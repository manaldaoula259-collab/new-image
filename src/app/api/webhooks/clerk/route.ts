import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { logger } from "@/core/utils/logger";
import User from "@/models/User";

// Welcome credits for new users
const WELCOME_IMAGE_CREDITS = 10;
const WELCOME_PROMPT_CREDITS = 10;

export async function POST(req: Request) {
  // Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: "Error occurred -- no svix headers" },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    logger.error("Error verifying webhook", err);
    return NextResponse.json(
      { error: "Error occurred -- webhook verification failed" },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id: userId, email_addresses, primary_email_address_id } = evt.data;

    // Get primary email
    let email = "";
    if (email_addresses && email_addresses.length > 0) {
      const primaryEmail = email_addresses.find(
        (e: any) => e.id === primary_email_address_id
      );
      email = primaryEmail ? primaryEmail.email_address : email_addresses[0].email_address;
    }

    try {
      await dbConnect();

      // Check if user already exists (shouldn't happen, but safety check)
      const existingUser = await User.findOne({ userId });

      if (existingUser) {
        logger.warn("User already exists in database", { userId });

        // Update email if missing
        if (!existingUser.email && email) {
          existingUser.email = email;
          await existingUser.save();
          logger.info("Updated existing user with missing email", { userId, email });
        }

        return NextResponse.json({ received: true });
      }

      // Create new user with welcome credits
      const newUser = await User.create({
        userId,
        email,
        credits: WELCOME_IMAGE_CREDITS,
        promptWizardCredits: WELCOME_PROMPT_CREDITS,
      });

      logger.info("New user created via Clerk webhook with welcome credits", {
        userId,
        email,
        credits: WELCOME_IMAGE_CREDITS,
        promptWizardCredits: WELCOME_PROMPT_CREDITS,
        userDbId: (newUser as any)._id?.toString() ?? String(newUser),
      });

      return NextResponse.json({
        received: true,
        message: "User created with welcome credits",
      });
    } catch (error) {
      logger.error("Error creating user from webhook", error, {
        userId,
        eventType,
      });
      return NextResponse.json(
        { error: "Error creating user" },
        { status: 500 }
      );
    }
  }

  if (eventType === "user.updated") {
    const { id: userId, email_addresses, primary_email_address_id } = evt.data;

    // Get primary email
    let email = "";
    if (email_addresses && email_addresses.length > 0) {
      const primaryEmail = email_addresses.find(
        (e: any) => e.id === primary_email_address_id
      );
      email = primaryEmail ? primaryEmail.email_address : email_addresses[0].email_address;
    }

    try {
      await dbConnect();

      if (email) {
        await User.findOneAndUpdate(
          { userId },
          { $set: { email } },
          { new: true }
        );
        logger.info("User updated via Clerk webhook", { userId, email });
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      logger.error("Error updating user from webhook", error, {
        userId,
        eventType,
      });
      return NextResponse.json(
        { error: "Error updating user" },
        { status: 500 }
      );
    }
  }

  // Return a response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
}

