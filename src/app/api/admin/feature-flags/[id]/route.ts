import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/core/utils/adminAuth";
import dbConnect from "@/lib/mongodb";
import FeatureFlag from "@/models/FeatureFlag";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

// GET single feature flag
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const flag = await FeatureFlag.findById(params.id).lean();

    if (!flag) {
      return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
    }

    return NextResponse.json({ flag });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/feature-flags/[id] GET", error);
    return NextResponse.json({ error: "Failed to fetch feature flag" }, { status: 500 });
  }
}

// PATCH - Update feature flag
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = await request.json();
    const { name, description, enabled, rolloutPercentage, targetUserGroups, category, tags } = body;

    const flag = await FeatureFlag.findByIdAndUpdate(
      params.id,
      {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(enabled !== undefined && { enabled }),
        ...(rolloutPercentage !== undefined && { rolloutPercentage }),
        ...(targetUserGroups !== undefined && { targetUserGroups }),
        ...(category && {
          "metadata.category": category,
        }),
        ...(tags !== undefined && {
          "metadata.tags": tags,
        }),
      },
      { new: true, runValidators: true }
    ).lean();

    if (!flag) {
      return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
    }

    return NextResponse.json({ flag });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/feature-flags/[id] PATCH", error);
    return NextResponse.json({ error: "Failed to update feature flag" }, { status: 500 });
  }
}

// DELETE - Delete feature flag
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const flag = await FeatureFlag.findByIdAndDelete(params.id);

    if (!flag) {
      return NextResponse.json({ error: "Feature flag not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/feature-flags/[id] DELETE", error);
    return NextResponse.json({ error: "Failed to delete feature flag" }, { status: 500 });
  }
}

