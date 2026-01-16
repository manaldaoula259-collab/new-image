import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import dbConnect from "@/lib/mongodb";
import { logger } from "@/core/utils/logger";
import User from "@/models/User";
import Payment from "@/models/Payment";

// Disable body parsing for webhook route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Process credit purchase from Stripe checkout session
 * Returns NextResponse if there's an error, null if successful
 */
async function processCreditPurchase(session: Stripe.Checkout.Session): Promise<NextResponse | null> {
  if (!session.metadata) {
    logger.error("Session metadata is missing", undefined, {
      sessionId: session.id,
    });
    return NextResponse.json(
      { error: "Missing session metadata" },
      { status: 400 }
    );
  }

  const userId = session.metadata.userId;
  const credits = Number(session.metadata.credits);
  const promptCredits = Number(session.metadata.promptCredits);

  if (!userId || !credits || !promptCredits) {
    logger.error("Missing required metadata in session", undefined, {
      sessionId: session.id,
    });
    return NextResponse.json(
      { error: "Missing required metadata" },
      { status: 400 }
    );
  }

  // Check if payment was already processed
  const existingPayment = await Payment.findOne({
    stripeSessionId: session.id,
    status: "paid",
    type: "user_credits",
  });

  if (existingPayment) {
    logger.info("Payment already processed", { sessionId: session.id });
    return NextResponse.json({ received: true });
  }

  // Find or create user
  let user = await User.findOne({ userId });

  if (!user) {
    // If user doesn't exist, they should have already been created via Clerk webhook
    // or will be created via /api/user/credits with welcome credits
    // For safety, create with 0 credits here (webhook might fire before user accesses credits endpoint)
    user = await User.create({
      userId,
      credits: 0,
      promptWizardCredits: 0,
    });
  }

  // Add credits to user
  user = await User.findOneAndUpdate(
    { userId },
    {
      $inc: {
        credits,
        promptWizardCredits: promptCredits,
      },
    },
    { new: true }
  );

  // Record payment
  await Payment.create({
    status: "paid",
    type: "user_credits",
    stripeSessionId: session.id,
    userId,
  });

  logger.info("Credits added to user", {
    userId,
    credits,
    promptCredits,
    sessionId: session.id,
  });

  return null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    logger.error("Webhook signature verification failed", err);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  await dbConnect();

  // Handle successful checkout events
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;

    // Only process user credit purchases
    if (session.metadata?.type === "user_credits") {
      const result = await processCreditPurchase(session);
      if (result) {
        return result;
      }
    }
  }

  // Handle failed async payments (optional - for logging/monitoring)
  if (event.type === "checkout.session.async_payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.type === "user_credits") {
      logger.error(
        "Async payment failed",
        undefined,
        {
          userId: session.metadata?.userId,
          sessionId: session.id,
        }
      );
      // You could send a notification to the user here
    }
  }

  return NextResponse.json({ received: true });
}

