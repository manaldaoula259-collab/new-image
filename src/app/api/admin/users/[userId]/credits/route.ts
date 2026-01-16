import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/core/utils/adminAuth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const body = await request.json();
    const { credits } = body;

    if (typeof credits !== "number" || credits < 0) {
      return NextResponse.json({ error: "Invalid credits value" }, { status: 400 });
    }

    const user = await User.findOneAndUpdate(
      { userId: params.userId },
      { credits },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      credits: user.credits,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/users/[userId]/credits", error);
    return NextResponse.json({ error: "Failed to update credits" }, { status: 500 });
  }
}


