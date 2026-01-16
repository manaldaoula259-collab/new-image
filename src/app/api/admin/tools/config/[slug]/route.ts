import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/core/utils/adminAuth";
import dbConnect from "@/lib/mongodb";
import ToolConfig from "@/models/ToolConfig";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

// GET single tool config by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const toolSlug = decodeURIComponent(params.slug);
    const config = await ToolConfig.findOne({ toolSlug }).lean();

    if (!config) {
      return NextResponse.json({ error: "Config not found" }, { status: 404 });
    }

    return NextResponse.json({ config });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/tools/config/[slug]", error);
    return NextResponse.json({ error: "Failed to fetch tool config" }, { status: 500 });
  }
}

// DELETE tool config
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const toolSlug = decodeURIComponent(params.slug);
    await ToolConfig.findOneAndDelete({ toolSlug });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/tools/config/[slug]", error);
    return NextResponse.json({ error: "Failed to delete tool config" }, { status: 500 });
  }
}


