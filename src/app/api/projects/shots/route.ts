import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Shot from "@/models/Shot";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({}, { status: 401 });
  }

  const projectId = params.id;

  const body = await request.json();
  const { take, skip } = body;

  await dbConnect();

  const project = await Project.findOne({
    _id: projectId,
    userId,
    modelStatus: "succeeded",
  }).lean();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const shots = await Shot.find({ projectId: project._id })
    .sort({ createdAt: -1 })
    .limit(Number(take) || 10)
    .skip(Number(skip) || 0)
    .lean();

  const shotsCount = await Shot.countDocuments({ projectId: project._id });

  return NextResponse.json({
    shots: shots.map((shot: any) => ({ ...shot, id: shot._id?.toString() ?? String(shot) })),
    shotsCount,
  });
}
