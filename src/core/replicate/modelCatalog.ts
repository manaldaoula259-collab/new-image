import { replicate } from "@/core/clients/replicate";
import { logger } from "@/core/utils/logger";

type ReplicateModelListItem = {
  owner: string;
  name: string;
  description?: string | null;
  latest_version?: { id?: string } | null;
};

type CatalogCache = {
  fetchedAt: number;
  models: ReplicateModelListItem[];
};

declare global {
  // eslint-disable-next-line no-var
  var __replicateModelCatalog: CatalogCache | undefined;
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// Manual overrides for models that might be missing from catalog
// Using models without version hashes allows Replicate to use the latest version automatically
const MANUAL_MODEL_OVERRIDES: Record<string, string> = {
  // ==========================================
  // AI Image Models - New Popular Models
  // ==========================================
  "ai-image-models/p-image": "prunaai/p-image",
  "ai-image-models/z-image-turbo": "prunaai/z-image-turbo",
  "ai-image-models/nano-banana-pro": "google/nano-banana-pro",
  "ai-image-models/imagen-4-fast": "google/imagen-4-fast",
  "ai-image-models/flux-2-max": "black-forest-labs/flux-2-max",
  "ai-image-models/seedream-4-5": "bytedance/seedream-4.5",
  "ai-image-models/nano-banana": "google/nano-banana",
  "ai-image-models/seedream-4": "bytedance/seedream-4",
  "ai-image-models/flux-pro": "black-forest-labs/flux-pro",
  "ai-image-models/ideogram-v3-turbo": "ideogram-ai/ideogram-v3-turbo",
  "ai-image-models/qwen-image": "qwen/qwen-image",
  "ai-image-models/flux-schnell": "black-forest-labs/flux-schnell",
  "ai-image-models/imagen-4": "google/imagen-4",
  "ai-image-models/imagen-3": "google/imagen-3",
  "ai-image-models/imagen-3-fast": "google/imagen-3-fast",
  "ai-image-models/imagen-4-ultra": "google/imagen-4-ultra",
  "ai-image-models/hidream-l1-fast": "prunaai/hidream-l1-fast",
  "ai-image-models/image-3-2": "bria/image-3.2",

  "ai-image-models/flux-kontext-max": "black-forest-labs/flux-kontext-max",
  "ai-image-models/flux-kontext-pro": "black-forest-labs/flux-kontext-pro",
  "ai-image-models/flux-1-1-pro-ultra": "black-forest-labs/flux-1.1-pro-ultra",
  "ai-image-models/seedream-3": "bytedance/seedream-3",
  "ai-image-models/flux-fast": "prunaai/flux-fast",

  "ai-image-models/recraft-v3": "recraft-ai/recraft-v3",
  "ai-image-models/recraft-v3-svg": "recraft-ai/recraft-v3-svg",
  "ai-image-models/ideogram-v2a-turbo": "ideogram-ai/ideogram-v2a-turbo",
  "ai-image-models/ideogram-v2": "ideogram-ai/ideogram-v2",
  "ai-image-models/ideogram-v3-quality": "ideogram-ai/ideogram-v3-quality",
  "ai-image-models/ideogram-v2a": "ideogram-ai/ideogram-v2a",
  "ai-image-models/ideogram-v3-balanced": "ideogram-ai/ideogram-v3-balanced",
  "ai-image-models/ideogram-v2-turbo": "ideogram-ai/ideogram-v2-turbo",
  "ai-image-models/sd-3-5-medium": "stability-ai/stable-diffusion-3.5-medium",
  "ai-image-models/sd-3-5-large": "stability-ai/stable-diffusion-3.5-large",
  "ai-image-models/sd-3-5-large-turbo": "stability-ai/stable-diffusion-3.5-large-turbo",
  "ai-image-models/minimax-image-01": "minimax/image-01",
  "ai-image-models/photon-flash": "luma/photon-flash",

  "ai-image-models/hunyuan-image-3": "tencent/hunyuan-image-3",
  "ai-image-models/sana-sprint-1-6b": "nvidia/sana-sprint-1.6b",
  "ai-image-models/wan-2-2-image": "prunaai/wan-2.2-image",
  "ai-image-models/hidream-l1-full": "prunaai/hidream-l1-full",
  "ai-image-models/hidream-l1-dev": "prunaai/hidream-l1-dev",
  "ai-image-models/flux-dev-lora": "black-forest-labs/flux-dev-lora",
  "ai-image-models/flux-dev": "black-forest-labs/flux-dev",
  "ai-image-models/sdxl-lightning": "prunaai/sdxl-lightning",
  "ai-image-models/sdxl-lightning-4step": "bytedance/sdxl-lightning-4step",
  "ai-image-models/sana": "nvidia/sana",
  "ai-image-models/photon": "luma/photon",
  "ai-image-models/sdxl": "stability-ai/sdxl",
  "ai-image-models/sticker-maker": "fofr/sticker-maker",
  "ai-image-models/kandinsky-2": "ai-forever/kandinsky-2",
  "ai-image-models/kandinsky-2-2": "ai-forever/kandinsky-2.2",
  "ai-image-models/playground-v2-5-1024px": "playgroundai/playground-v2.5-1024px-aesthetic",
  "ai-image-models/proteus-v0-3": "datacte/proteus-v0.3",
  "ai-image-models/sdxl-controlnet-lora": "fermatresearch/sdxl-controlnet-lora",
  "ai-image-models/proteus-v0-2": "datacte/proteus-v0.2",
  "ai-image-models/realvisxl-v3-0-turbo": "adirik/realvisxl-v3.0-turbo",
  "ai-image-models/latent-consistency-model": "fofr/latent-consistency-model",

  "ai-image-models/open-dalle-v1-1": "lucataco/open-dalle-v1.1",
  "ai-image-models/sdxl-multi-controlnet-lora": "fofr/sdxl-multi-controlnet-lora",
  "ai-image-models/dreamshaper-xl-turbo": "lucataco/dreamshaper-xl-turbo",
  "ai-image-models/ssd-1b": "lucataco/ssd-1b",
  "ai-image-models/sdxl-emoji": "fofr/sdxl-emoji",
  "ai-image-models/realistic-vision-v5-1": "lucataco/realistic-vision-v5.1",
  "ai-image-models/stable-diffusion": "stability-ai/stable-diffusion",

  "ai-image-models/material-diffusion": "tstramer/material-diffusion",
  // Short names for backward compatibility
  "p-image": "prunaai/p-image",
  "z-image-turbo": "prunaai/z-image-turbo",
  "nano-banana-pro": "google/nano-banana-pro",
  "imagen-4-fast": "google/imagen-4-fast",
  "flux-2-max": "black-forest-labs/flux-2-max",
  "seedream-4-5": "bytedance/seedream-4.5",
  "nano-banana": "google/nano-banana",
  "seedream-4": "bytedance/seedream-4",
  "flux-pro": "black-forest-labs/flux-pro",
  "ideogram-v3-turbo": "ideogram-ai/ideogram-v3-turbo",
  "qwen-image": "qwen/qwen-image",
  "flux-schnell": "black-forest-labs/flux-schnell",
  "imagen-4": "google/imagen-4",
  "imagen-3": "google/imagen-3",
  "imagen-3-fast": "google/imagen-3-fast",
  "imagen-4-ultra": "google/imagen-4-ultra",
  "hidream-l1-fast": "prunaai/hidream-l1-fast",
  "image-3-2": "bria/image-3.2",

  "flux-kontext-max": "black-forest-labs/flux-kontext-max",
  "flux-kontext-pro": "black-forest-labs/flux-kontext-pro",
  "flux-1-1-pro-ultra": "black-forest-labs/flux-1.1-pro-ultra",
  "seedream-3": "bytedance/seedream-3",
  "flux-fast": "prunaai/flux-fast",

  "recraft-v3": "recraft-ai/recraft-v3",
  "recraft-v3-svg": "recraft-ai/recraft-v3-svg",
  "ideogram-v2a-turbo": "ideogram-ai/ideogram-v2a-turbo",
  "ideogram-v2": "ideogram-ai/ideogram-v2",
  "ideogram-v3-quality": "ideogram-ai/ideogram-v3-quality",
  "ideogram-v2a": "ideogram-ai/ideogram-v2a",
  "ideogram-v3-balanced": "ideogram-ai/ideogram-v3-balanced",
  "ideogram-v2-turbo": "ideogram-ai/ideogram-v2-turbo",
  "sd-3-5-medium": "stability-ai/stable-diffusion-3.5-medium",
  "sd-3-5-large": "stability-ai/stable-diffusion-3.5-large",
  "sd-3-5-large-turbo": "stability-ai/stable-diffusion-3.5-large-turbo",
  "minimax-image-01": "minimax/image-01",
  "photon-flash": "luma/photon-flash",

  "hunyuan-image-3": "tencent/hunyuan-image-3",
  "sana-sprint-1-6b": "nvidia/sana-sprint-1.6b",
  "wan-2-2-image": "prunaai/wan-2.2-image",
  "hidream-l1-full": "prunaai/hidream-l1-full",
  "hidream-l1-dev": "prunaai/hidream-l1-dev",
  "flux-dev-lora": "black-forest-labs/flux-dev-lora",
  "flux-dev": "black-forest-labs/flux-dev",
  "sdxl-lightning": "prunaai/sdxl-lightning",
  "sdxl-lightning-4step": "bytedance/sdxl-lightning-4step",
  "sana": "nvidia/sana",
  "photon": "luma/photon",
  "sdxl": "stability-ai/sdxl",
  "sticker-maker": "fofr/sticker-maker",
  "kandinsky-2": "ai-forever/kandinsky-2",
  "kandinsky-2-2": "ai-forever/kandinsky-2.2",
  "playground-v2-5-1024px": "playgroundai/playground-v2.5-1024px-aesthetic",
  "proteus-v0-3": "datacte/proteus-v0.3",
  "sdxl-controlnet-lora": "fermatresearch/sdxl-controlnet-lora",
  "proteus-v0-2": "datacte/proteus-v0.2",
  "realvisxl-v3-0-turbo": "adirik/realvisxl-v3.0-turbo",
  "latent-consistency-model": "fofr/latent-consistency-model",

  "open-dalle-v1-1": "lucataco/open-dalle-v1.1",
  "sdxl-multi-controlnet-lora": "fofr/sdxl-multi-controlnet-lora",
  "dreamshaper-xl-turbo": "lucataco/dreamshaper-xl-turbo",
  "ssd-1b": "lucataco/ssd-1b",
  "sdxl-emoji": "fofr/sdxl-emoji",
  "realistic-vision-v5-1": "lucataco/realistic-vision-v5.1",
  "stable-diffusion": "stability-ai/stable-diffusion",

  "material-diffusion": "tstramer/material-diffusion",

  // ==========================================
  // AI Video Models (with full paths)
  // ==========================================
  "ai-video/wan-2-5-t2v": "wan-video/wan-2.5-t2v",
  "ai-video/wan-2-5-i2v": "wan-video/wan-2.5-i2v",
  "ai-video/wan-2-5-t2v-fast": "wan-video/wan-2.5-t2v-fast",
  "ai-video/wan-2-5-i2v-fast": "wan-video/wan-2.5-i2v-fast",
  "ai-video/wan-2-2-i2v-fast": "wan-video/wan-2.2-i2v-fast",
  "ai-video/veo-3-1": "google/veo-3.1",
  "ai-video/veo-3-1-fast": "google/veo-3.1-fast",
  "ai-video/veo-3": "google/veo-3",
  "ai-video/veo-3-fast": "google/veo-3-fast",
  "ai-video/veo-2": "google/veo-2",
  "ai-video/hailuo-2-3": "minimax/hailuo-2.3",
  "ai-video/hailuo-2-3-fast": "minimax/hailuo-2.3-fast",
  "ai-video/pixverse-v5": "pixverse/pixverse-v5",
  "ai-video/pixverse-v4": "pixverse/pixverse-v4",
  "ai-video/seedance-1-pro-fast": "bytedance/seedance-1-pro-fast",

  // Short names for backward compatibility
  "wan-2-5-t2v": "wan-video/wan-2.5-t2v",
  "wan-2-5-i2v": "wan-video/wan-2.5-i2v",
  "wan-2-5-t2v-fast": "wan-video/wan-2.5-t2v-fast",
  "wan-2-5-i2v-fast": "wan-video/wan-2.5-i2v-fast",
  "wan-2-2-i2v-fast": "wan-video/wan-2.2-i2v-fast",
  "veo-3-1": "google/veo-3.1",
  "veo-3-1-fast": "google/veo-3.1-fast",
  "veo-3": "google/veo-3",
  "veo-3-fast": "google/veo-3-fast",
  "veo-2": "google/veo-2",
  "hailuo-2-3": "minimax/hailuo-2.3",
  "hailuo-2-3-fast": "minimax/hailuo-2.3-fast",
  "pixverse-v5": "pixverse/pixverse-v5",
  "pixverse-v4": "pixverse/pixverse-v4",
  "seedance-1-pro-fast": "bytedance/seedance-1-pro-fast",


  // ==========================================
  // AI Photo Converter (using google/nano-banana)
  // ==========================================
  "ai-photo-converter/pet-to-human": "google/nano-banana",
  "ai-photo-converter/action-figure": "google/nano-banana",
  "ai-photo-converter/watercolor": "google/nano-banana",
  "ai-photo-converter/clay": "google/nano-banana",
  "ai-photo-converter/illustration": "google/nano-banana",
  "ai-photo-converter/pixel": "google/nano-banana",
  "ai-photo-converter/pixar": "google/nano-banana",
  "ai-photo-converter/lego": "google/nano-banana",
  "ai-photo-converter/3d": "google/nano-banana",
  "ai-photo-converter/disney": "google/nano-banana",
  "ai-photo-converter/cartoon": "google/nano-banana",
  "ai-photo-converter/cyberpunk": "google/nano-banana",
  "ai-photo-converter/simpsons": "google/nano-banana",
  "ai-photo-converter/oil-painting": "google/nano-banana",
  "ai-photo-converter/studio-ghibli": "aaronaftab/mirage-ghibli:166efd159b4138da932522bc5af40d39194033f587d9bdbab1e594119eae3e7f",
  "dashboard/tools/studio-ghibli": "aaronaftab/mirage-ghibli:166efd159b4138da932522bc5af40d39194033f587d9bdbab1e594119eae3e7f",
  "studio-ghibli": "aaronaftab/mirage-ghibli:166efd159b4138da932522bc5af40d39194033f587d9bdbab1e594119eae3e7f",
  "ghibli-diffusion": "aaronaftab/mirage-ghibli:166efd159b4138da932522bc5af40d39194033f587d9bdbab1e594119eae3e7f",
  // Short names for backward compatibility
  "pet-to-human": "google/nano-banana",
  "action-figure": "google/nano-banana",
  "watercolor": "google/nano-banana",
  "clay": "google/nano-banana",
  "illustration": "google/nano-banana",
  "pixel": "google/nano-banana",
  "pixar": "google/nano-banana",
  "lego": "google/nano-banana",
  "3d": "google/nano-banana",
  "disney": "google/nano-banana",
  "cartoon": "google/nano-banana",
  "cyberpunk": "google/nano-banana",
  "simpsons": "google/nano-banana",
  "oil-painting": "google/nano-banana",

  // ==========================================
  // AI Image Effects (using google/nano-banana)
  // ==========================================
  "ai-image-effects/face-swap": "google/nano-banana",
  "ai-image-effects/new-yorker-cartoon": "google/nano-banana",
  "ai-image-effects/album-cover": "google/nano-banana",
  "ai-image-effects/kpop-demon-hunter": "google/nano-banana",
  "ai-image-effects/pet-passport": "google/nano-banana",
  "ai-image-effects/labubu-doll": "google/nano-banana",
  "ai-image-effects/ghibli": "google/nano-banana",
  "ai-image-effects/clothes-changer": "google/nano-banana",
  "ai-image-effects/halloween": "google/nano-banana",
  "ai-image-effects/halloween-costume": "google/nano-banana",
  "ai-image-effects/pet-halloween-costume": "google/nano-banana",
  "ai-image-effects/zootopia": "google/nano-banana",
  "ai-image-effects/christmas": "google/nano-banana",
  // Short names for backward compatibility
  "face-swap": "google/nano-banana",
  "ai-face-swap": "google/nano-banana",
  "new-yorker-cartoon": "google/nano-banana",
  "album-cover": "google/nano-banana",
  "kpop-demon-hunter": "google/nano-banana",
  "pet-passport": "google/nano-banana",
  "labubu-doll": "google/nano-banana",
  "ghibli": "google/nano-banana",
  "clothes-changer": "google/nano-banana",
  "halloween": "google/nano-banana",
  "halloween-costume": "google/nano-banana",
  "pet-halloween-costume": "google/nano-banana",
  "zootopia": "google/nano-banana",
  "christmas": "google/nano-banana",

  // ==========================================
  // AI Photo Filters (with full paths)
  // ==========================================
  "ai-photo-filter/image-to-prompt": "black-forest-labs/flux-dev",
  "ai-photo-filter/ai-design-sketch": "hebhar/handsketch:e1f41a2e47f93ec8d8c9308bb60e789b8a667664b5125076224ad7a1dbc993e7",
  "ai-photo-filter/ai-anime-filter": "qwen-edit-apps/qwen-image-edit-plus-lora-photo-to-anime",
  "ai-photo-filter/ai-style-transfer": "timothybrooks/instruct-pix2pix",
  "ai-photo-filter/2d-to-3d-converter": "black-forest-labs/flux-depth-pro",
  "ai-photo-filter/turn-sketch-to-art": "google/nano-banana",
  "pencil-sketch": "tjrndll/pencil-sketch",

  // ==========================================
  // AI Art Generators (with full paths)
  // ==========================================
  "ai-art-generator/ai-image-generator": "black-forest-labs/flux-dev",
  "ai-art-generator/ai-character-generator": "stability-ai/sdxl",
  "ai-art-generator/ai-comic-generator": "stability-ai/sdxl",
  "ai-art-generator/ai-anime-generator": "stability-ai/sdxl",
  "ai-art-generator/ai-vector-image-generator": "stability-ai/sdxl",
  "ai-art-generator/ai-coloring-book-generator": "stability-ai/sdxl",
  // Short names for backward compatibility
  "ai-character-generator": "stability-ai/sdxl",
  "ai-comic-generator": "stability-ai/sdxl",
  "ai-anime-generator": "stability-ai/sdxl",
  "ai-vector-image-generator": "stability-ai/sdxl",
  "ai-coloring-book-generator": "stability-ai/sdxl",
  "ai-image-generator": "black-forest-labs/flux-dev",

  // ==========================================
  // AI Image Editors (with full paths)
  // ==========================================
  "ai-image-editor/add-object-into-image": "google/nano-banana",
  "ai-image-editor/remove-object-from-image": "google/nano-banana",
  "ai-image-editor/remove-background": "cjwbw/rembg",
  "ai-image-editor/ai-photo-enhancer": "google/nano-banana",
  "ai-image-editor/ai-photo-expand": "google/nano-banana",
  "ai-image-editor/vectorize-image": "google/nano-banana",
  "ai-image-editor/watermark-remover": "bytedance/seedream-4",
  "ai-image-editor/ai-combine-image": "black-forest-labs/flux-dev",
  "ai-image-editor/insert-objects": "black-forest-labs/flux-fill-pro",
  // Short names for backward compatibility
  "add-object-into-image": "google/nano-banana",
  "remove-object-from-image": "google/nano-banana",
  "remove-background": "cjwbw/rembg",
  "ai-photo-enhancer": "google/nano-banana",
  "ai-photo-expand": "google/nano-banana",
  "vectorize-image": "google/nano-banana",
  "watermark-remover": "google/nano-banana",

  // ==========================================
  // AI Upscalers (all use google/nano-banana)
  // ==========================================
  "ai-upscaler/real-esrgan-4x": "google/nano-banana",
  "ai-upscaler/clarity-upscaler": "google/nano-banana",
  "ai-upscaler/supir": "google/nano-banana",
  "ai-upscaler/gfpgan": "google/nano-banana",
  "ai-upscaler/codeformer": "google/nano-banana",
  "ai-upscaler/anime-upscaler": "google/nano-banana",
  // Short names for backward compatibility
  "real-esrgan-4x": "google/nano-banana",
  "clarity-upscaler": "google/nano-banana",
  "supir": "google/nano-banana",
  "gfpgan": "google/nano-banana",
  "codeformer": "google/nano-banana",
  "anime-upscaler": "google/nano-banana",

  // ==========================================
  // ControlNet & Guidance (using google/nano-banana)
  // ==========================================
  "ai-controlnet/canny": "google/nano-banana",
  "ai-controlnet/depth": "google/nano-banana",
  "ai-controlnet/pose": "google/nano-banana",
  "ai-controlnet/scribble": "google/nano-banana",
  "ai-controlnet/soft-edge": "google/nano-banana",
  "ai-controlnet/line-art": "google/nano-banana",
  "ai-controlnet/qr-code": "google/nano-banana",
  "ai-controlnet/ip-adapter": "google/nano-banana",
  "ai-controlnet/ip-adapter-face": "google/nano-banana",
  "ai-controlnet/instant-id": "google/nano-banana",
  "ai-controlnet/photomaker": "google/nano-banana",
  // Short names for backward compatibility
  "canny": "google/nano-banana",
  "depth": "google/nano-banana",
  "pose": "google/nano-banana",
  "scribble": "google/nano-banana",
  "soft-edge": "google/nano-banana",
  "line-art": "google/nano-banana",
  "qr-code": "google/nano-banana",
  "ip-adapter": "google/nano-banana",
  "ip-adapter-face": "google/nano-banana",
  "instant-id": "google/nano-banana",
  "instantid": "google/nano-banana",
  "photomaker": "google/nano-banana",

  // ==========================================
  // AI Background Tools
  // ==========================================
  "ai-background/remove-pro": "cjwbw/rembg",
  "ai-background/generator": "stability-ai/sdxl",
  "ai-background/blur": "cjwbw/rembg",
  "ai-background/replace": "stability-ai/sdxl",
  // Short names for backward compatibility
  "remove-pro": "cjwbw/rembg",
  "generator": "stability-ai/sdxl",
  "blur": "cjwbw/rembg",
  "replace": "stability-ai/sdxl",

  // ==========================================
  // AI Portrait Tools (using google/nano-banana)
  // ==========================================
  "ai-portrait/headshot-generator": "google/nano-banana",
  "ai-portrait/age-progression": "google/nano-banana",
  "ai-portrait/gender-swap": "google/nano-banana",
  "ai-portrait/ai-makeup": "google/nano-banana",
  "ai-portrait/hair-style": "google/nano-banana",
  "ai-portrait/expression-editor": "google/nano-banana",
  // Short names for backward compatibility
  "headshot-generator": "google/nano-banana",
  "age-progression": "google/nano-banana",
  "gender-swap": "google/nano-banana",
  "ai-makeup": "google/nano-banana",
  "hair-style-changer": "google/nano-banana",
  "hair-style": "google/nano-banana",
  "expression-editor": "google/nano-banana",
};

function now() {
  return Date.now();
}

function normalize(str: string) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function slugTokens(slug: string) {
  const s = normalize(slug.replace(/\//g, " "));
  const toks = s.split(/\s+/).filter(Boolean);
  // Drop generic tokens
  const stop = new Set(["ai", "image", "models", "model", "to", "pro", "v", "version"]);
  return toks.filter((t) => !stop.has(t));
}

function candidateNamesForSlug(slug: string) {
  // e.g. flux-1-1-pro -> flux-1.1-pro
  const base = slug.split("/").pop() || slug;
  const withDots = base.replace(/(\d)-(\d)/g, "$1.$2");
  const withDots2 = withDots.replace(/(\d)\s+(\d)/g, "$1.$2");
  return Array.from(new Set([base, withDots2, withDots]));
}

function scoreModel(slug: string, model: ReplicateModelListItem) {
  const toks = slugTokens(slug);
  const name = normalize(model.name);
  const owner = normalize(model.owner);
  const desc = normalize(model.description || "");

  let score = 0;

  // Exact-ish name matches
  for (const cn of candidateNamesForSlug(slug)) {
    const c = normalize(cn);
    if (name === c) score += 40;
    if (name.includes(c)) score += 18;
  }

  // Token overlap
  for (const t of toks) {
    if (name.includes(t)) score += 6;
    if (owner.includes(t)) score += 2;
    if (desc.includes(t)) score += 1;
  }

  // Prefer known owners for common families (best-effort heuristics)
  if (name.includes("flux") && owner.includes("black forest")) score += 10;
  if ((name.includes("sdxl") || name.includes("stable diffusion")) && owner.includes("stability")) score += 8;
  if (name.includes("ideogram") && owner.includes("ideogram")) score += 8;

  return score;
}

export async function getReplicateModelCatalog(forceRefresh = false) {
  const cached = globalThis.__replicateModelCatalog;
  if (!forceRefresh && cached && now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.models;
  }

  const models: ReplicateModelListItem[] = [];

  try {
    // replicate.paginate returns an async iterator of batches
    // @ts-ignore - replicate SDK types don't include paginate method
    for await (const batch of (replicate as any).paginate((replicate as any).models.list)) {
      if (Array.isArray(batch)) {
        for (const item of batch) {
          if (!item?.owner || !item?.name) continue;
          models.push({
            owner: item.owner,
            name: item.name,
            description: item.description ?? null,
            latest_version: item.latest_version ?? null,
          });
        }
      }
    }

    globalThis.__replicateModelCatalog = { fetchedAt: now(), models };

    logger.info("[replicate] Model catalog refreshed", {
      count: models.length,
    });
  } catch (error) {
    logger.apiError(
      "[replicate] Failed to refresh model catalog",
      error instanceof Error ? error : new Error(String(error))
    );

    // Fall back to stale cache if present
    if (cached?.models?.length) return cached.models;
  }

  return models;
}

export async function resolveReplicateModelIdentifierForSlug(slug: string) {
  const models = await getReplicateModelCatalog(false);
  const normalizedSlug = slug.replace(/^\/+/, "");

  // 1) Check manual overrides first
  if (MANUAL_MODEL_OVERRIDES[normalizedSlug]) {
    const override = MANUAL_MODEL_OVERRIDES[normalizedSlug];
    // If override doesn't have a version hash, try to get the latest version from catalog
    if (!override.includes(":")) {
      const [owner, name] = override.split("/");
      const modelFromCatalog = models.find(
        (m) => normalize(m.owner) === normalize(owner) && normalize(m.name) === normalize(name)
      );
      if (modelFromCatalog?.latest_version?.id) {
        return {
          identifier: `${modelFromCatalog.owner}/${modelFromCatalog.name}:${modelFromCatalog.latest_version.id}`,
          confidence: 100,
          matched: modelFromCatalog,
        };
      }
    }
    // Return override as-is (with or without version)
    return {
      identifier: override,
      confidence: 100,
      matched: { owner: "manual", name: normalizedSlug } as ReplicateModelListItem,
    };
  }

  // 2) Try exact name match candidates first (fast)
  const candidates = candidateNamesForSlug(normalizedSlug);
  for (const cn of candidates) {
    const c = normalize(cn);
    const exact = models.find((m) => normalize(m.name) === c);
    if (exact) {
      const version = exact.latest_version?.id;
      return {
        identifier: version ? `${exact.owner}/${exact.name}:${version}` : `${exact.owner}/${exact.name}`,
        confidence: 100,
        matched: exact,
      };
    }
  }

  // 2) Best-effort scoring across catalog
  let best: ReplicateModelListItem | null = null;
  let bestScore = -1;
  for (const m of models) {
    const s = scoreModel(normalizedSlug, m);
    if (s > bestScore) {
      bestScore = s;
      best = m;
    }
  }

  const confidence = Math.max(0, Math.min(100, bestScore));
  const finalBest = best as ReplicateModelListItem | null;
  const version = finalBest?.latest_version?.id;
  const identifier = finalBest
    ? (version ? `${finalBest.owner}/${finalBest.name}:${version}` : `${finalBest.owner}/${finalBest.name}`)
    : null;

  return {
    identifier,
    confidence,
    matched: finalBest,
  };
}

export async function getModelCatalog() {
  const cached = globalThis.__replicateModelCatalog;
  const models = await getReplicateModelCatalog(false);
  return {
    models: models.map((m) => ({ id: `${m.owner}/${m.name}`, ...m })),
    lastUpdated: cached?.fetchedAt || Date.now(),
  };
}

export async function refreshModelCatalog() {
  await getReplicateModelCatalog(true);
  return getModelCatalog();
}


