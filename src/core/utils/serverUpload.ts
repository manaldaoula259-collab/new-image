import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/core/clients/s3";
import sharp from "sharp";
import axios from "axios";
import uniqid from "uniqid";
import { logger } from "@/core/utils/logger";

export async function resizeAndUploadToS3(imageUrl: string, maxSize: number = 1024): Promise<string> {
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_S3_REGION || "us-east-1";

    if (!bucket) throw new Error("AWS_S3_BUCKET_NAME is not configured");

    try {
        // 1. Download
        logger.info("[resizeAndUploadToS3] Downloading image for resize", { imageUrl });
        const response = await axios.get(imageUrl, {
            responseType: "arraybuffer",
            timeout: 30000,
        });
        const inputBuffer = Buffer.from(response.data);

        // 2. Check metadata to see if resize is needed
        // If the image is already small enough, we might not need to resize? 
        // But for consistency and format (jpeg), we can process it.
        // However, if the user uploaded a PNG with transparency (for background stuff), converting to jpeg kills transparency!
        // Background generators usually need the subject. If subject separation logic (rembg) isn't used before this, we might need transparency.
        // 'generator' via SDXL img2img usually takes an opaque image.
        // But if we want to be safe, we should check format.

        const metadata = await sharp(inputBuffer).metadata();

        // If image is within bounds, return original URL (saving bandwidth/time)
        if (metadata.width && metadata.height && metadata.width <= maxSize && metadata.height <= maxSize) {
            logger.info("[resizeAndUploadToS3] Image is already small enough, skipping resize", { width: metadata.width, height: metadata.height });
            return imageUrl;
        }

        if (!metadata.format) throw new Error("Unable to determine image format");

        // Preserve transparency if png/webp
        const format = (metadata.format === 'png' || metadata.format === 'webp') ? metadata.format : 'jpeg';
        const contentType = `image/${format}`;

        logger.info("[resizeAndUploadToS3] Resizing image", { originalWidth: metadata.width, targetMax: maxSize });

        // 3. Resize
        const resizedBuffer = await sharp(inputBuffer)
            .resize(maxSize, maxSize, {
                fit: "inside",
                withoutEnlargement: true,
            })
            .toFormat(format, { quality: 90 }) // High quality
            .toBuffer();

        // 4. Upload
        const key = `media/resized/${uniqid()}.${format}`;

        await s3Client.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: resizedBuffer,
                ContentType: contentType,
                ACL: "public-read",
            })
        );

        const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
        logger.info("[resizeAndUploadToS3] Uploaded resized image", { s3Url });
        return s3Url;

    } catch (error) {
        logger.error("[resizeAndUploadToS3] Failed to resize image", error);
        // Fallback to original URL if resize fails, but risk OOM
        return imageUrl;
    }
}
