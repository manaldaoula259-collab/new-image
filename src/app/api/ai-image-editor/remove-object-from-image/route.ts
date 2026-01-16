import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";

const MODEL_IDENTIFIER = "google/nano-banana";

// Feature-specific prompt for removing objects
const SYSTEM_PROMPT = "You are an object removal engine using the Nano Banana model. The user will upload an image and specify the object to remove. Remove only the specified object and seamlessly reconstruct the background. Do not alter colors, lighting, perspective, or other elements of the image.";

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

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "prompt is required and must be a non-empty string describing the object to remove." },
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
      logger.warn("[api/remove-object-from-image] Image URL may not be accessible", {
        url: imageUrl.trim(),
        status: imageCheckResponse.status,
      });
    }
  } catch (error) {
    logger.warn("[api/remove-object-from-image] Could not verify image URL accessibility", {
      url: imageUrl.trim(),
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Construct the prompt following the feature-specific guidelines
  const resolvedPrompt = `${SYSTEM_PROMPT} User instruction: Remove ${prompt.trim()}. Apply only this instruction. Maintain realism and natural background reconstruction.`;

  // Build input with nano-banana parameters
  const input: Record<string, any> = {
    prompt: resolvedPrompt,
    image_input: [imageUrl.trim()], // Array of image URLs
    aspect_ratio: "match_input_image",
    output_format: "jpg",
  };

  try {
    logger.info("[api/remove-object-from-image] Calling Replicate", {
      model: MODEL_IDENTIFIER,
      promptLength: resolvedPrompt.length,
    });

    const output = await replicate.run(MODEL_IDENTIFIER, { input });

    // Handle output according to Replicate SDK - output.url() is a method
    let resultUrl: string;

    if (output && typeof output === "object") {
      // Check if output has a url() method (FileOutput type)
      if ("url" in output && typeof (output as any).url === "function") {
        resultUrl = await (output as any).url();
      } else if ("url" in output && typeof (output as any).url === "string") {
        resultUrl = (output as any).url;
      } else if (Array.isArray(output) && output.length > 0) {
        // If output is an array, take the first item
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
        // Try to stringify and see what we got
        throw new Error(`Invalid output format from Replicate: ${JSON.stringify(output)}`);
      }
    } else if (typeof output === "string") {
      resultUrl = output;
    } else {
      throw new Error(`Replicate did not return a valid output. Type: ${typeof output}, Value: ${JSON.stringify(output)}`);
    }

    logger.info("[api/remove-object-from-image] Object removal successful", {
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
    logger.apiError("/api/remove-object-from-image", error instanceof Error ? error : new Error(String(error)), {
      prompt: prompt?.toString().substring(0, 100),
    });
    return NextResponse.json(
      {
        error: "Failed to remove object from image.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

