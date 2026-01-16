import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";
import { auth } from "@clerk/nextjs/server";
import { saveGeneratedMedia } from "@/core/utils/saveGeneratedMedia";
import { resolveReplicateModelIdentifierForSlug } from "@/core/replicate/modelCatalog";

export const dynamic = "force-dynamic";

// Using the Qwen anime model specifically designed for photo-to-anime conversion
const FALLBACK_MODEL_IDENTIFIER = "qwen-edit-apps/qwen-image-edit-plus-lora-photo-to-anime";

const DEFAULT_PROMPT =
  "transform into anime, clean line art, vibrant cel-shaded colors";

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token is not configured." },
      { status: 500 }
    );
  }

  let body: { imageUrl?: unknown; prompt?: unknown } = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload.", details: (error as Error).message },
      { status: 400 }
    );
  }

  const { imageUrl, prompt } = body;

  if (typeof imageUrl !== "string" || imageUrl.trim().length === 0) {
    return NextResponse.json(
      { error: "imageUrl is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  // Check credits first (deduct on success)
  const creditCheck = await checkCredits(1);
  if (!creditCheck.success) {
    return NextResponse.json(
      { error: creditCheck.error || "Insufficient credits" },
      { status: 400 }
    );
  }

  // Use full slug to match the override in modelCatalog
  const resolved = await resolveReplicateModelIdentifierForSlug("ai-photo-filter/ai-anime-filter");
  const modelIdentifier = (resolved.identifier && resolved.confidence >= 25)
    ? resolved.identifier
    : FALLBACK_MODEL_IDENTIFIER;

  const resolvedPrompt =
    typeof prompt === "string" && prompt.trim().length > 0
      ? prompt.trim()
      : DEFAULT_PROMPT;

  // Build input with exact parameters from the example
  const input: Record<string, any> = {
    image: imageUrl.trim(),
    prompt: resolvedPrompt,
    lora_scale: 1,
    aspect_ratio: "match_input_image",
    lora_weights: "",
    output_format: "png",
    output_quality: 95,
    true_guidance_scale: 1,
  };

  try {
    logger.info("[api/ai-anime-filter] Calling Replicate", {
      model: modelIdentifier,
      promptLength: resolvedPrompt.length,
    });

    const output = await replicate.run(modelIdentifier as `${string}/${string}`, { input });

    // Handle output according to Replicate SDK
    // The qwen model returns an array with url() method: output[0].url()
    let resultUrl: string;

    if (Array.isArray(output) && output.length > 0) {
      const firstOutput = output[0];
      if (typeof firstOutput === "string") {
        resultUrl = firstOutput;
      } else if (firstOutput && typeof firstOutput === "object") {
        if ("url" in firstOutput && typeof (firstOutput as any).url === "function") {
          resultUrl = await (firstOutput as any).url();
        } else if ("url" in firstOutput && typeof (firstOutput as any).url === "string") {
          resultUrl = (firstOutput as any).url;
        } else {
          throw new Error("Invalid output format from Replicate");
        }
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
      throw new Error(`Replicate did not return a valid output. Type: ${typeof output}`);
    }

    logger.info("[api/ai-anime-filter] Anime filter conversion successful", {
      resultUrlLength: resultUrl.length,
    });

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
          source: "tool:ai-photo-filter/ai-anime-filter",
        });
      }
    } catch (e) {
      logger.apiError("[ai-anime-filter] Failed to save media", e);
    }

    return NextResponse.json({
      resultUrl,
      prompt: resolvedPrompt,
      model: modelIdentifier,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError("/api/ai-anime-filter", error instanceof Error ? error : new Error(String(error)), {
      imageUrl: imageUrl.trim().substring(0, 100),
    });

    // Handle specific Replicate API errors
    if (error instanceof Error) {
      // CUDA/GPU memory errors
      if (error.message.includes("CUDA") || error.message.includes("GPU") || error.message.includes("memory")) {
        return NextResponse.json(
          {
            error: "GPU memory error occurred. The image might be too large or the model is temporarily unavailable. Please try again with a smaller image or wait a moment.",
            details: error.message,
          },
          { status: 500 }
        );
      }
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
            error: "Model not found. The anime filter model may not be available.",
            details: error.message,
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to convert image to anime style.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

