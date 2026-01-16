import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { logger } from "@/core/utils/logger";

export const dynamic = "force-dynamic";

// Credit pricing plans
const CREDIT_PLANS = {
  250: { price: 2900, credits: 250, promptCredits: 50 }, // $29.00
  750: { price: 6900, credits: 750, promptCredits: 150 }, // $69.00
  2000: { price: 14900, credits: 2000, promptCredits: 400 }, // $149.00
} as const;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const planParam = url.searchParams.get("plan");

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Extract credit amount from plan parameter (e.g., "credits-250" -> 250)
    const creditAmount = planParam?.replace("credits-", "");
    const credits = creditAmount ? Number(creditAmount) : null;

    if (!credits || !(credits in CREDIT_PLANS)) {
      return NextResponse.json(
        { error: "Invalid plan. Please select a valid credit pack." },
        { status: 400 }
      );
    }

    const plan = CREDIT_PLANS[credits as keyof typeof CREDIT_PLANS];

    const session = await stripe.checkout.sessions.create({
      allow_promotion_codes: true,
      metadata: {
        userId,
        credits: plan.credits.toString(),
        promptCredits: plan.promptCredits.toString(),
        type: "user_credits",
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: plan.price,
            product_data: {
              name: `${plan.credits.toLocaleString()} Credit Pack`,
              description: `${plan.credits.toLocaleString()} credits + ${plan.promptCredits.toLocaleString()} prompt wizard credits`,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${url.origin}/dashboard/pricing?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${url.origin}/dashboard/pricing?canceled=true`,
    });

    return NextResponse.redirect(session.url!, 303);
  } catch (err) {
    logger.apiError("/api/checkout/credits", err instanceof Error ? err : new Error(String(err)), {
      plan: planParam,
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

