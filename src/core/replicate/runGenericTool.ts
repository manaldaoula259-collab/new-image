
import { replicate } from "@/core/clients/replicate";
import { resolveReplicateModelIdentifierForSlug } from "@/core/replicate/modelCatalog";
import { logger } from "@/core/utils/logger";
import { resizeAndUploadToS3 } from "@/core/utils/serverUpload";

// Using specific version hash to ensure API compatibility
const FALLBACK_MODEL_IDENTIFIER = "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";

const DEFAULT_NEGATIVE =
  "text, watermark, label, signature, logo, writing, letters, words, captions, text overlay, copyright, brand name, company name, website URL, blurry, low quality, distorted";

// Feature-specific prompts for upscalers (using google/nano-banana)
// Supports both full paths and short names
const UPSCALER_PROMPTS: Record<string, string> = {
  // Full paths
  "ai-upscaler/real-esrgan-4x": "You are a 4x image upscaling engine using the Nano Banana model. Increase the image resolution by approximately 4x while preserving original details. Enhance sharpness and texture naturally without hallucinating new objects. Do not alter colors, lighting, faces, or composition.",
  "ai-upscaler/clarity-upscaler": "You are an image clarity upscaling engine using the Nano Banana model. Improve perceived sharpness, local contrast, and fine details. Maintain original resolution proportions and image structure. Do not add artificial sharpening, noise, or stylistic effects.",
  "ai-upscaler/supir": "You are a structure-preserving upscaling engine using the Nano Banana model. Upscale the image while strictly preserving edges, geometry, and spatial accuracy. Restore degraded areas without altering the original structure or proportions. Avoid hallucinations and artistic interpretation.",
  "ai-upscaler/gfpgan": "You are a face restoration engine using the Nano Banana model. Restore facial clarity, skin texture, and facial features for human faces only. Maintain identity, expression, and natural appearance. Do not modify non-face areas of the image.",
  "ai-upscaler/codeformer": "You are a balanced face reconstruction engine using the Nano Banana model. Improve facial quality while preserving original identity and realism. Avoid over-smoothing or artificial facial features. Restore faces subtly and naturally without affecting the background.",
  "ai-upscaler/anime-upscaler": "You are an anime image upscaling engine using the Nano Banana model. Upscale anime or illustrated images while preserving clean line art and flat colors. Maintain original art style, outlines, and shading. Do not convert realistic images into anime or alter the style.",
  // Short names (for backward compatibility)
  "real-esrgan-4x": "You are a 4x image upscaling engine using the Nano Banana model. Increase the image resolution by approximately 4x while preserving original details. Enhance sharpness and texture naturally without hallucinating new objects. Do not alter colors, lighting, faces, or composition.",
  "clarity-upscaler": "You are an image clarity upscaling engine using the Nano Banana model. Improve perceived sharpness, local contrast, and fine details. Maintain original resolution proportions and image structure. Do not add artificial sharpening, noise, or stylistic effects.",
  "supir": "You are a structure-preserving upscaling engine using the Nano Banana model. Upscale the image while strictly preserving edges, geometry, and spatial accuracy. Restore degraded areas without altering the original structure or proportions. Avoid hallucinations and artistic interpretation.",
  "gfpgan": "You are a face restoration engine using the Nano Banana model. Restore facial clarity, skin texture, and facial features for human faces only. Maintain identity, expression, and natural appearance. Do not modify non-face areas of the image.",
  "codeformer": "You are a balanced face reconstruction engine using the Nano Banana model. Improve facial quality while preserving original identity and realism. Avoid over-smoothing or artificial facial features. Restore faces subtly and naturally without affecting the background.",
  "anime-upscaler": "You are an anime image upscaling engine using the Nano Banana model. Upscale anime or illustrated images while preserving clean line art and flat colors. Maintain original art style, outlines, and shading. Do not convert realistic images into anime or alter the style.",
};

// Feature-specific prompts for portrait tools (using google/nano-banana)
// Supports both full paths and short names
const PORTRAIT_PROMPTS: Record<string, string> = {
  // Full paths
  "ai-portrait/headshot-generator": `You are a professional headshot generation engine using the Nano Banana model.
  Generate a clean, realistic headshot from the input image.
  Improve framing, lighting, and background subtly to look professional.
  Preserve the person's identity, facial features, and natural appearance.
Do not apply artistic styles or alter gender, age, or expression unless instructed.`,
  "ai-portrait/age-progression": `You are an age progression engine using the Nano Banana model.
  Modify the person's age according to the user's instruction.
Preserve identity, facial structure, and realism.
Apply natural aging effects only(skin texture, wrinkles, facial maturity).
Do not change gender, expression, hairstyle, or background.`,
  "ai-portrait/gender-swap": `You are a gender transformation engine using the Nano Banana model.
  Change the person's gender appearance while preserving facial identity and realism.
Adjust facial features, hair, and secondary traits naturally.
Do not modify pose, expression, clothing style, or background unless instructed.`,
  "ai-portrait/ai-makeup": `You are a digital makeup application engine using the Nano Banana model.
  Apply realistic makeup based on the user's instructions.
Keep skin texture natural and avoid over - smoothing.
Do not alter facial structure, identity, or lighting.`,
  "ai-portrait/hair-style": `You are a hairstyle transformation engine using the Nano Banana model.
  Change only the hairstyle as described by the user.
  Preserve hair realism, lighting, and face shape.
  Do not modify face, expression, color tone, or background.`,
  "ai-portrait/expression-editor": `You are a facial expression editing engine using the Nano Banana model.
  Modify only the facial expression as instructed by the user.
  Preserve identity, age, gender, and facial structure.
  Do not change hairstyle, background, or lighting.`,
  // Short names (for backward compatibility)
  "headshot-generator": `You are a professional headshot generation engine using the Nano Banana model.
  Generate a clean, realistic headshot from the input image.
  Improve framing, lighting, and background subtly to look professional.
  Preserve the person's identity, facial features, and natural appearance.
Do not apply artistic styles or alter gender, age, or expression unless instructed.`,
  "age-progression": `You are an age progression engine using the Nano Banana model.
  Modify the person's age according to the user's instruction.
Preserve identity, facial structure, and realism.
Apply natural aging effects only(skin texture, wrinkles, facial maturity).
Do not change gender, expression, hairstyle, or background.`,
  "gender-swap": `You are a gender transformation engine using the Nano Banana model.
  Change the person's gender appearance while preserving facial identity and realism.
Adjust facial features, hair, and secondary traits naturally.
Do not modify pose, expression, clothing style, or background unless instructed.`,
  "ai-makeup": `You are a digital makeup application engine using the Nano Banana model.
  Apply realistic makeup based on the user's instructions.
Keep skin texture natural and avoid over - smoothing.
Do not alter facial structure, identity, or lighting.`,
  "hair-style-changer": `You are a hairstyle transformation engine using the Nano Banana model.
  Change only the hairstyle as described by the user.
  Preserve hair realism, lighting, and face shape.
  Do not modify face, expression, color tone, or background.`,
  "hair-style": `You are a hairstyle transformation engine using the Nano Banana model.
  Change only the hairstyle as described by the user.
  Preserve hair realism, lighting, and face shape.
  Do not modify face, expression, color tone, or background.`,
  "expression-editor": `You are a facial expression editing engine using the Nano Banana model.
  Modify only the facial expression as instructed by the user.
  Preserve identity, age, gender, and facial structure.
  Do not change hairstyle, background, or lighting.`,
};

// Feature-specific prompts for image effects (using google/nano-banana)
// Supports both full paths and short names
const IMAGE_EFFECTS_PROMPTS: Record<string, string> = {
  // Full paths
  "ai-image-effects/face-swap": `You are a face swap engine using the Nano Banana model.
  Swap the face from the provided reference onto the target image accurately.
  Preserve skin tone, lighting, perspective, and facial alignment.
  Do not modify background, expression, or image quality.`,
  "ai-image-effects/new-yorker-cartoon": `You are a New Yorker–style cartoon generation engine using the Nano Banana model.
  Convert the image into a clean, minimalist cartoon illustration.
  Use simple lines, muted colors, and a flat illustrative style.
  Preserve scene structure and subject identity.
  Do not add text unless explicitly instructed.`,
  "ai-image-effects/album-cover": `You are an album cover generation engine using the Nano Banana model.
  Transform the image into a visually striking album-cover - style composition.
Maintain high aesthetic quality and balanced framing.
Do not add text, logos, or typography unless instructed.`,
  "ai-image-effects/kpop-demon-hunter": `You are a K - pop demon hunter visual filter engine using the Nano Banana model.
  Apply a dramatic, stylized K-pop fantasy aesthetic with sharp lighting and mood.
Preserve facial identity and pose.
Do not distort anatomy or background composition.`,
  "ai-image-effects/pet-passport": `You are a pet passport photo generation engine using the Nano Banana model.
  Generate a clean, front-facing pet photo with neutral background and proper framing.
Ensure clear visibility of the pet's face.
Do not apply filters, stylization, or background elements.`,
  "ai-image-effects/labubu-doll": `You are a collectible Labubu - style doll generation engine using the Nano Banana model.
  Convert the subject into a cute, vinyl-toy - style character.
Preserve pose and general proportions while applying the doll aesthetic.
Do not add accessories unless instructed.`,
  "ai-image-effects/ghibli": `You are a Ghibli - inspired illustration engine using the Nano Banana model.
  Render the image in a soft, hand - painted, anime - inspired style.
Use warm colors, gentle lighting, and natural backgrounds.
Preserve character identity and scene composition.`,
  "ai-image-effects/clothes-changer": `You are a clothing transformation engine using the Nano Banana model.
  Change only the clothing as described by the user.
  Maintain body shape, pose, and lighting realism.
  Do not modify face, hairstyle, or background.`,
  "ai-image-effects/halloween": `You are a Halloween visual filter engine using the Nano Banana model.
  Apply a spooky, Halloween-themed atmosphere with subtle effects.
Preserve subject identity and composition.
Do not apply costumes unless explicitly requested.`,
  "ai-image-effects/halloween-costume": `You are a Halloween costume generation engine using the Nano Banana model.
  Dress the subject in a Halloween costume as instructed.
Ensure realistic fit, lighting, and texture.
Do not alter face, body shape, or background.`,
  "ai-image-effects/pet-halloween-costume": `You are a pet Halloween costume generation engine using the Nano Banana model.
  Add a Halloween costume to the pet while keeping posture and anatomy natural.
Ensure the pet remains clearly recognizable.
Do not add background effects.`,
  "ai-image-effects/zootopia": `You are a Zootopia - style anthropomorphic filter engine using the Nano Banana model.
  Convert the subject into a stylized animal character.
  Preserve pose, expression, and personality.
  Maintain clean, animated-film - style proportions.`,
  "ai-image-effects/christmas": `You are a Christmas visual filter engine using the Nano Banana model.
  Apply a festive Christmas atmosphere with warm lighting and subtle effects.
Preserve subject identity and realism.
Do not add costumes unless instructed.`,
  // Short names (for backward compatibility)
  "face-swap": `You are a face swap engine using the Nano Banana model.
  Swap the face from the provided reference onto the target image accurately.
  Preserve skin tone, lighting, perspective, and facial alignment.
  Do not modify background, expression, or image quality.`,
  "ai-face-swap": `You are a face swap engine using the Nano Banana model.
  Swap the face from the provided reference onto the target image accurately.
  Preserve skin tone, lighting, perspective, and facial alignment.
  Do not modify background, expression, or image quality.`,
  "new-yorker-cartoon": `You are a New Yorker–style cartoon generation engine using the Nano Banana model.
  Convert the image into a clean, minimalist cartoon illustration.
  Use simple lines, muted colors, and a flat illustrative style.
  Preserve scene structure and subject identity.
  Do not add text unless explicitly instructed.`,
  "album-cover": `You are an album cover generation engine using the Nano Banana model.
  Transform the image into a visually striking album-cover - style composition.
Maintain high aesthetic quality and balanced framing.
Do not add text, logos, or typography unless instructed.`,
  "kpop-demon-hunter": `You are a K - pop demon hunter visual filter engine using the Nano Banana model.
  Apply a dramatic, stylized K-pop fantasy aesthetic with sharp lighting and mood.
Preserve facial identity and pose.
Do not distort anatomy or background composition.`,
  "pet-passport": `You are a pet passport photo generation engine using the Nano Banana model.
  Generate a clean, front-facing pet photo with neutral background and proper framing.
Ensure clear visibility of the pet's face.
Do not apply filters, stylization, or background elements.`,
  "labubu-doll": `You are a collectible Labubu - style doll generation engine using the Nano Banana model.
  Convert the subject into a cute, vinyl-toy - style character.
Preserve pose and general proportions while applying the doll aesthetic.
Do not add accessories unless instructed.`,
  "ghibli": `You are a Ghibli - inspired illustration engine using the Nano Banana model.
  Render the image in a soft, hand - painted, anime - inspired style.
Use warm colors, gentle lighting, and natural backgrounds.
Preserve character identity and scene composition.`,
  "clothes-changer": `You are a clothing transformation engine using the Nano Banana model.
  Change only the clothing as described by the user.
  Maintain body shape, pose, and lighting realism.
  Do not modify face, hairstyle, or background.`,
  "halloween": `You are a Halloween visual filter engine using the Nano Banana model.
  Apply a spooky, Halloween-themed atmosphere with subtle effects.
Preserve subject identity and composition.
Do not apply costumes unless explicitly requested.`,
  "halloween-costume": `You are a Halloween costume generation engine using the Nano Banana model.
  Dress the subject in a Halloween costume as instructed.
Ensure realistic fit, lighting, and texture.
Do not alter face, body shape, or background.`,
  "pet-halloween-costume": `You are a pet Halloween costume generation engine using the Nano Banana model.
  Add a Halloween costume to the pet while keeping posture and anatomy natural.
Ensure the pet remains clearly recognizable.
Do not add background effects.`,
  "zootopia": `You are a Zootopia - style anthropomorphic filter engine using the Nano Banana model.
  Convert the subject into a stylized animal character.
  Preserve pose, expression, and personality.
  Maintain clean, animated-film - style proportions.`,
  "christmas": `You are a Christmas visual filter engine using the Nano Banana model.
  Apply a festive Christmas atmosphere with warm lighting and subtle effects.
Preserve subject identity and realism.
Do not add costumes unless instructed.`,
};

// Feature-specific prompts for photo converters (using google/nano-banana)
// Supports both full paths and short names
const PHOTO_CONVERTER_PROMPTS: Record<string, string> = {
  // Full paths
  "ai-photo-converter/studio-ghibli": `You are a Studio Ghibli–style conversion engine using the Nano Banana model.
  Convert the image into a soft, hand-painted, anime - style illustration.
Use warm colors, gentle lighting, and painterly textures.
Preserve subject identity, pose, and scene composition.`,
  "ai-photo-converter/action-figure": `You are an action figure conversion engine using the Nano Banana model.
  Convert the subject into a realistic plastic action figure.
  Add toy-like textures and proportions while preserving pose and identity.
Do not add packaging or accessories unless instructed.`,
  "ai-photo-converter/pet-to-human": `You are a pet - to - human transformation engine using the Nano Banana model.
  Convert the pet into a human character inspired by the pet's traits.
Preserve personality, expression, and posture.
Do not add fantasy elements unless instructed.`,
  "ai-photo-converter/watercolor": `You are a watercolor painting conversion engine using the Nano Banana model.
  Convert the image into a soft watercolor painting style.
  Use visible brush washes and gentle color blending.
  Preserve composition and subject clarity.`,
  "ai-photo-converter/clay": `You are a clay - style conversion engine using the Nano Banana model.
  Convert the image into a clay model appearance.
  Apply soft sculpted forms and matte clay textures.
  Maintain original pose and proportions.`,
  "ai-photo-converter/illustration": `You are a digital illustration conversion engine using the Nano Banana model.
  Convert the image into a clean, illustrated artwork.
  Use smooth lines and simplified shading.
  Preserve scene structure and subject identity.`,
  "ai-photo-converter/pixel": `You are a pixel - art conversion engine using the Nano Banana model.
  Convert the image into pixel art with clear blocky pixels.
Maintain recognizable shapes and color balance.
Do not add extra details beyond pixel representation.`,
  "ai-photo-converter/pixar": `You are a Pixar - inspired 3D character conversion engine using the Nano Banana model.
  Convert the subject into a stylized Pixar-like character.
Use soft lighting, expressive features, and smooth 3D shading.
Preserve identity and expression.`,
  "ai-photo-converter/lego": `You are a LEGO - style conversion engine using the Nano Banana model.
  Convert the subject into a LEGO minifigure or LEGO-built form.
Use blocky geometry and plastic textures.
Maintain pose and scene layout.`,
  "ai-photo-converter/3d": `You are a 3D rendering conversion engine using the Nano Banana model.
  Convert the image into a realistic 3D - rendered version.
Preserve proportions, lighting logic, and perspective.
Do not stylize beyond realistic 3D.`,
  "ai-photo-converter/disney": `You are a Disney - style character conversion engine using the Nano Banana model.
  Convert the subject into a classic Disney-inspired illustration style.
Use expressive features and smooth shading.
Preserve pose, identity, and scene composition.`,
  "ai-photo-converter/cartoon": `You are a cartoon - style conversion engine using the Nano Banana model.
  Convert the image into a clean cartoon version.
  Simplify shapes and colors while maintaining recognizability.
Do not apply specific studio styles unless instructed.`,
  "ai-photo-converter/cyberpunk": `You are a cyberpunk - style conversion engine using the Nano Banana model.
  Apply a futuristic cyberpunk aesthetic with neon lighting and tech elements.
Preserve subject identity and pose.
Do not distort anatomy or composition.`,
  "ai-photo-converter/simpsons": `You are a Simpsons - style conversion engine using the Nano Banana model.
  Convert the subject into a flat, yellow-toned cartoon style.
Use simple outlines and iconic proportions.
Preserve pose and expression.`,
  "ai-photo-converter/oil-painting": `You are an oil painting conversion engine using the Nano Banana model.
  Convert the image into a classic oil painting style.
  Use visible brush strokes and rich color depth.
  Preserve subject structure and composition.`,
  // Short names (for backward compatibility)
  "studio-ghibli": `You are a Studio Ghibli–style conversion engine using the Nano Banana model.
  Convert the image into a soft, hand-painted, anime - style illustration.
Use warm colors, gentle lighting, and painterly textures.
Preserve subject identity, pose, and scene composition.`,
  "ghibli-diffusion": `You are a Studio Ghibli–style conversion engine using the Nano Banana model.
  Convert the image into a soft, hand-painted, anime - style illustration.
Use warm colors, gentle lighting, and painterly textures.
Preserve subject identity, pose, and scene composition.`,
  "dashboard/tools/studio-ghibli": `You are a Studio Ghibli–style conversion engine using the Nano Banana model.
  Convert the image into a soft, hand-painted, anime - style illustration.
Use warm colors, gentle lighting, and painterly textures.
Preserve subject identity, pose, and scene composition.`,
  "action-figure": `You are an action figure conversion engine using the Nano Banana model.
  Convert the subject into a realistic plastic action figure.
  Add toy-like textures and proportions while preserving pose and identity.
Do not add packaging or accessories unless instructed.`,
  "pet-to-human": `You are a pet - to - human transformation engine using the Nano Banana model.
  Convert the pet into a human character inspired by the pet's traits.
Preserve personality, expression, and posture.
Do not add fantasy elements unless instructed.`,
  "watercolor": `You are a watercolor painting conversion engine using the Nano Banana model.
  Convert the image into a soft watercolor painting style.
  Use visible brush washes and gentle color blending.
  Preserve composition and subject clarity.`,
  "clay": `You are a clay - style conversion engine using the Nano Banana model.
  Convert the image into a clay model appearance.
  Apply soft sculpted forms and matte clay textures.
  Maintain original pose and proportions.`,
  "illustration": `You are a digital illustration conversion engine using the Nano Banana model.
  Convert the image into a clean, illustrated artwork.
  Use smooth lines and simplified shading.
  Preserve scene structure and subject identity.`,
  "pixel": `You are a pixel - art conversion engine using the Nano Banana model.
  Convert the image into pixel art with clear blocky pixels.
Maintain recognizable shapes and color balance.
Do not add extra details beyond pixel representation.`,
  "pixar": `You are a Pixar - inspired 3D character conversion engine using the Nano Banana model.
  Convert the subject into a stylized Pixar-like character.
Use soft lighting, expressive features, and smooth 3D shading.
Preserve identity and expression.`,
  "lego": `You are a LEGO - style conversion engine using the Nano Banana model.
  Convert the subject into a LEGO minifigure or LEGO-built form.
Use blocky geometry and plastic textures.
Maintain pose and scene layout.`,
  "3d": `You are a 3D rendering conversion engine using the Nano Banana model.
  Convert the image into a realistic 3D - rendered version.
Preserve proportions, lighting logic, and perspective.
Do not stylize beyond realistic 3D.`,
  "disney": `You are a Disney - style character conversion engine using the Nano Banana model.
  Convert the subject into a classic Disney-inspired illustration style.
Use expressive features and smooth shading.
Preserve pose, identity, and scene composition.`,
  "cartoon": `You are a cartoon - style conversion engine using the Nano Banana model.
  Convert the image into a clean cartoon version.
  Simplify shapes and colors while maintaining recognizability.
Do not apply specific studio styles unless instructed.`,
  "cyberpunk": `You are a cyberpunk - style conversion engine using the Nano Banana model.
  Apply a futuristic cyberpunk aesthetic with neon lighting and tech elements.
Preserve subject identity and pose.
Do not distort anatomy or composition.`,
  "simpsons": `You are a Simpsons - style conversion engine using the Nano Banana model.
  Convert the subject into a flat, yellow-toned cartoon style.
Use simple outlines and iconic proportions.
Preserve pose and expression.`,
  "oil-painting": `You are an oil painting conversion engine using the Nano Banana model.
  Convert the image into a classic oil painting style.
  Use visible brush strokes and rich color depth.
  Preserve subject structure and composition.`,
};

// Feature-specific prompts for ControlNet and Adapter features (using google/nano-banana)
// Supports both full paths and short names
const CONTROLNET_ADAPTER_PROMPTS: Record<string, string> = {
  // ControlNet features
  "ai-controlnet/canny": `You are a ControlNet Canny edge - guided generation engine using the Nano Banana model.
  Use the canny edge structure of the input image as the primary guide.
Generate an image that strictly follows detected edges and contours.
Do not deviate from the original structure or proportions.`,
  "ai-controlnet/depth": `You are a ControlNet Depth - guided generation engine using the Nano Banana model.
  Use the depth map of the input image to preserve spatial layout and perspective.
Maintain foreground and background separation accurately.
Do not alter scene geometry.`,
  "ai-controlnet/pose": `You are a ControlNet Pose - guided generation engine using the Nano Banana model.
  Use the detected human pose from the input image as a strict constraint.
  Generate the image while preserving exact body pose and limb positioning.
Do not change posture or orientation.`,
  "ai-controlnet/scribble": `You are a ControlNet Scribble - guided generation engine using the Nano Banana model.
  Use the scribble input as the primary structural guide.
  Convert rough strokes into a coherent image while preserving layout.
Do not invent additional structures.`,
  "ai-controlnet/soft-edge": `You are a ControlNet Soft Edge–guided generation engine using the Nano Banana model.
  Use soft edge boundaries to guide image generation.
  Preserve smooth contours and object boundaries accurately.
  Avoid sharp or exaggerated edges.`,
  "ai-controlnet/line-art": `You are a ControlNet Line Art–guided generation engine using the Nano Banana model.
  Use line art structure as the strict layout guide.
  Generate clean, well-aligned visuals following the line work.
Do not alter line geometry.`,
  "ai-controlnet/qr-code": `You are a ControlNet QR Code–guided generation engine using the Nano Banana model.
  Preserve QR code readability and scannability at all times.
  Integrate the QR code naturally into the image.
  Do not distort or obscure the QR pattern.`,
  // Adapter/Identity features
  "ai-controlnet/ip-adapter": `You are an IP - Adapter reference - guided generation engine using the Nano Banana model.
  Use the reference image to guide style and visual characteristics.
  Preserve the target image structure and composition.
  Do not copy the reference image directly.`,
  "ai-controlnet/ip-adapter-face": `You are an IP - Adapter face reference engine using the Nano Banana model.
  Use the reference face to guide facial identity.
  Preserve pose, lighting, and realism of the target image.
Avoid face distortion or overfitting.`,
  "ai-controlnet/instant-id": `You are an InstantID identity - preserving generation engine using the Nano Banana model.
  Preserve the subject's facial identity with high accuracy.
Allow changes only to non - identity attributes as instructed.
Do not alter facial structure or likeness.`,
  "ai-controlnet/photomaker": `You are a PhotoMaker identity - consistent image generation engine using the Nano Banana model.
  Maintain consistent facial identity across generated outputs.
  Preserve realism, lighting, and proportions.
  Do not introduce stylistic exaggeration.`,
  // Short names (for backward compatibility)
  "canny": `You are a ControlNet Canny edge - guided generation engine using the Nano Banana model.
  Use the canny edge structure of the input image as the primary guide.
Generate an image that strictly follows detected edges and contours.
Do not deviate from the original structure or proportions.`,
  "depth": `You are a ControlNet Depth - guided generation engine using the Nano Banana model.
  Use the depth map of the input image to preserve spatial layout and perspective.
Maintain foreground and background separation accurately.
Do not alter scene geometry.`,
  "pose": `You are a ControlNet Pose - guided generation engine using the Nano Banana model.
  Use the detected human pose from the input image as a strict constraint.
  Generate the image while preserving exact body pose and limb positioning.
Do not change posture or orientation.`,
  "scribble": `You are a ControlNet Scribble - guided generation engine using the Nano Banana model.
  Use the scribble input as the primary structural guide.
  Convert rough strokes into a coherent image while preserving layout.
Do not invent additional structures.`,
  "soft-edge": `You are a ControlNet Soft Edge–guided generation engine using the Nano Banana model.
  Use soft edge boundaries to guide image generation.
  Preserve smooth contours and object boundaries accurately.
  Avoid sharp or exaggerated edges.`,
  "line-art": `You are a ControlNet Line Art–guided generation engine using the Nano Banana model.
  Use line art structure as the strict layout guide.
  Generate clean, well-aligned visuals following the line work.
Do not alter line geometry.`,
  "qr-code": `You are a ControlNet QR Code–guided generation engine using the Nano Banana model.
  Preserve QR code readability and scannability at all times.
  Integrate the QR code naturally into the image.
  Do not distort or obscure the QR pattern.`,
  "ip-adapter": `You are an IP - Adapter reference - guided generation engine using the Nano Banana model.
  Use the reference image to guide style and visual characteristics.
  Preserve the target image structure and composition.
  Do not copy the reference image directly.`,
  "ip-adapter-face": `You are an IP - Adapter face reference engine using the Nano Banana model.
  Use the reference face to guide facial identity.
  Preserve pose, lighting, and realism of the target image.
Avoid face distortion or overfitting.`,
  "instant-id": `You are an InstantID identity - preserving generation engine using the Nano Banana model.
  Preserve the subject's facial identity with high accuracy.
Allow changes only to non - identity attributes as instructed.
Do not alter facial structure or likeness.`,
  "instantid": `You are an InstantID identity - preserving generation engine using the Nano Banana model.
  Preserve the subject's facial identity with high accuracy.
Allow changes only to non - identity attributes as instructed.
Do not alter facial structure or likeness.`,
  "photomaker": `You are a PhotoMaker identity - consistent image generation engine using the Nano Banana model.
  Maintain consistent facial identity across generated outputs.
  Preserve realism, lighting, and proportions.
  Do not introduce stylistic exaggeration.`,
};

export type GenericToolInput = {
  toolSlug: string; // e.g. "ai-photo-converter/pet-to-human"
  prompt?: string;
  imageUrl?: string;
  aspectRatio?: string;
  outputFormat?: "png" | "jpg" | "webp";
  styleStrength?: number;
  preserveFace?: boolean;
};

export async function runGenericToolWithReplicate(input: GenericToolInput) {
  const toolSlug = input.toolSlug.replace(/^\/+/, "");
  const prompt = (input.prompt || "").trim();
  let imageUrl = (input.imageUrl || "").trim();
  const outputFormat = input.outputFormat || "jpg";

  // Resolve model for slug
  const resolved = await resolveReplicateModelIdentifierForSlug(toolSlug);

  // For upscalers, portrait tools, image effects, and photo converters, use nano-banana as fallback instead of sdxl
  const isUpscaler = toolSlug.includes("upscaler") || toolSlug.includes("esrgan") ||
    toolSlug.includes("supir") || toolSlug.includes("gfpgan") ||
    toolSlug.includes("codeformer") || UPSCALER_PROMPTS[toolSlug];
  const isPortraitTool = toolSlug.includes("portrait") || toolSlug.includes("headshot") ||
    toolSlug.includes("age-progression") || toolSlug.includes("gender-swap") ||
    toolSlug.includes("makeup") || toolSlug.includes("hair-style") ||
    toolSlug.includes("expression-editor") || PORTRAIT_PROMPTS[toolSlug];
  const isImageEffect = toolSlug.includes("image-effects") || toolSlug.includes("face-swap") ||
    (toolSlug.includes("cartoon") && !toolSlug.includes("photo-converter")) ||
    toolSlug.includes("album-cover") || toolSlug.includes("kpop") ||
    toolSlug.includes("pet-passport") || toolSlug.includes("labubu") ||
    (toolSlug.includes("ghibli") && toolSlug.includes("image-effects")) ||
    toolSlug.includes("clothes-changer") || toolSlug.includes("halloween") ||
    toolSlug.includes("zootopia") || toolSlug.includes("christmas") ||
    IMAGE_EFFECTS_PROMPTS[toolSlug];
  const isPhotoConverter = toolSlug.includes("photo-converter") || toolSlug.includes("studio-ghibli") ||
    toolSlug.includes("action-figure") || toolSlug.includes("pet-to-human") ||
    toolSlug.includes("watercolor") || toolSlug.includes("clay") ||
    toolSlug.includes("illustration") || toolSlug.includes("pixel") ||
    toolSlug.includes("pixar") || toolSlug.includes("lego") ||
    (toolSlug.includes("3d") && !toolSlug.includes("2d-to-3d")) ||
    toolSlug.includes("disney") || (toolSlug.includes("cartoon") && toolSlug.includes("photo-converter")) ||
    toolSlug.includes("cyberpunk") || toolSlug.includes("simpsons") ||
    toolSlug.includes("oil-painting") || PHOTO_CONVERTER_PROMPTS[toolSlug];
  const isControlNetAdapter = toolSlug.includes("controlnet") || toolSlug.includes("canny") ||
    toolSlug.includes("depth") || toolSlug.includes("pose") ||
    toolSlug.includes("scribble") || toolSlug.includes("soft-edge") ||
    toolSlug.includes("line-art") || toolSlug.includes("qr-code") ||
    toolSlug.includes("ip-adapter") || toolSlug.includes("instant-id") ||
    toolSlug.includes("instantid") || toolSlug.includes("photomaker") ||
    CONTROLNET_ADAPTER_PROMPTS[toolSlug];
  const fallbackModel = (isUpscaler || isPortraitTool || isImageEffect || isPhotoConverter || isControlNetAdapter) ? "google/nano-banana" : FALLBACK_MODEL_IDENTIFIER;

  const resolvedIdentifier =
    resolved.identifier && resolved.confidence >= 18
      ? resolved.identifier
      : fallbackModel;

  // Resize large images for SDXL-based models to prevent OOM
  if (imageUrl && (resolvedIdentifier.includes("sdxl") || resolvedIdentifier.includes("stable-diffusion"))) {
    try {
      imageUrl = await resizeAndUploadToS3(imageUrl, 1024);
    } catch (error) {
      logger.warn("Failed to resize image for SDXL, proceeding with original", { error });
    }
  }

  // Use feature-specific prompt for upscalers, portrait tools, image effects, photo converters, and controlnet/adapters if no user prompt provided
  // If user provides prompt, combine it with the system prompt
  let effectivePrompt: string;
  if (UPSCALER_PROMPTS[toolSlug]) {
    if (prompt) {
      // User provided additional instructions - combine with system prompt
      effectivePrompt = `${UPSCALER_PROMPTS[toolSlug]} User instruction: ${prompt}. Apply only this instruction.`;
    } else {
      // Use the feature-specific prompt
      effectivePrompt = UPSCALER_PROMPTS[toolSlug];
    }
  } else if (PORTRAIT_PROMPTS[toolSlug]) {
    if (prompt) {
      // User provided additional instructions - combine with system prompt, ignore conflicting parts
      effectivePrompt = `${PORTRAIT_PROMPTS[toolSlug]} Additional instruction: ${prompt}. Apply only if it aligns with the feature purpose.`;
    } else {
      // Use the feature-specific prompt
      effectivePrompt = PORTRAIT_PROMPTS[toolSlug];
    }
  } else if (IMAGE_EFFECTS_PROMPTS[toolSlug]) {
    if (prompt) {
      // User provided additional instructions - combine with system prompt, ignore conflicting parts
      effectivePrompt = `${IMAGE_EFFECTS_PROMPTS[toolSlug]} Additional instruction: ${prompt}. Apply only if it aligns with the feature purpose.`;
    } else {
      // Use the feature-specific prompt
      effectivePrompt = IMAGE_EFFECTS_PROMPTS[toolSlug];
    }
  } else if (PHOTO_CONVERTER_PROMPTS[toolSlug]) {
    if (prompt) {
      // User provided additional instructions - combine with system prompt, ignore conflicting parts
      effectivePrompt = `${PHOTO_CONVERTER_PROMPTS[toolSlug]} Additional instruction: ${prompt}. Apply only if it aligns with the feature purpose.`;
    } else {
      // Use the feature-specific prompt
      effectivePrompt = PHOTO_CONVERTER_PROMPTS[toolSlug];
    }
  } else if (CONTROLNET_ADAPTER_PROMPTS[toolSlug]) {
    if (prompt) {
      // User provided additional instructions - combine with system prompt, ignore conflicting parts
      effectivePrompt = `${CONTROLNET_ADAPTER_PROMPTS[toolSlug]} Additional instruction: ${prompt}. Apply only if it aligns with the feature purpose.`;
    } else {
      // Use the feature-specific prompt
      effectivePrompt = CONTROLNET_ADAPTER_PROMPTS[toolSlug];
    }
  } else {
    // For other features, use user prompt or default
    effectivePrompt = prompt || "Create a beautiful high-quality image. Keep it clean. No text, no watermarks.";
  }

  // Build input - nano-banana uses image_input array and doesn't need negative_prompt
  const replicateInput: Record<string, any> = {
    prompt: effectivePrompt,
    output_format: outputFormat,
  };

  // Only add negative_prompt for non-nano-banana models
  if (!resolvedIdentifier.includes("nano-banana")) {
    replicateInput.negative_prompt = DEFAULT_NEGATIVE;
  }

  if (imageUrl) {
    if (resolvedIdentifier.includes("rembg")) {
      // rembg uses 'image' input and validation fails if we pass prompt/aspect_ratio
      replicateInput.image = imageUrl;
      delete replicateInput.prompt;
      delete replicateInput.negative_prompt;
      // remove defaults if they were set
    } else if (resolvedIdentifier.includes("sdxl") || resolvedIdentifier.includes("stable-diffusion")) {
      // SDXL uses 'image' for img2img
      replicateInput.image = imageUrl;
      // SDXL allows prompt/negative_prompt/aspect_ratio

      // Pass prompt_strength (styleStrength 0-100 -> 0.0-1.0)
      if (input.styleStrength !== undefined) {
        replicateInput.prompt_strength = input.styleStrength / 100;
      }

      // Note: We already resized imageUrl to <= 1024px via resizeAndUploadToS3
      // We do NOT force width/height here, to allow the model to output the natural aspect ratio of the input.
    } else if (resolvedIdentifier.includes("animate-diff") || resolvedIdentifier.includes("minimax")) {
      // AnimateDiff and Minimax are T2V, ignore image input which causes validation errors
    } else if (resolvedIdentifier.includes("wan-video") || resolvedIdentifier.includes("pixverse") || resolvedIdentifier.includes("seedance") || resolvedIdentifier.includes("veo")) {
      // Video models use 'image' parameter, not 'image_input'
      replicateInput.image = imageUrl;
      // Don't set aspect_ratio here - will be handled in video section below
    } else {
      // Nano Banana / Flux / Others using common wrapper
      replicateInput.image_input = [imageUrl];
      replicateInput.aspect_ratio = "match_input_image";
    }
  } else {
    replicateInput.aspect_ratio = input.aspectRatio || "1:1";
  }



  // ==========================================
  // Video Models - Model-Specific Parameter Handling
  // ==========================================
  if (toolSlug.includes("video") || resolvedIdentifier.includes("animate-diff")) {
    delete replicateInput.output_format; // Video models output MP4/GIF/WEBM

    // ByteDance Seedance - STRICT aspect_ratio validation required
    if (resolvedIdentifier.includes("seedance")) {
      // Seedance REQUIRES aspect_ratio and only accepts these specific values
      const validAspectRatios = ["16:9", "4:3", "1:1", "3:4", "9:16", "21:9", "9:21"];
      const currentAspect = replicateInput.aspect_ratio;

      // Validate and fix aspect_ratio
      if (!currentAspect || !validAspectRatios.includes(currentAspect)) {
        replicateInput.aspect_ratio = "16:9"; // Safe default for video
      }
      // Seedance supports negative_prompt - keep it
      // Seedance supports optional image input - keep if provided
    }

    // Wan Video models - Support aspect_ratio and negative_prompt
    else if (resolvedIdentifier.includes("wan-video")) {
      // Wan models support aspect_ratio
      if (!replicateInput.aspect_ratio || replicateInput.aspect_ratio === "match_input_image") {
        replicateInput.aspect_ratio = "16:9";
      }
      // Wan supports negative_prompt - keep it
      // Wan I2V models need image input - handled above
      // Wan T2V models ignore image input - handled above
    }

    // Google Veo models - Do NOT support aspect_ratio or negative_prompt
    else if (resolvedIdentifier.includes("veo") || resolvedIdentifier.includes("google/veo")) {
      // Veo uses Google's proprietary schema
      delete replicateInput.aspect_ratio; // NOT supported
      delete replicateInput.negative_prompt; // NOT supported
      // Only prompt is used
    }

    // Minimax Hailuo - Do NOT support aspect_ratio or negative_prompt
    else if (resolvedIdentifier.includes("hailuo") || resolvedIdentifier.includes("minimax")) {
      delete replicateInput.aspect_ratio; // NOT supported
      delete replicateInput.negative_prompt; // NOT supported
      // Minimax uses proprietary parameters
    }

    // PixVerse - Support aspect_ratio and negative_prompt
    else if (resolvedIdentifier.includes("pixverse")) {
      // PixVerse supports aspect_ratio with common values
      if (!replicateInput.aspect_ratio || replicateInput.aspect_ratio === "match_input_image") {
        replicateInput.aspect_ratio = "16:9";
      }
      // PixVerse supports negative_prompt - keep it
      // PixVerse supports optional image input - keep if provided
    }

    // AnimateDiff (existing model)
    else if (resolvedIdentifier.includes("animate-diff")) {
      delete replicateInput.aspect_ratio; // NOT supported
      // AnimateDiff is text-to-video only
    }

    // Default for unknown video models - be conservative
    else {
      delete replicateInput.aspect_ratio; // Remove to avoid errors
      delete replicateInput.negative_prompt; // Remove to avoid errors
    }
  }

  logger.info("[replicate] runGenericToolWithReplicate", {
    toolSlug,
    model: resolvedIdentifier,
    resolvedConfidence: resolved.confidence,
    resolvedMatched: resolved.matched ? `${resolved.matched.owner}/${resolved.matched.name}` : null,
    usedFallback: resolvedIdentifier === FALLBACK_MODEL_IDENTIFIER,
    hasImage: !!imageUrl,
    promptLength: effectivePrompt.length,
  });

  // Debug: Log actual input being sent to Replicate
  logger.info("[replicate] Sending to Replicate API", {
    toolSlug,
    replicateInput: JSON.stringify(replicateInput),
  });

  const output = await replicate.run(resolvedIdentifier as `${string}/${string}`, { input: replicateInput });

  let resultUrl: string;

  if (output && typeof output === "object") {
    if ("url" in output && typeof (output as any).url === "function") {
      const urlResult = await (output as any).url();
      // Handle URL object or string
      resultUrl = urlResult instanceof URL ? urlResult.href : String(urlResult);
    } else if ("url" in output) {
      const urlValue = (output as any).url;
      // Handle URL object or string
      resultUrl = urlValue instanceof URL ? urlValue.href : String(urlValue);
    } else if (Array.isArray(output) && output.length > 0) {
      const firstOutput = output[0];
      if (typeof firstOutput === "string") {
        resultUrl = firstOutput;
      } else if (firstOutput instanceof URL) {
        resultUrl = firstOutput.href;
      } else if (firstOutput && typeof firstOutput === "object" && "url" in firstOutput) {
        if (typeof (firstOutput as any).url === "function") {
          const urlResult = await (firstOutput as any).url();
          resultUrl = urlResult instanceof URL ? urlResult.href : String(urlResult);
        } else {
          const urlValue = (firstOutput as any).url;
          resultUrl = urlValue instanceof URL ? urlValue.href : String(urlValue);
        }
      } else {
        throw new Error("Invalid output format from Replicate");
      }
    } else if (output instanceof URL) {
      resultUrl = output.href;
    } else {
      throw new Error(`Invalid output format from Replicate: ${JSON.stringify(output)}`);
    }
  } else if (typeof output === "string") {
    resultUrl = output;
  } else {
    throw new Error("Replicate did not return a valid output.");
  }

  return {
    resultUrl,
    model: resolvedIdentifier,
    resolved: {
      confidence: resolved.confidence,
      matched: resolved.matched ? `${resolved.matched.owner}/${resolved.matched.name}` : null,
      usedFallback: resolvedIdentifier === FALLBACK_MODEL_IDENTIFIER,
    },
  };
}



