import StudioPage, { type ProjectWithShots } from "@/components/pages/StudioPage";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Shot from "@/models/Shot";
import { getCurrentSessionRedirect } from "@/lib/sessions";
import { Metadata } from "next";
import { notFound } from "next/navigation";

const PROJECTS_PER_PAGE = 9;

export const metadata: Metadata = {
  title: "My Studio",
};

const Studio = async ({ params }: { params: { id: string } }) => {
  const { userId } = await getCurrentSessionRedirect();
  const projectId = params.id;

  await dbConnect();

  // @ts-ignore - Mongoose query types are too complex for TypeScript
  const project = await Project.findOne({
    _id: projectId,
      userId,
      modelStatus: "succeeded",
  })
    .sort({ createdAt: -1 })
    .lean();

  if (!project) {
    notFound();
  }

  const [shots, shotsCount] = await Promise.all([
    Shot.find({ projectId: project._id })
      .sort({ createdAt: -1 })
      .limit(PROJECTS_PER_PAGE)
      .skip(0)
      .lean(),
    Shot.countDocuments({ projectId: project._id }),
  ]);

  const projectWithShots: ProjectWithShots & { _count: { shots: number } } = {
    ...project,
    id: project._id.toString(),
    shots: (shots as any[]).map((shot: any) => ({ ...shot, id: shot._id?.toString() ?? String(shot) })),
    _count: {
      shots: shotsCount,
    },
  } as any;

  return <StudioPage project={projectWithShots} />;
};

export default Studio;
