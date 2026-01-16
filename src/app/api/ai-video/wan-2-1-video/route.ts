import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";
import { auth } from "@clerk/nextjs/server";
import { saveGeneratedMedia } from "@/core/utils/saveGeneratedMedia";

export const dynamic = "force-dynamic";

// Using Wan 2.2 I2V Fast for video generation - Alibaba's image-to-video model available on Replicate
const WAN_VIDEO_MODEL = "wan-video/wan-2.2-i2v-fast";

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token is not configured." },
      { status: 500 }
    );
  }

  let body: {
    prompt?: unknown;
    imageUrl?: unknown;
    goFast?: unknown;
    numFrames?: unknown;
    resolution?: unknown;
    sampleShift?: unknown;
    framesPerSecond?: unknown;
    interpolateOutput?: unknown;
    loraScaleTransformer?: unknown;
    loraScaleTransformer2?: unknown;
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
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const goFast = typeof body.goFast === "boolean" ? body.goFast : true;
  const numFrames = typeof body.numFrames === "number" ? body.numFrames : 81;
  const resolution =
    typeof body.resolution === "string" ? body.resolution : "480p";
  const sampleShift = typeof body.sampleShift === "number" ? body.sampleShift : 12;
  const framesPerSecond =
    typeof body.framesPerSecond === "number" ? body.framesPerSecond : 16;
  const interpolateOutput =
    typeof body.interpolateOutput === "boolean" ? body.interpolateOutput : false;
  const loraScaleTransformer =
    typeof body.loraScaleTransformer === "number" ? body.loraScaleTransformer : 1;
  const loraScaleTransformer2 =
    typeof body.loraScaleTransformer2 === "number" ? body.loraScaleTransformer2 : 1;

  if (!prompt) {
    return NextResponse.json(
      { error: "prompt is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  if (!imageUrl) {
    return NextResponse.json(
      { error: "imageUrl is required and must be a non-empty string." },
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
    logger.info("[api/wan-2-1-video] Starting video generation with Wan 2.2 I2V Fast", {
      promptLength: prompt.length,
      hasImage: !!imageUrl,
      goFast,
      numFrames,
      resolution,
      sampleShift,
      framesPerSecond,
      interpolateOutput,
      loraScaleTransformer,
      loraScaleTransformer2,
    });

    // Prepare input for Wan 2.2 I2V Fast model
    // Wan 2.2 I2V Fast supports: image, prompt, go_fast, num_frames, resolution, sample_shift,
    // frames_per_second, interpolate_output, lora_scale_transformer, lora_scale_transformer_2
    const replicateInput: Record<string, unknown> = {
      image: imageUrl,
      prompt,
      go_fast: goFast,
      num_frames: numFrames,
      resolution,
      sample_shift: sampleShift,
      frames_per_second: framesPerSecond,
      interpolate_output: interpolateOutput,
      lora_scale_transformer: loraScaleTransformer,
      lora_scale_transformer_2: loraScaleTransformer2,
    };

    // Run the video generation with Wan 2.2 I2V Fast
    const output = await replicate.run(WAN_VIDEO_MODEL as `${string}/${string}`, {
      input: replicateInput,
    });

    // Handle video output (usually returns a URL or has a url() method)
    let resultUrl: string;

    if (output && typeof output === "object") {
      if ("url" in output && typeof (output as any).url === "function") {
        const urlResult = await (output as any).url();
        resultUrl = urlResult instanceof URL ? urlResult.href : String(urlResult);
      } else if ("url" in output) {
        const urlValue = (output as any).url;
        resultUrl = urlValue instanceof URL ? urlValue.href : String(urlValue);
      } else if (Array.isArray(output) && output.length > 0) {
        const firstOutput = output[0];
        if (typeof firstOutput === "string") {
          resultUrl = firstOutput;
        } else if (firstOutput instanceof URL) {
          resultUrl = firstOutput.href;
        } else if (firstOutput && typeof firstOutput === "object" && "url" in firstOutput) {
          if (typeof (firstOutput as any).url === "function") {
            const urlResult = await (firstOutput as any).url();
            resultUrl = urlResult instanceof URL ? urlResult.href : String(urlResult);
          } else {
            const urlValue = (firstOutput as any).url;
            resultUrl = urlValue instanceof URL ? urlValue.href : String(urlValue);
          }
        } else {
          throw new Error("Invalid output format from Replicate");
        }
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

    logger.info("[api/wan-2-1-video] Video generation successful with Wan 2.2 I2V Fast", {
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
        logger.info("[api/wan-2-1-video] Saving video to library", { userId, resultUrl });
        await saveGeneratedMedia({
          userId,
          url: resultUrl,
          prompt,
          source: "wan-2-1-video",
        });
        logger.info("[api/wan-2-1-video] Video saved successfully", { userId });
      }
    } catch (e) {
      logger.apiError("[api/wan-2-1-video] Failed to save video", e, { resultUrl });
    }

    return NextResponse.json({
      resultUrl,
      prompt,
      model: WAN_VIDEO_MODEL,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError(
      "/api/ai-video/wan-2-1-video",
      error instanceof Error ? error : new Error(String(error)),
      {
        promptLength: prompt.length,
        hasImage: !!imageUrl,
      }
    );

    // Handle specific Replicate errors
    if (error instanceof Error) {
      if (error.message.includes("404") || error.message.includes("not found")) {
        return NextResponse.json(
          {
            error: "Wan 2.2 I2V Fast video model not found. Please check if the model is available on Replicate.",
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

