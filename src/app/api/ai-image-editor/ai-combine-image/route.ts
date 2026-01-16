import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { logger } from "@/core/utils/logger";

const MODEL_IDENTIFIER = "fofr/image-merger:34009a2e9d9eafec981a6abd7e00afed4afeec35";

const DEFAULT_PROMPT_PREFIX = "Combine and merge these images seamlessly: ";

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token is not configured." },
      { status: 500 }
    );
  }

  let body: { imageUrls?: unknown; prompt?: unknown } = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload.", details: (error as Error).message },
      { status: 400 }
    );
  }

  const { imageUrls, prompt } = body;

  if (!Array.isArray(imageUrls) || imageUrls.length < 2) {
    return NextResponse.json(
      { error: "imageUrls is required and must be an array with at least 2 images." },
      { status: 400 }
    );
  }

  // Validate all URLs are strings
  const validUrls = imageUrls.filter((url) => typeof url === "string" && url.trim().length > 0);
  if (validUrls.length < 2) {
    return NextResponse.json(
      { error: "At least two valid imageUrls are required." },
      { status: 400 }
    );
  }

  const resolvedPrompt =
    typeof prompt === "string" && prompt.trim().length > 0
      ? `${DEFAULT_PROMPT_PREFIX}${prompt.trim()}. Create a seamless structural match and consistent styling.`
      : `${DEFAULT_PROMPT_PREFIX}Create a seamless structural match and consistent styling.`;

  const input = {
    image_1: validUrls[0].trim(),
    image_2: validUrls[1].trim(),
    prompt: resolvedPrompt,
  };

  try {
    logger.info("[api/ai-combine-image] Calling Replicate", {
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
      throw new Error(`Replicate did not return a valid output. Type: ${typeof output}, Value: ${JSON.stringify(output)}`);
    }

    logger.info("[api/ai-combine-image] Image combination successful", {
      resultUrlLength: resultUrl.length,
    });

    return NextResponse.json({
      resultUrl,
      prompt: resolvedPrompt,
      model: MODEL_IDENTIFIER,
    });
  } catch (error) {
    logger.apiError("/api/ai-combine-image", error instanceof Error ? error : new Error(String(error)), {
      prompt: prompt?.toString().substring(0, 100),
    });
    return NextResponse.json(
      {
        error: "Failed to combine images.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

