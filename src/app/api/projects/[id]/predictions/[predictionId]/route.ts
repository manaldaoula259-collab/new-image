import { replicate } from "@/core/clients/replicate";
import { extractSeedFromLogs } from "@/core/utils/predictions";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPlaiceholder } from "plaiceholder";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Shot from "@/models/Shot";

export async function GET(
  request: Request,
  { params }: { params: { id: string; predictionId: string } }
) {
  const projectId = params.id as string;
  const predictionId = params.predictionId as string;

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

  const prediction = await replicate.predictions.get(shot.replicateId);

  const outputUrl = prediction.output?.[0];
  let blurhash = null;

  if (outputUrl) {
    const { base64 } = await getPlaiceholder(outputUrl, { size: 16 });
    blurhash = base64;
  }

  const seedNumber = extractSeedFromLogs(prediction.logs!);

  // @ts-ignore - Mongoose findByIdAndUpdate types are too complex for TypeScript
  shot = await Shot.findByIdAndUpdate(
    shot._id,
    {
      status: prediction.status,
      outputUrl: outputUrl || null,
      blurhash,
      seed: seedNumber || null,
    },
    { new: true }
  );

  const shotData = (shot as any).toObject ? (shot as any).toObject() : shot;
  return NextResponse.json({ shot: { ...shotData, id: (shot as any)._id?.toString() ?? String(shot) } });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; predictionId: string } }
) {
  const projectId = params.id as string;
  const predictionId = params.predictionId as string;

  const body = await request.json();
  const { bookmarked } = body;

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

  shot = await (Shot.findByIdAndUpdate(
    shot._id,
    {
      bookmarked: bookmarked || false,
    },
    { new: true }
  ) as any);

  const shotData = (shot as any).toObject ? (shot as any).toObject() : shot;
  return NextResponse.json({ shot: { ...shotData, id: (shot as any)._id?.toString() ?? String(shot) } });
}
