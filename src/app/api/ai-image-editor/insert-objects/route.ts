import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { logger } from "@/core/utils/logger";

const MODEL_IDENTIFIER = "black-forest-labs/flux-fill-pro:2d419772";

const DEFAULT_PROMPT_PREFIX = "Insert and add the following object into this image using visual references: ";

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token is not configured." },
      { status: 500 }
    );
  }

  let body: { imageUrl?: unknown; prompt?: unknown; referenceImageUrl?: unknown } = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload.", details: (error as Error).message },
      { status: 400 }
    );
  }

  const { imageUrl, prompt, referenceImageUrl } = body;

  if (typeof imageUrl !== "string" || imageUrl.trim().length === 0) {
    return NextResponse.json(
      { error: "imageUrl is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    return NextResponse.json(
      { error: "prompt is required and must be a non-empty string describing the object to insert." },
      { status: 400 }
    );
  }

  // Build image_input array - include reference image if provided
  const imageInputs: string[] = [imageUrl.trim()];
  if (typeof referenceImageUrl === "string" && referenceImageUrl.trim().length > 0) {
    imageInputs.push(referenceImageUrl.trim());
  }

  try {
    for (const url of imageInputs) {
      const imageCheckResponse = await fetch(url, { method: "HEAD" });
      if (!imageCheckResponse.ok) {
        logger.warn("[api/insert-objects] Image URL may not be accessible", {
          url,
          status: imageCheckResponse.status,
        });
      }
    }
  } catch (error) {
    logger.warn("[api/insert-objects] Could not verify image URL accessibility", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const resolvedPrompt = `${DEFAULT_PROMPT_PREFIX}${prompt.trim()}. Use visual references to match style and appearance.`;

  const input = {
    image: imageUrl.trim(),
    prompt: resolvedPrompt,
  };

  try {
    logger.info("[api/insert-objects] Calling Replicate", {
      model: MODEL_IDENTIFIER,
      promptLength: resolvedPrompt.length,
    });

    const output = await replicate.run(MODEL_IDENTIFIER, { input });

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

    logger.info("[api/insert-objects] Object insertion successful", {
      resultUrlLength: resultUrl.length,
    });

    return NextResponse.json({
      resultUrl,
      prompt: resolvedPrompt,
      model: MODEL_IDENTIFIER,
    });
  } catch (error) {
    logger.apiError("/api/insert-objects", error instanceof Error ? error : new Error(String(error)), {
      prompt: prompt?.toString().substring(0, 100),
    });
    return NextResponse.json(
      {
        error: "Failed to insert object into image.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

