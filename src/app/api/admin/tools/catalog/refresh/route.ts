import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/utils/adminAuth";
import { refreshModelCatalog } from "@/core/replicate/modelCatalog";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdmin();
    await refreshModelCatalog();
    
    return NextResponse.json({ success: true, message: "Catalog refreshed" });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/tools/catalog/refresh", error);
    return NextResponse.json({ error: "Failed to refresh catalog" }, { status: 500 });
  }
}


