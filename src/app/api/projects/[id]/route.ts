import s3Client from "@/core/clients/s3";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { logger } from "@/core/utils/logger";
import Project from "@/models/Project";
import Shot from "@/models/Shot";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const projectId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // @ts-ignore - Mongoose query types are too complex for TypeScript
    const project = await Project.findOne({ _id: projectId, userId }).lean();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      project: { ...project, id: (project as any)._id?.toString() ?? String(project) },
      modelStatus: project.modelStatus || "not_created",
    });
  } catch (error) {
    logger.apiError(`/api/projects/${params.id} (GET)`, error, {
      projectId: params.id,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    const projectId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const project = await Project.findOne({ _id: projectId, userId }).lean();

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const { imageUrls, _id } = project;

    // Validate S3 configuration
    if (!process.env.AWS_S3_BUCKET_NAME || !process.env.AWS_S3_REGION) {
      logger.warn("S3 configuration is missing during project deletion", {
        projectId: projectId.toString(),
      });
      // Continue with database deletion even if S3 deletion fails
    } else {
      // Delete training images
      await Promise.allSettled(
        imageUrls.map(async (imageUrl) => {
          try {
            const urlParts = imageUrl.split(
              `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/`
            );
            const key = urlParts[1] || imageUrl.split("/").pop();

            if (key) {
              await s3Client.send(
                new DeleteObjectCommand({
                  Bucket: process.env.AWS_S3_BUCKET_NAME!,
                  Key: key,
                })
              );
            }
          } catch (error) {
            logger.error(`Error deleting image ${imageUrl}`, error, {
              projectId: projectId.toString(),
              imageUrl,
            });
            // Continue with other deletions
          }
        })
      );

      // Delete zip file
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: `${_id.toString()}.zip`,
          })
        );
      } catch (error) {
        logger.error("Error deleting zip file", error, {
          projectId: projectId.toString(),
        });
        // Continue with database deletion
      }
    }

    // Delete shots and project from database
    await Shot.deleteMany({ projectId: _id });
    await Project.findByIdAndDelete(_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.apiError(`/api/projects/${params.id} (DELETE)`, error, {
      projectId: params.id,
    });
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
