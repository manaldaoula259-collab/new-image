import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/core/utils/adminAuth";
import Replicate from "replicate";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    await requireAdmin();
    
    const type = params.type;

    if (type === "replicate") {
      const replicateToken = process.env.REPLICATE_API_TOKEN;
      
      if (!replicateToken) {
        return NextResponse.json(
          { error: "Replicate API token not configured" },
          { status: 400 }
        );
      }

      try {
        const replicate = new Replicate({
          auth: replicateToken,
        });

        // Test by fetching models list
        await replicate.models.list();
        
        return NextResponse.json({
          success: true,
          message: "Replicate API connection successful",
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: `Replicate API test failed: ${error.message}` },
          { status: 400 }
        );
      }
    }

    if (type === "s3") {
      const s3Bucket = process.env.S3_UPLOAD_BUCKET;
      const s3Region = process.env.S3_UPLOAD_REGION;
      const s3AccessKey = process.env.S3_UPLOAD_ACCESS_KEY;
      const s3SecretKey = process.env.S3_UPLOAD_SECRET_KEY;

      if (!s3Bucket || !s3Region || !s3AccessKey || !s3SecretKey) {
        return NextResponse.json(
          { error: "S3 configuration incomplete. Please set all required S3 environment variables." },
          { status: 400 }
        );
      }

      // Test S3 connection by checking if we can access AWS SDK
      try {
        const { S3Client, HeadBucketCommand } = await import("@aws-sdk/client-s3");
        
        const s3Client = new S3Client({
          region: s3Region,
          credentials: {
            accessKeyId: s3AccessKey,
            secretAccessKey: s3SecretKey,
          },
        });

        // Try to head the bucket (check if it exists and is accessible)
        await s3Client.send(new HeadBucketCommand({ Bucket: s3Bucket }));
        
        return NextResponse.json({
          success: true,
          message: `S3 connection successful. Bucket "${s3Bucket}" is accessible.`,
        });
      } catch (error: any) {
        return NextResponse.json(
          { error: `S3 connection test failed: ${error.message}` },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Invalid test type" },
      { status: 400 }
    );
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: `Test failed: ${error.message}` },
      { status: 500 }
    );
  }
}

