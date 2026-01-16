import { replicate } from "@/core/clients/replicate";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Shot from "@/models/Shot";
import { HdStatus } from "@/types/models";

export async function GET(
  request: Request,
  { params }: { params: { id: string; predictionId: string } }
) {
  const projectId = params.id;
  const predictionId = params.predictionId;

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({}, { status: 401 });
  }

  await dbConnect();

  const project = await Project.findOne({ _id: projectId, userId });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  let shot = await Shot.findOne({ projectId: project._id, _id: predictionId });

  if (!shot) {
    return NextResponse.json({ error: "Shot not found" }, { status: 404 });
  }

  if (shot.hdStatus !== HdStatus.PENDING) {
    return NextResponse.json(
      { message: "4K already applied" },
      { status: 400 }
    );
  }

  const prediction = await replicate.predictions.get(shot.hdPredictionId!);

  if (prediction.output) {
    // @ts-ignore - Mongoose findByIdAndUpdate types are too complex for TypeScript
    shot = await Shot.findByIdAndUpdate(
      shot._id,
      {
        hdStatus: HdStatus.PROCESSED,
        hdOutputUrl: prediction.output,
      },
      { new: true }
    );
  }

  const shotObj = (shot as any).toObject ? (shot as any).toObject() : shot;
  return NextResponse.json({ shot: { ...shotObj, id: (shot as any)._id?.toString() ?? String(shot) } });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string; predictionId: string } }
) {
  const projectId = params.id;
  const predictionId = params.predictionId;

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({}, { status: 401 });
  }

  await dbConnect();

  const project = await Project.findOne({ _id: projectId, userId });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  let shot = await Shot.findOne({ projectId: project._id, _id: predictionId });

  if (!shot) {
    return NextResponse.json({ error: "Shot not found" }, { status: 404 });
  }

  if (shot.hdStatus !== HdStatus.NO) {
    return NextResponse.json(
      { message: "4K already applied" },
      { status: 400 }
    );
  }

  const prediction = await replicate.predictions.create({
    version: process.env.REPLICATE_HD_VERSION_MODEL_ID!,
    input: {
      image: shot.outputUrl,
      upscale: 8,
      face_upsample: true,
      codeformer_fidelity: 1,
    },
  });

  // @ts-ignore - Mongoose findByIdAndUpdate types are too complex for TypeScript
  shot = await Shot.findByIdAndUpdate(
    shot._id,
    { hdStatus: HdStatus.PENDING, hdPredictionId: prediction.id },
    { new: true }
  );

  const shotObj = (shot as any).toObject ? (shot as any).toObject() : shot;
  return NextResponse.json({ shot: { ...shotObj, id: (shot as any)._id?.toString() ?? String(shot) } });
}
