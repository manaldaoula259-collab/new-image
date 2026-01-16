import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";
import { auth } from "@clerk/nextjs/server";
import { saveGeneratedMedia } from "@/core/utils/saveGeneratedMedia";

export const dynamic = "force-dynamic";

// Using Tencent Hunyuan Video for video generation - powerful video generation model available on Replicate
const HUNYUAN_VIDEO_MODEL = "tencent/hunyuan-video:6c9132aee14409cd6568d030453f1ba50f5f3412b844fe67f78a9eb62d55664f";

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token is not configured." },
      { status: 500 }
    );
  }

  let body: {
    prompt?: unknown;
    fps?: unknown;
    width?: unknown;
    height?: unknown;
    inferSteps?: unknown;
    videoLength?: unknown;
    embeddedGuidanceScale?: unknown;
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
  const fps = typeof body.fps === "number" ? body.fps : 24;
  const width = typeof body.width === "number" ? body.width : 864;
  const height = typeof body.height === "number" ? body.height : 480;
  const inferSteps = typeof body.inferSteps === "number" ? body.inferSteps : 50;
  const videoLength = typeof body.videoLength === "number" ? body.videoLength : 129;
  const embeddedGuidanceScale =
    typeof body.embeddedGuidanceScale === "number" ? body.embeddedGuidanceScale : 6;

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
    logger.info("[api/hunyuan-video] Starting video generation with Tencent Hunyuan Video", {
      promptLength: prompt.length,
      fps,
      width,
      height,
      inferSteps,
      videoLength,
      embeddedGuidanceScale,
    });

    // Prepare input for Tencent Hunyuan Video model
    // Hunyuan Video supports: prompt, fps, width, height, infer_steps, video_length, embedded_guidance_scale
    const replicateInput: Record<string, unknown> = {
      prompt,
      fps,
      width,
      height,
      infer_steps: inferSteps,
      video_length: videoLength,
      embedded_guidance_scale: embeddedGuidanceScale,
    };

    // Run the video generation with Tencent Hunyuan Video
    const output = await replicate.run(HUNYUAN_VIDEO_MODEL as `${string}/${string}`, {
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

    logger.info("[api/hunyuan-video] Video generation successful with Tencent Hunyuan Video", {
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
        logger.info("[api/hunyuan-video] Saving video to library", { userId, resultUrl });
        await saveGeneratedMedia({
          userId,
          url: resultUrl,
          prompt,
          source: "hunyuan-video",
        });
        logger.info("[api/hunyuan-video] Video saved successfully", { userId });
      }
    } catch (e) {
      logger.apiError("[api/hunyuan-video] Failed to save video", e, { resultUrl });
    }

    return NextResponse.json({
      resultUrl,
      prompt,
      model: HUNYUAN_VIDEO_MODEL,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError(
      "/api/ai-video/hunyuan-video",
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
            error: "Tencent Hunyuan Video model not found. Please check if the model is available on Replicate.",
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

