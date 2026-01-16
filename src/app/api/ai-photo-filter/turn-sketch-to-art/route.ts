import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

const MODEL_IDENTIFIER = "google/nano-banana";

const DEFAULT_PROMPT =
  "Transform this sketch into a fully painted artwork with rich colors, detailed textures, cinematic lighting, and professional artistic rendering. Add realistic shadows, highlights, depth, and atmospheric effects. Bring the sketch to life with vibrant colors and dramatic lighting. No text, no watermarks, clean painted artwork.";

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

  // Verify the image URL is accessible before sending to Replicate
  try {
    const imageCheckResponse = await fetch(imageUrl.trim(), { method: "HEAD" });
    if (!imageCheckResponse.ok) {
      logger.warn("[api/turn-sketch-to-art] Image URL may not be accessible", {
        url: imageUrl.trim(),
        status: imageCheckResponse.status,
      });
    }
  } catch (error) {
    logger.warn("[api/turn-sketch-to-art] Could not verify image URL accessibility", {
      url: imageUrl.trim(),
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const resolvedPrompt =
    typeof prompt === "string" && prompt.trim().length > 0
      ? prompt.trim()
      : DEFAULT_PROMPT;

  // Build input with exact parameters from the example
  // The model requires image_input as an array and prompt
  const input: Record<string, any> = {
    prompt: resolvedPrompt,
    image_input: [imageUrl.trim()], // Array of image URLs
    aspect_ratio: "match_input_image",
    output_format: "jpg",
  };

  try {
    logger.info("[api/turn-sketch-to-art] Calling Replicate", {
      model: MODEL_IDENTIFIER,
      promptLength: resolvedPrompt.length,
    });

    const output = await replicate.run(MODEL_IDENTIFIER as `${string}/${string}`, { input });

    // Handle output according to Replicate SDK
    // The model returns an object with url() method: output.url()
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
          throw new Error("Invalid output format from Replicate");
        }
      } else {
        throw new Error(`Invalid output format from Replicate: ${JSON.stringify(output)}`);
      }
    } else if (typeof output === "string") {
      resultUrl = output;
    } else {
      throw new Error(`Replicate did not return a valid output. Type: ${typeof output}`);
    }

    logger.info("[api/turn-sketch-to-art] Sketch to art conversion successful", {
      resultUrlLength: resultUrl.length,
    });

    const deduct = await deductCredits(1);
    if (!deduct.success) {
      return NextResponse.json(
        { error: deduct.error || "Failed to deduct credits" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      resultUrl,
      prompt: resolvedPrompt,
      model: MODEL_IDENTIFIER,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError("/api/turn-sketch-to-art", error instanceof Error ? error : new Error(String(error)), {
      imageUrl: imageUrl.trim().substring(0, 100),
    });
    return NextResponse.json(
      {
        error: "Failed to convert sketch to painted artwork.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

