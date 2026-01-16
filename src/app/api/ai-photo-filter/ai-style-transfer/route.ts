import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";
import { getOpenAIClient } from "@/core/clients/openai";

const MODEL_IDENTIFIER = "fofr/style-transfer:f1023890703bc0a5a3a2c21b5e498833be5f6ef6e70e9daf6b9b3a4fd8309cf0";

// Style presets for different artistic transformations
const STYLE_PROMPTS: Record<string, string> = {
  painterly: "impressionist painting style with bold, expressive brushstrokes and vibrant colors. No text, no watermarks, clean artistic painting.",
  cyberpunk: "cyberpunk neon aesthetic with vibrant electric colors, glowing neon lights, futuristic atmosphere, dark moody shadows, and high-tech urban vibes. Add neon pink, cyan, and purple accents. No text, no watermarks, clean cyberpunk style.",
  abstract: "abstract artistic composition with geometric shapes, bold colors, creative distortions, and modern abstract art style. Add artistic abstraction, unique patterns, and creative visual elements. No text, no watermarks, clean abstract artwork.",
  watercolor: "watercolor painting with soft flowing colors, gentle brush strokes, translucent layers, and dreamy artistic watercolor style. Add soft edges and artistic watercolor effects. No text, no watermarks, clean watercolor painting.",
  oil_painting: "classic oil painting with rich textures, thick impasto brushstrokes, traditional oil painting techniques, and artistic depth. Add classical painting style with rich colors and textures. No text, no watermarks, clean oil painting.",
  sketch: "detailed pencil sketch with fine lines, shading, cross-hatching, and artistic sketch style. Add realistic pencil drawing effects with depth and detail. No text, no watermarks, clean sketch artwork.",
};

const DEFAULT_STYLE = "painterly";

export async function POST(request: NextRequest) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token is not configured." },
      { status: 500 }
    );
  }

  let body: { imageUrl?: unknown; style?: unknown } = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload.", details: (error as Error).message },
      { status: 400 }
    );
  }

  const { imageUrl, style } = body;

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
      logger.warn("[api/ai-style-transfer] Image URL may not be accessible", {
        url: imageUrl.trim(),
        status: imageCheckResponse.status,
      });
    }
  } catch (error) {
    logger.warn("[api/ai-style-transfer] Could not verify image URL accessibility", {
      url: imageUrl.trim(),
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const selectedStyle =
    typeof style === "string" && style in STYLE_PROMPTS ? style : DEFAULT_STYLE;
  const styleDescription = STYLE_PROMPTS[selectedStyle];

  // Generate a prompt describing the user's image content using OpenAI Vision
  // Then use that prompt with the style description for style transfer
  let contentPrompt: string;
  try {
    if (process.env.OPENAI_API_KEY) {
      logger.info("[api/ai-style-transfer] Generating content prompt from image");
      const openai = getOpenAIClient();
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at describing images concisely. Describe the main subject, composition, and key visual elements in a short, clear prompt suitable for AI image generation.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Describe the main subject and composition of this image in a concise prompt (2-3 sentences max). Focus on what is in the image, not the style.",
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
        max_tokens: 150,
        temperature: 0.7,
      });

      const generatedPrompt = response.choices[0]?.message?.content?.trim();
      if (generatedPrompt) {
        contentPrompt = `${generatedPrompt}, ${styleDescription}`;
      } else {
        contentPrompt = `A detailed image, ${styleDescription}`;
      }
    } else {
      // Fallback if OpenAI is not available
      contentPrompt = `A detailed image, ${styleDescription}`;
    }
  } catch (error) {
    logger.warn("[api/ai-style-transfer] Failed to generate content prompt, using fallback", {
      error: error instanceof Error ? error.message : String(error),
    });
    contentPrompt = `A detailed image, ${styleDescription}`;
  }

  // Build input with exact parameters from the example
  // The model requires style_image (the style reference) and prompt (what to generate)
  // For style transfer, we use the user's image as the style reference
  const input: Record<string, any> = {
    model: "fast",
    width: 1024,
    height: 1024,
    prompt: contentPrompt,
    style_image: imageUrl.trim(), // User's image is used as the style reference
    output_format: "png",
    output_quality: 80,
    negative_prompt: "",
    number_of_images: 1,
    structure_depth_strength: 1,
    structure_denoising_strength: 0.65,
  };

  try {
    logger.info("[api/ai-style-transfer] Calling Replicate", {
      model: MODEL_IDENTIFIER,
      style: selectedStyle,
      promptLength: contentPrompt.length,
    });

    const output = await replicate.run(MODEL_IDENTIFIER, { input });

    // Handle output according to Replicate SDK
    // The model returns an array: output[0].url()
    let resultUrl: string;

    if (Array.isArray(output) && output.length > 0) {
      const firstOutput = output[0];
      if (typeof firstOutput === "string") {
        resultUrl = firstOutput;
      } else if (firstOutput && typeof firstOutput === "object") {
        if ("url" in firstOutput && typeof (firstOutput as any).url === "function") {
          resultUrl = await (firstOutput as any).url();
        } else if ("url" in firstOutput && typeof (firstOutput as any).url === "string") {
          resultUrl = (firstOutput as any).url;
        } else {
          throw new Error("Invalid output format from Replicate");
        }
      } else {
        throw new Error("Invalid output format from Replicate");
      }
    } else if (output && typeof output === "object") {
      if ("url" in output && typeof (output as any).url === "function") {
        resultUrl = await (output as any).url();
      } else if ("url" in output && typeof (output as any).url === "string") {
        resultUrl = (output as any).url;
      } else {
        throw new Error(`Invalid output format from Replicate: ${JSON.stringify(output)}`);
      }
    } else if (typeof output === "string") {
      resultUrl = output;
    } else {
      throw new Error(`Replicate did not return a valid output. Type: ${typeof output}`);
    }

    logger.info("[api/ai-style-transfer] Style transfer successful", {
      style: selectedStyle,
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
      style: selectedStyle,
      prompt: contentPrompt,
      model: MODEL_IDENTIFIER,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError("/api/ai-style-transfer", error instanceof Error ? error : new Error(String(error)), {
      style: selectedStyle,
      imageUrl: imageUrl.trim().substring(0, 100),
    });
    return NextResponse.json(
      {
        error: "Failed to apply style transfer to image.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

