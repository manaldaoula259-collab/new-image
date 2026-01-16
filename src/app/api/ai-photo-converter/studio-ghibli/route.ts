import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";
import { auth } from "@clerk/nextjs/server";
import { saveGeneratedMedia } from "@/core/utils/saveGeneratedMedia";
import { resolveReplicateModelIdentifierForSlug } from "@/core/replicate/modelCatalog";

export const dynamic = "force-dynamic";

// Using aaronaftab/mirage-ghibli for Studio Ghibli style transformation
// This model is specifically designed for Ghibli style and works well with input images
const FALLBACK_MODEL_IDENTIFIER = "aaronaftab/mirage-ghibli:166efd159b4138da932522bc5af40d39194033f587d9bdbab1e594119eae3e7f";

const DEFAULT_PROMPT = "GHBLI anime style photo";

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token is not configured." },
      { status: 500 }
    );
  }

  let body: { imageUrl?: unknown; prompt?: unknown; aspectRatio?: unknown } = {};
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload.", details: (error as Error).message },
      { status: 400 }
    );
  }

  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const userPrompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const aspectRatio = typeof body.aspectRatio === "string" ? body.aspectRatio.trim() : "1:1";

  if (!imageUrl) {
    return NextResponse.json(
      { error: "imageUrl is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  // Verify the image URL is accessible before sending to Replicate
  try {
    const imageCheckResponse = await fetch(imageUrl, { method: "HEAD" });
    if (!imageCheckResponse.ok) {
      logger.warn("[api/studio-ghibli] Image URL may not be accessible", {
        url: imageUrl.substring(0, 100),
        status: imageCheckResponse.status,
      });
    }
  } catch (error) {
    logger.warn("[api/studio-ghibli] Could not verify image URL accessibility", {
      url: imageUrl.substring(0, 100),
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Check credits first (no deduction yet)
  const creditCheck = await checkCredits(1);
  if (!creditCheck.success) {
    return NextResponse.json(
      { error: creditCheck.error || "Insufficient credits" },
      { status: 400 }
    );
  }

  // Determine which model to use. We'll try to find one dynamically or use a reliable fallback.
  const resolved = await resolveReplicateModelIdentifierForSlug("ghibli-diffusion");
  const modelIdentifier = (resolved.identifier && resolved.confidence >= 30)
    ? resolved.identifier
    : FALLBACK_MODEL_IDENTIFIER;

  // For aaronaftab/mirage-ghibli, use Ghibli style prompt
  const resolvedPrompt = userPrompt && userPrompt.trim()
    ? userPrompt.trim()
    : DEFAULT_PROMPT;

  // Input schema for aaronaftab/mirage-ghibli model
  // This model is specifically designed for Ghibli style transformation
  const input: Record<string, any> = {
    image: imageUrl.trim(),
    model: "dev",
    prompt: resolvedPrompt,
    go_fast: true,
    lora_scale: 1,
    megapixels: "1",
    num_outputs: 1,
    aspect_ratio: aspectRatio,
    output_format: "png",
    guidance_scale: 10,
    output_quality: 80,
    prompt_strength: 0.77,
    extra_lora_scale: 1,
    num_inference_steps: 38,
  };

  try {
    logger.info("[api/studio-ghibli] Calling Replicate", {
      model: modelIdentifier,
      hasImage: !!imageUrl,
    });

    const output = await replicate.run(modelIdentifier as `${string}/${string}`, { input });

    let resultUrl: string;

    // aaronaftab/mirage-ghibli returns an array of FileOutput objects
    if (Array.isArray(output) && output.length > 0) {
      const firstOutput = output[0];
      if (firstOutput && typeof firstOutput === "object" && "url" in firstOutput) {
        if (typeof (firstOutput as any).url === "function") {
          resultUrl = await (firstOutput as any).url();
        } else {
          resultUrl = (firstOutput as any).url;
        }
      } else if (typeof firstOutput === "string") {
        resultUrl = firstOutput;
      } else {
        throw new Error("Invalid output format from Replicate");
      }
    } else if (output && typeof output === "object") {
      if ("url" in output && typeof (output as any).url === "function") {
        resultUrl = await (output as any).url();
      } else if ("url" in output && typeof (output as any).url === "string") {
        resultUrl = (output as any).url;
      } else {
        throw new Error(`Invalid output format from Replicate: ${JSON.stringify(output)}`);
      }
    } else if (typeof output === "string") {
      resultUrl = output;
    } else {
      throw new Error("Replicate did not return a valid output.");
    }

    // Deduct credits on success only
    const deduct = await deductCredits(1);
    if (!deduct.success) {
      return NextResponse.json(
        { error: deduct.error || "Failed to deduct credits" },
        { status: 400 }
      );
    }

    // Save to Media library (best-effort)
    try {
      const { userId } = await auth();
      if (userId) {
        await saveGeneratedMedia({
          userId,
          url: resultUrl,
          prompt: resolvedPrompt,
          source: "tool:ai-photo-converter/studio-ghibli",
        });
      }
    } catch (e) {
      logger.apiError("[studio-ghibli] Failed to save media", e);
    }

    return NextResponse.json({
      resultUrl,
      prompt: resolvedPrompt,
      model: modelIdentifier,
      creditsDeducted: 1,
    });
  } catch (error) {
    console.error("[api/studio-ghibli] Error generating image:", error);
    logger.apiError(
      "/api/ai-photo-converter/studio-ghibli",
      error instanceof Error ? error : new Error(String(error))
    );

    // Handle specific Replicate API errors
    if (error instanceof Error) {
      // 402 Payment Required - Insufficient credits on Replicate account
      if (error.message.includes("402") || error.message.includes("Payment Required") || error.message.includes("insufficient credit")) {
        return NextResponse.json(
          {
            error: "Replicate account has insufficient credits. Please add credits to your Replicate account at https://replicate.com/account/billing",
            details: "The Replicate API account needs to be topped up with credits to run this model.",
          },
          { status: 402 }
        );
      }
      // Rate limit errors
      if (error.message.includes("rate limit") || error.message.includes("429")) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again in a moment.",
            details: error.message,
          },
          { status: 429 }
        );
      }
      // Model not found errors
      if (error.message.includes("404") || error.message.includes("not found")) {
        return NextResponse.json(
          {
            error: "Model not found. The Studio Ghibli model may not be available.",
            details: error.message,
          },
          { status: 404 }
        );
      }
      // CUDA/GPU errors - model GPU memory issues
      if (error.message.includes("CUDA") || error.message.includes("illegal memory access") || error.message.includes("GPU")) {
        return NextResponse.json(
          {
            error: "The model encountered a GPU memory error. Please try again with a smaller image or try again in a moment.",
            details: "This is a temporary issue with the model's GPU. Please retry.",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate Studio Ghibli style image.", details: (error as Error).message },
      { status: 500 }
    );
  }
}


