import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import dbConnect from "@/lib/mongodb";
import Media from "@/models/Media";
import Project from "@/models/Project";
import Shot from "@/models/Shot";
import { isS3Url, downloadAndUploadToS3 } from "@/core/utils/upload";
import { logger } from "@/core/utils/logger";

type MediaResponseItem = {
  id: string;
  url: string;
  prompt?: string;
  source?: string;
  createdAt: string;
};

/**
 * Handle existing media - update if needed or return existing
 */
async function handleExistingMedia(existing: any, finalUrl: string, originalUrl: string) {
  // If existing media has a non-S3 URL but we now have an S3 URL, update it
  if (!isS3Url(existing.url) && isS3Url(finalUrl)) {
    try {
      await Media.findByIdAndUpdate(existing._id, { url: finalUrl });
    } catch (error) {
      logger.dbError("handleExistingMedia - update", error, { mediaId: existing._id });
    }
    return NextResponse.json(
      {
        media: {
          id: (existing as any)._id?.toString() ?? String(existing),
          url: finalUrl,
          prompt: existing.prompt ?? undefined,
          source: existing.source ?? "library",
          createdAt:
            existing.createdAt?.toISOString() ?? new Date().toISOString(),
        },
        message: "Media updated with S3 URL.",
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      media: {
        id: (existing as any)._id?.toString() ?? String(existing),
        url: existing.url,
        prompt: existing.prompt ?? undefined,
        source: existing.source ?? "library",
        createdAt:
          existing.createdAt?.toISOString() ?? new Date().toISOString(),
      },
      message: "Media already saved.",
    },
    { status: 200 }
  );
}

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json([], { status: 401 });
  }

  await dbConnect();

  // @ts-ignore - Mongoose query types are too complex for TypeScript
  const [mediaDocs, projects] = await Promise.all([
    Media.find({ userId }).sort({ createdAt: -1 }).lean(),
    Project.find({ userId })
      .select(["_id", "imageUrls"])
      .lean(),
  ]);

  const projectIds = projects.map((project) => project._id);
  let projectShots: MediaResponseItem[] = [];

  if (projectIds.length > 0) {
    const shots = await Shot.find({
      projectId: { $in: projectIds },
    })
      .sort({ createdAt: -1 })
      .select(["_id", "projectId", "hdOutputUrl", "outputUrl", "createdAt"])
      .lean();

    const projectMap = new Map(
      projects.map((project: any) => [(project._id?.toString() ?? String(project)), project])
    );

    projectShots = shots
      .map((shot) => {
        const project = projectMap.get(shot.projectId?.toString() ?? "");
        const url =
          shot.hdOutputUrl ??
          shot.outputUrl ??
          (project?.imageUrls && project.imageUrls[0]);

        if (!url) {
          return null;
        }

        return {
          id: (shot as any)._id?.toString() ?? String(shot),
          url,
          source: "project-shot",
          createdAt: (shot as any).createdAt?.toISOString() ?? new Date().toISOString(),
        } satisfies MediaResponseItem;
      })
      .filter((item) => item !== null) as MediaResponseItem[];
  }

  const libraryMedia: MediaResponseItem[] = mediaDocs.map((doc: any) => ({
    id: doc._id?.toString() ?? String(doc),
    url: doc.url,
    prompt: doc.prompt ?? undefined,
    source: doc.source ?? "library",
    createdAt: doc.createdAt?.toISOString() ?? new Date().toISOString(),
  }));

  const combined = [...libraryMedia, ...projectShots].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(combined);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { url?: unknown; prompt?: unknown; source?: unknown } = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload.", details: (error as Error).message },
      { status: 400 }
    );
  }

  const { url, prompt, source } = body;

  if (typeof url !== "string" || url.trim().length === 0) {
    return NextResponse.json(
      { error: "url is required and must be a non-empty string." },
      { status: 400 }
    );
  }

  await dbConnect();

  let finalUrl = url.trim();

  // If the URL is not already an S3 URL, download and upload it to S3
  if (!isS3Url(finalUrl)) {
    try {
      logger.info("Uploading media to S3", { originalUrl: finalUrl });
      finalUrl = await downloadAndUploadToS3(finalUrl);
      logger.info("Media uploaded to S3 successfully", { s3Url: finalUrl });
    } catch (error) {
      logger.apiError("/api/media (POST) - S3 upload", error, {
        originalUrl: url,
      });
      // If S3 upload fails, we'll still save the original URL
      // but log the error for monitoring
    }
  }

  // Check if media with this URL already exists (check both original and S3 URL)
  const existing = await Media.findOne({ 
    userId, 
    $or: [
      { url: url.trim() },
      { url: finalUrl }
    ]
  }).lean();

  if (existing) {
    return await handleExistingMedia(existing, finalUrl, url.trim());
  }

  return createNewMedia(userId, finalUrl, prompt, source);
}

/**
 * Create new media entry
 */
async function createNewMedia(
  userId: string,
  finalUrl: string,
  prompt: unknown,
  source: unknown
) {
  // @ts-ignore - Mongoose create types are too complex for TypeScript
  const media = await Media.create({
    userId,
    url: finalUrl,
    prompt: typeof prompt === "string" ? prompt : undefined,
    source: typeof source === "string" ? source : "library",
  });

  const mediaObj = media.toObject ? media.toObject() : media;

  return NextResponse.json(
    {
      media: {
        id: (mediaObj as any)._id?.toString() ?? String(mediaObj),
        url: (mediaObj as any).url ?? finalUrl,
        prompt: (mediaObj as any).prompt ?? (typeof prompt === "string" ? prompt : undefined),
        source: (mediaObj as any).source ?? (typeof source === "string" ? source : "library"),
        createdAt: (mediaObj as any).createdAt?.toISOString() ?? new Date().toISOString(),
      },
    },
    { status: 201 }
  );
}

