import { NextResponse } from "next/server";
import { requireAdmin } from "@/core/utils/adminAuth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Media from "@/models/Media";
import Payment from "@/models/Payment";
import Project from "@/models/Project";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days
    const days = parseInt(period);

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    // User Growth Data
    const userGrowthData = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Revenue Data (from payments)
    const revenueData = await Payment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: "succeeded",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Tool Usage Statistics
    const toolUsage = await Media.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Daily Activity
    const dailyActivity = await Media.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          generations: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Credit Usage
    const creditUsage = await User.aggregate([
      {
        $project: {
          totalCredits: { $sum: ["$credits", "$promptWizardCredits"] },
        },
      },
      {
        $group: {
          _id: null,
          totalCredits: { $sum: "$totalCredits" },
          avgCredits: { $avg: "$totalCredits" },
          maxCredits: { $max: "$totalCredits" },
        },
      },
    ]);

    // Top Users by Activity
    const topUsers = await Media.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$userId",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Overall Stats
    const [totalUsers, totalMedia, totalPayments, totalRevenue] = await Promise.all([
      User.countDocuments(),
      Media.countDocuments(),
      Payment.countDocuments({ status: "succeeded" }),
      Payment.aggregate([
        {
          $match: { status: "succeeded" },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    // New users in period
    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate },
    });

    // New media in period
    const newMedia = await Media.countDocuments({
      createdAt: { $gte: startDate },
    });

    return NextResponse.json({
      period: days,
      userGrowth: userGrowthData.map((item) => ({
        date: item._id,
        users: item.count,
      })),
      revenue: revenueData.map((item) => ({
        date: item._id,
        amount: item.revenue / 100, // Convert cents to dollars
        transactions: item.count,
      })),
      toolUsage: toolUsage.map((item) => ({
        tool: item._id || "unknown",
        count: item.count,
      })),
      dailyActivity: dailyActivity.map((item) => ({
        date: item._id,
        generations: item.count,
      })),
      creditStats: creditUsage[0] || {
        totalCredits: 0,
        avgCredits: 0,
        maxCredits: 0,
      },
      topUsers: topUsers.map((item) => ({
        userId: item._id,
        generations: item.count,
      })),
      overview: {
        totalUsers,
        totalMedia,
        totalPayments,
        totalRevenue: totalRevenue[0]?.total / 100 || 0,
        newUsers,
        newMedia,
        avgRevenuePerUser: totalUsers > 0 ? (totalRevenue[0]?.total / 100 || 0) / totalUsers : 0,
        avgGenerationsPerUser: totalUsers > 0 ? totalMedia / totalUsers : 0,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    logger.apiError("/api/admin/analytics", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

