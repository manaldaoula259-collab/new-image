import { replicate } from "@/core/clients/replicate";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({}, { status: 401 });
  }

  await dbConnect();

  let project = await Project.findOne({
    _id: projectId,
    userId,
    modelStatus: "not_created",
    stripePaymentId: { $ne: null },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const projectIdString = (project as any)._id?.toString() ?? String(project);

  await replicate.models.create(process.env.REPLICATE_USERNAME!, projectIdString, {
    description: projectIdString,
    visibility: "private",
    hardware: "gpu-t4",
  });

  const training = await replicate.trainings.create(
    "ostris",
    "flux-dev-lora-trainer",
    "e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497",
    {
      destination: `${process.env.REPLICATE_USERNAME}/${projectIdString}`,
      input: {
        trigger_word: process.env.NEXT_PUBLIC_REPLICATE_INSTANCE_TOKEN,
        input_images: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${projectIdString}.zip`,
        //max_train_steps: Number(process.env.REPLICATE_MAX_TRAIN_STEPS || 3000),
        //num_class_images: 200,
        //learning_rate: 1e-6,
        webhook: `${process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL}/api/webhooks/completed`,
      },
    }
  );

  // @ts-ignore - Mongoose findByIdAndUpdate types are too complex for TypeScript
  project = await (Project.findByIdAndUpdate(
    project._id,
    {
      replicateModelId: training.id,
      modelStatus: "processing",
    },
    { new: true }
  ) as any);

  const projectObj = (project as any).toObject ? (project as any).toObject() : project;
  return NextResponse.json({ project: { ...projectObj, id: (project as any)._id?.toString() ?? String(project) } });
}
