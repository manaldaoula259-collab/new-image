import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/utils/adminAuth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Media from "@/models/Media";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    await dbConnect();

    const [totalUsers, totalMedia, users, mediaDocs] = await Promise.all([
      User.countDocuments(),
      Media.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(10).lean(),
      Media.find().sort({ createdAt: -1 }).limit(100).lean(),
    ]);

    // Calculate total credits across all users
    const usersWithCredits = await User.aggregate([
      { $group: { _id: null, totalCredits: { $sum: "$credits" } } },
    ]);
    const totalCredits = usersWithCredits[0]?.totalCredits || 0;

    // Total generations = total media
    const totalGenerations = totalMedia;

    return NextResponse.json({
      totalUsers,
      totalMedia,
      totalCredits,
      totalGenerations,
      recentUsers: users.map((u: any) => ({
        userId: u.userId,
        email: u.email || u.userId, // Fallback to userId if email is missing
        credits: u.credits,
        createdAt: u.createdAt,
      })),
      topTools: [], // Can be enhanced later
    });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/stats", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}


