import dbConnect from "@/lib/mongodb";
import Media from "@/models/Media";
import { isS3Url, downloadAndUploadToS3 } from "@/core/utils/upload";
import { logger } from "@/core/utils/logger";

export async function saveGeneratedMedia(params: {
  userId: string;
  url: string | URL;
  prompt?: string;
  source?: string;
}) {
  const { userId } = params;
  // Handle URL object or string
  const urlValue = params.url instanceof URL ? params.url.href : params.url;
  const originalUrl = (urlValue || "").trim();
  const source = params.source || "tool";
  const prompt = params.prompt;

  if (!userId) {
    logger.apiError("[saveGeneratedMedia] userId is required", new Error("userId is required"), params);
    throw new Error("userId is required");
  }
  if (!originalUrl) {
    logger.apiError("[saveGeneratedMedia] url is required", new Error("url is required"), params);
    throw new Error("url is required");
  }

  try {
    await dbConnect();
  } catch (error) {
    logger.dbError("[saveGeneratedMedia] Database connection failed", error, { userId, originalUrl });
    throw error;
  }

  let finalUrl = originalUrl;

  // Ensure we persist an S3 URL when possible (Media page prefers S3)
  if (!isS3Url(finalUrl)) {
    try {
      logger.info("[saveGeneratedMedia] Uploading to S3", { userId, originalUrl });
      finalUrl = await downloadAndUploadToS3(finalUrl);
      logger.info("[saveGeneratedMedia] S3 upload successful", { userId, finalUrl });
    } catch (error) {
      logger.apiError("[saveGeneratedMedia] S3 upload failed", error, { originalUrl, userId });
      // fall back to originalUrl
      finalUrl = originalUrl;
    }
  }

  // De-dupe
  let existing;
  try {
    existing = await Media.findOne({
      userId,
      $or: [{ url: originalUrl }, { url: finalUrl }],
    }).lean();
  } catch (error) {
    logger.dbError("[saveGeneratedMedia] Find existing media failed", error, { userId, originalUrl, finalUrl });
    throw error;
  }

  if (existing) {
    logger.info("[saveGeneratedMedia] Media already exists", { userId, mediaId: (existing as any)._id });
    // Upgrade to S3 URL if we have it now
    if (!isS3Url((existing as any).url) && isS3Url(finalUrl)) {
      try {
        await Media.findByIdAndUpdate((existing as any)._id, { url: finalUrl });
        logger.info("[saveGeneratedMedia] Upgraded existing media to S3 URL", { userId, mediaId: (existing as any)._id });
      } catch (error) {
        logger.dbError("saveGeneratedMedia - update", error, { mediaId: (existing as any)._id });
      }
    }

    return {
      id: (existing as any)._id?.toString() ?? String(existing),
      url: isS3Url(finalUrl) ? finalUrl : (existing as any).url,
      createdAt: (existing as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
      source: (existing as any).source ?? source,
    };
  }

  // Create new media entry
  let media;
  try {
    // @ts-ignore
    media = await Media.create({
      userId,
      url: finalUrl,
      prompt: typeof prompt === "string" ? prompt : undefined,
      source,
    });
    logger.info("[saveGeneratedMedia] Media saved successfully", { 
      userId, 
      mediaId: (media as any)._id?.toString(), 
      url: finalUrl,
      source 
    });
  } catch (error) {
    logger.dbError("[saveGeneratedMedia] Failed to create media", error, { userId, finalUrl, source });
    throw error;
  }

  const mediaObj = (media as any).toObject ? (media as any).toObject() : media;

  return {
    id: (mediaObj as any)._id?.toString() ?? String(mediaObj),
    url: (mediaObj as any).url ?? finalUrl,
    createdAt: (mediaObj as any).createdAt?.toISOString?.() ?? new Date().toISOString(),
    source: (mediaObj as any).source ?? source,
  };
}



