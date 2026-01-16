import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";

const MODEL_IDENTIFIER = "black-forest-labs/flux-depth-pro";

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
      logger.warn("[api/2d-to-3d-converter] Image URL may not be accessible", {
        url: imageUrl.trim(),
        status: imageCheckResponse.status,
      });
    }
  } catch (error) {
    logger.warn("[api/2d-to-3d-converter] Could not verify image URL accessibility", {
      url: imageUrl.trim(),
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Build input with exact parameters from the example
  const input: Record<string, any> = {
    steps: 50,
    prompt: typeof prompt === "string" && prompt.length > 0 ? prompt : "high quality 3D render, depth map style, 8k, detailed",
    guidance: 7,
    control_image: imageUrl.trim(),
    output_format: "jpg",
    safety_tolerance: 2,
    prompt_upsampling: false,
  };

  try {
    logger.info("[api/2d-to-3d-converter] Calling Replicate", {
      model: MODEL_IDENTIFIER,
      imageUrl: imageUrl.trim().substring(0, 100),
    });

    const output = await replicate.run(MODEL_IDENTIFIER as `${string}/${string}`, { input });

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

    logger.info("[api/2d-to-3d-converter] Conversion successful", {
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
      model: MODEL_IDENTIFIER,
      creditsDeducted: 1,
      outputFormat: "jpg",
    });
  } catch (error) {
    logger.apiError("/api/2d-to-3d-converter", error instanceof Error ? error : new Error(String(error)), {
      imageUrl: imageUrl.trim().substring(0, 100),
    });
    return NextResponse.json(
      {
        error: "Failed to convert image to 3D.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
