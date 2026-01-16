import { replicate } from "@/core/clients/replicate";
import s3Client from "@/core/clients/s3";
import { createZipFolder } from "@/core/utils/assets";
import { logger } from "@/core/utils/logger";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Shot from "@/models/Shot";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const projects = await (Project.find({ userId })
      .sort({ createdAt: -1 })
      .lean() as any);

    // Populate shots for each project
    const projectsWithShots = await Promise.all(
      projects.map(async (project: any) => {
        const shots = await (Shot.find({ projectId: project._id })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean() as any);
        return { 
          ...project, 
          id: (project as any)._id?.toString() ?? String(project), 
          shots: shots.map((shot: any) => ({ ...shot, id: shot._id?.toString() ?? String(shot) }))
        };
      })
    );

    // Update project statuses in parallel
    await Promise.allSettled(
      projectsWithShots.map(async (project) => {
        if (project?.replicateModelId && project?.modelStatus !== "succeeded") {
          try {
            const training = await replicate.trainings.get(
              project.replicateModelId
            );

            const version = training?.output?.version?.split?.(":")?.[1];

            await Project.findByIdAndUpdate(project._id, {
              modelVersionId: version,
              modelStatus: training?.status,
            });
          } catch (error) {
            // Log error but don't fail the entire request
            logger.error(`Error updating project ${project._id}`, error, {
              projectId: (project as any)._id?.toString() ?? String(project),
            });
          }
        }
      })
    );

    return NextResponse.json(projectsWithShots);
  } catch (error) {
    logger.apiError("/api/projects (GET)", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let studioName: string | undefined;
  let instanceClass: string | undefined;
  let urls: string[] | undefined;

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    ({ urls, studioName, instanceClass } = body);

    // Validate input
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "Image URLs are required" },
        { status: 400 }
      );
    }

    if (!studioName || typeof studioName !== "string" || studioName.trim().length === 0) {
      return NextResponse.json(
        { error: "Studio name is required" },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!process.env.AWS_S3_BUCKET_NAME) {
      return NextResponse.json(
        { error: "S3 configuration is missing" },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_REPLICATE_INSTANCE_TOKEN) {
      return NextResponse.json(
        { error: "Replicate instance token is not configured" },
        { status: 500 }
      );
    }

    const project = await (Project.create({
      imageUrls: urls,
      name: studioName.trim(),
      userId,
      modelStatus: "not_created",
      instanceClass: instanceClass || "person",
      instanceName: process.env.NEXT_PUBLIC_REPLICATE_INSTANCE_TOKEN,
      credits: Number(process.env.NEXT_PUBLIC_STUDIO_SHOT_AMOUNT) || 50,
      version: "V2",
    }) as any);

    const projectData = project.toObject() as any;
    const projectObj = { ...projectData, id: (project as any)._id?.toString() ?? String(project) };
    
    const buffer = await createZipFolder(urls, projectObj);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${(project as any)._id?.toString() ?? String(project)}.zip`,
        Body: buffer,
        ContentType: "application/zip",
      })
    );

    return NextResponse.json(projectObj, { status: 201 });
  } catch (error) {
    logger.apiError("/api/projects (POST)", error, {
      studioName,
      instanceClass,
      urlCount: urls?.length || 0,
    });
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("validation")) {
        return NextResponse.json(
          { error: "Invalid input data" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
