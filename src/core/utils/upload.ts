import uniqid from "uniqid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/core/clients/s3";
import axios from "axios";

export async function resizeImage(file: File | Blob) {
  const imageBlobReduce = await import("image-blob-reduce");
  const reduce = imageBlobReduce.default();
  const blob = new Blob([file], { type: "image/jpeg" });
  const resizedBlob = await reduce.toBlob(blob, { max: 1024 });
  const resizedFile = new File([resizedBlob], `${uniqid()}.jpeg`);

  return resizedFile;
}

export const createPreviewMedia = (media: File | Blob): File & { preview: string } => {
  // Ensure we always return a File, converting Blob to File if needed
  const file = media instanceof File 
    ? media 
    : new File([media], `preview-${Date.now()}.jpg`, { type: media.type || 'image/jpeg' });
  
  return Object.assign(file, {
    preview: URL.createObjectURL(media),
  });
};

/**
 * Checks if a URL is already an S3 URL
 */
export function isS3Url(url: string): boolean {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  if (!bucket) return false;
  
  // Check if URL contains the S3 bucket name
  return url.includes(`${bucket}.s3`) || url.includes(`s3.amazonaws.com`);
}

/**
 * Downloads a media file (image or video) from a URL and uploads it to S3
 * Returns the S3 URL
 */
export async function downloadAndUploadToS3(imageUrl: string): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_S3_REGION || "us-east-1";

  if (!bucket) {
    throw new Error("S3 bucket not configured");
  }

  // Download the media file (image or video)
  const response = await axios.get(imageUrl, {
    responseType: "arraybuffer",
    timeout: 60000, // 60 second timeout for videos (longer than images)
  });

  const buffer = Buffer.from(response.data);
  
  // Determine file extension from URL or content type
  const contentType = response.headers["content-type"] || "";
  let fileExtension = "png"; // Default fallback
  let finalContentType = contentType || "image/png"; // Default content type
  
  // Check content type first (prioritize video types)
  if (contentType.includes("video/mp4")) {
    fileExtension = "mp4";
    finalContentType = "video/mp4";
  } else if (contentType.includes("video/webm")) {
    fileExtension = "webm";
    finalContentType = "video/webm";
  } else if (contentType.includes("video/quicktime") || contentType.includes("video/mov")) {
    fileExtension = "mov";
    finalContentType = "video/quicktime";
  } else if (contentType.includes("video")) {
    // Generic video type - try to detect from URL
    const urlMatch = imageUrl.match(/\.(mp4|webm|mov|avi|mkv)/i);
    if (urlMatch) {
      fileExtension = urlMatch[1].toLowerCase();
      finalContentType = `video/${fileExtension === "mov" ? "quicktime" : fileExtension}`;
    } else {
      fileExtension = "mp4"; // Default video extension
      finalContentType = "video/mp4";
    }
  } else if (contentType.includes("jpeg") || contentType.includes("jpg")) {
    fileExtension = "jpg";
    finalContentType = "image/jpeg";
  } else if (contentType.includes("png")) {
    fileExtension = "png";
    finalContentType = "image/png";
  } else if (contentType.includes("webp")) {
    fileExtension = "webp";
    finalContentType = "image/webp";
  } else if (contentType.includes("gif")) {
    fileExtension = "gif";
    finalContentType = "image/gif";
  } else {
    // Try to get extension from URL (check for both images and videos)
    const urlMatch = imageUrl.match(/\.(jpg|jpeg|png|webp|gif|mp4|webm|mov|avi|mkv)/i);
    if (urlMatch) {
      fileExtension = urlMatch[1].toLowerCase();
      // Set appropriate content type based on extension
      if (["mp4", "webm", "mov", "avi", "mkv"].includes(fileExtension)) {
        finalContentType = fileExtension === "mov" ? "video/quicktime" : `video/${fileExtension}`;
      } else {
        finalContentType = fileExtension === "jpg" || fileExtension === "jpeg" ? "image/jpeg" : `image/${fileExtension}`;
      }
    }
  }

  const key = `media/${uniqid()}.${fileExtension}`;

  // Upload to S3
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: finalContentType,
      ACL: "public-read",
    })
  );

  const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  return s3Url;
}
