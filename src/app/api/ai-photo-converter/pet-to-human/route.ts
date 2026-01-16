import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";
import { auth } from "@clerk/nextjs/server";
import { saveGeneratedMedia } from "@/core/utils/saveGeneratedMedia";
import { resolveReplicateModelIdentifierForSlug } from "@/core/replicate/modelCatalog";

export const dynamic = "force-dynamic";

const FALLBACK_MODEL_IDENTIFIER = "black-forest-labs/flux-dev";

const DEFAULT_PROMPT =
  "Transform this pet photo into a realistic human portrait while keeping the same vibe, pose, and composition. Preserve key traits like fur color pattern as hair/skin tone inspiration, eye color vibe, and personality. Make it look like a professional portrait photo. No text, no watermarks.";

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
  const userPrompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

  if (!imageUrl) {
    return NextResponse.json(
      { error: "imageUrl is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  // Check credits first (deduct on success only)
  const creditCheck = await checkCredits(1);
  if (!creditCheck.success) {
    return NextResponse.json(
      { error: creditCheck.error || "Insufficient credits" },
      { status: 400 }
    );
  }

  const resolved = await resolveReplicateModelIdentifierForSlug("pet-to-human");
  const modelIdentifier = (resolved.identifier && resolved.confidence >= 25)
    ? resolved.identifier
    : FALLBACK_MODEL_IDENTIFIER;

  const resolvedPrompt = userPrompt ? `${DEFAULT_PROMPT} ${userPrompt}` : DEFAULT_PROMPT;

  const input: Record<string, any> = {
    prompt: resolvedPrompt,
    image: imageUrl,
    negative_prompt:
      "text, watermark, label, signature, logo, writing, letters, words, captions, text overlay, copyright, brand name, company name, website URL",
  };

  try {
    logger.info("[api/pet-to-human] Calling Replicate", {
      model: modelIdentifier,
      hasImage: !!imageUrl
    });

    const output = await replicate.run(modelIdentifier as `${string}/${string}`, { input });

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
      throw new Error("Replicate did not return a valid output.");
    }

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
          source: "tool:ai-photo-converter/pet-to-human",
        });
      }
    } catch (e) {
      logger.apiError("[pet-to-human] Failed to save media", e);
    }

    return NextResponse.json({
      resultUrl,
      prompt: resolvedPrompt,
      model: modelIdentifier,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError(
      "/api/ai-photo-converter/pet-to-human",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      { error: "Failed to convert pet to human.", details: (error as Error).message },
      { status: 500 }
    );
  }
}


