import { NextResponse, NextRequest } from "next/server";
import { requireAdmin } from "@/core/utils/adminAuth";
import dbConnect from "@/lib/mongodb";
import FeatureFlag from "@/models/FeatureFlag";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

// GET all feature flags
export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();

    const flags = await FeatureFlag.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ flags });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/feature-flags", error);
    return NextResponse.json({ error: "Failed to fetch feature flags" }, { status: 500 });
  }
}

// POST - Create new feature flag
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = await request.json();
    const { key, name, description, enabled, rolloutPercentage, targetUserGroups, category, tags } = body;

    if (!key || !name) {
      return NextResponse.json(
        { error: "Key and name are required" },
        { status: 400 }
      );
    }

    // Check if key already exists
    const existing = await FeatureFlag.findOne({ key: key.toLowerCase() });
    if (existing) {
      return NextResponse.json(
        { error: "Feature flag with this key already exists" },
        { status: 400 }
      );
    }

    const flag = await FeatureFlag.create({
      key: key.toLowerCase(),
      name,
      description: description || "",
      enabled: enabled || false,
      rolloutPercentage: rolloutPercentage || 100,
      targetUserGroups: targetUserGroups || [],
      metadata: {
        category: category || "general",
        tags: tags || [],
      },
    });

    return NextResponse.json({ flag: flag.toObject() }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/feature-flags POST", error);
    return NextResponse.json({ error: "Failed to create feature flag" }, { status: 500 });
  }
}

