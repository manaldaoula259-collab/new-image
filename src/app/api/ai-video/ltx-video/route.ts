import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";
import { auth } from "@clerk/nextjs/server";
import { saveGeneratedMedia } from "@/core/utils/saveGeneratedMedia";

export const dynamic = "force-dynamic";

// Using Lightricks LTX Video for video generation - Lightricks video generation model available on Replicate
const LTX_VIDEO_MODEL = "lightricks/ltx-video:8c47da666861d081eeb4d1261853087de23923a268a69b63febdf5dc1dee08e4";

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token is not configured." },
      { status: 500 }
    );
  }

  let body: {
    prompt?: unknown;
    cfg?: unknown;
    model?: unknown;
    steps?: unknown;
    length?: unknown;
    targetSize?: unknown;
    aspectRatio?: unknown;
    negativePrompt?: unknown;
    imageNoiseScale?: unknown;
  } = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload.", details: (error as Error).message },
      { status: 400 }
    );
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const cfg = typeof body.cfg === "number" ? body.cfg : 3;
  const model = typeof body.model === "string" ? body.model : "0.9.1";
  const steps = typeof body.steps === "number" ? body.steps : 30;
  const length = typeof body.length === "number" ? body.length : 97;
  const targetSize = typeof body.targetSize === "number" ? body.targetSize : 640;
  const aspectRatio = typeof body.aspectRatio === "string" ? body.aspectRatio : "16:9";
  const negativePrompt =
    typeof body.negativePrompt === "string"
      ? body.negativePrompt.trim()
      : "low quality, worst quality, deformed, distorted, watermark";
  const imageNoiseScale =
    typeof body.imageNoiseScale === "number" ? body.imageNoiseScale : 0.15;

  if (!prompt) {
    return NextResponse.json(
      { error: "prompt is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  // Credit check first (deduct on success only)
  const creditCheck = await checkCredits(1);
  if (!creditCheck.success) {
    return NextResponse.json(
      { error: creditCheck.error || "Insufficient credits" },
      { status: 400 }
    );
  }

  try {
    logger.info("[api/ltx-video] Starting video generation with Lightricks LTX Video", {
      promptLength: prompt.length,
      cfg,
      model,
      steps,
      length,
      targetSize,
      aspectRatio,
      imageNoiseScale,
    });

    // Prepare input for Lightricks LTX Video model
    // LTX Video supports: prompt, cfg, model, steps, length, target_size, aspect_ratio,
    // negative_prompt, image_noise_scale
    const replicateInput: Record<string, unknown> = {
      prompt,
      cfg,
      model,
      steps,
      length,
      target_size: targetSize,
      aspect_ratio: aspectRatio,
      negative_prompt: negativePrompt,
      image_noise_scale: imageNoiseScale,
    };

    // Run the video generation with Lightricks LTX Video
    const output = await replicate.run(LTX_VIDEO_MODEL as `${string}/${string}`, {
      input: replicateInput,
    });

    // Handle video output - LTX Video returns an array, access first element
    let resultUrl: string;

    if (Array.isArray(output) && output.length > 0) {
      const firstOutput = output[0];
      if (firstOutput && typeof firstOutput === "object") {
        if ("url" in firstOutput && typeof (firstOutput as any).url === "function") {
          const urlResult = await (firstOutput as any).url();
          resultUrl = urlResult instanceof URL ? urlResult.href : String(urlResult);
        } else if ("url" in firstOutput) {
          const urlValue = (firstOutput as any).url;
          resultUrl = urlValue instanceof URL ? urlValue.href : String(urlValue);
        } else if (typeof firstOutput === "string") {
          resultUrl = firstOutput;
        } else if (firstOutput instanceof URL) {
          resultUrl = firstOutput.href;
        } else {
          throw new Error("Invalid output format from Replicate");
        }
      } else if (typeof firstOutput === "string") {
        resultUrl = firstOutput;
      } else if (firstOutput instanceof URL) {
        resultUrl = firstOutput.href;
      } else {
        throw new Error("Invalid output format from Replicate");
      }
    } else if (output && typeof output === "object") {
      if ("url" in output && typeof (output as any).url === "function") {
        const urlResult = await (output as any).url();
        resultUrl = urlResult instanceof URL ? urlResult.href : String(urlResult);
      } else if ("url" in output) {
        const urlValue = (output as any).url;
        resultUrl = urlValue instanceof URL ? urlValue.href : String(urlValue);
      } else if (output instanceof URL) {
        resultUrl = output.href;
      } else {
        throw new Error(`Invalid output format from Replicate: ${JSON.stringify(output)}`);
      }
    } else if (typeof output === "string") {
      resultUrl = output;
    } else {
      throw new Error("Replicate did not return a valid output.");
    }

    logger.info("[api/ltx-video] Video generation successful with Lightricks LTX Video", {
      resultUrlLength: resultUrl.length,
    });

    // Deduct credits
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
        logger.info("[api/ltx-video] Saving video to library", { userId, resultUrl });
        await saveGeneratedMedia({
          userId,
          url: resultUrl,
          prompt,
          source: "ltx-video",
        });
        logger.info("[api/ltx-video] Video saved successfully", { userId });
      }
    } catch (e) {
      logger.apiError("[api/ltx-video] Failed to save video", e, { resultUrl });
    }

    return NextResponse.json({
      resultUrl,
      prompt,
      model: LTX_VIDEO_MODEL,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError(
      "/api/ai-video/ltx-video",
      error instanceof Error ? error : new Error(String(error)),
      {
        promptLength: prompt.length,
      }
    );

    // Handle specific Replicate errors
    if (error instanceof Error) {
      if (error.message.includes("404") || error.message.includes("not found")) {
        return NextResponse.json(
          {
            error: "Lightricks LTX Video model not found. Please check if the model is available on Replicate.",
            details: error.message,
          },
          { status: 404 }
        );
      }
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again in a moment.",
            details: error.message,
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to generate video.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

