import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Payment from "@/models/Payment";

export async function GET(
  req: Request,
  { params }: { params: { ppi: string; sessionId: string } }
) {
  const sessionId = params.sessionId;
  const ppi = params.ppi;

  await dbConnect();

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const payments = await Payment.find({
    stripeSessionId: sessionId,
    projectId: ppi,
    status: "paid",
    type: "credits",
  }).lean();

  if (payments.length > 0) {
    return NextResponse.json(
      { success: false, error: "payment_already_processed" },
      { status: 400 }
    );
  }

  if (
    session.payment_status === "paid" &&
    session.metadata?.projectId === ppi
  ) {
    if (!session.metadata) {
      return NextResponse.json(
        { success: false, error: "Missing session metadata" },
        { status: 400 }
      );
    }

    const quantity = Number(session.metadata.quantity);
    const promptWizardQuantity = Number(session.metadata.promptWizardQuantity);

    const project = await Project.findByIdAndUpdate(
      ppi,
      {
        $inc: {
          credits: quantity,
          promptWizardCredits: promptWizardQuantity,
        },
      },
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    await Payment.create({
      status: "paid",
      projectId: ppi,
      type: "credits",
      stripeSessionId: sessionId,
    });

    return NextResponse.json(
      {
        success: true,
        credits: project.credits,
        promptWizardCredits: project.promptWizardCredits,
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    {
      success: false,
    },
    { status: 400 }
  );
}
