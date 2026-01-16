import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/core/utils/adminAuth";
import dbConnect from "@/lib/mongodb";
import ToolConfig from "@/models/ToolConfig";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

// GET all tool configs
export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();

    const configs = await ToolConfig.find({}).sort({ toolSlug: 1 }).lean();

    return NextResponse.json({ configs });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/tools/config", error);
    return NextResponse.json({ error: "Failed to fetch tool configs" }, { status: 500 });
  }
}

// POST - Create or update tool config
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = await request.json();
    const {
      toolSlug,
      modelIdentifier,
      promptTemplate,
      negativePrompt,
      defaultAspectRatio,
      defaultOutputFormat,
      creditsCost,
      enabled,
    } = body;

    if (!toolSlug || !modelIdentifier || !promptTemplate) {
      return NextResponse.json(
        { error: "toolSlug, modelIdentifier, and promptTemplate are required" },
        { status: 400 }
      );
    }

    const config = await ToolConfig.findOneAndUpdate(
      { toolSlug },
      {
        modelIdentifier,
        promptTemplate,
        negativePrompt: negativePrompt || "",
        defaultAspectRatio: defaultAspectRatio || "1:1",
        defaultOutputFormat: defaultOutputFormat || "jpg",
        creditsCost: creditsCost || 5,
        enabled: enabled !== undefined ? enabled : true,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ config });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/tools/config", error);
    return NextResponse.json({ error: "Failed to save tool config" }, { status: 500 });
  }
}


