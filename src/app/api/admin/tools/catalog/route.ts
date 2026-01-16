import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/utils/adminAuth";
import { getModelCatalog } from "@/core/replicate/modelCatalog";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const catalog = await getModelCatalog();
    
    return NextResponse.json({
      catalog: {
        lastUpdated: catalog.lastUpdated,
        modelCount: catalog.models.length,
        sampleModels: catalog.models.slice(0, 10).map((m) => m.id),
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/tools/catalog", error);
    return NextResponse.json({ error: "Failed to fetch catalog" }, { status: 500 });
  }
}


