import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Media from "@/models/Media";
import { logger } from "@/core/utils/logger";

/**
 * GET /api/share/[mediaId]
 * Publicly accessible endpoint to view shared media
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { mediaId: string } }
) {
    try {
        await dbConnect();

        const { mediaId } = params;

        if (!mediaId) {
            return NextResponse.json(
                { error: "Media ID is required" },
                { status: 400 }
            );
        }

        // Find the media by ID
        const media = await Media.findById(mediaId).lean();

        if (!media) {
            return NextResponse.json(
                { detail: "requested file not found" },
                { status: 404 }
            );
        }

        // Fetch the image from the URL
        const imageResponse = await fetch(media.url);

        if (!imageResponse.ok) {
            logger.error("Failed to fetch media from URL", {
                mediaId,
                url: media.url,
                status: imageResponse.status,
            });
            return NextResponse.json(
                { detail: "requested file not found" },
                { status: 404 }
            );
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const contentType = imageResponse.headers.get("content-type") || "image/png";

        // Return the image with appropriate headers
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        logger.apiError("/api/share/[mediaId]", error instanceof Error ? error : new Error(String(error)), {
            mediaId: params.mediaId,
        });
        return NextResponse.json(
            { detail: "requested file not found" },
            { status: 404 }
        );
    }
}
