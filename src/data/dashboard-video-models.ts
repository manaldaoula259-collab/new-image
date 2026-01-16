
import { DashboardTool } from "./dashboard";
import {
    FiVideo,
    FiZap,
    FiCpu,
    FiStar,
} from "react-icons/fi";
import {
    BsLightning,
    BsStars,
} from "react-icons/bs";

// All AI Video Models - New Verified Replicate Models
export const aiVideoModels: DashboardTool[] = [
    // ==========================================
    // Wan Video Series
    // ==========================================
    {
        title: "Wan 2.5 Text to Video",
        description: "Generate videos from text prompts. Supports aspect ratio selection and negative prompts for better control.",
        icon: FiVideo,
        href: "/ai-video/wan-2-5-t2v",
        color: "rgba(99, 102, 241, 0.18)",
        iconColor: "#6366F1",
        category: "video-models",
    },
    {
        title: "Wan 2.5 Image to Video",
        description: "Animate your images into videos. Upload an image and add a prompt to bring it to life. Supports aspect ratio control.",
        icon: FiVideo,
        href: "/ai-video/wan-2-5-i2v",
        color: "rgba(139, 92, 246, 0.18)",
        iconColor: "#8B5CF6",
        category: "video-models",
    },
    {
        title: "Wan 2.5 T2V Fast",
        description: "Fast text-to-video generation with Wan 2.5. Same quality, faster results. Supports aspect ratio and negative prompts.",
        icon: BsLightning,
        href: "/ai-video/wan-2-5-t2v-fast",
        color: "rgba(239, 68, 68, 0.18)",
        iconColor: "#EF4444",
        category: "video-models",
    },
    {
        title: "Wan 2.5 I2V Fast",
        description: "Fast image-to-video with Wan 2.5. Upload an image and get quick video results. Supports aspect ratio control.",
        icon: BsLightning,
        href: "/ai-video/wan-2-5-i2v-fast",
        color: "rgba(249, 115, 22, 0.18)",
        iconColor: "#F97316",
        category: "video-models",
    },
    {
        title: "Wan 2.2 I2V Fast",
        description: "Older but reliable image-to-video model. Upload an image and describe the motion you want to see.",
        icon: BsLightning,
        href: "/ai-video/wan-2-2-i2v-fast",
        color: "rgba(234, 179, 8, 0.18)",
        iconColor: "#EAB308",
        category: "video-models",
    },

    // ==========================================
    // Google Veo Series
    // ==========================================
    {
        title: "Google Veo 3.1",
        description: "Google's latest video AI. Just provide a text prompt - aspect ratio is handled automatically. Simple and powerful.",
        icon: FiStar,
        href: "/ai-video/veo-3-1",
        color: "rgba(59, 130, 246, 0.18)",
        iconColor: "#3B82F6",
        category: "video-models",
    },
    {
        title: "Google Veo 3.1 Fast",
        description: "Faster version of Veo 3.1. Text prompt only - Google handles the technical details automatically.",
        icon: BsLightning,
        href: "/ai-video/veo-3-1-fast",
        color: "rgba(6, 182, 212, 0.18)",
        iconColor: "#06B6D4",
        category: "video-models",
    },
    {
        title: "Google Veo 3",
        description: "High-quality video generation from Google. Simple text-to-video with automatic optimization.",
        icon: FiVideo,
        href: "/ai-video/veo-3",
        color: "rgba(168, 85, 247, 0.18)",
        iconColor: "#A855F7",
        category: "video-models",
    },
    {
        title: "Google Veo 3 Fast",
        description: "Fast text-to-video with Google Veo 3. Quick results with Google's automatic quality optimization.",
        icon: BsLightning,
        href: "/ai-video/veo-3-fast",
        color: "rgba(236, 72, 153, 0.18)",
        iconColor: "#EC4899",
        category: "video-models",
    },
    {
        title: "Google Veo 2",
        description: "Reliable video generation from Google. Text prompt only - simple and effective for most use cases.",
        icon: FiVideo,
        href: "/ai-video/veo-2",
        color: "rgba(244, 114, 182, 0.18)",
        iconColor: "#F472B6",
        category: "video-models",
    },

    // ==========================================
    // Minimax Series
    // ==========================================
    {
        title: "Minimax Hailuo 2.3",
        description: "Powerful text-to-video from Minimax. Just describe what you want - the model handles the rest automatically.",
        icon: BsStars,
        href: "/ai-video/hailuo-2-3",
        color: "rgba(16, 185, 129, 0.18)",
        iconColor: "#10B981",
        category: "video-models",
    },
    {
        title: "Minimax Hailuo 2.3 Fast",
        description: "Fast video generation with Minimax. Text prompt only for quick, high-quality video results.",
        icon: BsLightning,
        href: "/ai-video/hailuo-2-3-fast",
        color: "rgba(20, 184, 166, 0.18)",
        iconColor: "#14B8A6",
        category: "video-models",
    },

    // ==========================================
    // PixVerse Series
    // ==========================================
    {
        title: "PixVerse V5",
        description: "Cinematic video generation. Supports text-to-video and image-to-video. Control aspect ratio and use negative prompts.",
        icon: FiVideo,
        href: "/ai-video/pixverse-v5",
        color: "rgba(217, 70, 239, 0.18)",
        iconColor: "#D946EF",
        category: "video-models",
    },
    {
        title: "PixVerse V4",
        description: "Flexible video generation. Works with text or images. Supports aspect ratio selection and negative prompts.",
        icon: FiVideo,
        href: "/ai-video/pixverse-v4",
        color: "rgba(124, 58, 237, 0.18)",
        iconColor: "#7C3AED",
        category: "video-models",
    },

    // ==========================================
    // Other Models
    // ==========================================
    {
        title: "Seedance 1 Pro Fast",
        description: "Fast video generation from ByteDance. Supports aspect ratio (16:9, 9:16, 1:1, etc.) and negative prompts for precise control.",
        icon: BsLightning,
        href: "/ai-video/seedance-1-pro-fast",
        color: "rgba(239, 68, 68, 0.18)",
        iconColor: "#EF4444",
        category: "video-models",
    },
];
