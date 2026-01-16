import { NextRequest, NextResponse } from "next/server";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";
import { runGenericToolWithReplicate } from "@/core/replicate/runGenericTool";
import { auth } from "@clerk/nextjs/server";
import { saveGeneratedMedia } from "@/core/utils/saveGeneratedMedia";

export const dynamic = "force-dynamic";

type Props = { params: { slug?: string[] } };

export async function POST(request: NextRequest, { params }: Props) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token is not configured." },
      { status: 500 }
    );
  }

  const toolSlug = (params.slug || []).join("/");

  let body: {
    prompt?: unknown;
    imageUrl?: unknown;
    aspectRatio?: unknown;
    outputFormat?: unknown;
    styleStrength?: unknown;
    preserveFace?: unknown;
  } = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload.", details: (error as Error).message },
      { status: 400 }
    );
  }

  const prompt = typeof body.prompt === "string" ? body.prompt : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : "";
  const aspectRatio = typeof body.aspectRatio === "string" ? body.aspectRatio : undefined;
  const outputFormat =
    typeof body.outputFormat === "string" && ["png", "jpg", "webp"].includes(body.outputFormat)
      ? (body.outputFormat as "png" | "jpg" | "webp")
      : "jpg";
  const styleStrength = typeof body.styleStrength === "number" ? body.styleStrength : undefined;
  const preserveFace = typeof body.preserveFace === "boolean" ? body.preserveFace : undefined;

  // Credit check first (deduct on success only)
  const creditCheck = await checkCredits(1);
  if (!creditCheck.success) {
    return NextResponse.json(
      { error: creditCheck.error || "Insufficient credits" },
      { status: 400 }
    );
  }

  try {
    const run = await runGenericToolWithReplicate({
      toolSlug,
      prompt,
      imageUrl,
      aspectRatio,
      outputFormat,
      styleStrength,
      preserveFace,
    });

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
        logger.info("[tool-catchall] Saving media to library", { userId, toolSlug, resultUrl: run.resultUrl });
        await saveGeneratedMedia({
          userId,
          url: run.resultUrl,
          prompt,
          source: `tool:${toolSlug}`,
        });
        logger.info("[tool-catchall] Media saved successfully", { userId, toolSlug });
      } else {
        logger.warn("[tool-catchall] No userId found, skipping media save", { toolSlug });
      }
    } catch (e) {
      logger.apiError("[tool-catchall] Failed to save media", e, { toolSlug, resultUrl: run.resultUrl });
    }

    return NextResponse.json({
      ...run,
      toolSlug,
      creditsDeducted: 1,
    });
  } catch (error) {
    logger.apiError(
      "/api/_tool-catchall/[...slug]",
      error instanceof Error ? error : new Error(String(error)),
      { toolSlug }
    );

    const errorMessage = (error as Error).message || "Unknown error";

    // Handle Sensitive Content / NSFW Errors
    if (errorMessage.includes("NSFW") ||
      errorMessage.includes("sensitive") ||
      errorMessage.includes("content policy") ||
      errorMessage.includes("E005")) {
      return NextResponse.json(
        {
          error: "Content flagged as sensitive.",
          details: "The model rejected your prompt due to safety filters. Please try a different prompt without explicit or sensitive content."
        },
        { status: 400 } // Bad Request (User error), not 500 (Server error)
      );
    }

    return NextResponse.json(
      { error: "Failed to run tool.", details: errorMessage },
      { status: 500 }
    );
  }
}


