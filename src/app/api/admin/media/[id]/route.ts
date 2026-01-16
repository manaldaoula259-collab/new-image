import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/utils/adminAuth";
import dbConnect from "@/lib/mongodb";
import Media from "@/models/Media";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    await Media.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/media/[id]", error);
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}


