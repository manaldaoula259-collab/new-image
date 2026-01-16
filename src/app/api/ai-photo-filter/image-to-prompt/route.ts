import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/core/clients/openai";
import { checkAndDeductPromptCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";

const SYSTEM_PROMPT = `You are an expert prompt engineer specializing in creating detailed, high-quality prompts for AI image generation models (like Stable Diffusion, DALL-E, Midjourney, etc.).

Your task is to analyze the uploaded image and generate a comprehensive, well-structured prompt that accurately describes the image. The prompt should:

1. Be detailed and descriptive, capturing all important visual elements
2. Include style, composition, lighting, colors, mood, and atmosphere
3. Use technical terms where appropriate (e.g., "cinematic lighting", "depth of field", "volumetric fog")
4. Be optimized for AI image generation models
5. Be clear, concise, and well-formatted
6. Focus on visual elements only - no text descriptions unless text is actually visible in the image

Generate a single, polished prompt that could be used to recreate a similar image.`;

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
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

  // Check and deduct prompt wizard credits
  const creditCheck = await checkAndDeductPromptCredits(5);
  if (!creditCheck.success) {
    return NextResponse.json(
      { error: creditCheck.error || "Insufficient prompt wizard credits" },
      { status: 400 }
    );
  }

  // Verify the image URL is accessible
  try {
    const imageCheckResponse = await fetch(imageUrl.trim(), { method: "HEAD" });
    if (!imageCheckResponse.ok) {
      logger.warn("[api/image-to-prompt] Image URL may not be accessible", {
        url: imageUrl.trim(),
        status: imageCheckResponse.status,
      });
    }
  } catch (error) {
    logger.warn("[api/image-to-prompt] Could not verify image URL accessibility", {
      url: imageUrl.trim(),
      error: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    logger.info("[api/image-to-prompt] Calling OpenAI Vision API", {
      imageUrl: imageUrl.trim(),
    });

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o which has vision capabilities
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and generate a detailed, high-quality prompt that accurately describes it. The prompt should be optimized for AI image generation models and include all important visual elements, style, composition, lighting, colors, and mood.",
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
      max_tokens: 500,
      temperature: 0.7,
    });

    const generatedPrompt = response.choices[0]?.message?.content?.trim();

    if (!generatedPrompt) {
      throw new Error("OpenAI did not return a prompt.");
    }

    logger.info("[api/image-to-prompt] Generated prompt successfully", {
      promptLength: generatedPrompt.length,
    });

    return NextResponse.json({
      prompt: generatedPrompt,
    });
  } catch (error) {
    logger.apiError("/api/image-to-prompt", error instanceof Error ? error : new Error(String(error)), {
      imageUrl: imageUrl.trim(),
    });

    // Handle OpenAI API errors
    if (error instanceof Error) {
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again in a moment.",
            details: error.message,
          },
          { status: 429 }
        );
      }
      if (error.message.includes("invalid_api_key")) {
        return NextResponse.json(
          {
            error: "OpenAI API key is invalid.",
            details: error.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Failed to generate prompt from image.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

