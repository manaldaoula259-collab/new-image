import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";
import { auth } from "@clerk/nextjs/server";
import { saveGeneratedMedia } from "@/core/utils/saveGeneratedMedia";

export const dynamic = "force-dynamic";

const MODEL_IDENTIFIER = "google/nano-banana";

const FEATURE_PROMPT = `You are a hairstyle transformation engine using the Nano Banana model.
Change only the hairstyle as described by the user.
Preserve hair realism, lighting, and face shape.
Do not modify face, expression, color tone, or background.`;

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

  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const userInstruction = typeof body.prompt === "string" ? body.prompt.trim() : "";

  if (!imageUrl) {
    return NextResponse.json(
      { error: "imageUrl is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  if (!userInstruction) {
    return NextResponse.json(
      { error: "prompt is required and must describe the desired hairstyle (e.g., 'short bob', 'long curly hair', 'pixie cut')." },
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

  // Construct prompt: use feature prompt with user's hairstyle instruction
  const resolvedPrompt = `${FEATURE_PROMPT} User instruction: ${userInstruction}. Apply only the hairstyle change specified.`;

  const input: Record<string, any> = {
    prompt: resolvedPrompt,
    image_input: [imageUrl],
    aspect_ratio: "match_input_image",
    output_format: "jpg",
  };

  try {
    logger.info("[api/hair-style-changer] Calling Replicate", {
      model: MODEL_IDENTIFIER,
      promptLength: resolvedPrompt.length,
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
          throw new Error("Invalid output format from Replicate: array with invalid items");
        }
      } else {
        throw new Error(`Invalid output format from Replicate: ${JSON.stringify(output)}`);
      }
    } else if (typeof output === "string") {
      resultUrl = output;
    } else {
      throw new Error(`Replicate did not return a valid output. Type: ${typeof output}`);
    }

    logger.info("[api/hair-style-changer] Hairstyle change successful", {
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
          source: "tool:ai-image-editor/hair-style-changer",
        });
      }
    } catch (e) {
      logger.apiError("[hair-style-changer] Failed to save media", e);
    }

    return NextResponse.json({
      resultUrl,
      prompt: resolvedPrompt,
      model: MODEL_IDENTIFIER,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError("/api/hair-style-changer", error instanceof Error ? error : new Error(String(error)), {
      imageUrl: imageUrl.substring(0, 100),
    });
    return NextResponse.json(
      {
        error: "Failed to change hairstyle.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

