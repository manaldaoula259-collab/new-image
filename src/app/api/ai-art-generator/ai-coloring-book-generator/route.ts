import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";
import { auth } from "@clerk/nextjs/server";
import { saveGeneratedMedia } from "@/core/utils/saveGeneratedMedia";

import { resolveReplicateModelIdentifierForSlug } from "@/core/replicate/modelCatalog";

// Using model without version hash to always use latest version
const FALLBACK_MODEL_IDENTIFIER = "stability-ai/sdxl";

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token is not configured." },
      { status: 500 }
    );
  }

  let body: { prompt?: unknown; imageUrl?: unknown } = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload.", details: (error as Error).message },
      { status: 400 }
    );
  }

  const { prompt, imageUrl } = body;

  if (!prompt && !imageUrl) {
    return NextResponse.json(
      { error: "Either prompt or imageUrl is required." },
      { status: 400 }
    );
  }

  if (prompt && typeof prompt !== "string") {
    return NextResponse.json(
      { error: "prompt must be a string if provided." },
      { status: 400 }
    );
  }

  if (imageUrl && typeof imageUrl !== "string") {
    return NextResponse.json(
      { error: "imageUrl must be a string if provided." },
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

  const resolved = await resolveReplicateModelIdentifierForSlug("ai-coloring-book-generator");
  const modelIdentifier = (resolved.identifier && resolved.confidence >= 30)
    ? resolved.identifier
    : FALLBACK_MODEL_IDENTIFIER;

  // If image is provided, verify it's accessible
  if (imageUrl && typeof imageUrl === "string") {
    try {
      const imageCheckResponse = await fetch(imageUrl.trim(), { method: "HEAD" });
      if (!imageCheckResponse.ok) {
        logger.warn("[api/ai-coloring-book-generator] Image URL may not be accessible", {
          url: imageUrl.trim(),
          status: imageCheckResponse.status,
        });
      }
    } catch (error) {
      logger.warn("[api/ai-coloring-book-generator] Could not verify image URL accessibility", {
        url: imageUrl.trim(),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const basePrompt = prompt && typeof prompt === "string" && prompt.trim().length > 0
    ? prompt.trim()
    : "coloring book page";

  const enhancedPrompt = `Create a coloring book page: ${basePrompt}. Black and white line art, clean outlines, simple line drawing, coloring book style, no shading, no colors, just black lines on white background. Perfect for coloring activities. No text, no watermarks, clean line art illustration.`;

  const input: any = {
    prompt: enhancedPrompt,
    aspect_ratio: "1:1",
    output_format: "png",
    negative_prompt: "text, watermark, label, signature, logo, writing, letters, words, captions, text overlay, copyright, brand name, company name, website URL, filename, file name, text on image, written text, printed text, typed text, handwritten text, text banner, text box, subtitle, title text, description text, any text, any writing, any letters, any numbers, any symbols that form words, colors, shading, gradients, filled areas, blurry, low quality, distorted",
  };

  // Add image input if provided
  if (imageUrl && typeof imageUrl === "string" && imageUrl.trim().length > 0) {
    input.image_input = [imageUrl.trim()];
  }

  try {
    logger.info("[api/ai-coloring-book-generator] Calling Replicate", {
      model: modelIdentifier,
      promptLength: enhancedPrompt.length,
    });

    const output = await replicate.run(modelIdentifier as `${string}/${string}`, { input });

    let resultUrl: string;

    if (output && typeof output === "object") {
      if ("url" in output && typeof (output as any).url === "function") {
        resultUrl = await (output as any).url();
      } else if ("url" in output && typeof (output as any).url === "string") {
        resultUrl = (output as any).url;
      } else if (Array.isArray(output) && output.length > 0) {
        const firstOutput = output[0];
        if (typeof firstOutput === "string") {
          resultUrl = firstOutput;
        } else if (firstOutput && typeof firstOutput === "object" && "url" in firstOutput) {
          if (typeof (firstOutput as any).url === "function") {
            resultUrl = await (firstOutput as any).url();
          } else {
            resultUrl = (firstOutput as any).url;
          }
        } else {
          throw new Error("Invalid output format from Replicate: array with invalid items");
        }
      } else {
        throw new Error(`Invalid output format from Replicate: ${JSON.stringify(output)}`);
      }
    } else if (typeof output === "string") {
      resultUrl = output;
    } else {
      throw new Error(`Replicate did not return a valid output. Type: ${typeof output}, Value: ${JSON.stringify(output)}`);
    }

    logger.info("[api/ai-coloring-book-generator] Coloring book generation successful", {
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
        logger.info("[ai-coloring-book-generator] Saving media to library", { userId, resultUrl });
        await saveGeneratedMedia({
          userId,
          url: resultUrl,
          prompt: typeof prompt === "string" ? prompt : enhancedPrompt,
          source: "tool:ai-art-generator/ai-coloring-book-generator",
        });
        logger.info("[ai-coloring-book-generator] Media saved successfully", { userId });
      } else {
        logger.warn("[ai-coloring-book-generator] No userId found, skipping media save");
      }
    } catch (e) {
      logger.apiError("[ai-coloring-book-generator] Failed to save media", e, { resultUrl });
    }

    return NextResponse.json({
      resultUrl,
      prompt: enhancedPrompt,
      model: modelIdentifier,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError("/api/ai-coloring-book-generator", error instanceof Error ? error : new Error(String(error)), {
      prompt: prompt?.toString().substring(0, 100),
    });
    return NextResponse.json(
      {
        error: "Failed to generate coloring book page.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

