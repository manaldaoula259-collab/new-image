import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { logger } from "@/core/utils/logger";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// Welcome credits for new users
const WELCOME_IMAGE_CREDITS = 10;
const WELCOME_PROMPT_CREDITS = 10;

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let user = await User.findOne({ userId });
    let isNewUser = false;

    // Create user if doesn't exist and give welcome credits
    if (!user) {
      isNewUser = true;
      user = await User.create({
        userId,
        credits: WELCOME_IMAGE_CREDITS,
        promptWizardCredits: WELCOME_PROMPT_CREDITS,
      });
      
      logger.info("New user created with welcome credits", {
        userId,
        credits: WELCOME_IMAGE_CREDITS,
        promptWizardCredits: WELCOME_PROMPT_CREDITS,
      });
    }

    return NextResponse.json({
      credits: user.credits,
      promptWizardCredits: user.promptWizardCredits,
      isNewUser, // Indicate if this was a new user
    });
  } catch (error: any) {
    logger.apiError("/api/user/credits", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch credits" },
      { status: 500 }
    );
  }
}

