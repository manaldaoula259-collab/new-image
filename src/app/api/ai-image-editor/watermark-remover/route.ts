import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";

const MODEL_IDENTIFIER = "bytedance/seedream-4";

export async function POST(request: NextRequest) {
    if (!process.env.REPLICATE_API_TOKEN) {
        return NextResponse.json(
            { error: "Replicate API token is not configured." },
            { status: 500 }
        );
    }

    let body: { imageUrl?: unknown; prompt?: unknown } = {};

    try {
        body = await request.json();
    } catch (error) {
        return NextResponse.json(
            { error: "Invalid JSON payload.", details: (error as Error).message },
            { status: 400 }
        );
    }

    const { imageUrl, prompt } = body;

    if (typeof imageUrl !== "string" || imageUrl.trim().length === 0) {
        return NextResponse.json(
            { error: "imageUrl is required and must be a non-empty string." },
            { status: 400 }
        );
    }

    // Check credits first
    const creditCheck = await checkCredits(1);
    if (!creditCheck.success) {
        return NextResponse.json(
            { error: creditCheck.error || "Insufficient credits" },
            { status: 400 }
        );
    }

    // Build input parameters according to the specific user schema for bytedance/seedream-4
    // The user says "when the user enter any image then the watermark from the image should get removed"
    // and provided `image_input: []`. We will assume putting the image in that array is the key.
    const input: Record<string, any> = {
        size: "2K",
        width: 2048,
        height: 2048,
        prompt: typeof prompt === "string" && prompt.trim().length > 0 ? prompt : "clean image, remove watermark, high quality, original content only",
        max_images: 1,
        image_input: [imageUrl.trim()], // Pass the image here as requested
        aspect_ratio: "4:3",
        enhance_prompt: true,
        sequential_image_generation: "disabled"
    };

    try {
        logger.info("[api/watermark-remover] Calling Replicate", {
            model: MODEL_IDENTIFIER,
            imageUrl: imageUrl.trim().substring(0, 50) + "...",
        });

        const output = await replicate.run(MODEL_IDENTIFIER as `${string}/${string}`, { input });

        let resultUrl: string;

        // Handle output which might be array of strings/objects/urls
        if (Array.isArray(output) && output.length > 0) {
            const first = output[0];
            if (typeof first === "string") {
                resultUrl = first;
            } else if (first && typeof first === "object" && "url" in first) {
                if (typeof (first as any).url === "function") {
                    resultUrl = await (first as any).url();
                } else {
                    resultUrl = (first as any).url;
                }
            } else {
                throw new Error("Unknown output item format from Replicate");
            }
        } else if (typeof output === "object" && output !== null && "url" in output) {
            if (typeof (output as any).url === "function") {
                resultUrl = await (output as any).url();
            } else {
                resultUrl = (output as any).url;
            }
        } else if (typeof output === "string") {
            resultUrl = output;
        } else {
            throw new Error(`Invalid output format from Replicate: ${JSON.stringify(output)}`);
        }

        // Deduct credits on success
        const deduct = await deductCredits(1);
        if (!deduct.success) {
            // Should rare occur if check passed, but handle it
            return NextResponse.json(
                { error: deduct.error || "Failed to deduct credits" },
                { status: 400 }
            );
        }

        return NextResponse.json({
            resultUrl,
            model: MODEL_IDENTIFIER,
            creditsDeducted: 1,
        });

    } catch (error) {
        logger.apiError("/api/ai-image-editor/watermark-remover", error instanceof Error ? error : new Error(String(error)), {
            imageUrl: imageUrl.trim().substring(0, 50),
        });
        return NextResponse.json(
            {
                error: "Failed to remove watermark.",
                details: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
