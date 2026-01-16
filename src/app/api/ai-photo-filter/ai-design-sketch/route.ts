import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";
import { getOpenAIClient } from "@/core/clients/openai";

export const dynamic = "force-dynamic";

const MODEL_IDENTIFIER = "hebhar/handsketch:e1f41a2e47f93ec8d8c9308bb60e789b8a667664b5125076224ad7a1dbc993e7";

const DEFAULT_PROMPT =
  "make a detailed architectural sketch in studioisasketch style with fine lines, shading, and artistic detail. Black and white hand-drawn sketch style, no colors, no text, no watermarks, clean artistic sketch.";

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token is not configured." },
      { status: 500 }
    );
  }

  let body: { imageUrl?: unknown; prompt?: unknown; aspectRatio?: unknown } = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload.", details: (error as Error).message },
      { status: 400 }
    );
  }

  const { imageUrl, prompt, aspectRatio } = body;

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
      logger.warn("[api/ai-design-sketch] Image URL may not be accessible", {
        url: imageUrl.trim(),
        status: imageCheckResponse.status,
      });
    }
  } catch (error) {
    logger.warn("[api/ai-design-sketch] Could not verify image URL accessibility", {
      url: imageUrl.trim(),
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Convert image to prompt if user didn't provide a custom prompt
  let resolvedPrompt: string;

  if (typeof prompt === "string" && prompt.trim().length > 0) {
    // User provided a custom prompt, use it
    resolvedPrompt = prompt.trim();
  } else {
    // Convert image to prompt using OpenAI Vision API
    try {
      if (!process.env.OPENAI_API_KEY) {
        logger.warn("[api/ai-design-sketch] OpenAI API key not configured, using default prompt");
        resolvedPrompt = DEFAULT_PROMPT;
      } else {
        logger.info("[api/ai-design-sketch] Converting image to prompt using OpenAI Vision");
        const openai = getOpenAIClient();
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert at describing images for AI sketch generation. Analyze the image and create a detailed prompt that describes what should be sketched in a studioisasketch style. Focus on architectural and design elements, composition, and key visual features.",
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image and create a detailed prompt for generating a hand-drawn architectural sketch in studioisasketch style. Describe the key elements, composition, and design features.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl.trim(),
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
          temperature: 0.7,
        });

        const generatedPrompt = response.choices[0]?.message?.content?.trim();
        if (generatedPrompt) {
          resolvedPrompt = `${generatedPrompt}, in studioisasketch style, detailed architectural sketch, black and white hand-drawn style, fine lines, shading, artistic detail, no colors, no text, no watermarks`;
        } else {
          resolvedPrompt = DEFAULT_PROMPT;
        }
      }
    } catch (error) {
      logger.warn("[api/ai-design-sketch] Failed to convert image to prompt, using default", {
        error: error instanceof Error ? error.message : String(error),
      });
      resolvedPrompt = DEFAULT_PROMPT;
    }
  }

  // Build input with exact parameters from the example
  const aspectRatioValue = typeof aspectRatio === "string" && aspectRatio.trim()
    ? aspectRatio.trim()
    : "1:1";

  const input: Record<string, any> = {
    model: "dev",
    prompt: resolvedPrompt,
    go_fast: false,
    lora_scale: 1,
    megapixels: "1",
    num_outputs: 1,
    aspect_ratio: aspectRatioValue,
    output_format: "png",
    guidance_scale: 3,
    output_quality: 80,
    prompt_strength: 0.8,
    extra_lora_scale: 1,
    num_inference_steps: 28,
  };

  try {
    logger.info("[api/ai-design-sketch] Calling Replicate", {
      model: MODEL_IDENTIFIER,
      promptLength: resolvedPrompt.length,
    });

    const output = await replicate.run(MODEL_IDENTIFIER as `${string}/${string}`, { input });

    // Handle output according to Replicate SDK
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

    logger.info("[api/ai-design-sketch] Conversion successful", {
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
      prompt: resolvedPrompt,
      model: MODEL_IDENTIFIER,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError("/api/ai-design-sketch", error instanceof Error ? error : new Error(String(error)), {
      imageUrl: imageUrl.trim().substring(0, 100),
    });

    // Handle specific Replicate API errors
    if (error instanceof Error) {
      // 402 Payment Required - Insufficient credits on Replicate account
      if (error.message.includes("402") || error.message.includes("Payment Required") || error.message.includes("insufficient credit")) {
        return NextResponse.json(
          {
            error: "Replicate account has insufficient credits. Please add credits to your Replicate account at https://replicate.com/account/billing",
            details: "The Replicate API account needs to be topped up with credits to run this model.",
          },
          { status: 402 }
        );
      }
      // Rate limit errors
      if (error.message.includes("rate limit") || error.message.includes("429")) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again in a moment.",
            details: error.message,
          },
          { status: 429 }
        );
      }
      // Model not found errors
      if (error.message.includes("404") || error.message.includes("not found")) {
        return NextResponse.json(
          {
            error: "Model not found. The sketch model may not be available.",
            details: error.message,
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to convert image to sketch.",
        details: (error as Error).message,
        stack: process.env.NODE_ENV === "development" ? (error as Error).stack : undefined,
      },
      { status: 500 }
    );
  }
}

