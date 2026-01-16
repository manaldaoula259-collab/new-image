import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";
import { auth } from "@clerk/nextjs/server";
import { saveGeneratedMedia } from "@/core/utils/saveGeneratedMedia";

export const dynamic = "force-dynamic";

// Using CogVideoX-5B for video generation - open-source text-to-video diffusion model available on Replicate
const COGVIDEOX_5B_MODEL = "cuuupid/cogvideox-5b:5b14e2c2c648efecc8d36c6353576552f8a124e690587212f8e8bb17ecda3d8c";

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token is not configured." },
      { status: 500 }
    );
  }

  let body: {
    prompt?: unknown;
    seed?: unknown;
    steps?: unknown;
    guidance?: unknown;
    numOutputs?: unknown;
    extendPrompt?: unknown;
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
  const seed = typeof body.seed === "number" ? body.seed : 42;
  const steps = typeof body.steps === "number" ? body.steps : 50;
  const guidance = typeof body.guidance === "number" ? body.guidance : 6;
  const numOutputs = typeof body.numOutputs === "number" ? body.numOutputs : 1;
  const extendPrompt = typeof body.extendPrompt === "boolean" ? body.extendPrompt : true;

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
    logger.info("[api/cogvideox-5b] Starting video generation with CogVideoX-5B", {
      promptLength: prompt.length,
      seed,
      steps,
      guidance,
      numOutputs,
      extendPrompt,
    });

    // Prepare input for CogVideoX-5B model
    // CogVideoX-5B supports: prompt, seed, steps, guidance, num_outputs, extend_prompt
    const replicateInput: Record<string, unknown> = {
      prompt,
      seed,
      steps,
      guidance,
      num_outputs: numOutputs,
      extend_prompt: extendPrompt,
    };

    // Run the video generation with CogVideoX-5B
    const output = await replicate.run(COGVIDEOX_5B_MODEL as `${string}/${string}`, {
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

    logger.info("[api/cogvideox-5b] Video generation successful with CogVideoX-5B", {
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
        logger.info("[api/cogvideox-5b] Saving video to library", { userId, resultUrl });
        await saveGeneratedMedia({
          userId,
          url: resultUrl,
          prompt,
          source: "cogvideox-5b",
        });
        logger.info("[api/cogvideox-5b] Video saved successfully", { userId });
      }
    } catch (e) {
      logger.apiError("[api/cogvideox-5b] Failed to save video", e, { resultUrl });
    }

    return NextResponse.json({
      resultUrl,
      prompt,
      model: COGVIDEOX_5B_MODEL,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError(
      "/api/ai-video/cogvideox-5b",
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
            error: "CogVideoX-5B model not found. Please check if the model is available on Replicate.",
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

