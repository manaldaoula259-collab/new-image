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

  let body: { prompt?: unknown } = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload.", details: (error as Error).message },
      { status: 400 }
    );
  }

  const { prompt } = body;

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "prompt is required and must be a non-empty string." },
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

  const resolved = await resolveReplicateModelIdentifierForSlug("ai-anime-generator");
  const modelIdentifier = (resolved.identifier && resolved.confidence >= 30)
    ? resolved.identifier
    : FALLBACK_MODEL_IDENTIFIER;

  const enhancedPrompt = `Create an exquisite anime style art: ${prompt.trim()}. Vibrant anime illustration, expressive anime features, smooth anime shading, colorful anime art style, professional anime character design, anime aesthetic, high-quality anime artwork. Perfect for avatars, posters, and social content. No text, no watermarks, clean anime illustration.`;

  const input = {
    prompt: enhancedPrompt,
    aspect_ratio: "1:1",
    output_format: "jpg",
    negative_prompt: "text, watermark, label, signature, logo, writing, letters, words, captions, text overlay, copyright, brand name, company name, website URL, filename, file name, text on image, written text, printed text, typed text, handwritten text, text banner, text box, subtitle, title text, description text, any text, any writing, any letters, any numbers, any symbols that form words, blurry, low quality, distorted",
  };

  try {
    logger.info("[api/ai-anime-generator] Calling Replicate", {
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

    logger.info("[api/ai-anime-generator] Anime generation successful", {
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
        logger.info("[ai-anime-generator] Saving media to library", { userId, resultUrl });
        await saveGeneratedMedia({
          userId,
          url: resultUrl,
          prompt: typeof prompt === "string" ? prompt : enhancedPrompt,
          source: "tool:ai-art-generator/ai-anime-generator",
        });
        logger.info("[ai-anime-generator] Media saved successfully", { userId });
      } else {
        logger.warn("[ai-anime-generator] No userId found, skipping media save");
      }
    } catch (e) {
      logger.apiError("[ai-anime-generator] Failed to save media", e, { resultUrl });
    }

    return NextResponse.json({
      resultUrl,
      prompt: enhancedPrompt,
      model: modelIdentifier,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError("/api/ai-anime-generator", error instanceof Error ? error : new Error(String(error)), {
      prompt: prompt?.toString().substring(0, 100),
    });
    return NextResponse.json(
      {
        error: "Failed to generate anime art.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

