import { NextRequest, NextResponse } from "next/server";
import { replicate } from "@/core/clients/replicate";
import { checkCredits, deductCredits } from "@/core/utils/credits";
import { logger } from "@/core/utils/logger";
import { resolveReplicateModelIdentifierForSlug } from "@/core/replicate/modelCatalog";
import { auth } from "@clerk/nextjs/server";
import { saveGeneratedMedia } from "@/core/utils/saveGeneratedMedia";

export const dynamic = "force-dynamic";

const FALLBACK_MODEL_IDENTIFIER = "black-forest-labs/flux-schnell";

const DEFAULT_NEGATIVE =
  "text, watermark, label, signature, logo, writing, letters, words, captions, text overlay, copyright, brand name, company name, website URL, blurry, low quality, distorted";

type Props = { params: { slug?: string[] } };

export async function POST(request: NextRequest, { params }: Props) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Replicate API token is not configured." },
      { status: 500 }
    );
  }

  const toolSlug = (params.slug || []).join("/");

  let body: {
    prompt?: unknown;
    imageUrl?: unknown;
    aspectRatio?: unknown;
    outputFormat?: unknown;
    outputQuality?: unknown;
    safetyTolerance?: unknown;
    promptUpsampling?: unknown;
    raw?: unknown;
    imagePromptStrength?: unknown;
    goFast?: unknown;
    megapixels?: unknown;
    numOutputs?: unknown;
    numInferenceSteps?: unknown;
    guidance?: unknown;
    promptStrength?: unknown;
    steps?: unknown;
    width?: unknown;
    height?: unknown;
    interval?: unknown;
    mask?: unknown;
    outpaint?: unknown;
    reduxImage?: unknown;
    controlImage?: unknown;
    guidanceScale?: unknown;
    size?: unknown;
    maxImages?: unknown;
    imageInput?: unknown;
    enhancePrompt?: unknown;
    sequentialImageGeneration?: unknown;
    resolution?: unknown;
    styleType?: unknown;
    stylePreset?: unknown;
    magicPromptOption?: unknown;
    style?: unknown;
    seed?: unknown;
    modelType?: unknown;
    speedMode?: unknown;
    modelVariant?: unknown;
    pagGuidanceScale?: unknown;
    priorGuidanceScale?: unknown;
    priorNumInferenceSteps?: unknown;
    decoderGuidanceScale?: unknown;
    decoderNumInferenceSteps?: unknown;
    numImagesPerPrompt?: unknown;
    imageSize?: unknown;
    duration?: unknown;
    cfgScale?: unknown;
    cfg?: unknown;
    refine?: unknown;
    scheduler?: unknown;
    loraScale?: unknown;
    strength?: unknown;
    applyWatermark?: unknown;
    highNoiseFrac?: unknown;
    numImages?: unknown;
    imageWidth?: unknown;
    imageHeight?: unknown;
    numberOfImages?: unknown;
    controlnet1?: unknown;
    controlnet2?: unknown;
    controlnet3?: unknown;
    controlnet1Image?: unknown;
    controlnet2Image?: unknown;
    controlnet3Image?: unknown;
    controlnet1Start?: unknown;
    controlnet2Start?: unknown;
    controlnet3Start?: unknown;
    controlnet1End?: unknown;
    controlnet2End?: unknown;
    controlnet3End?: unknown;
    controlnet1ConditioningScale?: unknown;
    controlnet2ConditioningScale?: unknown;
    controlnet3ConditioningScale?: unknown;
    sizingStrategy?: unknown;
    model?: unknown;
    extraLoraScale?: unknown;
    vae?: unknown;
    clipSkip?: unknown;
    pagScale?: unknown;
    batchSize?: unknown;
    guidanceRescale?: unknown;
    prependPreprompt?: unknown;
  } = {};

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload.", details: (error as Error).message },
      { status: 400 }
    );
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const userSpecifiedFormat = typeof body.outputFormat === "string" && ["png", "jpg", "webp"].includes(body.outputFormat);
  const outputFormat = userSpecifiedFormat
    ? (body.outputFormat as "png" | "jpg" | "webp")
    : "jpg";

  // If image-to-image, allow empty prompt (we’ll apply a gentle default).
  // If text-to-image (no imageUrl), prompt is required.
  if (!imageUrl && !prompt) {
    return NextResponse.json(
      { error: "prompt is required for Text to Image." },
      { status: 400 }
    );
  }

  // Credits: check first, deduct on success only
  const creditCheck = await checkCredits(1);
  if (!creditCheck.success) {
    return NextResponse.json(
      { error: creditCheck.error || "Insufficient credits" },
      { status: 400 }
    );
  }

  let effectivePrompt = prompt || "Create a beautiful high-quality image. No text, no watermarks.";
  let effectiveNegativePrompt = DEFAULT_NEGATIVE;

  // Specific handling for certain tool slugs
  if (["pet-to-human", "ai-anime-filter", "ai-photo-enhancer"].includes(toolSlug)) {
    if (!imageUrl) {
      return NextResponse.json(
        { error: `imageUrl is required for ${toolSlug}.` },
        { status: 400 }
      );
    }
    // Override prompt and negative prompt for these specific image-to-image tools
    if (toolSlug === "ai-photo-enhancer") {
      effectivePrompt = "Enhance this photo automatically: increase resolution, sharpen all details, improve image quality, enhance colors and contrast, reduce noise, improve clarity and sharpness. Make it look professional and high-quality with enhanced aesthetic appeal. No text, no watermarks, clean enhanced photo.";
      effectiveNegativePrompt = "text, watermark, label, signature, logo, writing, letters, words, captions, text overlay, copyright, brand name, company name, website URL, filename, file name, text on image, written text, printed text, typed text, handwritten text, text banner, text box, subtitle, title text, description text, any text, any writing, any letters, any numbers, any symbols that form words";
    } else if (toolSlug === "pet-to-human") {
      effectivePrompt = prompt || "Transform this pet into a human, maintaining its essence and characteristics. High quality, detailed, no text, no watermarks.";
    } else if (toolSlug === "ai-anime-filter") {
      effectivePrompt = prompt || "Transform this image into an anime style. High quality, detailed, no text, no watermarks.";
    }
  }

  const input: Record<string, any> = {
    prompt: effectivePrompt,
    output_format: outputFormat,
    negative_prompt: effectiveNegativePrompt,
  };

  // Check if this is Seedream 4.0 (uses image_input array, not image)
  const isSeedream4Early = toolSlug.includes("seedream-4");
  // Check if this is Ideogram V3 (text-to-image only, doesn't use image parameter)
  const isIdeogramV3Early = toolSlug.includes("ideogram-v3");
  // Check if this is Ideogram V2 Turbo (text-to-image only, doesn't use image parameter)
  const isIdeogramV2TurboEarly = toolSlug.includes("ideogram-v2-turbo");
  // Check if this is Recraft V3 (text-to-image only, doesn't use image parameter)
  const isRecraftV3Early = toolSlug.includes("recraft-v3") && !toolSlug.includes("recraft-v3-svg");
  // Check if this is Recraft V3 SVG (text-to-image only, doesn't use image parameter)
  const isRecraftV3SVGEarly = toolSlug.includes("recraft-v3-svg");
  // Check if this is Hidream I1 Full (text-to-image only, doesn't use image parameter)
  const isHidreamI1FullEarly = toolSlug.includes("hidream-i1-full") && !toolSlug.includes("hidream-i1-dev") && !toolSlug.includes("hidream-i1-fast");
  // Check if this is Hidream I1 Dev (text-to-image only, doesn't use image parameter)
  const isHidreamI1DevEarly = toolSlug.includes("hidream-i1-dev") && !toolSlug.includes("hidream-i1-fast");
  // Check if this is Hidream I1 Fast (text-to-image only, doesn't use image parameter)
  const isHidreamI1FastEarly = toolSlug.includes("hidream-i1-fast");
  // Check if this is Sana (text-to-image only, doesn't use image parameter)
  const isSanaEarly = toolSlug.includes("sana");
  // Check if this is Hunyuan Image (text-to-image only, doesn't use image parameter)
  const isHunyuanImageEarly = toolSlug.includes("hunyuan-image");
  // Check if this is Kling 2.0 Image (text-to-image only, doesn't use image parameter)
  const isKling2ImageEarly = toolSlug.includes("kling-2-image");
  // Check if this is SD 3.5 Large (text-to-image only, doesn't use image parameter)
  const isSD35LargeEarly = toolSlug.includes("sd-3-5-large") && !toolSlug.includes("sd-3-5-large-turbo");
  // Check if this is SD 3.5 Large Turbo (text-to-image only, doesn't use image parameter)
  const isSD35LargeTurboEarly = toolSlug.includes("sd-3-5-large-turbo");
  // Check if this is SDXL (text-to-image only, doesn't use image parameter)
  const isSDXLEarly = toolSlug.includes("sdxl") && !toolSlug.includes("sdxl-lightning");
  // Check if this is SDXL Lightning (text-to-image only, doesn't use image parameter)
  const isSDXLLightningEarly = toolSlug.includes("sdxl-lightning");
  // Check if this is Playground V3 (text-to-image only, doesn't use image parameter)
  const isPlaygroundV3Early = toolSlug.includes("playground-v3");
  // Check if this is Kolors (text-to-image only, doesn't use image parameter)
  const isKolorsEarly = toolSlug.includes("kolors");
  // Check if this is Juggernaut XL (text-to-image only, doesn't use image parameter)
  const isJuggernautXLEarly = toolSlug.includes("juggernaut-xl");
  // Check if this is RealVisXL V5 (text-to-image only, doesn't use standard image parameter, uses controlnet images instead)
  const isRealVisXLV5Early = toolSlug.includes("realvis-xl-v5");
  // Check if this is Dalle 3 (text-to-image only, doesn't use image parameter)
  const isDalle3Early = toolSlug.includes("dalle-3");
  // Check if this is Midjourney Style (text-to-image only, doesn't use image parameter)
  const isMidjourneyStyleEarly = toolSlug.includes("midjourney-style");
  // Check if this is Dreamshaper XL (text-to-image only, doesn't use image parameter)
  const isDreamshaperXLEarly = toolSlug.includes("dreamshaper-xl");
  // Check if this is Proteus V0.5 (text-to-image only, doesn't use image parameter)
  const isProteusV05Early = toolSlug.includes("proteus-v0-5");
  // Check if this is AnimagineXL V3.1 (text-to-image only, doesn't use image parameter)
  const isAnimagineXLV31Early = toolSlug.includes("animagine-xl-v3-1");
  // Check if this is Pony Diffusion XL (text-to-image only, doesn't use image parameter)
  const isPonyDiffusionXLEarly = toolSlug.includes("pony-diffusion-xl");
  // Check if this is OpenJourney V4 (text-to-image only, doesn't use image parameter)
  const isOpenJourneyV4Early = toolSlug.includes("openjourney-v4");
  // Check if this is Pixart Sigma (text-to-image only, doesn't use image parameter)
  const isPixartSigmaEarly = toolSlug.includes("pixart-sigma");
  // Check if this is Kandinsky 3.0 (text-to-image only, doesn't use image parameter)
  const isKandinsky3Early = toolSlug.includes("kandinsky-3");
  // Check if this is Wuerstchen (text-to-image only, doesn't use image parameter)
  const isWuerstchenEarly = toolSlug.includes("wuerstchen");
  // Check if this is Qwen VL Image (text-to-image only, doesn't use image parameter)
  const isQwenVLImageEarly = toolSlug.includes("qwen-vl-image");


  // If we have an image, run image-to-image path
  // Exception: Seedream 4.0 uses image_input array instead of image
  // Exception: Ideogram V3, V2 Turbo, Recraft V3, Recraft V3 SVG, Hidream I1 Full, Hidream I1 Dev, Hidream I1 Fast, Sana, Hunyuan Image, Kling 2.0 Image, SD 3.5 Large, SD 3.5 Large Turbo, SDXL, SDXL Lightning, Playground V3, Kolors, Juggernaut XL, RealVisXL V5, Dalle 3, Midjourney Style, Dreamshaper XL, Proteus V0.5, AnimagineXL V3.1, Pony Diffusion XL, OpenJourney V4, Pixart Sigma, Kandinsky 3.0, Wuerstchen, and Qwen VL Image are text-to-image only
  if (imageUrl && !isSeedream4Early && !isIdeogramV3Early && !isIdeogramV2TurboEarly && !isRecraftV3Early && !isRecraftV3SVGEarly && !isHidreamI1FullEarly && !isHidreamI1DevEarly && !isHidreamI1FastEarly && !isSanaEarly && !isHunyuanImageEarly && !isKling2ImageEarly && !isSD35LargeEarly && !isSD35LargeTurboEarly && !isSDXLEarly && !isSDXLLightningEarly && !isPlaygroundV3Early && !isKolorsEarly && !isJuggernautXLEarly && !isRealVisXLV5Early && !isDalle3Early && !isMidjourneyStyleEarly && !isDreamshaperXLEarly && !isProteusV05Early && !isAnimagineXLV31Early && !isPonyDiffusionXLEarly && !isOpenJourneyV4Early && !isPixartSigmaEarly && !isKandinsky3Early && !isWuerstchenEarly && !isQwenVLImageEarly) {
    input.image = imageUrl; // Corrected to use 'image' for image-to-image
  } else if (!imageUrl && !isSeedream4Early && !isIdeogramV3Early && !isIdeogramV2TurboEarly && !isRecraftV3Early && !isRecraftV3SVGEarly && !isHidreamI1FullEarly && !isHidreamI1DevEarly && !isHidreamI1FastEarly && !isSanaEarly && !isHunyuanImageEarly && !isKling2ImageEarly && !isSD35LargeEarly && !isSD35LargeTurboEarly && !isSDXLEarly && !isSDXLLightningEarly && !isPlaygroundV3Early && !isKolorsEarly && !isJuggernautXLEarly && !isRealVisXLV5Early && !isDalle3Early && !isMidjourneyStyleEarly && !isDreamshaperXLEarly && !isProteusV05Early && !isAnimagineXLV31Early && !isPonyDiffusionXLEarly && !isOpenJourneyV4Early && !isPixartSigmaEarly && !isKandinsky3Early && !isWuerstchenEarly && !isQwenVLImageEarly) {
    // Text to image: allow user aspect ratios from studio
    const ar = typeof body.aspectRatio === "string" ? body.aspectRatio : "1:1";
    input.aspect_ratio = ar;
  }
  // For Seedream 4.0, image_input and aspect_ratio are handled in the Seedream 4.0 specific section
  // For Ideogram V3, V2 Turbo, Recraft V3, Recraft V3 SVG, Hidream I1 Full, Hidream I1 Dev, Hidream I1 Fast, Sana, Hunyuan Image, Kling 2.0 Image, SD 3.5 Large, SD 3.5 Large Turbo, SDXL, SDXL Lightning, Playground V3, Kolors, Juggernaut XL, RealVisXL V5, Dalle 3, Midjourney Style, Dreamshaper XL, Proteus V0.5, AnimagineXL V3.1, Pony Diffusion XL, OpenJourney V4, Pixart Sigma, Kandinsky 3.0, Wuerstchen, and Qwen VL Image, aspect_ratio is handled in their specific sections

  // Check if this is FLUX Kontext Pro or Max (both support image-to-image)
  const isFluxKontextPro = toolSlug.includes("flux-kontext-pro");
  const isFluxKontextMax = toolSlug.includes("flux-kontext-max");
  const isFluxKontext = isFluxKontextPro || isFluxKontextMax;

  // Check if this is FLUX Fill Pro (supports image-to-image with 'image' and 'mask')
  const isFluxFillPro = toolSlug.includes("flux-fill-pro");

  // Check if this is FLUX Redux (supports image-to-image with 'redux_image')
  const isFluxRedux = toolSlug.includes("flux-redux");

  // Check if this is FLUX Canny Pro (supports image-to-image with 'control_image')
  const isFluxCannyPro = toolSlug.includes("flux-canny-pro");

  // Check if this is FLUX Depth Pro (supports image-to-image with 'control_image')
  const isFluxDepthPro = toolSlug.includes("flux-depth-pro");

  // Ensure Flux models never receive 'image' (Text-to-Image only)
  // Exception: FLUX Kontext Pro and Max support image-to-image with 'input_image'
  // Exception: FLUX Fill Pro supports image-to-image with 'image' and 'mask' (for inpainting/outpainting)
  // Exception: FLUX Redux supports image-to-image with 'redux_image'
  // Exception: FLUX Canny Pro and Depth Pro support image-to-image with 'control_image' (ControlNet style)
  // This prevents errors if frontend accidentally sends an image URL with a Flux model selected
  if (
    (toolSlug.includes("flux") && !isFluxKontext && !isFluxFillPro && !isFluxRedux && !isFluxCannyPro && !isFluxDepthPro) ||
    (input.image && !isFluxKontext && !isFluxFillPro && !isFluxRedux && !isFluxCannyPro && !isFluxDepthPro && (
      (params.slug || []).join("/").includes("flux") ||
      (body as any).model?.includes("flux")
    ))
  ) {
    if (input.image) {
      delete input.image;
    }
  }

  // FLUX Kontext Pro and Max use 'input_image' instead of 'image' for image-to-image
  if (isFluxKontext && imageUrl) {
    delete input.image; // Remove 'image' if it exists
    input.input_image = imageUrl; // Use 'input_image' instead
  }

  // FLUX Fill Pro uses 'image' and optionally 'mask' for inpainting/outpainting
  // The 'image' parameter is already set above if imageUrl is provided
  // We'll handle 'mask' in the FLUX Fill Pro specific parameters section

  // FLUX Redux uses 'redux_image' instead of 'image' for image-to-image
  if (isFluxRedux && imageUrl) {
    delete input.image; // Remove 'image' if it exists
    // We'll set 'redux_image' in the FLUX Redux specific parameters section
  }

  // FLUX Canny Pro uses 'control_image' instead of 'image' for image-to-image
  if (isFluxCannyPro && imageUrl) {
    delete input.image; // Remove 'image' if it exists
    // We'll set 'control_image' in the FLUX Canny Pro specific parameters section
  }

  // FLUX Depth Pro uses 'control_image' instead of 'image' for image-to-image
  if (isFluxDepthPro && imageUrl) {
    delete input.image; // Remove 'image' if it exists
    // We'll set 'control_image' in the FLUX Depth Pro specific parameters section
  }

  try {
    const resolved = await resolveReplicateModelIdentifierForSlug(toolSlug);
    // Use a higher confidence threshold for specific image-to-image tools if they are critical
    const confidenceThreshold = ["pet-to-human", "ai-anime-filter", "ai-photo-enhancer"].includes(toolSlug) ? 25 : 18;
    let resolvedIdentifier =
      resolved.identifier && resolved.confidence >= confidenceThreshold
        ? resolved.identifier
        : FALLBACK_MODEL_IDENTIFIER;

    // Fallback for Flux Redux if no image is provided (it requires redux_image)
    // We seamlessly switch to Flux Dev for text-to-image generation
    if (resolvedIdentifier.includes("flux-redux") && !imageUrl && !(body as any).reduxImage) {
      resolvedIdentifier = "black-forest-labs/flux-dev";
    }

    // Fallback for Flux Fill Pro if no image is provided (it requires image)
    if (resolvedIdentifier.includes("flux-fill-pro") && !imageUrl) {
      resolvedIdentifier = "black-forest-labs/flux-dev";
    }

    // Fallback for Flux Canny Pro if no image is provided (it requires control_image)
    if (resolvedIdentifier.includes("flux-canny-pro") && !imageUrl && !(body as any).controlImage) {
      resolvedIdentifier = "black-forest-labs/flux-dev";
    }

    // Fallback for Flux Depth Pro if no image is provided (it requires control_image)
    if (resolvedIdentifier.includes("flux-depth-pro") && !imageUrl && !(body as any).controlImage) {
      resolvedIdentifier = "black-forest-labs/flux-dev";
    }

    // Fallback for Seedream 3.0 if no image is provided (it requires image)
    if (resolvedIdentifier.includes("seededit-3.0") && !imageUrl) {
      resolvedIdentifier = "black-forest-labs/flux-dev";
    }

    // Filter out negative_prompt for Flux models that don't support it
    if (
      resolvedIdentifier.includes("flux-1.1-pro") ||
      resolvedIdentifier.includes("flux-pro") ||
      resolvedIdentifier.includes("flux-schnell") ||
      resolvedIdentifier.includes("flux-kontext-pro") ||
      resolvedIdentifier.includes("flux-kontext-max") ||
      resolvedIdentifier.includes("flux-fill-pro") ||
      resolvedIdentifier.includes("flux-redux") ||
      resolvedIdentifier.includes("flux-canny-pro") ||
      resolvedIdentifier.includes("flux-depth-pro")
    ) {
      delete input.negative_prompt;
    }

    // FLUX 1.1 Pro Ultra specific parameters
    const isFlux11ProUltra = resolvedIdentifier.includes("flux-1.1-pro-ultra");
    if (isFlux11ProUltra) {
      // Set raw (default false)
      const raw = typeof body.raw === "boolean"
        ? body.raw
        : typeof body.raw === "string"
          ? body.raw.toLowerCase() === "true"
          : false;
      input.raw = raw;

      // Set output_format (default to jpg for FLUX 1.1 Pro Ultra if user didn't specify)
      input.output_format = userSpecifiedFormat ? outputFormat : "jpg";

      // Set safety_tolerance (1-5, default 2)
      const safetyTolerance = typeof body.safetyTolerance === "number"
        ? Math.max(1, Math.min(5, body.safetyTolerance))
        : typeof body.safetyTolerance === "string"
          ? Math.max(1, Math.min(5, parseInt(body.safetyTolerance, 10) || 2))
          : 2;
      input.safety_tolerance = safetyTolerance;

      // Set image_prompt_strength (for image-to-image, 0.0-1.0, default 0.1)
      if (imageUrl) {
        const imagePromptStrength = typeof body.imagePromptStrength === "number"
          ? Math.max(0.0, Math.min(1.0, body.imagePromptStrength))
          : typeof body.imagePromptStrength === "string"
            ? Math.max(0.0, Math.min(1.0, parseFloat(body.imagePromptStrength) || 0.1))
            : 0.1;
        input.image_prompt_strength = imagePromptStrength;
      }
    }

    // FLUX Pro specific parameters (not 1.1 Pro or Ultra)
    const isFluxPro = resolvedIdentifier.includes("flux-pro") && !resolvedIdentifier.includes("flux-1.1-pro");
    if (isFluxPro) {
      // Set steps (default 25)
      const steps = typeof body.steps === "number"
        ? Math.max(1, Math.min(50, body.steps))
        : typeof body.steps === "string"
          ? Math.max(1, Math.min(50, parseInt(body.steps, 10) || 25))
          : 25;
      input.steps = steps;

      // Set width (default 1024)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(2048, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 1024))
          : 1024;
      input.width = width;

      // Set height (default 1024)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(2048, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 1024))
          : 1024;
      input.height = height;

      // Set guidance (default 3)
      const guidance = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 3))
          : 3;
      input.guidance = guidance;

      // Set interval (default 2)
      const interval = typeof body.interval === "number"
        ? Math.max(1, Math.min(10, body.interval))
        : typeof body.interval === "string"
          ? Math.max(1, Math.min(10, parseInt(body.interval, 10) || 2))
          : 2;
      input.interval = interval;

      // Set output_format (default to webp for FLUX Pro if user didn't specify)
      input.output_format = userSpecifiedFormat ? outputFormat : "webp";

      // Set output_quality (0-100, default 80)
      const outputQuality = typeof body.outputQuality === "number"
        ? Math.max(0, Math.min(100, body.outputQuality))
        : typeof body.outputQuality === "string"
          ? Math.max(0, Math.min(100, parseInt(body.outputQuality, 10) || 80))
          : 80;
      input.output_quality = outputQuality;

      // Set safety_tolerance (1-5, default 2)
      const safetyTolerance = typeof body.safetyTolerance === "number"
        ? Math.max(1, Math.min(5, body.safetyTolerance))
        : typeof body.safetyTolerance === "string"
          ? Math.max(1, Math.min(5, parseInt(body.safetyTolerance, 10) || 2))
          : 2;
      input.safety_tolerance = safetyTolerance;

      // Set prompt_upsampling (default false)
      const promptUpsampling = typeof body.promptUpsampling === "boolean"
        ? body.promptUpsampling
        : typeof body.promptUpsampling === "string"
          ? body.promptUpsampling.toLowerCase() === "true"
          : false;
      input.prompt_upsampling = promptUpsampling;
    }

    // FLUX 1.1 Pro specific parameters (not Ultra)
    const isFlux11Pro = resolvedIdentifier.includes("flux-1.1-pro") && !isFlux11ProUltra;
    if (isFlux11Pro) {
      // Set output_format (default to webp for FLUX 1.1 Pro if user didn't specify)
      input.output_format = userSpecifiedFormat ? outputFormat : "webp";

      // Set output_quality (0-100, default 80)
      const outputQuality = typeof body.outputQuality === "number"
        ? Math.max(0, Math.min(100, body.outputQuality))
        : typeof body.outputQuality === "string"
          ? Math.max(0, Math.min(100, parseInt(body.outputQuality, 10) || 80))
          : 80;
      input.output_quality = outputQuality;

      // Set safety_tolerance (1-5, default 2)
      const safetyTolerance = typeof body.safetyTolerance === "number"
        ? Math.max(1, Math.min(5, body.safetyTolerance))
        : typeof body.safetyTolerance === "string"
          ? Math.max(1, Math.min(5, parseInt(body.safetyTolerance, 10) || 2))
          : 2;
      input.safety_tolerance = safetyTolerance;

      // Set prompt_upsampling (default true)
      const promptUpsampling = typeof body.promptUpsampling === "boolean"
        ? body.promptUpsampling
        : typeof body.promptUpsampling === "string"
          ? body.promptUpsampling.toLowerCase() === "true"
          : true;
      input.prompt_upsampling = promptUpsampling;
    }

    // FLUX Schnell specific parameters
    const isFluxSchnell = resolvedIdentifier.includes("flux-schnell");
    if (isFluxSchnell) {
      // Set go_fast (default true)
      const goFast = typeof body.goFast === "boolean"
        ? body.goFast
        : typeof body.goFast === "string"
          ? body.goFast.toLowerCase() === "true"
          : true;
      input.go_fast = goFast;

      // Set megapixels (default "1")
      const megapixels = typeof body.megapixels === "string"
        ? body.megapixels
        : typeof body.megapixels === "number"
          ? String(body.megapixels)
          : "1";
      input.megapixels = megapixels;

      // Set num_outputs (default 1)
      const numOutputs = typeof body.numOutputs === "number"
        ? Math.max(1, Math.min(4, body.numOutputs))
        : typeof body.numOutputs === "string"
          ? Math.max(1, Math.min(4, parseInt(body.numOutputs, 10) || 1))
          : 1;
      input.num_outputs = numOutputs;

      // Set output_format (default to webp for FLUX Schnell if user didn't specify)
      input.output_format = userSpecifiedFormat ? outputFormat : "webp";

      // Set output_quality (0-100, default 80)
      const outputQuality = typeof body.outputQuality === "number"
        ? Math.max(0, Math.min(100, body.outputQuality))
        : typeof body.outputQuality === "string"
          ? Math.max(0, Math.min(100, parseInt(body.outputQuality, 10) || 80))
          : 80;
      input.output_quality = outputQuality;

      // Set num_inference_steps (default 4)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(50, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(50, parseInt(body.numInferenceSteps, 10) || 4))
          : 4;
      input.num_inference_steps = numInferenceSteps;
    }

    // FLUX Dev specific parameters
    const isFluxDev = resolvedIdentifier.includes("flux-dev") && !isFluxSchnell;
    if (isFluxDev) {
      // Set go_fast (default true)
      const goFast = typeof body.goFast === "boolean"
        ? body.goFast
        : typeof body.goFast === "string"
          ? body.goFast.toLowerCase() === "true"
          : true;
      input.go_fast = goFast;

      // Set guidance (default 3.5)
      const guidance = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 3.5))
          : 3.5;
      input.guidance = guidance;

      // Set megapixels (default "1")
      const megapixels = typeof body.megapixels === "string"
        ? body.megapixels
        : typeof body.megapixels === "number"
          ? String(body.megapixels)
          : "1";
      input.megapixels = megapixels;

      // Set num_outputs (default 1)
      const numOutputs = typeof body.numOutputs === "number"
        ? Math.max(1, Math.min(4, body.numOutputs))
        : typeof body.numOutputs === "string"
          ? Math.max(1, Math.min(4, parseInt(body.numOutputs, 10) || 1))
          : 1;
      input.num_outputs = numOutputs;

      // Set output_format (default to webp for FLUX Dev if user didn't specify)
      input.output_format = userSpecifiedFormat ? outputFormat : "webp";

      // Set output_quality (0-100, default 80)
      const outputQuality = typeof body.outputQuality === "number"
        ? Math.max(0, Math.min(100, body.outputQuality))
        : typeof body.outputQuality === "string"
          ? Math.max(0, Math.min(100, parseInt(body.outputQuality, 10) || 80))
          : 80;
      input.output_quality = outputQuality;

      // Set prompt_strength (0.0-1.0, default 0.8)
      const promptStrength = typeof body.promptStrength === "number"
        ? Math.max(0.0, Math.min(1.0, body.promptStrength))
        : typeof body.promptStrength === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.promptStrength) || 0.8))
          : 0.8;
      input.prompt_strength = promptStrength;

      // Set num_inference_steps (default 28)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(50, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(50, parseInt(body.numInferenceSteps, 10) || 28))
          : 28;
      input.num_inference_steps = numInferenceSteps;
    }

    // FLUX Kontext Pro specific parameters
    const isFluxKontextProResolved = resolvedIdentifier.includes("flux-kontext-pro");
    if (isFluxKontextProResolved) {
      // Set output_format (default to jpg for FLUX Kontext Pro if user didn't specify)
      input.output_format = userSpecifiedFormat ? outputFormat : "jpg";

      // Set safety_tolerance (1-5, default 2)
      const safetyTolerance = typeof body.safetyTolerance === "number"
        ? Math.max(1, Math.min(5, body.safetyTolerance))
        : typeof body.safetyTolerance === "string"
          ? Math.max(1, Math.min(5, parseInt(body.safetyTolerance, 10) || 2))
          : 2;
      input.safety_tolerance = safetyTolerance;

      // Set prompt_upsampling (default false)
      const promptUpsampling = typeof body.promptUpsampling === "boolean"
        ? body.promptUpsampling
        : typeof body.promptUpsampling === "string"
          ? body.promptUpsampling.toLowerCase() === "true"
          : false;
      input.prompt_upsampling = promptUpsampling;

      // Handle aspect_ratio: if image is provided, use "match_input_image", otherwise use provided or default
      if (imageUrl) {
        input.aspect_ratio = "match_input_image";
      } else if (input.aspect_ratio) {
        // Keep the aspect_ratio that was set earlier (from body.aspectRatio or default "1:1")
        // No change needed
      }
    }

    // FLUX Kontext Max specific parameters
    const isFluxKontextMaxResolved = resolvedIdentifier.includes("flux-kontext-max");
    if (isFluxKontextMaxResolved) {
      // Set output_format (default to jpg for FLUX Kontext Max if user didn't specify)
      input.output_format = userSpecifiedFormat ? outputFormat : "jpg";

      // Set safety_tolerance (1-5, default 2)
      const safetyTolerance = typeof body.safetyTolerance === "number"
        ? Math.max(1, Math.min(5, body.safetyTolerance))
        : typeof body.safetyTolerance === "string"
          ? Math.max(1, Math.min(5, parseInt(body.safetyTolerance, 10) || 2))
          : 2;
      input.safety_tolerance = safetyTolerance;

      // Set prompt_upsampling (default false)
      const promptUpsampling = typeof body.promptUpsampling === "boolean"
        ? body.promptUpsampling
        : typeof body.promptUpsampling === "string"
          ? body.promptUpsampling.toLowerCase() === "true"
          : false;
      input.prompt_upsampling = promptUpsampling;

      // Handle aspect_ratio: if image is provided, use "match_input_image", otherwise use provided or default
      if (imageUrl) {
        input.aspect_ratio = "match_input_image";
      } else if (input.aspect_ratio) {
        // Keep the aspect_ratio that was set earlier (from body.aspectRatio or default "1:1")
        // No change needed
      }
    }

    // FLUX Fill Pro specific parameters
    const isFluxFillProResolved = resolvedIdentifier.includes("flux-fill-pro");
    if (isFluxFillProResolved) {
      // Set steps (default 50)
      const steps = typeof body.steps === "number"
        ? Math.max(1, Math.min(100, body.steps))
        : typeof body.steps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.steps, 10) || 50))
          : 50;
      input.steps = steps;

      // Set guidance (default 60)
      const guidance = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(100.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(100.0, parseFloat(body.guidance) || 60))
          : 60;
      input.guidance = guidance;

      // Set outpaint (default "None")
      const outpaint = typeof body.outpaint === "string"
        ? body.outpaint
        : typeof body.outpaint === "number"
          ? String(body.outpaint)
          : "None";
      input.outpaint = outpaint;

      // Set output_format (default to jpg for FLUX Fill Pro if user didn't specify)
      input.output_format = userSpecifiedFormat ? outputFormat : "jpg";

      // Set safety_tolerance (1-5, default 2)
      const safetyTolerance = typeof body.safetyTolerance === "number"
        ? Math.max(1, Math.min(5, body.safetyTolerance))
        : typeof body.safetyTolerance === "string"
          ? Math.max(1, Math.min(5, parseInt(body.safetyTolerance, 10) || 2))
          : 2;
      input.safety_tolerance = safetyTolerance;

      // Set prompt_upsampling (default false)
      const promptUpsampling = typeof body.promptUpsampling === "boolean"
        ? body.promptUpsampling
        : typeof body.promptUpsampling === "string"
          ? body.promptUpsampling.toLowerCase() === "true"
          : false;
      input.prompt_upsampling = promptUpsampling;

      // Set mask (for inpainting, if provided)
      const maskUrl = typeof body.mask === "string" ? body.mask.trim() : "";
      if (maskUrl) {
        input.mask = maskUrl;
      }
    }

    // FLUX Redux specific parameters
    const isFluxReduxResolved = resolvedIdentifier.includes("flux-redux");
    if (isFluxReduxResolved) {
      // Set redux_image (for image-to-image, if provided)
      const reduxImageUrl = typeof body.reduxImage === "string"
        ? body.reduxImage.trim()
        : imageUrl || "";
      if (reduxImageUrl) {
        input.redux_image = reduxImageUrl;
      }

      // Set guidance (default 3)
      const guidance = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 3))
          : 3;
      input.guidance = guidance;

      // Set megapixels (default "1")
      const megapixels = typeof body.megapixels === "string"
        ? body.megapixels
        : typeof body.megapixels === "number"
          ? String(body.megapixels)
          : "1";
      input.megapixels = megapixels;

      // Set num_outputs (default 1)
      const numOutputs = typeof body.numOutputs === "number"
        ? Math.max(1, Math.min(4, body.numOutputs))
        : typeof body.numOutputs === "string"
          ? Math.max(1, Math.min(4, parseInt(body.numOutputs, 10) || 1))
          : 1;
      input.num_outputs = numOutputs;

      // Set output_format (default to webp for FLUX Redux if user didn't specify)
      input.output_format = userSpecifiedFormat ? outputFormat : "webp";

      // Set output_quality (0-100, default 80)
      const outputQuality = typeof body.outputQuality === "number"
        ? Math.max(0, Math.min(100, body.outputQuality))
        : typeof body.outputQuality === "string"
          ? Math.max(0, Math.min(100, parseInt(body.outputQuality, 10) || 80))
          : 80;
      input.output_quality = outputQuality;

      // Set num_inference_steps (default 28)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(50, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(50, parseInt(body.numInferenceSteps, 10) || 28))
          : 28;
      input.num_inference_steps = numInferenceSteps;
    }

    // FLUX Canny Pro specific parameters
    const isFluxCannyProResolved = resolvedIdentifier.includes("flux-canny-pro");
    if (isFluxCannyProResolved) {
      // Set control_image (for ControlNet style image-to-image, if provided)
      const controlImageUrl = typeof body.controlImage === "string"
        ? body.controlImage.trim()
        : imageUrl || "";
      if (controlImageUrl) {
        input.control_image = controlImageUrl;
      }

      // Set steps (default 28)
      const steps = typeof body.steps === "number"
        ? Math.max(1, Math.min(100, body.steps))
        : typeof body.steps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.steps, 10) || 28))
          : 28;
      input.steps = steps;

      // Set guidance (default 25)
      const guidance = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(100.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(100.0, parseFloat(body.guidance) || 25))
          : 25;
      input.guidance = guidance;

      // Set output_format (default to jpg for FLUX Canny Pro if user didn't specify)
      input.output_format = userSpecifiedFormat ? outputFormat : "jpg";

      // Set safety_tolerance (1-5, default 2)
      const safetyTolerance = typeof body.safetyTolerance === "number"
        ? Math.max(1, Math.min(5, body.safetyTolerance))
        : typeof body.safetyTolerance === "string"
          ? Math.max(1, Math.min(5, parseInt(body.safetyTolerance, 10) || 2))
          : 2;
      input.safety_tolerance = safetyTolerance;

      // Set prompt_upsampling (default false)
      const promptUpsampling = typeof body.promptUpsampling === "boolean"
        ? body.promptUpsampling
        : typeof body.promptUpsampling === "string"
          ? body.promptUpsampling.toLowerCase() === "true"
          : false;
      input.prompt_upsampling = promptUpsampling;
    }

    // FLUX Depth Pro specific parameters
    const isFluxDepthProResolved = resolvedIdentifier.includes("flux-depth-pro");
    if (isFluxDepthProResolved) {
      // Set control_image (for ControlNet style image-to-image, if provided)
      const controlImageUrl = typeof body.controlImage === "string"
        ? body.controlImage.trim()
        : imageUrl || "";
      if (controlImageUrl) {
        input.control_image = controlImageUrl;
      }

      // Set steps (default 50)
      const steps = typeof body.steps === "number"
        ? Math.max(1, Math.min(100, body.steps))
        : typeof body.steps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.steps, 10) || 50))
          : 50;
      input.steps = steps;

      // Set guidance (default 7)
      const guidance = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(100.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(100.0, parseFloat(body.guidance) || 7))
          : 7;
      input.guidance = guidance;

      // Set output_format (default to jpg for FLUX Depth Pro if user didn't specify)
      input.output_format = userSpecifiedFormat ? outputFormat : "jpg";

      // Set safety_tolerance (1-5, default 2)
      const safetyTolerance = typeof body.safetyTolerance === "number"
        ? Math.max(1, Math.min(5, body.safetyTolerance))
        : typeof body.safetyTolerance === "string"
          ? Math.max(1, Math.min(5, parseInt(body.safetyTolerance, 10) || 2))
          : 2;
      input.safety_tolerance = safetyTolerance;

      // Set prompt_upsampling (default false)
      const promptUpsampling = typeof body.promptUpsampling === "boolean"
        ? body.promptUpsampling
        : typeof body.promptUpsampling === "string"
          ? body.promptUpsampling.toLowerCase() === "true"
          : false;
      input.prompt_upsampling = promptUpsampling;
    }

    // Seedream 3.0 specific parameters
    const isSeedream3 = resolvedIdentifier.includes("seededit-3.0");
    if (isSeedream3) {
      // Set guidance_scale (default 5.5)
      const guidanceScale = typeof body.guidanceScale === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidanceScale))
        : typeof body.guidanceScale === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidanceScale) || 5.5))
          : 5.5;
      input.guidance_scale = guidanceScale;

      // The 'image' parameter is already set above if imageUrl is provided (line 114)
      // No additional handling needed for image parameter
    }

    // Seedream 4.0 specific parameters
    const isSeedream4 = resolvedIdentifier.includes("seedream-4") && !isSeedream3;
    if (isSeedream4) {
      // Remove output_format and negative_prompt for Seedream 4.0 (not supported)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.negative_prompt) {
        delete input.negative_prompt;
      }
      // Set size (default "2K")
      const size = typeof body.size === "string"
        ? body.size
        : typeof body.size === "number"
          ? String(body.size)
          : "2K";
      input.size = size;

      // Set width (default 2048)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(4096, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(4096, parseInt(body.width, 10) || 2048))
          : 2048;
      input.width = width;

      // Set height (default 2048)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(4096, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(4096, parseInt(body.height, 10) || 2048))
          : 2048;
      input.height = height;

      // Set max_images (default 1)
      const maxImages = typeof body.maxImages === "number"
        ? Math.max(1, Math.min(4, body.maxImages))
        : typeof body.maxImages === "string"
          ? Math.max(1, Math.min(4, parseInt(body.maxImages, 10) || 1))
          : 1;
      input.max_images = maxImages;

      // Set image_input (array, default empty array)
      const imageInput = Array.isArray(body.imageInput)
        ? body.imageInput
        : typeof body.imageInput === "string"
          ? body.imageInput.trim() ? [body.imageInput.trim()] : []
          : imageUrl
            ? [imageUrl]
            : [];
      input.image_input = imageInput;

      // Set aspect_ratio (use provided or default "4:3")
      const ar = typeof body.aspectRatio === "string" ? body.aspectRatio : "4:3";
      input.aspect_ratio = ar;

      // Set enhance_prompt (default true)
      const enhancePrompt = typeof body.enhancePrompt === "boolean"
        ? body.enhancePrompt
        : typeof body.enhancePrompt === "string"
          ? body.enhancePrompt.toLowerCase() === "true"
          : true;
      input.enhance_prompt = enhancePrompt;

      // Set sequential_image_generation (default "disabled")
      const sequentialImageGeneration = typeof body.sequentialImageGeneration === "string"
        ? body.sequentialImageGeneration
        : typeof body.sequentialImageGeneration === "number"
          ? String(body.sequentialImageGeneration)
          : "disabled";
      input.sequential_image_generation = sequentialImageGeneration;
    }

    // Ideogram V3 specific parameters
    const isIdeogramV3 = resolvedIdentifier.includes("ideogram-v3-turbo");
    if (isIdeogramV3) {
      // Remove image parameter for Ideogram V3 (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and negative_prompt for Ideogram V3 (not supported)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.negative_prompt) {
        delete input.negative_prompt;
      }

      // Set resolution (default "None")
      const resolution = typeof body.resolution === "string"
        ? body.resolution
        : typeof body.resolution === "number"
          ? String(body.resolution)
          : "None";
      input.resolution = resolution;

      // Set style_type (default "None")
      const styleType = typeof body.styleType === "string"
        ? body.styleType
        : typeof body.styleType === "number"
          ? String(body.styleType)
          : "None";
      input.style_type = styleType;

      // Set aspect_ratio (use provided or default "3:2")
      const ar = typeof body.aspectRatio === "string" ? body.aspectRatio : "3:2";
      input.aspect_ratio = ar;

      // Set style_preset (default "None")
      const stylePreset = typeof body.stylePreset === "string"
        ? body.stylePreset
        : typeof body.stylePreset === "number"
          ? String(body.stylePreset)
          : "None";
      input.style_preset = stylePreset;

      // Set magic_prompt_option (default "Auto")
      const magicPromptOption = typeof body.magicPromptOption === "string"
        ? body.magicPromptOption
        : typeof body.magicPromptOption === "number"
          ? String(body.magicPromptOption)
          : "Auto";
      input.magic_prompt_option = magicPromptOption;
    }

    // Ideogram V2 Turbo specific parameters
    const isIdeogramV2Turbo = resolvedIdentifier.includes("ideogram-v2-turbo");
    if (isIdeogramV2Turbo) {
      // Remove image parameter for Ideogram V2 Turbo (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and negative_prompt for Ideogram V2 Turbo (not supported)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.negative_prompt) {
        delete input.negative_prompt;
      }

      // Set resolution (default "None")
      const resolution = typeof body.resolution === "string"
        ? body.resolution
        : typeof body.resolution === "number"
          ? String(body.resolution)
          : "None";
      input.resolution = resolution;

      // Set style_type (default "None")
      const styleType = typeof body.styleType === "string"
        ? body.styleType
        : typeof body.styleType === "number"
          ? String(body.styleType)
          : "None";
      input.style_type = styleType;

      // Set aspect_ratio (use provided or default "1:1")
      const ar = typeof body.aspectRatio === "string" ? body.aspectRatio : "1:1";
      input.aspect_ratio = ar;

      // Set magic_prompt_option (default "Auto")
      const magicPromptOption = typeof body.magicPromptOption === "string"
        ? body.magicPromptOption
        : typeof body.magicPromptOption === "number"
          ? String(body.magicPromptOption)
          : "Auto";
      input.magic_prompt_option = magicPromptOption;
    }

    // Recraft V3 specific parameters
    const isRecraftV3 = resolvedIdentifier.includes("recraft-v3") && !resolvedIdentifier.includes("recraft-v3-svg");
    if (isRecraftV3) {
      // Remove image parameter for Recraft V3 (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and negative_prompt for Recraft V3 (not supported)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.negative_prompt) {
        delete input.negative_prompt;
      }

      // Set size (default "1365x1024")
      const size = typeof body.size === "string"
        ? body.size
        : typeof body.size === "number"
          ? String(body.size)
          : "1365x1024";
      input.size = size;

      // Set style (default "any")
      const style = typeof body.style === "string"
        ? body.style
        : typeof body.style === "number"
          ? String(body.style)
          : "any";
      input.style = style;

      // Set aspect_ratio (use provided or default "Not set")
      const ar = typeof body.aspectRatio === "string" ? body.aspectRatio : "Not set";
      input.aspect_ratio = ar;
    }

    // Recraft V3 SVG specific parameters
    const isRecraftV3SVG = resolvedIdentifier.includes("recraft-v3-svg");
    if (isRecraftV3SVG) {
      // Remove image parameter for Recraft V3 SVG (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and negative_prompt for Recraft V3 SVG (not supported)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.negative_prompt) {
        delete input.negative_prompt;
      }

      // Set size (default "1024x1024")
      const size = typeof body.size === "string"
        ? body.size
        : typeof body.size === "number"
          ? String(body.size)
          : "1024x1024";
      input.size = size;

      // Set style (default "any")
      const style = typeof body.style === "string"
        ? body.style
        : typeof body.style === "number"
          ? String(body.style)
          : "any";
      input.style = style;

      // Set aspect_ratio (use provided or default "Not set")
      const ar = typeof body.aspectRatio === "string" ? body.aspectRatio : "Not set";
      input.aspect_ratio = ar;
    }

    // Hidream I1 Full specific parameters
    const isHidreamI1Full = resolvedIdentifier.includes("hidream-l1-full");
    if (isHidreamI1Full) {
      // Remove image parameter for Hidream I1 Full (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove negative_prompt for Hidream I1 Full (not supported)
      if (input.negative_prompt) {
        delete input.negative_prompt;
      }

      // Set seed (default 1)
      const seed = typeof body.seed === "number"
        ? Math.max(0, Math.min(2147483647, body.seed))
        : typeof body.seed === "string"
          ? Math.max(0, Math.min(2147483647, parseInt(body.seed, 10) || 1))
          : 1;
      input.seed = seed;

      // Set model_type (default "full")
      const modelType = typeof body.modelType === "string"
        ? body.modelType
        : typeof body.modelType === "number"
          ? String(body.modelType)
          : "full";
      input.model_type = modelType;

      // Set resolution (default "1024 × 1024 (Square)")
      const resolution = typeof body.resolution === "string"
        ? body.resolution
        : typeof body.resolution === "number"
          ? String(body.resolution)
          : "1024 × 1024 (Square)";
      input.resolution = resolution;

      // Set speed_mode (default "Juiced 🔥 (more speed)")
      const speedMode = typeof body.speedMode === "string"
        ? body.speedMode
        : typeof body.speedMode === "number"
          ? String(body.speedMode)
          : "Juiced 🔥 (more speed)";
      input.speed_mode = speedMode;

      // Set output_format (use provided or default "webp")
      const of = userSpecifiedFormat ? outputFormat : "webp";
      input.output_format = of;

      // Set output_quality (0-100, default 80)
      const outputQuality = typeof body.outputQuality === "number"
        ? Math.max(0, Math.min(100, body.outputQuality))
        : typeof body.outputQuality === "string"
          ? Math.max(0, Math.min(100, parseInt(body.outputQuality, 10) || 80))
          : 80;
      input.output_quality = outputQuality;
    }

    // Hidream I1 Dev specific parameters
    const isHidreamI1Dev = resolvedIdentifier.includes("hidream-l1-dev");
    if (isHidreamI1Dev) {
      // Remove image parameter for Hidream I1 Dev (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove negative_prompt for Hidream I1 Dev (not supported)
      if (input.negative_prompt) {
        delete input.negative_prompt;
      }

      // Set seed (default -1)
      const seed = typeof body.seed === "number"
        ? Math.max(-1, Math.min(2147483647, body.seed))
        : typeof body.seed === "string"
          ? Math.max(-1, Math.min(2147483647, parseInt(body.seed, 10) || -1))
          : -1;
      input.seed = seed;

      // Set model_type (default "dev")
      const modelType = typeof body.modelType === "string"
        ? body.modelType
        : typeof body.modelType === "number"
          ? String(body.modelType)
          : "dev";
      input.model_type = modelType;

      // Set resolution (default "1024 × 1024 (Square)")
      const resolution = typeof body.resolution === "string"
        ? body.resolution
        : typeof body.resolution === "number"
          ? String(body.resolution)
          : "1024 × 1024 (Square)";
      input.resolution = resolution;

      // Set speed_mode (default "Juiced 🔥 (more speed)")
      const speedMode = typeof body.speedMode === "string"
        ? body.speedMode
        : typeof body.speedMode === "number"
          ? String(body.speedMode)
          : "Juiced 🔥 (more speed)";
      input.speed_mode = speedMode;

      // Set output_format (use provided or default "jpg")
      const of = userSpecifiedFormat ? outputFormat : "jpg";
      input.output_format = of;

      // Set output_quality (0-100, default 80)
      const outputQuality = typeof body.outputQuality === "number"
        ? Math.max(0, Math.min(100, body.outputQuality))
        : typeof body.outputQuality === "string"
          ? Math.max(0, Math.min(100, parseInt(body.outputQuality, 10) || 80))
          : 80;
      input.output_quality = outputQuality;
    }

    // Hidream I1 Fast specific parameters
    const isHidreamI1Fast = resolvedIdentifier.includes("hidream-l1-fast");
    if (isHidreamI1Fast) {
      // Remove image parameter for Hidream I1 Fast (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Note: negative_prompt is supported for Hidream I1 Fast (unlike Full and Dev)

      // Set seed (default 10)
      const seed = typeof body.seed === "number"
        ? Math.max(-1, Math.min(2147483647, body.seed))
        : typeof body.seed === "string"
          ? Math.max(-1, Math.min(2147483647, parseInt(body.seed, 10) || 10))
          : 10;
      input.seed = seed;

      // Set model_type (default "fast")
      const modelType = typeof body.modelType === "string"
        ? body.modelType
        : typeof body.modelType === "number"
          ? String(body.modelType)
          : "fast";
      input.model_type = modelType;

      // Set resolution (default "1024 × 1024 (Square)")
      const resolution = typeof body.resolution === "string"
        ? body.resolution
        : typeof body.resolution === "number"
          ? String(body.resolution)
          : "1024 × 1024 (Square)";
      input.resolution = resolution;

      // Set speed_mode (default "Extra Juiced 🚀 (even more speed)")
      const speedMode = typeof body.speedMode === "string"
        ? body.speedMode
        : typeof body.speedMode === "number"
          ? String(body.speedMode)
          : "Extra Juiced 🚀 (even more speed)";
      input.speed_mode = speedMode;

      // Set output_format (use provided or default "jpg")
      const of = userSpecifiedFormat ? outputFormat : "jpg";
      input.output_format = of;

      // Set output_quality (0-100, default 80)
      const outputQuality = typeof body.outputQuality === "number"
        ? Math.max(0, Math.min(100, body.outputQuality))
        : typeof body.outputQuality === "string"
          ? Math.max(0, Math.min(100, parseInt(body.outputQuality, 10) || 80))
          : 80;
      input.output_quality = outputQuality;

      // Set negative_prompt (default empty string if not provided)
      // Note: negative_prompt is supported for Hidream I1 Fast
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }
    }

    // Sana specific parameters
    const isSana = resolvedIdentifier.includes("nvidia/sana");
    if (isSana) {
      // Remove image parameter for Sana (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and aspect_ratio for Sana (not supported, uses width/height instead)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set width (default 1024)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(4096, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(4096, parseInt(body.width, 10) || 1024))
          : 1024;
      input.width = width;

      // Set height (default 1024)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(4096, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(4096, parseInt(body.height, 10) || 1024))
          : 1024;
      input.height = height;

      // Set model_variant (default "1600M-1024px")
      const modelVariant = typeof body.modelVariant === "string"
        ? body.modelVariant
        : typeof body.modelVariant === "number"
          ? String(body.modelVariant)
          : "1600M-1024px";
      input.model_variant = modelVariant;

      // Set guidance_scale (default 5)
      const guidanceScale = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 5))
          : 5;
      input.guidance_scale = guidanceScale;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }

      // Set pag_guidance_scale (default 2)
      const pagGuidanceScale = typeof body.pagGuidanceScale === "number"
        ? Math.max(0.0, Math.min(20.0, body.pagGuidanceScale))
        : typeof body.pagGuidanceScale === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.pagGuidanceScale) || 2))
          : 2;
      input.pag_guidance_scale = pagGuidanceScale;

      // Set num_inference_steps (default 18)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(50, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(50, parseInt(body.numInferenceSteps, 10) || 18))
          : 18;
      input.num_inference_steps = numInferenceSteps;
    }

    // Hunyuan Image specific parameters
    const isHunyuanImage = resolvedIdentifier.includes("hunyuan-image-2.1");
    if (isHunyuanImage) {
      // Remove image parameter for Hunyuan Image (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove negative_prompt for Hunyuan Image (not supported)
      if (input.negative_prompt) {
        delete input.negative_prompt;
      }

      // Set go_fast (default true)
      const goFast = typeof body.goFast === "boolean"
        ? body.goFast
        : typeof body.goFast === "string"
          ? body.goFast.toLowerCase() === "true"
          : true;
      input.go_fast = goFast;

      // Set aspect_ratio (use provided or default "1:1")
      const ar = typeof body.aspectRatio === "string" ? body.aspectRatio : "1:1";
      input.aspect_ratio = ar;

      // Set output_format (use provided or default "webp")
      const of = userSpecifiedFormat ? outputFormat : "webp";
      input.output_format = of;

      // Set output_quality (0-100, default 95)
      const outputQuality = typeof body.outputQuality === "number"
        ? Math.max(0, Math.min(100, body.outputQuality))
        : typeof body.outputQuality === "string"
          ? Math.max(0, Math.min(100, parseInt(body.outputQuality, 10) || 95))
          : 95;
      input.output_quality = outputQuality;
    }

    // Kling 2.0 Image specific parameters
    const isKling2Image = resolvedIdentifier.includes("kling-v2.0");
    if (isKling2Image) {
      // Remove image parameter for Kling 2.0 Image (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format for Kling 2.0 Image (not supported)
      if (input.output_format) {
        delete input.output_format;
      }

      // Set duration (default 5)
      const duration = typeof body.duration === "number"
        ? Math.max(1, Math.min(10, body.duration))
        : typeof body.duration === "string"
          ? Math.max(1, Math.min(10, parseInt(body.duration, 10) || 5))
          : 5;
      input.duration = duration;

      // Set cfg_scale (default 0.5)
      const cfgScale = typeof body.cfgScale === "number"
        ? Math.max(0.0, Math.min(20.0, body.cfgScale))
        : typeof body.cfgScale === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.cfgScale) || 0.5))
          : 0.5;
      input.cfg_scale = cfgScale;

      // Set aspect_ratio (use provided or default "16:9")
      const ar = typeof body.aspectRatio === "string" ? body.aspectRatio : "16:9";
      input.aspect_ratio = ar;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }
    }

    // SD 3.5 Large specific parameters
    const isSD35Large = resolvedIdentifier.includes("stable-diffusion-3.5-large") && !resolvedIdentifier.includes("stable-diffusion-3.5-large-turbo");
    if (isSD35Large) {
      // Remove image parameter for SD 3.5 Large (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove negative_prompt for SD 3.5 Large (not supported)
      if (input.negative_prompt) {
        delete input.negative_prompt;
      }

      // Set cfg (default 4.5)
      const cfg = typeof body.cfg === "number"
        ? Math.max(0.0, Math.min(20.0, body.cfg))
        : typeof body.cfg === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.cfg) || 4.5))
          : 4.5;
      input.cfg = cfg;

      // Set aspect_ratio (use provided or default "1:1")
      const ar = typeof body.aspectRatio === "string" ? body.aspectRatio : "1:1";
      input.aspect_ratio = ar;

      // Set output_format (use provided or default "webp")
      const of = userSpecifiedFormat ? outputFormat : "webp";
      input.output_format = of;

      // Set prompt_strength (default 0.85)
      const promptStrength = typeof body.promptStrength === "number"
        ? Math.max(0.0, Math.min(1.0, body.promptStrength))
        : typeof body.promptStrength === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.promptStrength) || 0.85))
          : 0.85;
      input.prompt_strength = promptStrength;
    }

    // SD 3.5 Large Turbo specific parameters
    const isSD35LargeTurbo = resolvedIdentifier.includes("stable-diffusion-3.5-large-turbo");
    if (isSD35LargeTurbo) {
      // Remove image parameter for SD 3.5 Large Turbo (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove negative_prompt for SD 3.5 Large Turbo (not supported)
      if (input.negative_prompt) {
        delete input.negative_prompt;
      }

      // Set cfg (default 1)
      const cfg = typeof body.cfg === "number"
        ? Math.max(0.0, Math.min(20.0, body.cfg))
        : typeof body.cfg === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.cfg) || 1))
          : 1;
      input.cfg = cfg;

      // Set aspect_ratio (use provided or default "3:2")
      const ar = typeof body.aspectRatio === "string" ? body.aspectRatio : "3:2";
      input.aspect_ratio = ar;

      // Set output_format (use provided or default "webp")
      const of = userSpecifiedFormat ? outputFormat : "webp";
      input.output_format = of;

      // Set prompt_strength (default 0.85)
      const promptStrength = typeof body.promptStrength === "number"
        ? Math.max(0.0, Math.min(1.0, body.promptStrength))
        : typeof body.promptStrength === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.promptStrength) || 0.85))
          : 0.85;
      input.prompt_strength = promptStrength;
    }

    // SDXL specific parameters
    const isSDXL = resolvedIdentifier.includes("stability-ai/sdxl") && !resolvedIdentifier.includes("sdxl-lightning");
    if (isSDXL) {
      // Remove image parameter for SDXL (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and aspect_ratio for SDXL (uses width/height instead)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set width (default 768)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(2048, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 768))
          : 768;
      input.width = width;

      // Set height (default 768)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(2048, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 768))
          : 768;
      input.height = height;

      // Set refine (default "expert_ensemble_refiner")
      const refine = typeof body.refine === "string"
        ? body.refine
        : typeof body.refine === "number"
          ? String(body.refine)
          : "expert_ensemble_refiner";
      input.refine = refine;

      // Set scheduler (default "K_EULER")
      const scheduler = typeof body.scheduler === "string"
        ? body.scheduler
        : typeof body.scheduler === "number"
          ? String(body.scheduler)
          : "K_EULER";
      input.scheduler = scheduler;

      // Set lora_scale (default 0.6)
      const loraScale = typeof body.loraScale === "number"
        ? Math.max(0.0, Math.min(1.0, body.loraScale))
        : typeof body.loraScale === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.loraScale) || 0.6))
          : 0.6;
      input.lora_scale = loraScale;

      // Set num_outputs (default 1)
      const numOutputs = typeof body.numOutputs === "number"
        ? Math.max(1, Math.min(4, body.numOutputs))
        : typeof body.numOutputs === "string"
          ? Math.max(1, Math.min(4, parseInt(body.numOutputs, 10) || 1))
          : 1;
      input.num_outputs = numOutputs;

      // Set guidance_scale (default 7.5)
      const guidanceScale = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 7.5))
          : 7.5;
      input.guidance_scale = guidanceScale;

      // Set apply_watermark (default false)
      const applyWatermark = typeof body.applyWatermark === "boolean"
        ? body.applyWatermark
        : typeof body.applyWatermark === "string"
          ? body.applyWatermark.toLowerCase() === "true"
          : false;
      input.apply_watermark = applyWatermark;

      // Set high_noise_frac (default 0.8)
      const highNoiseFrac = typeof body.highNoiseFrac === "number"
        ? Math.max(0.0, Math.min(1.0, body.highNoiseFrac))
        : typeof body.highNoiseFrac === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.highNoiseFrac) || 0.8))
          : 0.8;
      input.high_noise_frac = highNoiseFrac;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }

      // Set prompt_strength (default 0.8)
      const promptStrength = typeof body.promptStrength === "number"
        ? Math.max(0.0, Math.min(1.0, body.promptStrength))
        : typeof body.promptStrength === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.promptStrength) || 0.8))
          : 0.8;
      input.prompt_strength = promptStrength;

      // Set num_inference_steps (default 25)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(100, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.numInferenceSteps, 10) || 25))
          : 25;
      input.num_inference_steps = numInferenceSteps;
    }

    // SDXL Lightning specific parameters
    const isSDXLLightning = resolvedIdentifier.includes("sdxl-lightning");
    if (isSDXLLightning) {
      // Remove image parameter for SDXL Lightning (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove negative_prompt and aspect_ratio for SDXL Lightning (not supported)
      if (input.negative_prompt) {
        delete input.negative_prompt;
      }
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set seed (default 42)
      const seed = typeof body.seed === "number"
        ? Math.max(-1, Math.min(2147483647, body.seed))
        : typeof body.seed === "string"
          ? Math.max(-1, Math.min(2147483647, parseInt(body.seed, 10) || 42))
          : 42;
      input.seed = seed;

      // Set num_images (default 1)
      const numImages = typeof body.numImages === "number"
        ? Math.max(1, Math.min(4, body.numImages))
        : typeof body.numImages === "string"
          ? Math.max(1, Math.min(4, parseInt(body.numImages, 10) || 1))
          : 1;
      input.num_images = numImages;

      // Set image_width (default 1024)
      const imageWidth = typeof body.imageWidth === "number"
        ? Math.max(256, Math.min(2048, body.imageWidth))
        : typeof body.imageWidth === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.imageWidth, 10) || 1024))
          : typeof body.width === "number"
            ? Math.max(256, Math.min(2048, body.width))
            : typeof body.width === "string"
              ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 1024))
              : 1024;
      input.image_width = imageWidth;

      // Set image_height (default 1024)
      const imageHeight = typeof body.imageHeight === "number"
        ? Math.max(256, Math.min(2048, body.imageHeight))
        : typeof body.imageHeight === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.imageHeight, 10) || 1024))
          : typeof body.height === "number"
            ? Math.max(256, Math.min(2048, body.height))
            : typeof body.height === "string"
              ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 1024))
              : 1024;
      input.image_height = imageHeight;

      // Set output_format (use provided or default "jpg")
      const of = userSpecifiedFormat ? outputFormat : "jpg";
      input.output_format = of;

      // Set guidance_scale (default 0)
      const guidanceScale = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 0))
          : 0;
      input.guidance_scale = guidanceScale;

      // Set output_quality (0-100, default 80)
      const outputQuality = typeof body.outputQuality === "number"
        ? Math.max(0, Math.min(100, body.outputQuality))
        : typeof body.outputQuality === "string"
          ? Math.max(0, Math.min(100, parseInt(body.outputQuality, 10) || 80))
          : 80;
      input.output_quality = outputQuality;

      // Set num_inference_steps (default 4)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(50, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(50, parseInt(body.numInferenceSteps, 10) || 4))
          : 4;
      input.num_inference_steps = numInferenceSteps;
    }

    // Playground V3 specific parameters
    const isPlaygroundV3 = resolvedIdentifier.includes("playground-v2-1024px-aesthetic");
    if (isPlaygroundV3) {
      // Remove image parameter for Playground V3 (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and aspect_ratio for Playground V3 (uses width/height instead)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set width (default 1024)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(2048, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 1024))
          : 1024;
      input.width = width;

      // Set height (default 1024)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(2048, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 1024))
          : 1024;
      input.height = height;

      // Set scheduler (default "KarrasDPM")
      const scheduler = typeof body.scheduler === "string"
        ? body.scheduler
        : typeof body.scheduler === "number"
          ? String(body.scheduler)
          : "KarrasDPM";
      input.scheduler = scheduler;

      // Set num_outputs (default 2)
      const numOutputs = typeof body.numOutputs === "number"
        ? Math.max(1, Math.min(4, body.numOutputs))
        : typeof body.numOutputs === "string"
          ? Math.max(1, Math.min(4, parseInt(body.numOutputs, 10) || 2))
          : 2;
      input.num_outputs = numOutputs;

      // Set guidance_scale (default 3)
      const guidanceScale = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 3))
          : 3;
      input.guidance_scale = guidanceScale;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }

      // Set num_inference_steps (default 25)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(100, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.numInferenceSteps, 10) || 25))
          : 25;
      input.num_inference_steps = numInferenceSteps;
    }

    // Kolors specific parameters
    const isKolors = resolvedIdentifier.includes("fofr/kolors");
    if (isKolors) {
      // Remove image parameter for Kolors (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove aspect_ratio for Kolors (uses width/height instead)
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set cfg (default 5)
      const cfg = typeof body.cfg === "number"
        ? Math.max(0.0, Math.min(20.0, body.cfg))
        : typeof body.cfg === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.cfg) || 5))
          : 5;
      input.cfg = cfg;

      // Set steps (default 25)
      const steps = typeof body.steps === "number"
        ? Math.max(1, Math.min(100, body.steps))
        : typeof body.steps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.steps, 10) || 25))
          : 25;
      input.steps = steps;

      // Set width (default 1024)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(2048, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 1024))
          : 1024;
      input.width = width;

      // Set height (default 1024)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(2048, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 1024))
          : 1024;
      input.height = height;

      // Set scheduler (default "EulerDiscreteScheduler")
      const scheduler = typeof body.scheduler === "string"
        ? body.scheduler
        : typeof body.scheduler === "number"
          ? String(body.scheduler)
          : "EulerDiscreteScheduler";
      input.scheduler = scheduler;

      // Set output_format (use provided or default "webp")
      const of = userSpecifiedFormat ? outputFormat : "webp";
      input.output_format = of;

      // Set output_quality (0-100, default 80)
      const outputQuality = typeof body.outputQuality === "number"
        ? Math.max(0, Math.min(100, body.outputQuality))
        : typeof body.outputQuality === "string"
          ? Math.max(0, Math.min(100, parseInt(body.outputQuality, 10) || 80))
          : 80;
      input.output_quality = outputQuality;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }

      // Set number_of_images (default 1)
      const numberOfImages = typeof body.numberOfImages === "number"
        ? Math.max(1, Math.min(4, body.numberOfImages))
        : typeof body.numberOfImages === "string"
          ? Math.max(1, Math.min(4, parseInt(body.numberOfImages, 10) || 1))
          : 1;
      input.number_of_images = numberOfImages;
    }

    // Juggernaut XL specific parameters
    const isJuggernautXL = resolvedIdentifier.includes("juggernaut-xl-v7");
    if (isJuggernautXL) {
      // Remove image parameter for Juggernaut XL (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and aspect_ratio for Juggernaut XL (uses width/height instead)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set seed (default 29725)
      const seed = typeof body.seed === "number"
        ? Math.max(-1, Math.min(2147483647, body.seed))
        : typeof body.seed === "string"
          ? Math.max(-1, Math.min(2147483647, parseInt(body.seed, 10) || 29725))
          : 29725;
      input.seed = seed;

      // Set width (default 1024)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(2048, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 1024))
          : 1024;
      input.width = width;

      // Set height (default 1024)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(2048, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 1024))
          : 1024;
      input.height = height;

      // Set strength (default 1)
      const strength = typeof body.strength === "number"
        ? Math.max(0.0, Math.min(1.0, body.strength))
        : typeof body.strength === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.strength) || 1))
          : 1;
      input.strength = strength;

      // Set scheduler (default "K_EULER_ANCESTRAL")
      const scheduler = typeof body.scheduler === "string"
        ? body.scheduler
        : typeof body.scheduler === "number"
          ? String(body.scheduler)
          : "K_EULER_ANCESTRAL";
      input.scheduler = scheduler;

      // Set lora_scale (default 0.6)
      const loraScale = typeof body.loraScale === "number"
        ? Math.max(0.0, Math.min(1.0, body.loraScale))
        : typeof body.loraScale === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.loraScale) || 0.6))
          : 0.6;
      input.lora_scale = loraScale;

      // Set num_outputs (default 1)
      const numOutputs = typeof body.numOutputs === "number"
        ? Math.max(1, Math.min(4, body.numOutputs))
        : typeof body.numOutputs === "string"
          ? Math.max(1, Math.min(4, parseInt(body.numOutputs, 10) || 1))
          : 1;
      input.num_outputs = numOutputs;

      // Set guidance_scale (default 7)
      const guidanceScale = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 7))
          : 7;
      input.guidance_scale = guidanceScale;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }

      // Set num_inference_steps (default 40)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(100, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.numInferenceSteps, 10) || 40))
          : 40;
      input.num_inference_steps = numInferenceSteps;
    }

    // RealVisXL V5 specific parameters
    const isRealVisXLV5 = resolvedIdentifier.includes("realvisxl-v3-multi-controlnet-lora");
    if (isRealVisXLV5) {
      // Remove image parameter for RealVisXL V5 (uses controlnet images instead)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and aspect_ratio for RealVisXL V5 (uses width/height instead)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set width (default 768)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(2048, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 768))
          : 768;
      input.width = width;

      // Set height (default 768)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(2048, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 768))
          : 768;
      input.height = height;

      // Set refine (default "no_refiner")
      const refine = typeof body.refine === "string"
        ? body.refine
        : typeof body.refine === "number"
          ? String(body.refine)
          : "no_refiner";
      input.refine = refine;

      // Set scheduler (default "K_EULER")
      const scheduler = typeof body.scheduler === "string"
        ? body.scheduler
        : typeof body.scheduler === "number"
          ? String(body.scheduler)
          : "K_EULER";
      input.scheduler = scheduler;

      // Set lora_scale (default 0.8)
      const loraScale = typeof body.loraScale === "number"
        ? Math.max(0.0, Math.min(1.0, body.loraScale))
        : typeof body.loraScale === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.loraScale) || 0.8))
          : 0.8;
      input.lora_scale = loraScale;

      // Set num_outputs (default 1)
      const numOutputs = typeof body.numOutputs === "number"
        ? Math.max(1, Math.min(4, body.numOutputs))
        : typeof body.numOutputs === "string"
          ? Math.max(1, Math.min(4, parseInt(body.numOutputs, 10) || 1))
          : 1;
      input.num_outputs = numOutputs;

      // Set controlnet_1 (default "soft_edge_hed")
      const controlnet1 = typeof body.controlnet1 === "string"
        ? body.controlnet1
        : typeof body.controlnet1 === "number"
          ? String(body.controlnet1)
          : "soft_edge_hed";
      input.controlnet_1 = controlnet1;

      // Set controlnet_2 (default "none")
      const controlnet2 = typeof body.controlnet2 === "string"
        ? body.controlnet2
        : typeof body.controlnet2 === "number"
          ? String(body.controlnet2)
          : "none";
      input.controlnet_2 = controlnet2;

      // Set controlnet_3 (default "none")
      const controlnet3 = typeof body.controlnet3 === "string"
        ? body.controlnet3
        : typeof body.controlnet3 === "number"
          ? String(body.controlnet3)
          : "none";
      input.controlnet_3 = controlnet3;

      // Set guidance_scale (default 7.5)
      const guidanceScale = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 7.5))
          : 7.5;
      input.guidance_scale = guidanceScale;

      // Set apply_watermark (default false)
      const applyWatermark = typeof body.applyWatermark === "boolean"
        ? body.applyWatermark
        : typeof body.applyWatermark === "string"
          ? body.applyWatermark.toLowerCase() === "true"
          : false;
      input.apply_watermark = applyWatermark;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }

      // Set prompt_strength (default 0.8)
      const promptStrength = typeof body.promptStrength === "number"
        ? Math.max(0.0, Math.min(1.0, body.promptStrength))
        : typeof body.promptStrength === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.promptStrength) || 0.8))
          : 0.8;
      input.prompt_strength = promptStrength;

      // Set sizing_strategy (default "width_height")
      const sizingStrategy = typeof body.sizingStrategy === "string"
        ? body.sizingStrategy
        : typeof body.sizingStrategy === "number"
          ? String(body.sizingStrategy)
          : "width_height";
      input.sizing_strategy = sizingStrategy;

      // Set controlnet_1_end (default 1)
      const controlnet1End = typeof body.controlnet1End === "number"
        ? Math.max(0.0, Math.min(1.0, body.controlnet1End))
        : typeof body.controlnet1End === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.controlnet1End) || 1))
          : 1;
      input.controlnet_1_end = controlnet1End;

      // Set controlnet_2_end (default 1)
      const controlnet2End = typeof body.controlnet2End === "number"
        ? Math.max(0.0, Math.min(1.0, body.controlnet2End))
        : typeof body.controlnet2End === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.controlnet2End) || 1))
          : 1;
      input.controlnet_2_end = controlnet2End;

      // Set controlnet_3_end (default 1)
      const controlnet3End = typeof body.controlnet3End === "number"
        ? Math.max(0.0, Math.min(1.0, body.controlnet3End))
        : typeof body.controlnet3End === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.controlnet3End) || 1))
          : 1;
      input.controlnet_3_end = controlnet3End;

      // Set controlnet_1_image (from controlnet1Image or imageUrl)
      const controlnet1Image = typeof body.controlnet1Image === "string"
        ? body.controlnet1Image.trim()
        : imageUrl
          ? imageUrl
          : "";
      if (controlnet1Image) {
        input.controlnet_1_image = controlnet1Image;
      }

      // Set controlnet_1_start (default 0)
      const controlnet1Start = typeof body.controlnet1Start === "number"
        ? Math.max(0.0, Math.min(1.0, body.controlnet1Start))
        : typeof body.controlnet1Start === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.controlnet1Start) || 0))
          : 0;
      input.controlnet_1_start = controlnet1Start;

      // Set controlnet_2_start (default 0)
      const controlnet2Start = typeof body.controlnet2Start === "number"
        ? Math.max(0.0, Math.min(1.0, body.controlnet2Start))
        : typeof body.controlnet2Start === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.controlnet2Start) || 0))
          : 0;
      input.controlnet_2_start = controlnet2Start;

      // Set controlnet_3_start (default 0)
      const controlnet3Start = typeof body.controlnet3Start === "number"
        ? Math.max(0.0, Math.min(1.0, body.controlnet3Start))
        : typeof body.controlnet3Start === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.controlnet3Start) || 0))
          : 0;
      input.controlnet_3_start = controlnet3Start;

      // Set num_inference_steps (default 30)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(100, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.numInferenceSteps, 10) || 30))
          : 30;
      input.num_inference_steps = numInferenceSteps;

      // Set controlnet_1_conditioning_scale (default 0.8)
      const controlnet1ConditioningScale = typeof body.controlnet1ConditioningScale === "number"
        ? Math.max(0.0, Math.min(2.0, body.controlnet1ConditioningScale))
        : typeof body.controlnet1ConditioningScale === "string"
          ? Math.max(0.0, Math.min(2.0, parseFloat(body.controlnet1ConditioningScale) || 0.8))
          : 0.8;
      input.controlnet_1_conditioning_scale = controlnet1ConditioningScale;

      // Set controlnet_2_conditioning_scale (default 0.8)
      const controlnet2ConditioningScale = typeof body.controlnet2ConditioningScale === "number"
        ? Math.max(0.0, Math.min(2.0, body.controlnet2ConditioningScale))
        : typeof body.controlnet2ConditioningScale === "string"
          ? Math.max(0.0, Math.min(2.0, parseFloat(body.controlnet2ConditioningScale) || 0.8))
          : 0.8;
      input.controlnet_2_conditioning_scale = controlnet2ConditioningScale;

      // Set controlnet_3_conditioning_scale (default 0.75)
      const controlnet3ConditioningScale = typeof body.controlnet3ConditioningScale === "number"
        ? Math.max(0.0, Math.min(2.0, body.controlnet3ConditioningScale))
        : typeof body.controlnet3ConditioningScale === "string"
          ? Math.max(0.0, Math.min(2.0, parseFloat(body.controlnet3ConditioningScale) || 0.75))
          : 0.75;
      input.controlnet_3_conditioning_scale = controlnet3ConditioningScale;

      // Set controlnet_2_image if provided
      const controlnet2Image = typeof body.controlnet2Image === "string" ? body.controlnet2Image.trim() : "";
      if (controlnet2Image) {
        input.controlnet_2_image = controlnet2Image;
      }

      // Set controlnet_3_image if provided
      const controlnet3Image = typeof body.controlnet3Image === "string" ? body.controlnet3Image.trim() : "";
      if (controlnet3Image) {
        input.controlnet_3_image = controlnet3Image;
      }
    }

    // Dalle 3 specific parameters
    const isDalle3 = resolvedIdentifier.includes("dall-e-3");
    if (isDalle3) {
      // Remove image parameter for Dalle 3 (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and negative_prompt for Dalle 3 (not supported)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.negative_prompt) {
        delete input.negative_prompt;
      }

      // Set style (default "vivid")
      const style = typeof body.style === "string"
        ? body.style
        : typeof body.style === "number"
          ? String(body.style)
          : "vivid";
      input.style = style;

      // Set aspect_ratio (default "1:1")
      const aspectRatio = typeof body.aspectRatio === "string"
        ? body.aspectRatio
        : "1:1";
      input.aspect_ratio = aspectRatio;
    }

    // Midjourney Style specific parameters
    const isMidjourneyStyle = resolvedIdentifier.includes("midjourney-allcraft");
    if (isMidjourneyStyle) {
      // Remove image parameter for Midjourney Style (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove negative_prompt for Midjourney Style (not supported)
      if (input.negative_prompt) {
        delete input.negative_prompt;
      }

      // Set model (default "dev")
      const model = typeof body.model === "string"
        ? body.model
        : typeof body.model === "number"
          ? String(body.model)
          : "dev";
      input.model = model;

      // Set go_fast (default true)
      const goFast = typeof body.goFast === "boolean"
        ? body.goFast
        : typeof body.goFast === "string"
          ? body.goFast.toLowerCase() === "true"
          : true;
      input.go_fast = goFast;

      // Set lora_scale (default 1)
      const loraScale = typeof body.loraScale === "number"
        ? Math.max(0.0, Math.min(2.0, body.loraScale))
        : typeof body.loraScale === "string"
          ? Math.max(0.0, Math.min(2.0, parseFloat(body.loraScale) || 1))
          : 1;
      input.lora_scale = loraScale;

      // Set megapixels (default "1")
      const megapixels = typeof body.megapixels === "string"
        ? body.megapixels
        : typeof body.megapixels === "number"
          ? String(body.megapixels)
          : "1";
      input.megapixels = megapixels;

      // Set num_outputs (default 1)
      const numOutputs = typeof body.numOutputs === "number"
        ? Math.max(1, Math.min(4, body.numOutputs))
        : typeof body.numOutputs === "string"
          ? Math.max(1, Math.min(4, parseInt(body.numOutputs, 10) || 1))
          : 1;
      input.num_outputs = numOutputs;

      // Set aspect_ratio (default "1:1")
      const aspectRatio = typeof body.aspectRatio === "string"
        ? body.aspectRatio
        : "1:1";
      input.aspect_ratio = aspectRatio;

      // Set output_format (use provided or default "webp")
      const outputFormatValue = typeof body.outputFormat === "string" ? body.outputFormat.trim() : "";
      const outputFormat = outputFormatValue !== ""
        ? outputFormatValue.toLowerCase()
        : "webp";
      input.output_format = outputFormat;

      // Set guidance_scale (default 3)
      const guidanceScale = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 3))
          : 3;
      input.guidance_scale = guidanceScale;

      // Set output_quality (0-100, default 100)
      const outputQuality = typeof body.outputQuality === "number"
        ? Math.max(0, Math.min(100, body.outputQuality))
        : typeof body.outputQuality === "string"
          ? Math.max(0, Math.min(100, parseInt(body.outputQuality, 10) || 100))
          : 100;
      input.output_quality = outputQuality;

      // Set prompt_strength (default 0.8)
      const promptStrength = typeof body.promptStrength === "number"
        ? Math.max(0.0, Math.min(1.0, body.promptStrength))
        : typeof body.promptStrength === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.promptStrength) || 0.8))
          : 0.8;
      input.prompt_strength = promptStrength;

      // Set extra_lora_scale (default 1)
      const extraLoraScale = typeof body.extraLoraScale === "number"
        ? Math.max(0.0, Math.min(2.0, body.extraLoraScale))
        : typeof body.extraLoraScale === "string"
          ? Math.max(0.0, Math.min(2.0, parseFloat(body.extraLoraScale) || 1))
          : 1;
      input.extra_lora_scale = extraLoraScale;

      // Set num_inference_steps (default 38)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(100, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.numInferenceSteps, 10) || 38))
          : 38;
      input.num_inference_steps = numInferenceSteps;
    }

    // Dreamshaper XL specific parameters
    const isDreamshaperXL = resolvedIdentifier.includes("dreamshaper-xl-turbo");
    if (isDreamshaperXL) {
      // Remove image parameter for Dreamshaper XL (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and aspect_ratio for Dreamshaper XL (uses width/height instead)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set width (default 1024)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(2048, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 1024))
          : 1024;
      input.width = width;

      // Set height (default 1024)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(2048, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 1024))
          : 1024;
      input.height = height;

      // Set scheduler (default "K_EULER")
      const scheduler = typeof body.scheduler === "string"
        ? body.scheduler
        : typeof body.scheduler === "number"
          ? String(body.scheduler)
          : "K_EULER";
      input.scheduler = scheduler;

      // Set num_outputs (default 1)
      const numOutputs = typeof body.numOutputs === "number"
        ? Math.max(1, Math.min(4, body.numOutputs))
        : typeof body.numOutputs === "string"
          ? Math.max(1, Math.min(4, parseInt(body.numOutputs, 10) || 1))
          : 1;
      input.num_outputs = numOutputs;

      // Set guidance_scale (default 2)
      const guidanceScale = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 2))
          : 2;
      input.guidance_scale = guidanceScale;

      // Set apply_watermark (default true)
      const applyWatermark = typeof body.applyWatermark === "boolean"
        ? body.applyWatermark
        : typeof body.applyWatermark === "string"
          ? body.applyWatermark.toLowerCase() === "true"
          : true;
      input.apply_watermark = applyWatermark;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }

      // Set num_inference_steps (default 7)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(100, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.numInferenceSteps, 10) || 7))
          : 7;
      input.num_inference_steps = numInferenceSteps;
    }

    // Proteus V0.5 specific parameters
    const isProteusV05 = resolvedIdentifier.includes("proteus-v0.5");
    if (isProteusV05) {
      // Remove image parameter for Proteus V0.5 (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and aspect_ratio for Proteus V0.5 (uses width/height instead)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set width (default 1024)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(2048, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 1024))
          : 1024;
      input.width = width;

      // Set height (default 1024)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(2048, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 1024))
          : 1024;
      input.height = height;

      // Set scheduler (default "DPM++2MSDE")
      const scheduler = typeof body.scheduler === "string"
        ? body.scheduler
        : typeof body.scheduler === "number"
          ? String(body.scheduler)
          : "DPM++2MSDE";
      input.scheduler = scheduler;

      // Set num_outputs (default 1)
      const numOutputs = typeof body.numOutputs === "number"
        ? Math.max(1, Math.min(4, body.numOutputs))
        : typeof body.numOutputs === "string"
          ? Math.max(1, Math.min(4, parseInt(body.numOutputs, 10) || 1))
          : 1;
      input.num_outputs = numOutputs;

      // Set guidance_scale (default 7)
      const guidanceScale = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 7))
          : 7;
      input.guidance_scale = guidanceScale;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }

      // Set prompt_strength (default 0.8)
      const promptStrength = typeof body.promptStrength === "number"
        ? Math.max(0.0, Math.min(1.0, body.promptStrength))
        : typeof body.promptStrength === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.promptStrength) || 0.8))
          : 0.8;
      input.prompt_strength = promptStrength;

      // Set num_inference_steps (default 50)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(100, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.numInferenceSteps, 10) || 50))
          : 50;
      input.num_inference_steps = numInferenceSteps;
    }

    // AnimagineXL V3.1 specific parameters
    const isAnimagineXLV31 = resolvedIdentifier.includes("dvine-v3.1");
    if (isAnimagineXLV31) {
      // Remove image parameter for AnimagineXL V3.1 (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and aspect_ratio for AnimagineXL V3.1 (uses width/height instead)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set vae (default "default")
      const vae = typeof body.vae === "string"
        ? body.vae
        : typeof body.vae === "number"
          ? String(body.vae)
          : "default";
      input.vae = vae;

      // Set seed (default -1)
      const seed = typeof body.seed === "number"
        ? Math.max(-1, Math.min(2147483647, body.seed))
        : typeof body.seed === "string"
          ? Math.max(-1, Math.min(2147483647, parseInt(body.seed, 10) || -1))
          : -1;
      input.seed = seed;

      // Set model (default "Dvine-v3.1")
      const model = typeof body.model === "string"
        ? body.model
        : typeof body.model === "number"
          ? String(body.model)
          : "Dvine-v3.1";
      input.model = model;

      // Set steps (default 30)
      const steps = typeof body.steps === "number"
        ? Math.max(1, Math.min(100, body.steps))
        : typeof body.steps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.steps, 10) || 30))
          : 30;
      input.steps = steps;

      // Set width (default 1024)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(2048, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 1024))
          : 1024;
      input.width = width;

      // Set height (default 1024)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(2048, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 1024))
          : 1024;
      input.height = height;

      // Set cfg_scale (default 7)
      const cfgScale = typeof body.cfgScale === "number"
        ? Math.max(0.0, Math.min(20.0, body.cfgScale))
        : typeof body.cfgScale === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.cfgScale) || 7))
          : typeof body.guidance === "number"
            ? Math.max(0.0, Math.min(20.0, body.guidance))
            : typeof body.guidance === "string"
              ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 7))
              : 7;
      input.cfg_scale = cfgScale;

      // Set clip_skip (default 2)
      const clipSkip = typeof body.clipSkip === "number"
        ? Math.max(1, Math.min(12, body.clipSkip))
        : typeof body.clipSkip === "string"
          ? Math.max(1, Math.min(12, parseInt(body.clipSkip, 10) || 2))
          : 2;
      input.clip_skip = clipSkip;

      // Set pag_scale (default 3)
      const pagScale = typeof body.pagScale === "number"
        ? Math.max(0.0, Math.min(10.0, body.pagScale))
        : typeof body.pagScale === "string"
          ? Math.max(0.0, Math.min(10.0, parseFloat(body.pagScale) || 3))
          : 3;
      input.pag_scale = pagScale;

      // Set scheduler (default "Euler a")
      const scheduler = typeof body.scheduler === "string"
        ? body.scheduler
        : typeof body.scheduler === "number"
          ? String(body.scheduler)
          : "Euler a";
      input.scheduler = scheduler;

      // Set batch_size (default 1)
      const batchSize = typeof body.batchSize === "number"
        ? Math.max(1, Math.min(4, body.batchSize))
        : typeof body.batchSize === "string"
          ? Math.max(1, Math.min(4, parseInt(body.batchSize, 10) || 1))
          : 1;
      input.batch_size = batchSize;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }

      // Set guidance_rescale (default 0.5)
      const guidanceRescale = typeof body.guidanceRescale === "number"
        ? Math.max(0.0, Math.min(1.0, body.guidanceRescale))
        : typeof body.guidanceRescale === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.guidanceRescale) || 0.5))
          : 0.5;
      input.guidance_rescale = guidanceRescale;

      // Set prepend_preprompt (default true)
      const prependPreprompt = typeof body.prependPreprompt === "boolean"
        ? body.prependPreprompt
        : typeof body.prependPreprompt === "string"
          ? body.prependPreprompt.toLowerCase() === "true"
          : true;
      input.prepend_preprompt = prependPreprompt;
    }

    // Pony Diffusion XL specific parameters
    const isPonyDiffusionXL = resolvedIdentifier.includes("pony-sdxl");
    if (isPonyDiffusionXL) {
      // Remove image parameter for Pony Diffusion XL (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and aspect_ratio for Pony Diffusion XL (uses width/height instead)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set vae (default "sdxl-vae-fp16-fix")
      const vae = typeof body.vae === "string"
        ? body.vae
        : typeof body.vae === "number"
          ? String(body.vae)
          : "sdxl-vae-fp16-fix";
      input.vae = vae;

      // Set seed (default -1)
      const seed = typeof body.seed === "number"
        ? Math.max(-1, Math.min(2147483647, body.seed))
        : typeof body.seed === "string"
          ? Math.max(-1, Math.min(2147483647, parseInt(body.seed, 10) || -1))
          : -1;
      input.seed = seed;

      // Set model (default "ponyRealism_v20VAE.safetensors")
      const model = typeof body.model === "string"
        ? body.model
        : typeof body.model === "number"
          ? String(body.model)
          : "ponyRealism_v20VAE.safetensors";
      input.model = model;

      // Set steps (default 35)
      const steps = typeof body.steps === "number"
        ? Math.max(1, Math.min(100, body.steps))
        : typeof body.steps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.steps, 10) || 35))
          : 35;
      input.steps = steps;

      // Set width (default 1184)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(2048, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 1184))
          : 1184;
      input.width = width;

      // Set height (default 864)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(2048, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 864))
          : 864;
      input.height = height;

      // Set cfg_scale (default 7)
      const cfgScale = typeof body.cfgScale === "number"
        ? Math.max(0.0, Math.min(20.0, body.cfgScale))
        : typeof body.cfgScale === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.cfgScale) || 7))
          : typeof body.guidance === "number"
            ? Math.max(0.0, Math.min(20.0, body.guidance))
            : typeof body.guidance === "string"
              ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 7))
              : 7;
      input.cfg_scale = cfgScale;

      // Set scheduler (default "DPM++ 2M SDE Karras")
      const scheduler = typeof body.scheduler === "string"
        ? body.scheduler
        : typeof body.scheduler === "number"
          ? String(body.scheduler)
          : "DPM++ 2M SDE Karras";
      input.scheduler = scheduler;

      // Set batch_size (default 1)
      const batchSize = typeof body.batchSize === "number"
        ? Math.max(1, Math.min(4, body.batchSize))
        : typeof body.batchSize === "string"
          ? Math.max(1, Math.min(4, parseInt(body.batchSize, 10) || 1))
          : 1;
      input.batch_size = batchSize;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }

      // Set guidance_rescale (default 0.7)
      const guidanceRescale = typeof body.guidanceRescale === "number"
        ? Math.max(0.0, Math.min(1.0, body.guidanceRescale))
        : typeof body.guidanceRescale === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.guidanceRescale) || 0.7))
          : 0.7;
      input.guidance_rescale = guidanceRescale;

      // Set prepend_preprompt (default true)
      const prependPreprompt = typeof body.prependPreprompt === "boolean"
        ? body.prependPreprompt
        : typeof body.prependPreprompt === "string"
          ? body.prependPreprompt.toLowerCase() === "true"
          : true;
      input.prepend_preprompt = prependPreprompt;
    }

    // OpenJourney V4 specific parameters
    const isOpenJourneyV4 = resolvedIdentifier.includes("openjourney-v4");
    if (isOpenJourneyV4) {
      // Remove image parameter for OpenJourney V4 (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and aspect_ratio for OpenJourney V4 (uses width/height instead)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set seed (default random, but we'll use -1 to indicate random)
      const seed = typeof body.seed === "number"
        ? Math.max(-1, Math.min(2147483647, body.seed))
        : typeof body.seed === "string"
          ? Math.max(-1, Math.min(2147483647, parseInt(body.seed, 10) || -1))
          : -1;
      input.seed = seed;

      // Set width (default 512)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(2048, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 512))
          : 512;
      input.width = width;

      // Set height (default 768)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(2048, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 768))
          : 768;
      input.height = height;

      // Set scheduler (default "K_EULER_ANCESTRAL")
      const scheduler = typeof body.scheduler === "string"
        ? body.scheduler
        : typeof body.scheduler === "number"
          ? String(body.scheduler)
          : "K_EULER_ANCESTRAL";
      input.scheduler = scheduler;

      // Set num_outputs (default 1)
      const numOutputs = typeof body.numOutputs === "number"
        ? Math.max(1, Math.min(4, body.numOutputs))
        : typeof body.numOutputs === "string"
          ? Math.max(1, Math.min(4, parseInt(body.numOutputs, 10) || 1))
          : 1;
      input.num_outputs = numOutputs;

      // Set guidance_scale (default 7)
      const guidanceScale = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 7))
          : typeof body.guidanceScale === "number"
            ? Math.max(0.0, Math.min(20.0, body.guidanceScale))
            : typeof body.guidanceScale === "string"
              ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidanceScale) || 7))
              : 7;
      input.guidance_scale = guidanceScale;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }

      // Set prompt_strength (default 0.8)
      const promptStrength = typeof body.promptStrength === "number"
        ? Math.max(0.0, Math.min(1.0, body.promptStrength))
        : typeof body.promptStrength === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.promptStrength) || 0.8))
          : 0.8;
      input.prompt_strength = promptStrength;

      // Set num_inference_steps (default 25)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(100, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.numInferenceSteps, 10) || 25))
          : 25;
      input.num_inference_steps = numInferenceSteps;
    }

    // Pixart Sigma specific parameters
    const isPixartSigma = resolvedIdentifier.includes("pixart-sigma");
    if (isPixartSigma) {
      // Remove image parameter for Pixart Sigma (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and aspect_ratio for Pixart Sigma (uses width/height instead)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set width (default 1024)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(2048, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 1024))
          : 1024;
      input.width = width;

      // Set height (default 1024)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(2048, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 1024))
          : 1024;
      input.height = height;

      // Set guidance_scale (default 4.5)
      const guidanceScale = typeof body.guidanceScale === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidanceScale))
        : typeof body.guidanceScale === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidanceScale) || 4.5))
          : typeof body.guidance === "number"
            ? Math.max(0.0, Math.min(20.0, body.guidance))
            : typeof body.guidance === "string"
              ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 4.5))
              : 4.5;
      input.guidance_scale = guidanceScale;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }

      // Set num_inference_steps (default 20)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(100, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.numInferenceSteps, 10) || 20))
          : 20;
      input.num_inference_steps = numInferenceSteps;
    }

    // Kandinsky 3.0 specific parameters
    const isKandinsky3 = resolvedIdentifier.includes("kandinsky-3.0");
    if (isKandinsky3) {
      // Remove image parameter for Kandinsky 3.0 (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and aspect_ratio for Kandinsky 3.0 (uses width/height instead)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set width (default 1024)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(2048, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 1024))
          : 1024;
      input.width = width;

      // Set height (default 1024)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(2048, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 1024))
          : 1024;
      input.height = height;

      // Set strength (default 0.75)
      const strength = typeof body.strength === "number"
        ? Math.max(0.0, Math.min(1.0, body.strength))
        : typeof body.strength === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.strength) || 0.75))
          : 0.75;
      input.strength = strength;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }

      // Set num_inference_steps (default 50)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(100, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.numInferenceSteps, 10) || 50))
          : 50;
      input.num_inference_steps = numInferenceSteps;
    }

    // Wuerstchen specific parameters
    const isWuerstchen = resolvedIdentifier.includes("wuerstchen");
    if (isWuerstchen) {
      // Remove image parameter for Wuerstchen (text-to-image only)
      if (input.image) {
        delete input.image;
      }
      // Remove output_format and aspect_ratio for Wuerstchen (uses width/height instead)
      if (input.output_format) {
        delete input.output_format;
      }
      if (input.aspect_ratio) {
        delete input.aspect_ratio;
      }

      // Set width (default 1536)
      const width = typeof body.width === "number"
        ? Math.max(256, Math.min(2048, body.width))
        : typeof body.width === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.width, 10) || 1536))
          : 1536;
      input.width = width;

      // Set height (default 1536)
      const height = typeof body.height === "number"
        ? Math.max(256, Math.min(2048, body.height))
        : typeof body.height === "string"
          ? Math.max(256, Math.min(2048, parseInt(body.height, 10) || 1536))
          : 1536;
      input.height = height;

      // Set prior_guidance_scale (default 4)
      const priorGuidanceScale = typeof body.priorGuidanceScale === "number"
        ? Math.max(0.0, Math.min(20.0, body.priorGuidanceScale))
        : typeof body.priorGuidanceScale === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.priorGuidanceScale) || 4))
          : 4;
      input.prior_guidance_scale = priorGuidanceScale;

      // Set num_images_per_prompt (default 2)
      const numImagesPerPrompt = typeof body.numImagesPerPrompt === "number"
        ? Math.max(1, Math.min(4, body.numImagesPerPrompt))
        : typeof body.numImagesPerPrompt === "string"
          ? Math.max(1, Math.min(4, parseInt(body.numImagesPerPrompt, 10) || 2))
          : 2;
      input.num_images_per_prompt = numImagesPerPrompt;

      // Set decoder_guidance_scale (default 0)
      const decoderGuidanceScale = typeof body.decoderGuidanceScale === "number"
        ? Math.max(0.0, Math.min(20.0, body.decoderGuidanceScale))
        : typeof body.decoderGuidanceScale === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.decoderGuidanceScale) || 0))
          : 0;
      input.decoder_guidance_scale = decoderGuidanceScale;

      // Set prior_num_inference_steps (default 30)
      const priorNumInferenceSteps = typeof body.priorNumInferenceSteps === "number"
        ? Math.max(1, Math.min(100, body.priorNumInferenceSteps))
        : typeof body.priorNumInferenceSteps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.priorNumInferenceSteps, 10) || 30))
          : 30;
      input.prior_num_inference_steps = priorNumInferenceSteps;

      // Set decoder_num_inference_steps (default 12)
      const decoderNumInferenceSteps = typeof body.decoderNumInferenceSteps === "number"
        ? Math.max(1, Math.min(100, body.decoderNumInferenceSteps))
        : typeof body.decoderNumInferenceSteps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.decoderNumInferenceSteps, 10) || 12))
          : 12;
      input.decoder_num_inference_steps = decoderNumInferenceSteps;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = "";
      }
    }



    // Qwen VL Image specific parameters
    const isQwenVLImage = resolvedIdentifier.includes("qwen-image");
    if (isQwenVLImage) {
      // Remove image parameter for Qwen VL Image (text-to-image only)
      if (input.image) {
        delete input.image;
      }

      // Set go_fast (default true)
      const goFast = typeof body.goFast === "boolean"
        ? body.goFast
        : typeof body.goFast === "string"
          ? body.goFast.toLowerCase() === "true"
          : true;
      input.go_fast = goFast;

      // Set guidance (default 4)
      const guidance = typeof body.guidance === "number"
        ? Math.max(0.0, Math.min(20.0, body.guidance))
        : typeof body.guidance === "string"
          ? Math.max(0.0, Math.min(20.0, parseFloat(body.guidance) || 4))
          : 4;
      input.guidance = guidance;

      // Set strength (default 0.9)
      const strength = typeof body.strength === "number"
        ? Math.max(0.0, Math.min(1.0, body.strength))
        : typeof body.strength === "string"
          ? Math.max(0.0, Math.min(1.0, parseFloat(body.strength) || 0.9))
          : 0.9;
      input.strength = strength;

      // Set image_size (default "optimize_for_quality")
      const imageSize = typeof body.imageSize === "string"
        ? body.imageSize
        : typeof body.imageSize === "number"
          ? String(body.imageSize)
          : "optimize_for_quality";
      input.image_size = imageSize;

      // Set lora_scale (default 1)
      const loraScale = typeof body.loraScale === "number"
        ? Math.max(0.0, Math.min(2.0, body.loraScale))
        : typeof body.loraScale === "string"
          ? Math.max(0.0, Math.min(2.0, parseFloat(body.loraScale) || 1))
          : 1;
      input.lora_scale = loraScale;

      // Set aspect_ratio (default "16:9")
      const aspectRatio = typeof body.aspectRatio === "string"
        ? body.aspectRatio
        : "16:9";
      input.aspect_ratio = aspectRatio;

      // Set output_format (default "webp")
      const of = userSpecifiedFormat ? outputFormat : "webp";
      input.output_format = of;

      // Set enhance_prompt (default false)
      const enhancePrompt = typeof body.enhancePrompt === "boolean"
        ? body.enhancePrompt
        : typeof body.enhancePrompt === "string"
          ? body.enhancePrompt.toLowerCase() === "true"
          : false;
      input.enhance_prompt = enhancePrompt;

      // Set output_quality (default 80)
      const outputQuality = typeof body.outputQuality === "number"
        ? Math.max(0, Math.min(100, body.outputQuality))
        : typeof body.outputQuality === "string"
          ? Math.max(0, Math.min(100, parseInt(body.outputQuality, 10) || 80))
          : 80;
      input.output_quality = outputQuality;

      // Set negative_prompt (default empty string if not provided)
      if (effectiveNegativePrompt) {
        input.negative_prompt = effectiveNegativePrompt;
      } else {
        input.negative_prompt = " ";
      }

      // Set num_inference_steps (default 50)
      const numInferenceSteps = typeof body.numInferenceSteps === "number"
        ? Math.max(1, Math.min(100, body.numInferenceSteps))
        : typeof body.numInferenceSteps === "string"
          ? Math.max(1, Math.min(100, parseInt(body.numInferenceSteps, 10) || 50))
          : 50;
      input.num_inference_steps = numInferenceSteps;
    }

    logger.info("[api/ai-image-models] Calling Replicate", {
      toolSlug,
      model: resolvedIdentifier,
      resolvedConfidence: resolved.confidence,
      resolvedMatched: resolved.matched ? `${resolved.matched.owner}/${resolved.matched.name}` : null,
      hasImage: !!imageUrl,
      promptLength: effectivePrompt.length,
      isFlux11Pro,
      isFlux11ProUltra,
      isFluxPro,
      isFluxKontextPro: isFluxKontextProResolved,
      isFluxKontextMax: isFluxKontextMaxResolved,
      isFluxFillPro: isFluxFillProResolved,
      isFluxRedux: isFluxReduxResolved,
      isFluxCannyPro: isFluxCannyProResolved,
      isFluxDepthPro: isFluxDepthProResolved,
      isSeedream3,
      isSeedream4,
      isIdeogramV3,
      isIdeogramV2Turbo,
      isRecraftV3,
      isRecraftV3SVG,
      isHidreamI1Full,
      isHidreamI1Dev,
      isHidreamI1Fast,
      isSana,
      isHunyuanImage,
      isKling2Image,
      isSD35Large,
      isSD35LargeTurbo,
      isSDXL,
      isSDXLLightning,
      isPlaygroundV3,
      isKolors,
      isJuggernautXL,
      isRealVisXLV5,
      isDalle3,
      isMidjourneyStyle,
      isDreamshaperXL,
      isProteusV05,
      isAnimagineXLV31,
      isPonyDiffusionXL,
      isOpenJourneyV4,
      isPixartSigma,
      isKandinsky3,
      isWuerstchen,
      isQwenVLImage,
      isFluxSchnell,
      isFluxDev,
      fluxParams: isFlux11ProUltra ? {
        raw: input.raw,
        output_format: input.output_format,
        safety_tolerance: input.safety_tolerance,
        image_prompt_strength: input.image_prompt_strength,
      } : isFlux11Pro ? {
        output_format: input.output_format,
        output_quality: input.output_quality,
        safety_tolerance: input.safety_tolerance,
        prompt_upsampling: input.prompt_upsampling,
      } : isFluxPro ? {
        steps: input.steps,
        width: input.width,
        height: input.height,
        guidance: input.guidance,
        interval: input.interval,
        output_format: input.output_format,
        output_quality: input.output_quality,
        safety_tolerance: input.safety_tolerance,
        prompt_upsampling: input.prompt_upsampling,
      } : isFluxSchnell ? {
        go_fast: input.go_fast,
        megapixels: input.megapixels,
        num_outputs: input.num_outputs,
        output_format: input.output_format,
        output_quality: input.output_quality,
        num_inference_steps: input.num_inference_steps,
      } : isFluxDev ? {
        go_fast: input.go_fast,
        guidance: input.guidance,
        megapixels: input.megapixels,
        num_outputs: input.num_outputs,
        output_format: input.output_format,
        output_quality: input.output_quality,
        prompt_strength: input.prompt_strength,
        num_inference_steps: input.num_inference_steps,
      } : isFluxKontextProResolved ? {
        input_image: input.input_image,
        aspect_ratio: input.aspect_ratio,
        output_format: input.output_format,
        safety_tolerance: input.safety_tolerance,
        prompt_upsampling: input.prompt_upsampling,
      } : isFluxKontextMaxResolved ? {
        input_image: input.input_image,
        aspect_ratio: input.aspect_ratio,
        output_format: input.output_format,
        safety_tolerance: input.safety_tolerance,
        prompt_upsampling: input.prompt_upsampling,
      } : isFluxFillProResolved ? {
        image: input.image,
        mask: input.mask,
        steps: input.steps,
        guidance: input.guidance,
        outpaint: input.outpaint,
        output_format: input.output_format,
        safety_tolerance: input.safety_tolerance,
        prompt_upsampling: input.prompt_upsampling,
      } : isFluxReduxResolved ? {
        redux_image: input.redux_image,
        guidance: input.guidance,
        megapixels: input.megapixels,
        num_outputs: input.num_outputs,
        output_format: input.output_format,
        output_quality: input.output_quality,
        num_inference_steps: input.num_inference_steps,
      } : isFluxCannyProResolved ? {
        control_image: input.control_image,
        steps: input.steps,
        guidance: input.guidance,
        output_format: input.output_format,
        safety_tolerance: input.safety_tolerance,
        prompt_upsampling: input.prompt_upsampling,
      } : isFluxDepthProResolved ? {
        control_image: input.control_image,
        steps: input.steps,
        guidance: input.guidance,
        output_format: input.output_format,
        safety_tolerance: input.safety_tolerance,
        prompt_upsampling: input.prompt_upsampling,
      } : isSeedream3 ? {
        image: input.image,
        guidance_scale: input.guidance_scale,
      } : isSeedream4 ? {
        size: input.size,
        width: input.width,
        height: input.height,
        max_images: input.max_images,
        image_input: input.image_input,
        aspect_ratio: input.aspect_ratio,
        enhance_prompt: input.enhance_prompt,
        sequential_image_generation: input.sequential_image_generation,
      } : isIdeogramV3 ? {
        resolution: input.resolution,
        style_type: input.style_type,
        aspect_ratio: input.aspect_ratio,
        style_preset: input.style_preset,
        magic_prompt_option: input.magic_prompt_option,
      } : isIdeogramV2Turbo ? {
        resolution: input.resolution,
        style_type: input.style_type,
        aspect_ratio: input.aspect_ratio,
        magic_prompt_option: input.magic_prompt_option,
      } : isRecraftV3 ? {
        size: input.size,
        style: input.style,
        aspect_ratio: input.aspect_ratio,
      } : isRecraftV3SVG ? {
        size: input.size,
        style: input.style,
        aspect_ratio: input.aspect_ratio,
      } : isHidreamI1Full ? {
        seed: input.seed,
        model_type: input.model_type,
        resolution: input.resolution,
        speed_mode: input.speed_mode,
        output_format: input.output_format,
        output_quality: input.output_quality,
      } : isHidreamI1Dev ? {
        seed: input.seed,
        model_type: input.model_type,
        resolution: input.resolution,
        speed_mode: input.speed_mode,
        output_format: input.output_format,
        output_quality: input.output_quality,
      } : isHidreamI1Fast ? {
        seed: input.seed,
        model_type: input.model_type,
        resolution: input.resolution,
        speed_mode: input.speed_mode,
        output_format: input.output_format,
        output_quality: input.output_quality,
        negative_prompt: input.negative_prompt,
      } : isSana ? {
        width: input.width,
        height: input.height,
        model_variant: input.model_variant,
        guidance_scale: input.guidance_scale,
        negative_prompt: input.negative_prompt,
        pag_guidance_scale: input.pag_guidance_scale,
        num_inference_steps: input.num_inference_steps,
      } : isHunyuanImage ? {
        go_fast: input.go_fast,
        aspect_ratio: input.aspect_ratio,
        output_format: input.output_format,
        output_quality: input.output_quality,
      } : isKling2Image ? {
        duration: input.duration,
        cfg_scale: input.cfg_scale,
        aspect_ratio: input.aspect_ratio,
        negative_prompt: input.negative_prompt,
      } : isSD35Large ? {
        cfg: input.cfg,
        aspect_ratio: input.aspect_ratio,
        output_format: input.output_format,
        prompt_strength: input.prompt_strength,
      } : isSD35LargeTurbo ? {
        cfg: input.cfg,
        aspect_ratio: input.aspect_ratio,
        output_format: input.output_format,
        prompt_strength: input.prompt_strength,
      } : isSDXL ? {
        width: input.width,
        height: input.height,
        refine: input.refine,
        scheduler: input.scheduler,
        lora_scale: input.lora_scale,
        num_outputs: input.num_outputs,
        guidance_scale: input.guidance_scale,
        apply_watermark: input.apply_watermark,
        high_noise_frac: input.high_noise_frac,
        negative_prompt: input.negative_prompt,
        prompt_strength: input.prompt_strength,
        num_inference_steps: input.num_inference_steps,
      } : isSDXLLightning ? {
        seed: input.seed,
        num_images: input.num_images,
        image_width: input.image_width,
        image_height: input.image_height,
        output_format: input.output_format,
        guidance_scale: input.guidance_scale,
        output_quality: input.output_quality,
        num_inference_steps: input.num_inference_steps,
      } : isPlaygroundV3 ? {
        width: input.width,
        height: input.height,
        scheduler: input.scheduler,
        num_outputs: input.num_outputs,
        guidance_scale: input.guidance_scale,
        negative_prompt: input.negative_prompt,
        num_inference_steps: input.num_inference_steps,
      } : isKolors ? {
        cfg: input.cfg,
        steps: input.steps,
        width: input.width,
        height: input.height,
        scheduler: input.scheduler,
        output_format: input.output_format,
        output_quality: input.output_quality,
        negative_prompt: input.negative_prompt,
        number_of_images: input.number_of_images,
      } : isJuggernautXL ? {
        seed: input.seed,
        width: input.width,
        height: input.height,
        strength: input.strength,
        scheduler: input.scheduler,
        lora_scale: input.lora_scale,
        num_outputs: input.num_outputs,
        guidance_scale: input.guidance_scale,
        negative_prompt: input.negative_prompt,
        num_inference_steps: input.num_inference_steps,
      } : isRealVisXLV5 ? {
        width: input.width,
        height: input.height,
        refine: input.refine,
        scheduler: input.scheduler,
        lora_scale: input.lora_scale,
        num_outputs: input.num_outputs,
        controlnet_1: input.controlnet_1,
        controlnet_2: input.controlnet_2,
        controlnet_3: input.controlnet_3,
        guidance_scale: input.guidance_scale,
        apply_watermark: input.apply_watermark,
        negative_prompt: input.negative_prompt,
        prompt_strength: input.prompt_strength,
        sizing_strategy: input.sizing_strategy,
        controlnet_1_end: input.controlnet_1_end,
        controlnet_2_end: input.controlnet_2_end,
        controlnet_3_end: input.controlnet_3_end,
        controlnet_1_image: input.controlnet_1_image,
        controlnet_1_start: input.controlnet_1_start,
        controlnet_2_start: input.controlnet_2_start,
        controlnet_3_start: input.controlnet_3_start,
        num_inference_steps: input.num_inference_steps,
        controlnet_1_conditioning_scale: input.controlnet_1_conditioning_scale,
        controlnet_2_conditioning_scale: input.controlnet_2_conditioning_scale,
        controlnet_3_conditioning_scale: input.controlnet_3_conditioning_scale,
        controlnet_2_image: input.controlnet_2_image,
        controlnet_3_image: input.controlnet_3_image,
      } : isDalle3 ? {
        style: input.style,
        aspect_ratio: input.aspect_ratio,
      } : isMidjourneyStyle ? {
        model: input.model,
        go_fast: input.go_fast,
        lora_scale: input.lora_scale,
        megapixels: input.megapixels,
        num_outputs: input.num_outputs,
        aspect_ratio: input.aspect_ratio,
        output_format: input.output_format,
        guidance_scale: input.guidance_scale,
        output_quality: input.output_quality,
        prompt_strength: input.prompt_strength,
        extra_lora_scale: input.extra_lora_scale,
        num_inference_steps: input.num_inference_steps,
      } : isDreamshaperXL ? {
        width: input.width,
        height: input.height,
        scheduler: input.scheduler,
        num_outputs: input.num_outputs,
        guidance_scale: input.guidance_scale,
        apply_watermark: input.apply_watermark,
        negative_prompt: input.negative_prompt,
        num_inference_steps: input.num_inference_steps,
      } : isProteusV05 ? {
        width: input.width,
        height: input.height,
        scheduler: input.scheduler,
        num_outputs: input.num_outputs,
        guidance_scale: input.guidance_scale,
        negative_prompt: input.negative_prompt,
        prompt_strength: input.prompt_strength,
        num_inference_steps: input.num_inference_steps,
      } : isAnimagineXLV31 ? {
        vae: input.vae,
        seed: input.seed,
        model: input.model,
        steps: input.steps,
        width: input.width,
        height: input.height,
        cfg_scale: input.cfg_scale,
        clip_skip: input.clip_skip,
        pag_scale: input.pag_scale,
        scheduler: input.scheduler,
        batch_size: input.batch_size,
        negative_prompt: input.negative_prompt,
        guidance_rescale: input.guidance_rescale,
        prepend_preprompt: input.prepend_preprompt,
      } : isPonyDiffusionXL ? {
        vae: input.vae,
        seed: input.seed,
        model: input.model,
        steps: input.steps,
        width: input.width,
        height: input.height,
        cfg_scale: input.cfg_scale,
        scheduler: input.scheduler,
        batch_size: input.batch_size,
        negative_prompt: input.negative_prompt,
        guidance_rescale: input.guidance_rescale,
        prepend_preprompt: input.prepend_preprompt,
      } : isOpenJourneyV4 ? {
        seed: input.seed,
        width: input.width,
        height: input.height,
        scheduler: input.scheduler,
        num_outputs: input.num_outputs,
        guidance_scale: input.guidance_scale,
        negative_prompt: input.negative_prompt,
        prompt_strength: input.prompt_strength,
        num_inference_steps: input.num_inference_steps,
      } : undefined,
    });

    // Validate Aspect Ratio for Flux models (they support a specific set of ratios)
    // FLUX Kontext Pro and Max also support "match_input_image" when an image is provided
    // FLUX Fill Pro doesn't use aspect_ratio (uses image dimensions)
    // FLUX Redux supports aspect_ratio
    if (
      (resolvedIdentifier.includes("flux-1.1-pro") ||
        resolvedIdentifier.includes("flux-pro") ||
        resolvedIdentifier.includes("flux-schnell") ||
        resolvedIdentifier.includes("flux-dev") ||
        resolvedIdentifier.includes("flux-kontext-pro") ||
        resolvedIdentifier.includes("flux-kontext-max") ||
        resolvedIdentifier.includes("flux-redux") ||
        resolvedIdentifier.includes("flux-canny-pro") ||
        resolvedIdentifier.includes("flux-depth-pro")) &&
      !resolvedIdentifier.includes("flux-fill-pro") &&
      input.aspect_ratio
    ) {
      const allowedRatios = [
        "1:1", "16:9", "21:9", "3:2", "2:3", "4:5", "5:4", "3:4", "4:3", "9:16", "9:21", "match_input_image"
      ];
      if (!allowedRatios.includes(input.aspect_ratio)) {
        logger.warn("[api/ai-image-models] Invalid aspect ratio for Flux, defaulting to 1:1", {
          provided: input.aspect_ratio,
        });
        input.aspect_ratio = "1:1";
      }
    }

    // Ensure FLUX 1.1 Pro Ultra never receives image (Text-to-Image only)
    if (isFlux11ProUltra && input.image) {
      delete input.image;
    }

    const output = await replicate.run(resolvedIdentifier as `${string}/${string}`, { input });

    let resultUrl: string;

    // Handle FLUX 1.1 Pro output format (returns FileOutput object with url() method)
    if (output && typeof output === "object") {
      if ("url" in output && typeof (output as any).url === "function") {
        resultUrl = await (output as any).url();
      } else if ("url" in output && typeof (output as any).url === "string") {
        resultUrl = (output as any).url;
      } else if (Array.isArray(output) && output.length > 0) {
        const firstOutput = output[0];
        if (typeof firstOutput === "string") {
          resultUrl = firstOutput;
        } else if (firstOutput && typeof firstOutput === "object" && "url" in firstOutput) {
          if (typeof (firstOutput as any).url === "function") {
            resultUrl = await (firstOutput as any).url();
          } else {
            resultUrl = (firstOutput as any).url;
          }
        } else {
          throw new Error("Invalid output format from Replicate");
        }
      } else {
        throw new Error(`Invalid output format from Replicate: ${JSON.stringify(output)}`);
      }
    } else if (typeof output === "string") {
      resultUrl = output;
    } else {
      throw new Error("Replicate did not return a valid output.");
    }

    const deduct = await deductCredits(1);
    if (!deduct.success) {
      return NextResponse.json(
        { error: deduct.error || "Failed to deduct credits" },
        { status: 400 }
      );
    }

    // Save to Media library (best-effort)
    try {
      const { userId } = await auth();
      if (userId) {
        logger.info("[ai-image-models] Saving media to library", { userId, toolSlug, resultUrl });
        await saveGeneratedMedia({
          userId,
          url: resultUrl,
          prompt: effectivePrompt,
          source: `tool:ai-image-models/${toolSlug}`,
        });
        logger.info("[ai-image-models] Media saved successfully", { userId, toolSlug });
      } else {
        logger.warn("[ai-image-models] No userId found, skipping media save", { toolSlug });
      }
    } catch (e) {
      logger.apiError("[ai-image-models] Failed to save media", e, { toolSlug, resultUrl });
    }

    return NextResponse.json({
      resultUrl,
      model: resolvedIdentifier,
      toolSlug,
      creditsDeducted: 1,
      resolved: {
        confidence: resolved.confidence,
        matched: resolved.matched ? `${resolved.matched.owner}/${resolved.matched.name}` : null,
        usedFallback: resolvedIdentifier === FALLBACK_MODEL_IDENTIFIER,
      },
    });
  } catch (error) {
    console.error("[api/ai-image-models] Error generating image:", error); // Explicit terminal log
    logger.apiError(
      "/api/ai-image-models/[...slug]",
      error instanceof Error ? error : new Error(String(error)),
      { toolSlug, input } // Log input to debug inputs
    );

    // Handle sensitive content errors (E005) - Replicate/Google content moderation
    if (error instanceof Error && (
      error.message.includes("flagged as sensitive") ||
      error.message.includes("(E005)") ||
      error.message.includes("content policy")
    )) {
      return NextResponse.json(
        {
          error: "Content flagged as sensitive",
          details: "Your prompt was flagged by the AI's safety filters. Please try rewording your prompt to avoid potentially sensitive content, such as:\n\n• Children in dangerous situations\n• Violence or harmful activities\n• Inappropriate or explicit content\n• Copyrighted characters or brands\n\nTry using more general, safe descriptions instead."
        },
        { status: 422 }
      );
    }

    // Handle NSFW content errors specifically
    if (error instanceof Error && error.message.includes("NSFW content")) {
      return NextResponse.json(
        {
          error: "NSFW content detected",
          details: "The AI model detected potentially sensitive or unsafe content in the generated images and blocked them. Please try again with a different prompt."
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate image.", details: (error as Error).message },
      { status: 500 }
    );
  }
}


