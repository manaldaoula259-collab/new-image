import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/core/utils/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    
    // Return settings from environment variables
    // Note: In production, these should be set via environment variables, not through the UI
    return NextResponse.json({
      replicateConfigured: !!process.env.REPLICATE_API_TOKEN,
      replicateApiToken: process.env.REPLICATE_API_TOKEN ? "••••••••••••••••" : "",
      s3Bucket: process.env.S3_UPLOAD_BUCKET || "",
      s3Region: process.env.S3_UPLOAD_REGION || "",
      s3AccessKey: process.env.S3_UPLOAD_ACCESS_KEY ? "••••••••••••••••" : "",
      s3SecretKey: process.env.S3_UPLOAD_SECRET_KEY ? "••••••••••••••••" : "",
      s3Endpoint: process.env.S3_UPLOAD_ENDPOINT || "",
      environment: process.env.NODE_ENV || "development",
      nodeVersion: process.version || "",
    });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    
    // Validate the settings
    if (body.replicateApiToken !== undefined) {
      if (body.replicateApiToken && !body.replicateApiToken.startsWith("r8_")) {
        return NextResponse.json(
          { error: "Invalid Replicate API token format" },
          { status: 400 }
        );
      }
    }

    if (body.s3Bucket !== undefined || body.s3Region !== undefined) {
      if (body.s3Bucket && !body.s3Region) {
        return NextResponse.json(
          { error: "S3 region is required when bucket is set" },
          { status: 400 }
        );
      }
    }

    // Note: In a real application, you would save these to a secure storage
    // For now, we'll just validate and return success
    // The actual values should be set via environment variables
    
    return NextResponse.json({
      success: true,
      message: "Settings validated successfully. Please update your environment variables and restart the server for changes to take effect.",
      note: "For security reasons, API keys should be configured via environment variables rather than through the UI.",
    });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
