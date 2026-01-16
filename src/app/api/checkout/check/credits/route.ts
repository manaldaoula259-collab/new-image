import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session_id");

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the session belongs to this user
    if (session.metadata?.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Check if payment was successful
    if (session.payment_status === "paid" && session.metadata?.type === "user_credits") {
      // Fetch updated user credits
      const user = await User.findOne({ userId });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        credits: user.credits,
        promptWizardCredits: user.promptWizardCredits,
      });
    }

    return NextResponse.json({
      success: false,
      payment_status: session.payment_status,
    });
  } catch (err) {
    logger.apiError("/api/checkout/check/credits", err instanceof Error ? err : new Error(String(err)), {
      sessionId: url.searchParams.get("session_id"),
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) || "Failed to check payment status" },
      { status: 500 }
    );
  }
}

