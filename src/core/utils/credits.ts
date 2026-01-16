import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { logger } from "./logger";
import { InsufficientCreditsError, UnauthorizedError, wrapError } from "./errors";

import type { Document } from "mongoose";
import type { IUser } from "@/types/models";

export interface CreditCheckResult {
  success: boolean;
  error?: string;
  user?: Document & IUser;
}

/**
 * Check if user has enough credits and deduct them
 * @param creditsRequired - Number of credits to deduct (default: 5)
 * @returns CreditCheckResult
 */
export async function checkAndDeductCredits(
  creditsRequired: number = 5
): Promise<CreditCheckResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    await dbConnect();

    let user = await User.findOne({ userId });

    // Create user if doesn't exist
    if (!user) {
      user = await User.create({
        userId,
        credits: 0,
        promptWizardCredits: 0,
      });
    }

    // Check if user has enough credits
    if (user.credits < creditsRequired) {
      throw new InsufficientCreditsError(creditsRequired, user.credits);
    }

    // Deduct credits
    // @ts-ignore - Mongoose findByIdAndUpdate types are too complex for TypeScript
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $inc: {
          credits: -creditsRequired,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("Failed to update user credits");
    }

    return {
      success: true,
      user: updatedUser as Document & IUser,
    };
  } catch (error) {
    if (error instanceof InsufficientCreditsError || error instanceof UnauthorizedError) {
      // Re-throw known errors as-is
      return {
        success: false,
        error: error.message,
      };
    }
    
    const wrappedError = wrapError(error, "Failed to process credits", { creditsRequired });
    logger.dbError("checkAndDeductCredits", wrappedError, {
      creditsRequired,
    });
    return {
      success: false,
      error: wrappedError.message,
    };
  }
}

/**
 * Check if user has enough credits WITHOUT deducting them.
 * Use this when you only want to deduct on success.
 */
export async function checkCredits(
  creditsRequired: number = 1
): Promise<CreditCheckResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    await dbConnect();

    let user = await User.findOne({ userId });

    // Create user if doesn't exist
    if (!user) {
      user = await User.create({
        userId,
        credits: 0,
        promptWizardCredits: 0,
      });
    }

    if (user.credits < creditsRequired) {
      throw new InsufficientCreditsError(creditsRequired, user.credits);
    }

    return { success: true, user: user as Document & IUser };
  } catch (error) {
    if (error instanceof InsufficientCreditsError || error instanceof UnauthorizedError) {
      return { success: false, error: error.message };
    }

    const wrappedError = wrapError(error, "Failed to check credits", { creditsRequired });
    logger.dbError("checkCredits", wrappedError, { creditsRequired });
    return { success: false, error: wrappedError.message };
  }
}

/**
 * Deduct credits (atomic) AFTER success.
 * Returns failure if credits are not sufficient at deduction time.
 */
export async function deductCredits(
  creditsToDeduct: number = 1
): Promise<CreditCheckResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    await dbConnect();

    // Atomic conditional update (prevents negative credits)
    // @ts-ignore - Mongoose findOneAndUpdate types are too complex for TypeScript
    const updatedUser = await User.findOneAndUpdate(
      { userId, credits: { $gte: creditsToDeduct } },
      { $inc: { credits: -creditsToDeduct } },
      { new: true }
    );

    if (!updatedUser) {
      // Either user doesn't exist or insufficient credits at deduction time
      const existing = await User.findOne({ userId });
      const currentCredits = existing?.credits ?? 0;
      throw new InsufficientCreditsError(creditsToDeduct, currentCredits);
    }

    return { success: true, user: updatedUser as Document & IUser };
  } catch (error) {
    if (error instanceof InsufficientCreditsError || error instanceof UnauthorizedError) {
      return { success: false, error: error.message };
    }

    const wrappedError = wrapError(error, "Failed to deduct credits", { creditsToDeduct });
    logger.dbError("deductCredits", wrappedError, { creditsToDeduct });
    return { success: false, error: wrappedError.message };
  }
}

/**
 * Check if user has enough prompt wizard credits and deduct them
 * @param creditsRequired - Number of prompt wizard credits to deduct (default: 5)
 * @returns CreditCheckResult
 */
export async function checkAndDeductPromptCredits(
  creditsRequired: number = 5
): Promise<CreditCheckResult> {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new UnauthorizedError("User authentication required");
    }

    await dbConnect();

    let user = await User.findOne({ userId });

    // Create user if doesn't exist
    if (!user) {
      user = await User.create({
        userId,
        credits: 0,
        promptWizardCredits: 0,
      });
    }

    // Check if user has enough prompt wizard credits
    if (user.promptWizardCredits < creditsRequired) {
      throw new InsufficientCreditsError(creditsRequired, user.promptWizardCredits, {
        creditType: "promptWizardCredits",
      });
    }

    // Deduct prompt wizard credits
    // @ts-ignore - Mongoose findByIdAndUpdate types are too complex for TypeScript
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $inc: {
          promptWizardCredits: -creditsRequired,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("Failed to update user prompt wizard credits");
    }

    return {
      success: true,
      user: updatedUser as Document & IUser,
    };
  } catch (error) {
    if (error instanceof InsufficientCreditsError || error instanceof UnauthorizedError) {
      // Re-throw known errors as-is
      return {
        success: false,
        error: error.message,
      };
    }
    
    const wrappedError = wrapError(error, "Failed to process prompt wizard credits", { creditsRequired });
    logger.dbError("checkAndDeductPromptCredits", wrappedError, {
      creditsRequired,
    });
    return {
      success: false,
      error: wrappedError.message,
    };
  }
}


