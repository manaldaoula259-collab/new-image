import { IconType } from "react-icons";
import {
  FiCpu,
  FiDollarSign,
  FiHome,
  FiImage,
  FiPlusSquare,
  FiCrop,
  FiMaximize2,
  FiPenTool,
  FiBox,
  FiSmile,
  FiBookOpen,
  FiZap,
  FiEdit3,
  FiCamera,
  FiLayers,
  FiGrid,
  FiRefreshCw,
  FiStar,
  FiDroplet,
  FiTrash2,
  FiVideo,
  FiUser,
  FiSliders,
} from "react-icons/fi";
import {
  BsLightning,
  BsPencil,
  BsEraser,
  BsPerson,
  BsStars,
  BsPalette,
  BsBrush,
  BsImage,
} from "react-icons/bs";
import { aiImageModels } from "./dashboard-image-models";
import { aiVideoModels } from "./dashboard-video-models";

export type DashboardNavKey = "home" | "media" | "ai-tools" | "pricing";

export interface DashboardNavItem {
  key: DashboardNavKey;
  label: string;
  href: string;
  icon: IconType;
}

// Top navigation items (above tool categories)
export const dashboardNavItemsTop: DashboardNavItem[] = [
  { key: "home", label: "Home", href: "/dashboard", icon: FiHome },
  { key: "ai-tools", label: "All Tools", href: "/dashboard/ai-tools", icon: FiCpu },
];

// Bottom navigation items (below tool categories)
export const dashboardNavItemsBottom: DashboardNavItem[] = [
  { key: "media", label: "Media Library", href: "/dashboard/media", icon: FiImage },
  { key: "pricing", label: "Pricing", href: "/dashboard/pricing", icon: FiDollarSign },
];

// Combined for backwards compatibility
export const dashboardNavItems: DashboardNavItem[] = [
  ...dashboardNavItemsTop,
  ...dashboardNavItemsBottom,
];

export interface DashboardTool {
  title: string;
  description: string;
  href: string;
  icon: IconType;
  color: string;
  iconColor: string;
  category: string;
}

export interface ToolCategory {
  id: string;
  label: string;
  icon: IconType;
  tools: DashboardTool[];
}

export interface DashboardPricingPlan {
  name: string;
  credits: number;
  promptCredits: number;
  price: string;
  pricePerCredit: string;
  description: string;
  highlight?: boolean;
  ctaLabel: string;
  ctaHref: string;
}

// All tools organized by category
export const dashboardTools: DashboardTool[] = [
  // ==========================================
  // AI Image Models - Imported from dashboard-image-models.ts
  // ==========================================
  ...aiImageModels,

  // ==========================================
  // AI Photo Converter
  // ==========================================
  {
    title: "Convert to Studio Ghibli",
    description: "Transform photos into Studio Ghibli anime style.",
    icon: BsPalette,
    href: "/dashboard/tools/studio-ghibli",
    color: "rgba(134, 239, 172, 0.18)",
    iconColor: "#86EFAC",
    category: "photo-converter",
  },
  {
    title: "Convert to Action Figure",
    description: "Turn photos into action figure style images.",
    icon: BsPerson,
    href: "/ai-photo-converter/action-figure",
    color: "rgba(248, 113, 113, 0.18)",
    iconColor: "#F87171",
    category: "photo-converter",
  },
  {
    title: "Convert Pet to Human",
    description: "Transform pet photos into human-like portraits.",
    icon: FiSmile,
    href: "/ai-photo-converter/pet-to-human",
    color: "rgba(251, 146, 60, 0.18)",
    iconColor: "#FB923C",
    category: "photo-converter",
  },
  {
    title: "Convert Photo to Watercolor",
    description: "Transform photos into watercolor paintings.",
    icon: FiDroplet,
    href: "/ai-photo-converter/watercolor",
    color: "rgba(96, 165, 250, 0.18)",
    iconColor: "#60A5FA",
    category: "photo-converter",
  },
  {
    title: "Convert Photo to Clay",
    description: "Create clay sculpture style images.",
    icon: FiBox,
    href: "/ai-photo-converter/clay",
    color: "rgba(252, 211, 77, 0.18)",
    iconColor: "#FCD34D",
    category: "photo-converter",
  },
  {
    title: "Convert Photo to Illustration",
    description: "Transform photos into artistic illustrations.",
    icon: BsBrush,
    href: "/ai-photo-converter/illustration",
    color: "rgba(192, 132, 252, 0.18)",
    iconColor: "#C084FC",
    category: "photo-converter",
  },
  {
    title: "Convert Photo to Pixel",
    description: "Create pixel art from photos.",
    icon: FiGrid,
    href: "/ai-photo-converter/pixel",
    color: "rgba(34, 211, 238, 0.18)",
    iconColor: "#22D3EE",
    category: "photo-converter",
  },
  {
    title: "Convert Photo to Pixar",
    description: "Transform photos into Pixar animation style.",
    icon: FiSmile,
    href: "/ai-photo-converter/pixar",
    color: "rgba(250, 204, 21, 0.18)",
    iconColor: "#FACC15",
    category: "photo-converter",
  },
  {
    title: "Convert Photo to Lego",
    description: "Create Lego brick style images.",
    icon: FiBox,
    href: "/ai-photo-converter/lego",
    color: "rgba(239, 68, 68, 0.18)",
    iconColor: "#EF4444",
    category: "photo-converter",
  },
  {
    title: "Convert Photo to 3D",
    description: "Transform 2D photos into 3D renders.",
    icon: FiBox,
    href: "/ai-photo-converter/3d",
    color: "rgba(94, 234, 212, 0.18)",
    iconColor: "#5EEAD4",
    category: "photo-converter",
  },
  {
    title: "Convert Photo to Disney",
    description: "Transform photos into Disney animation style.",
    icon: BsStars,
    href: "/ai-photo-converter/disney",
    color: "rgba(96, 165, 250, 0.18)",
    iconColor: "#60A5FA",
    category: "photo-converter",
  },
  {
    title: "Convert Photo to Cartoon",
    description: "Create cartoon style images from photos.",
    icon: BsPencil,
    href: "/ai-photo-converter/cartoon",
    color: "rgba(251, 146, 60, 0.18)",
    iconColor: "#FB923C",
    category: "photo-converter",
  },
  {
    title: "Convert Photo to Cyberpunk",
    description: "Transform photos into cyberpunk aesthetic.",
    icon: FiZap,
    href: "/ai-photo-converter/cyberpunk",
    color: "rgba(192, 132, 252, 0.18)",
    iconColor: "#C084FC",
    category: "photo-converter",
  },
  {
    title: "Convert Photo to Simpsons",
    description: "Transform photos into Simpsons cartoon style.",
    icon: FiSmile,
    href: "/ai-photo-converter/simpsons",
    color: "rgba(250, 204, 21, 0.18)",
    iconColor: "#FACC15",
    category: "photo-converter",
  },
  {
    title: "Convert Photo to Oil Painting",
    description: "Create oil painting style artwork.",
    icon: BsBrush,
    href: "/ai-photo-converter/oil-painting",
    color: "rgba(134, 239, 172, 0.18)",
    iconColor: "#86EFAC",
    category: "photo-converter",
  },

  // ==========================================
  // AI Image Effects
  // ==========================================
  {
    title: "AI Face Swap",
    description: "Swap faces in photos with AI precision.",
    icon: FiRefreshCw,
    href: "/ai-image-effects/face-swap",
    color: "rgba(248, 113, 113, 0.18)",
    iconColor: "#F87171",
    category: "image-effects",
  },
  {
    title: "New Yorker Cartoon Generator",
    description: "Create New Yorker style cartoons.",
    icon: BsPencil,
    href: "/ai-image-effects/new-yorker-cartoon",
    color: "rgba(96, 165, 250, 0.18)",
    iconColor: "#60A5FA",
    category: "image-effects",
  },
  {
    title: "AI Album Cover Generator",
    description: "Design professional album covers.",
    icon: FiImage,
    href: "/ai-image-effects/album-cover",
    color: "rgba(192, 132, 252, 0.18)",
    iconColor: "#C084FC",
    category: "image-effects",
  },
  {
    title: "Kpop Demon Hunter Filter",
    description: "Apply Kpop demon hunter style effects.",
    icon: BsStars,
    href: "/ai-image-effects/kpop-demon-hunter",
    color: "rgba(239, 68, 68, 0.18)",
    iconColor: "#EF4444",
    category: "image-effects",
  },
  {
    title: "Pet Passport Photo Generator",
    description: "Create passport-style photos for pets.",
    icon: FiCamera,
    href: "/ai-image-effects/pet-passport",
    color: "rgba(94, 234, 212, 0.18)",
    iconColor: "#5EEAD4",
    category: "image-effects",
  },
  {
    title: "Labubu Doll Generator",
    description: "Create cute Labubu doll images.",
    icon: FiSmile,
    href: "/ai-image-effects/labubu-doll",
    color: "rgba(244, 114, 182, 0.18)",
    iconColor: "#F472B6",
    category: "image-effects",
  },
  {
    title: "Ghibli Generator",
    description: "Generate Studio Ghibli style artwork.",
    icon: BsPalette,
    href: "/ai-image-effects/ghibli",
    color: "rgba(134, 239, 172, 0.18)",
    iconColor: "#86EFAC",
    category: "image-effects",
  },
  {
    title: "AI Clothes Changer",
    description: "Change outfits in photos with AI.",
    icon: BsPerson,
    href: "/ai-image-effects/clothes-changer",
    color: "rgba(96, 165, 250, 0.18)",
    iconColor: "#60A5FA",
    category: "image-effects",
  },
  {
    title: "AI Halloween Filter",
    description: "Apply spooky Halloween effects.",
    icon: BsStars,
    href: "/ai-image-effects/halloween",
    color: "rgba(251, 146, 60, 0.18)",
    iconColor: "#FB923C",
    category: "image-effects",
  },
  {
    title: "Halloween Costume Generator",
    description: "Generate Halloween costume ideas.",
    icon: FiStar,
    href: "/ai-image-effects/halloween-costume",
    color: "rgba(192, 132, 252, 0.18)",
    iconColor: "#C084FC",
    category: "image-effects",
  },
  {
    title: "Pet Halloween Costume Generator",
    description: "Create Halloween costumes for pets.",
    icon: FiSmile,
    href: "/ai-image-effects/pet-halloween-costume",
    color: "rgba(248, 113, 113, 0.18)",
    iconColor: "#F87171",
    category: "image-effects",
  },
  {
    title: "Zootopia Filter",
    description: "Transform photos into Zootopia style.",
    icon: BsPalette,
    href: "/ai-image-effects/zootopia",
    color: "rgba(34, 211, 238, 0.18)",
    iconColor: "#22D3EE",
    category: "image-effects",
  },
  {
    title: "AI Christmas Filter",
    description: "Add festive Christmas effects.",
    icon: FiStar,
    href: "/ai-image-effects/christmas",
    color: "rgba(239, 68, 68, 0.18)",
    iconColor: "#EF4444",
    category: "image-effects",
  },

  // ==========================================
  // AI Photo Filters (existing)
  // ==========================================
  {
    title: "Image to Prompt",
    description: "Generate detailed prompts from any reference image.",
    icon: BsLightning,
    href: "/ai-photo-filter/image-to-prompt",
    color: "rgba(250, 204, 21, 0.18)",
    iconColor: "#FACC15",
    category: "photo-filters",
  },
  {
    title: "AI Design Sketch",
    description: "Transform sketches into polished concept designs.",
    icon: BsPencil,
    href: "/ai-photo-filter/ai-design-sketch",
    color: "rgba(248, 113, 113, 0.18)",
    iconColor: "#F87171",
    category: "photo-filters",
  },
  {
    title: "AI Anime Filter",
    description: "Convert portraits into vibrant anime-inspired artwork.",
    icon: BsStars,
    href: "/ai-photo-filter/ai-anime-filter",
    color: "rgba(192, 132, 252, 0.18)",
    iconColor: "#C084FC",
    category: "photo-filters",
  },
  {
    title: "AI Style Transfer",
    description: "Apply artistic styles to your images instantly.",
    icon: BsPalette,
    href: "/ai-photo-filter/ai-style-transfer",
    color: "rgba(251, 146, 60, 0.18)",
    iconColor: "#FB923C",
    category: "photo-filters",
  },
  {
    title: "2D to 3D Converter",
    description: "Convert flat images into stunning 3D models.",
    icon: FiBox,
    href: "/ai-photo-filter/2d-to-3d-converter",
    color: "rgba(34, 211, 238, 0.18)",
    iconColor: "#22D3EE",
    category: "photo-filters",
  },
  {
    title: "Turn Sketch to Art",
    description: "Transform rough sketches into beautiful finished artwork.",
    icon: BsBrush,
    href: "/ai-photo-filter/turn-sketch-to-art",
    color: "rgba(134, 239, 172, 0.18)",
    iconColor: "#86EFAC",
    category: "photo-filters",
  },

  // ==========================================
  // AI Image Editors (existing)
  // ==========================================
  {
    title: "Add Object into Image",
    description: "Insert new elements seamlessly into any scene.",
    icon: FiPlusSquare,
    href: "/ai-image-editor/add-object-into-image",
    color: "rgba(94, 234, 212, 0.18)",
    iconColor: "#5EEAD4",
    category: "image-editors",
  },
  {
    title: "Remove Object from Image",
    description: "Erase distractions while keeping backgrounds intact.",
    icon: BsEraser,
    href: "/ai-image-editor/remove-object-from-image",
    color: "rgba(239, 68, 68, 0.18)",
    iconColor: "#EF4444",
    category: "image-editors",
  },
  {
    title: "Remove Background",
    description: "Cut out subjects with crisp, studio-quality edges.",
    icon: FiCrop,
    href: "/ai-image-editor/remove-background",
    color: "rgba(16, 185, 129, 0.18)",
    iconColor: "#10B981",
    category: "image-editors",
  },
  {
    title: "AI Photo Enhancer",
    description: "Upscale and sharpen photos while keeping natural detail.",
    icon: FiZap,
    href: "/ai-image-editor/ai-photo-enhancer",
    color: "rgba(96, 165, 250, 0.18)",
    iconColor: "#60A5FA",
    category: "image-editors",
  },
  {
    title: "AI Photo Expand",
    description: "Extend image borders with realistic AI-generated context.",
    icon: FiMaximize2,
    href: "/ai-image-editor/ai-photo-expand",
    color: "rgba(191, 219, 254, 0.18)",
    iconColor: "#3B82F6",
    category: "image-editors",
  },
  {
    title: "Vectorize Image",
    description: "Convert raster graphics into clean vector artwork.",
    icon: FiPenTool,
    href: "/ai-image-editor/vectorize-image",
    color: "rgba(253, 224, 71, 0.18)",
    iconColor: "#F59E0B",
    category: "image-editors",
  },
  {
    title: "Watermark Remover",
    description: "Remove watermarks from images cleanly.",
    icon: FiTrash2,
    href: "/ai-image-editor/watermark-remover",
    color: "rgba(248, 113, 113, 0.18)",
    iconColor: "#F87171",
    category: "image-editors",
  },

  // ==========================================
  // AI Art Generators (existing)
  // ==========================================
  {
    title: "AI Image Generator",
    description: "Generate images from text prompts.",
    icon: BsImage,
    href: "/ai-art-generator/ai-image-generator",
    color: "rgba(192, 132, 252, 0.18)",
    iconColor: "#C084FC",
    category: "art-generators",
  },
  {
    title: "AI Character Generator",
    description: "Create consistent characters ready for storytelling.",
    icon: BsPerson,
    href: "/ai-art-generator/ai-character-generator",
    color: "rgba(134, 239, 172, 0.18)",
    iconColor: "#34D399",
    category: "art-generators",
  },
  {
    title: "AI Anime Generator",
    description: "Generate stylized anime characters and scenes.",
    icon: FiSmile,
    href: "/ai-art-generator/ai-anime-generator",
    color: "rgba(216, 180, 254, 0.18)",
    iconColor: "#C4B5FD",
    category: "art-generators",
  },
  {
    title: "AI Comic Generator",
    description: "Turn prompts into bold comic-book panels.",
    icon: FiBookOpen,
    href: "/ai-art-generator/ai-comic-generator",
    color: "rgba(252, 211, 77, 0.18)",
    iconColor: "#FBBF24",
    category: "art-generators",
  },
  {
    title: "AI Coloring Book Generator",
    description: "Produce line art perfect for coloring books and activities.",
    icon: FiEdit3,
    href: "/ai-art-generator/ai-coloring-book-generator",
    color: "rgba(244, 114, 182, 0.18)",
    iconColor: "#F472B6",
    category: "art-generators",
  },

  // ==========================================
  // AI Video Models
  // ==========================================
  ...aiVideoModels,


  // ==========================================
  // AI Upscalers & Enhancement
  // ==========================================
  {
    title: "Real-ESRGAN 4x+",
    description: "4x upscaling with enhanced details.",
    icon: FiMaximize2,
    href: "/ai-upscaler/real-esrgan-4x",
    color: "rgba(59, 130, 246, 0.18)",
    iconColor: "#3B82F6",
    category: "upscalers",
  },
  {
    title: "Clarity Upscaler",
    description: "AI upscaler with clarity enhancement.",
    icon: FiMaximize2,
    href: "/ai-upscaler/clarity-upscaler",
    color: "rgba(99, 102, 241, 0.18)",
    iconColor: "#6366F1",
    category: "upscalers",
  },
  {
    title: "SUPIR Upscaler",
    description: "Super-resolution with intelligent restoration.",
    icon: FiMaximize2,
    href: "/ai-upscaler/supir",
    color: "rgba(139, 92, 246, 0.18)",
    iconColor: "#8B5CF6",
    category: "upscalers",
  },
  {
    title: "GFPGAN Face Restore",
    description: "Restore and enhance faces in photos.",
    icon: BsPerson,
    href: "/ai-upscaler/gfpgan",
    color: "rgba(236, 72, 153, 0.18)",
    iconColor: "#EC4899",
    category: "upscalers",
  },
  {
    title: "CodeFormer",
    description: "Advanced face restoration algorithm.",
    icon: BsPerson,
    href: "/ai-upscaler/codeformer",
    color: "rgba(244, 114, 182, 0.18)",
    iconColor: "#F472B6",
    category: "upscalers",
  },
  {
    title: "Anime Upscaler",
    description: "Specialized upscaler for anime and illustrations.",
    icon: FiMaximize2,
    href: "/ai-upscaler/anime-upscaler",
    color: "rgba(251, 113, 133, 0.18)",
    iconColor: "#FB7185",
    category: "upscalers",
  },

  // ==========================================
  // AI ControlNet & Guidance
  // ==========================================
  {
    title: "ControlNet Canny",
    description: "Edge-guided image generation with Canny detection.",
    icon: FiPenTool,
    href: "/ai-controlnet/canny",
    color: "rgba(248, 113, 113, 0.18)",
    iconColor: "#F87171",
    category: "controlnet",
  },
  {
    title: "ControlNet Depth",
    description: "Depth-guided generation for 3D consistency.",
    icon: FiBox,
    href: "/ai-controlnet/depth",
    color: "rgba(251, 146, 60, 0.18)",
    iconColor: "#FB923C",
    category: "controlnet",
  },
  {
    title: "ControlNet Pose",
    description: "Human pose-guided image generation.",
    icon: BsPerson,
    href: "/ai-controlnet/pose",
    color: "rgba(250, 204, 21, 0.18)",
    iconColor: "#FACC15",
    category: "controlnet",
  },
  {
    title: "ControlNet Scribble",
    description: "Turn rough scribbles into detailed images.",
    icon: BsPencil,
    href: "/ai-controlnet/scribble",
    color: "rgba(163, 230, 53, 0.18)",
    iconColor: "#A3E635",
    category: "controlnet",
  },
  {
    title: "ControlNet Soft Edge",
    description: "Soft edge detection for smoother guidance.",
    icon: FiPenTool,
    href: "/ai-controlnet/soft-edge",
    color: "rgba(74, 222, 128, 0.18)",
    iconColor: "#4ADE80",
    category: "controlnet",
  },
  {
    title: "ControlNet Line Art",
    description: "Line art guided image generation.",
    icon: BsPencil,
    href: "/ai-controlnet/line-art",
    color: "rgba(52, 211, 153, 0.18)",
    iconColor: "#34D399",
    category: "controlnet",
  },
  {
    title: "ControlNet QR Code",
    description: "Generate artistic QR codes that actually work.",
    icon: FiGrid,
    href: "/ai-controlnet/qr-code",
    color: "rgba(45, 212, 191, 0.18)",
    iconColor: "#2DD4BF",
    category: "controlnet",
  },
  {
    title: "IP-Adapter",
    description: "Image prompt adapter for style and subject consistency.",
    icon: FiImage,
    href: "/ai-controlnet/ip-adapter",
    color: "rgba(34, 211, 238, 0.18)",
    iconColor: "#22D3EE",
    category: "controlnet",
  },
  {
    title: "IP-Adapter Face",
    description: "Face-specific IP adapter for consistent portraits.",
    icon: BsPerson,
    href: "/ai-controlnet/ip-adapter-face",
    color: "rgba(56, 189, 248, 0.18)",
    iconColor: "#38BDF8",
    category: "controlnet",
  },
  {
    title: "InstantID",
    description: "Zero-shot identity-preserving generation.",
    icon: BsPerson,
    href: "/ai-controlnet/instant-id",
    color: "rgba(96, 165, 250, 0.18)",
    iconColor: "#60A5FA",
    category: "controlnet",
  },
  {
    title: "PhotoMaker",
    description: "Customized realistic human photo generation.",
    icon: FiCamera,
    href: "/ai-controlnet/photomaker",
    color: "rgba(129, 140, 248, 0.18)",
    iconColor: "#818CF8",
    category: "controlnet",
  },

  // ==========================================
  // AI Background Tools
  // ==========================================
  {
    title: "Background Remover Pro",
    description: "Advanced background removal with edge refinement.",
    icon: FiCrop,
    href: "/ai-background/remove-pro",
    color: "rgba(16, 185, 129, 0.18)",
    iconColor: "#10B981",
    category: "background-tools",
  },
  {
    title: "Background Generator",
    description: "Generate custom backgrounds for your subjects.",
    icon: FiImage,
    href: "/ai-background/generator",
    color: "rgba(20, 184, 166, 0.18)",
    iconColor: "#14B8A6",
    category: "background-tools",
  },
  {
    title: "Background Blur",
    description: "Add professional blur effects to backgrounds.",
    icon: FiDroplet,
    href: "/ai-background/blur",
    color: "rgba(6, 182, 212, 0.18)",
    iconColor: "#06B6D4",
    category: "background-tools",
  },
  {
    title: "Background Replace",
    description: "Replace backgrounds with AI-generated scenes.",
    icon: FiRefreshCw,
    href: "/ai-background/replace",
    color: "rgba(14, 165, 233, 0.18)",
    iconColor: "#0EA5E9",
    category: "background-tools",
  },

  // ==========================================
  // AI Portrait Tools
  // ==========================================
  {
    title: "AI Headshot Generator",
    description: "Generate professional headshots from casual photos.",
    icon: FiCamera,
    href: "/ai-portrait/headshot-generator",
    color: "rgba(59, 130, 246, 0.18)",
    iconColor: "#3B82F6",
    category: "portrait-tools",
  },
  {
    title: "Age Progression",
    description: "See how you'll look at different ages.",
    icon: BsPerson,
    href: "/ai-portrait/age-progression",
    color: "rgba(99, 102, 241, 0.18)",
    iconColor: "#6366F1",
    category: "portrait-tools",
  },
  {
    title: "Gender Swap",
    description: "Transform photos with gender swap effects.",
    icon: FiRefreshCw,
    href: "/ai-portrait/gender-swap",
    color: "rgba(139, 92, 246, 0.18)",
    iconColor: "#8B5CF6",
    category: "portrait-tools",
  },
  {
    title: "AI Makeup",
    description: "Apply virtual makeup to photos.",
    icon: BsBrush,
    href: "/ai-portrait/ai-makeup",
    color: "rgba(236, 72, 153, 0.18)",
    iconColor: "#EC4899",
    category: "portrait-tools",
  },
  {
    title: "Hair Style Changer",
    description: "Try different hairstyles virtually.",
    icon: BsPerson,
    href: "/ai-portrait/hair-style",
    color: "rgba(244, 114, 182, 0.18)",
    iconColor: "#F472B6",
    category: "portrait-tools",
  },
  {
    title: "Expression Editor",
    description: "Change facial expressions in photos.",
    icon: FiSmile,
    href: "/ai-portrait/expression-editor",
    color: "rgba(251, 113, 133, 0.18)",
    iconColor: "#FB7185",
    category: "portrait-tools",
  },
];

// Tool categories for sidebar navigation
export const toolCategories: ToolCategory[] = [
  {
    id: "image-models",
    label: "AI Image Models",
    icon: FiCpu,
    tools: dashboardTools.filter(t => t.category === "image-models"),
  },
  {
    id: "video-models",
    label: "AI Video Models",
    icon: FiVideo,
    tools: dashboardTools.filter(t => t.category === "video-models"),
  },
  {
    id: "photo-converter",
    label: "AI Photo Converter",
    icon: FiRefreshCw,
    tools: dashboardTools.filter(t => t.category === "photo-converter"),
  },
  {
    id: "image-effects",
    label: "AI Image Effects",
    icon: BsStars,
    tools: dashboardTools.filter(t => t.category === "image-effects"),
  },
  {
    id: "photo-filters",
    label: "AI Photo Filters",
    icon: FiCamera,
    tools: dashboardTools.filter(t => t.category === "photo-filters"),
  },
  {
    id: "image-editors",
    label: "AI Image Editor",
    icon: FiLayers,
    tools: dashboardTools.filter(t => t.category === "image-editors"),
  },
  {
    id: "upscalers",
    label: "AI Upscalers",
    icon: FiMaximize2,
    tools: dashboardTools.filter(t => t.category === "upscalers"),
  },
  {
    id: "controlnet",
    label: "ControlNet & Guidance",
    icon: FiSliders,
    tools: dashboardTools.filter(t => t.category === "controlnet"),
  },
  {
    id: "background-tools",
    label: "AI Background Tools",
    icon: FiCrop,
    tools: dashboardTools.filter(t => t.category === "background-tools"),
  },
  {
    id: "portrait-tools",
    label: "AI Portrait Tools",
    icon: FiUser,
    tools: dashboardTools.filter(t => t.category === "portrait-tools"),
  },
  {
    id: "art-generators",
    label: "AI Art Generator",
    icon: FiStar,
    tools: dashboardTools.filter(t => t.category === "art-generators"),
  },
];

export const dashboardPricingPlans: DashboardPricingPlan[] = [
  {
    name: "250 Credit Pack",
    credits: 250,
    promptCredits: 50,
    price: "$29",
    pricePerCredit: "$0.12 per credit",
    description: "Kickstart new ideas with a flexible entry pack.",
    ctaLabel: "Buy 250 Credits",
    ctaHref: "/api/checkout/credits?plan=credits-250",
  },
  {
    name: "750 Credit Pack",
    credits: 750,
    promptCredits: 150,
    price: "$69",
    pricePerCredit: "$0.09 per credit",
    description: "Best value for creators shipping content every week.",
    highlight: true,
    ctaLabel: "Buy 750 Credits",
    ctaHref: "/api/checkout/credits?plan=credits-750",
  },
  {
    name: "2000 Credit Pack",
    credits: 2000,
    promptCredits: 400,
    price: "$149",
    pricePerCredit: "$0.075 per credit",
    description: "Scale production with the lowest cost per credit.",
    ctaLabel: "Buy 2000 Credits",
    ctaHref: "/api/checkout/credits?plan=credits-2000",
  },
];
