import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/utils/adminAuth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();

    const users = await User.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      users: users.map((u: any) => ({
        _id: u._id?.toString(),
        userId: u.userId,
        email: u.email,
        credits: u.credits || 0,
        promptWizardCredits: u.promptWizardCredits || 0,
        createdAt: u.createdAt,
      })),
    });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/users", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}


