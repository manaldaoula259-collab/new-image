import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@/core/clients/s3";
import { logger } from "@/core/utils/logger";
import uniqid from "uniqid";

export async function POST(request: NextRequest) {
  let file: File | null = null;
  
  try {
    const formData = await request.formData();
    file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    const bucket = process.env.AWS_S3_BUCKET_NAME;
    if (!bucket) {
      return NextResponse.json(
        { error: "S3 bucket not configured." },
        { status: 500 }
      );
    }

    const fileExtension = file.name.split(".").pop() || "png";
    const key = `next-s3-uploads/${uniqid()}.${fileExtension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || "image/png",
        ACL: "public-read", // Make file publicly accessible so Replicate can fetch it
      })
    );

    const region = process.env.AWS_S3_REGION || "us-east-1";
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return NextResponse.json({ url });
  } catch (error) {
    logger.apiError("/api/upload-image", error, {
      fileName: file?.name,
      fileSize: file?.size,
    });
    return NextResponse.json(
      {
        error: "Failed to upload image.",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

