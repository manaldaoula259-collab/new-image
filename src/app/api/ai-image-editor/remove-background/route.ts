import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";

const MODEL_IDENTIFIER = "lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1";

const DEFAULT_PROMPT =
  "Remove the background from this image completely. Keep only the main subject(s) visible. Make the background transparent. Ensure perfect edge detection and clean cutout of the subject.";

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token is not configured." },
      { status: 500 }
    );
  }

  let body: { imageUrl?: unknown } = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload.", details: (error as Error).message },
      { status: 400 }
    );
  }

  const { imageUrl } = body;

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
      logger.warn("[api/remove-background] Image URL may not be accessible", {
        url: imageUrl.trim(),
        status: imageCheckResponse.status,
      });
    }
  } catch (error) {
    logger.warn("[api/remove-background] Could not verify image URL accessibility", {
      url: imageUrl.trim(),
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const input = {
    image: imageUrl.trim(),
  };

  try {
    logger.info("[api/remove-background] Calling Replicate", {
      model: MODEL_IDENTIFIER,
    });

    const output = await replicate.run(MODEL_IDENTIFIER, { input });

    // Handle output according to Replicate SDK - output.url() is a method
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

    logger.info("[api/remove-background] Background removal successful", {
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
      prompt: DEFAULT_PROMPT,
      model: MODEL_IDENTIFIER,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError("/api/remove-background", error instanceof Error ? error : new Error(String(error)), {
      imageUrl: imageUrl.trim().substring(0, 100),
    });
    return NextResponse.json(
      {
        error: "Failed to remove background from image.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

