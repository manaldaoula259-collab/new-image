import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/utils/adminAuth";
import dbConnect from "@/lib/mongodb";
import Media from "@/models/Media";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();

    const media = await Media.find().sort({ createdAt: -1 }).limit(500).lean();

    return NextResponse.json({
      media: media.map((m: any) => ({
        id: m._id?.toString(),
        url: m.url,
        prompt: m.prompt,
        userId: m.userId,
        source: m.source,
        createdAt: m.createdAt,
      })),
    });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/media", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}


