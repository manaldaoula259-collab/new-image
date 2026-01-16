import GalleryPage from "@/components/pages/GalleryPage";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Shot from "@/models/Shot";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery",
};

const Gallery = async ({ params }: { params: { userId: string } }) => {
  const userId = params.userId;

  await dbConnect();

  // First, find all projects for this user
  // @ts-ignore - Mongoose query types are too complex for TypeScript
  const projects = await Project.find({ userId }).select("_id").lean();
  const projectIds = projects.map((p: any) => p._id);

  // Then find all bookmarked shots from those projects
  const shotsData = await Shot.find({
    projectId: { $in: projectIds },
    outputUrl: { $ne: null },
      bookmarked: true,
  })
    .select("outputUrl blurhash")
    .sort({ createdAt: -1 })
    .lean();

  // Convert undefined to null to match expected type
  const shots = shotsData.map((shot) => ({
    outputUrl: shot.outputUrl ?? null,
    blurhash: shot.blurhash ?? null,
  }));

  return <GalleryPage shots={shots} />;
};

export default Gallery;
