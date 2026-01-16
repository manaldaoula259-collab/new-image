import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";
import { auth } from "@clerk/nextjs/server";
import { saveGeneratedMedia } from "@/core/utils/saveGeneratedMedia";

export const dynamic = "force-dynamic";

const MODEL_IDENTIFIER = "google/nano-banana";

// Feature-specific prompt for photo enhancement
const SYSTEM_PROMPT = "You are an image enhancement engine using the Nano Banana model. Enhance image clarity, sharpness, lighting, and overall quality. Do not change faces, objects, colors, or composition. No stylization or artistic effects unless explicitly requested.";

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

  // Build input with nano-banana parameters
  const input: Record<string, any> = {
    prompt: SYSTEM_PROMPT,
    image_input: [imageUrl.trim()], // Array of image URLs
    aspect_ratio: "match_input_image",
    output_format: "jpg",
  };

  try {
    logger.info("[api/ai-photo-enhancer] Calling Replicate", {
      model: MODEL_IDENTIFIER,
    });

    const output = await replicate.run(MODEL_IDENTIFIER as `${string}/${string}`, { input });

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

    logger.info("[api/ai-photo-enhancer] Photo enhancement successful", {
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
          prompt: SYSTEM_PROMPT,
          source: "tool:ai-image-editor/ai-photo-enhancer",
        });
      }
    } catch (e) {
      logger.apiError("[ai-photo-enhancer] Failed to save media", e);
    }

    return NextResponse.json({
      resultUrl,
      prompt: SYSTEM_PROMPT,
      model: MODEL_IDENTIFIER,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError("/api/ai-photo-enhancer", error instanceof Error ? error : new Error(String(error)), {
      imageUrl: imageUrl.trim().substring(0, 100),
    });
    return NextResponse.json(
      {
        error: "Failed to enhance photo.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

