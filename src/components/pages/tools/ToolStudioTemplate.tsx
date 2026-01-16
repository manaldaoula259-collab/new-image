"use client";

import {
  Box,
  Button,
  Collapse,
  Divider,
  Flex,
  HStack,
  Icon,
  IconButton,
  Select,
  Spinner,
  Switch,
  Text,
  Textarea,
  Tooltip,
  VStack,
  Badge,
  Image as ChakraImage,
  keyframes,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalCloseButton,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@chakra-ui/react";
import {
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiCrop,
  FiDownload,
  FiImage,
  FiInfo,
  FiMaximize2,
  FiRefreshCw,
  FiSettings,
  FiShare2,
  FiThumbsDown,
  FiThumbsUp,
  FiType,
  FiUploadCloud,
  FiX,
  FiZap,
} from "react-icons/fi";
import { BsAspectRatioFill, BsStars } from "react-icons/bs";
import { dashboardTools, type DashboardTool } from "@/data/dashboard";
import { toDashboardToolHref } from "@/core/utils/toDashboardToolHref";
import { Cropper, type CropperRef } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

type Mode = "image-to-image" | "text-to-image";
type AspectRatio = "1:1" | "3:2" | "2:3" | "16:9" | "9:16";
type Quality = "standard" | "hd" | "ultra";

function guessDefaultMode(tool: DashboardTool): Mode {
  const href = tool.href || "";
  const cat = tool.category || "";
  if (href.includes("image-to-prompt")) return "image-to-image";
  if (cat === "image-models" || cat === "art-generators") return "text-to-image";
  return "image-to-image";
}

function defaultPromptHint(mode: Mode) {
  return mode === "image-to-image"
    ? "Describe any specific changes or style preferences..."
    : "Describe your scene in detail. E.g., 'A cozy cottage on a hill surrounded by wildflowers, sunset lighting, peaceful atmosphere'";
}

// Get video model capabilities based on model slug
function getVideoModelCapabilities(toolHref: string): {
  supportsAspectRatio: boolean;
  supportsNegativePrompt: boolean;
  supportsImageInput: boolean;
  modelType: string;
  info: string;
} | null {
  const slug = toolHref.toLowerCase();

  // Wan Video models
  if (slug.includes('wan-2-5-t2v') || slug.includes('wan-2-5-i2v') || slug.includes('wan-2-2')) {
    const isI2V = slug.includes('i2v');
    return {
      supportsAspectRatio: true,
      supportsNegativePrompt: true,
      supportsImageInput: isI2V,
      modelType: isI2V ? "Image-to-Video" : "Text-to-Video",
      info: isI2V
        ? "Upload an image and describe the motion. Supports aspect ratio control and negative prompts."
        : "Generate videos from text. Supports aspect ratio control and negative prompts for precise results."
    };
  }

  // Google Veo models
  if (slug.includes('veo')) {
    return {
      supportsAspectRatio: false,
      supportsNegativePrompt: false,
      supportsImageInput: false,
      modelType: "Text-to-Video",
      info: "Simple text-to-video. Just describe your scene - Google handles aspect ratio and optimization automatically."
    };
  }

  // Minimax Hailuo models
  if (slug.includes('hailuo') || slug.includes('minimax')) {
    return {
      supportsAspectRatio: false,
      supportsNegativePrompt: false,
      supportsImageInput: false,
      modelType: "Text-to-Video",
      info: "Fast text-to-video generation. Describe your scene and get quick results with automatic optimization."
    };
  }

  // PixVerse models
  if (slug.includes('pixverse')) {
    return {
      supportsAspectRatio: true,
      supportsNegativePrompt: true,
      supportsImageInput: true,
      modelType: "Flexible (Text or Image)",
      info: "Flexible video generation. Works with text prompts or images. Supports aspect ratio control and negative prompts."
    };
  }

  // Seedance model
  if (slug.includes('seedance')) {
    return {
      supportsAspectRatio: true,
      supportsNegativePrompt: true,
      supportsImageInput: true,
      modelType: "Fast Generation",
      info: "Fast video generation with precise control. Aspect ratio selection is REQUIRED. Supports negative prompts."
    };
  }

  return null;
}

export default function ToolStudioTemplate({ tool }: { tool: DashboardTool }) {
  const router = useRouter();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropperRef = useRef<CropperRef>(null);

  const [mode, setMode] = useState<Mode>(() => guessDefaultMode(tool));
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // preview URL (object URL)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [prompt, setPrompt] = useState("");
  // Video tools only support "16:9" and "9:16", default to "16:9" for video tools
  const isVideoTool = tool.category === "video-models";
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(isVideoTool ? "16:9" : "1:1");
  const [outputFormat, setOutputFormat] = useState<"png" | "jpg" | "webp">("png");
  const [quality, setQuality] = useState<Quality>("hd");
  const [preserveFace, setPreserveFace] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [styleStrength, setStyleStrength] = useState(() => (tool.href || "").includes("background") ? 40 : 75);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<"uploaded" | "generated">("uploaded");
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  // Demo mode restriction removed - video tools are now enabled
  const isRestrictedByDemo = false;

  const credits = 1;
  const canGenerate = mode === "image-to-image" ? !!uploadedImage : !!prompt.trim();

  const siblingModels = useMemo(() => {
    if (tool.category !== "image-models") return [];
    return dashboardTools.filter((t) => t.category === "image-models");
  }, [tool.category]);

  const currentToolHref = useMemo(() => toDashboardToolHref(tool.href), [tool.href]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (uploadedImage?.startsWith("blob:")) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  const isSupportedImageType = useCallback((file: File) => {
    return ["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (!isSupportedImageType(file)) {
      toast({
        title: "Unsupported file format",
        description: "Please upload a PNG, JPG, or WebP image.",
        status: "warning",
        duration: 3500,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    // Revoke previous preview URL if any
    setUploadedImage((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return prev;
    });

    const previewUrl = URL.createObjectURL(file);
    setUploadedImage(previewUrl);
    setUploadedFile(file);
    setGeneratedImage(null);
  }, [isSupportedImageType, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleReset = useCallback(() => {
    setUploadedImage((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setUploadedFile(null);
    setGeneratedImage(null);
    setGeneratedPrompt(null);
  }, []);

  const enhancePrompt = useCallback(() => {
    if (!prompt.trim()) return;
    const suffix = ", soft watercolor, cinematic lighting, whimsical atmosphere";
    setPrompt((p) => (p + suffix).slice(0, 500));
  }, [prompt]);

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || isRestrictedByDemo) return;
    setIsProcessing(true);
    try {
      let imageUrl: string | undefined;

      // Upload image to S3 (required for image-to-image tools)
      if (mode === "image-to-image") {
        if (!uploadedFile) throw new Error("Please upload an image first.");
        const uploadFormData = new FormData();
        uploadFormData.append("file", uploadedFile);

        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          body: uploadFormData,
        });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err?.error || err?.details || "Failed to upload image.");
        }
        const { url } = (await uploadRes.json()) as { url: string };
        imageUrl = url;
      }

      // Determine tool API route
      const href = tool.href || "";
      const apiPath = href.startsWith("/dashboard/")
        ? null
        : `/api${href}`;

      if (!apiPath) {
        throw new Error("This tool is not wired yet.");
      }

      // Special handling for image-to-prompt - only send imageUrl
      const isImageToPrompt = (tool.href || "").includes("image-to-prompt");
      const payload: Record<string, any> = isImageToPrompt
        ? { imageUrl }
        : {
          prompt,
          imageUrl,
          aspectRatio,
          outputFormat,
          quality,
          styleStrength,
          preserveFace,
        };

      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || err?.details || "Tool generation failed.");
      }
      const data = (await res.json()) as { resultUrl?: string; prompt?: string };

      // Special handling for image-to-prompt tool
      if (isImageToPrompt) {
        if (!data?.prompt) {
          throw new Error("No prompt returned by server.");
        }
        setGeneratedPrompt(data.prompt);
        setGeneratedImage(null);
        toast({
          title: "Prompt generated!",
          description: "Copy the prompt and use it in your favorite model.",
          status: "success",
          duration: 2500,
          isClosable: true,
          position: "top-right",
        });
      } else {
        if (!data?.resultUrl) {
          throw new Error("No resultUrl returned by server.");
        }
        setGeneratedImage(data.resultUrl);
        setGeneratedPrompt(null);
        setFeedback(null); // Reset feedback for new generation
        toast({
          title: "Done!",
          description: "Your output is ready.",
          status: "success",
          duration: 2500,
          isClosable: true,
          position: "top-right",
        });
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Something went wrong";
      const isSensitive = msg.toLowerCase().includes("sensitive") || msg.toLowerCase().includes("flagged") || msg.toLowerCase().includes("nsfw") || msg.toLowerCase().includes("safety");

      toast({
        title: isSensitive ? "Safety Check Failed" : "Generation failed",
        description: isSensitive
          ? "Your prompt contains content flagged by our safety filters. Please verify your prompt is appropriate and try again with different wording."
          : msg,
        status: "error",
        duration: isSensitive ? 6000 : 3500,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [canGenerate, mode, uploadedFile, tool.href, prompt, aspectRatio, outputFormat, quality, styleStrength, preserveFace, toast]);

  const downloadUrl = useCallback(async (url: string, filename: string) => {
    // Always open in a new tab for user access
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      // ignore
    }

    // Best-effort automatic download (may fail due to CORS)
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // fallback: the new tab is already opened
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!generatedImage) return;
    // Determine file extension based on URL or tool type
    const isVideo = /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(generatedImage) || isVideoTool;
    const extension = isVideo ? "mp4" : outputFormat;
    void downloadUrl(generatedImage, `${tool.title || "output"}.${extension}`);
  }, [downloadUrl, generatedImage, tool.title, isVideoTool, outputFormat]);

  const handleCopy = useCallback(async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      toast({
        title: "Copied to clipboard",
        description: "Image has been copied to your clipboard.",
        status: "success",
        duration: 2500,
        isClosable: true,
        position: "top-right",
      });
    } catch (err) {
      // Fallback: Copy URL
      try {
        await navigator.clipboard.writeText(generatedImage);
        toast({
          title: "URL Copied",
          description: "Image URL has been copied to clipboard.",
          status: "success",
          duration: 2500,
          isClosable: true,
          position: "top-right",
        });
      } catch (e) {
        toast({
          title: "Copy failed",
          description: "Failed to copy image or URL.",
          status: "error",
          duration: 2500,
          isClosable: true,
          position: "top-right",
        });
      }
    }
  }, [generatedImage, toast]);

  const handleShare = useCallback(async () => {
    if (!generatedImage) return;

    try {
      // First, save the image to the media library to get a media ID
      const saveResponse = await fetch("/api/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: generatedImage,
          prompt: prompt || `Generated with ${tool.title}`,
          source: tool.href || "ai-tool",
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save image to library");
      }

      const saveData = await saveResponse.json();
      const mediaId = saveData.media?.id;

      if (!mediaId) {
        throw new Error("No media ID returned");
      }

      // Generate the shareable public URL
      const shareUrl = `${window.location.origin}/api/share/${mediaId}`;

      // Try native share API first (only on supported platforms)
      if (navigator.share && navigator.canShare) {
        try {
          // Check if we can share with files
          const canShareData = navigator.canShare({
            url: shareUrl,
          });

          if (canShareData) {
            await navigator.share({
              title: tool.title || "AI Generated Image",
              url: shareUrl,
            });
            toast({
              title: "Shared successfully!",
              status: "success",
              duration: 2000,
              isClosable: true,
              position: "top-right",
            });
            return;
          }
        } catch (err) {
          // If native share fails or is cancelled, fall through to copy
          if ((err as Error).name !== "AbortError") {
            console.error("Share failed:", err);
          }
        }
      }

      // Fallback: Copy the shareable URL to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Share link copied!",
        description: "The shareable link has been copied to your clipboard.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: error instanceof Error ? error.message : "Failed to create shareable link",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  }, [generatedImage, tool.title, tool.href, prompt, toast]);

  const handleFeedback = useCallback((type: "like" | "dislike") => {
    setFeedback((prev) => (prev === type ? null : type));
    toast({
      title: type === "like" ? "Liked!" : "Feedback received",
      description: type === "like" ? "Glad you like this generation!" : "We'll use this to improve our models.",
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });
  }, [toast]);

  const openCrop = useCallback((target: "uploaded" | "generated") => {
    setCropTarget(target);
    setIsCropOpen(true);
  }, []);

  const applyCrop = useCallback(async () => {
    const cropper = cropperRef.current;
    if (!cropper) return;

    const canvas = cropper.getCanvas();
    if (!canvas) return;

    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
    if (!blob) return;

    const file = new File([blob], `crop-${Date.now()}.png`, { type: "image/png" });
    const previewUrl = URL.createObjectURL(file);

    if (cropTarget === "uploaded") {
      setUploadedImage((prev) => {
        if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
        return previewUrl;
      });
      setUploadedFile(file);
    } else {
      // For generated image, keep it as an object URL preview too
      setGeneratedImage(previewUrl);
    }

    setIsCropOpen(false);
    toast({
      title: "Cropped",
      description: "Crop applied successfully.",
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });
  }, [cropTarget, toast]);

  return (
    <Box minH="calc(100vh - 80px)" bg="#FAFAFA">
      {/* Top Header (same layout as Ghibli) */}
      <Flex
        px={{ base: 4, md: 6 }}
        py={4}
        borderBottom="1px solid"
        borderColor="#E5E5E5"
        bg="white"
        justify="space-between"
        align="center"
        position="sticky"
        top={0}
        zIndex={10}
        flexDirection={{ base: "column", md: "row" }}
        gap={{ base: 4, md: 0 }}
      >
        <HStack spacing={4}>
          <HStack spacing={2}>
            <Box
              w="32px"
              h="32px"
              borderRadius="10px"
              bg="linear-gradient(135deg, #86EFAC, #34D399)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={tool.icon} color="white" fontSize="16px" />
            </Box>
            <Text
              fontSize="16px"
              fontWeight="600"
              color="#1a1a1a"
              fontFamily="'General Sans', 'Inter', sans-serif"
              display={{ base: "none", md: "block" }}
            >
              {tool.title}
            </Text>
          </HStack>

          {/* Mode Toggle */}
          <Box bg="#F5F5F5" borderRadius="full" p="3px" display="flex">
            <Button
              size="sm"
              bg={mode === "image-to-image" ? "white" : "transparent"}
              color={mode === "image-to-image" ? "#1a1a1a" : "#71717A"}
              boxShadow={mode === "image-to-image" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"}
              borderRadius="full"
              px={4}
              h="32px"
              fontFamily="'General Sans', 'Inter', sans-serif"
              fontWeight="500"
              fontSize="13px"
              leftIcon={<FiImage />}
              onClick={() => setMode("image-to-image")}
              _hover={{ bg: mode === "image-to-image" ? "white" : "rgba(0,0,0,0.05)" }}
            >
              Image to Image
            </Button>
            <Button
              size="sm"
              bg={mode === "text-to-image" ? "white" : "transparent"}
              color={mode === "text-to-image" ? "#1a1a1a" : "#71717A"}
              boxShadow={mode === "text-to-image" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"}
              borderRadius="full"
              px={4}
              h="32px"
              fontFamily="'General Sans', 'Inter', sans-serif"
              fontWeight="500"
              fontSize="13px"
              leftIcon={<FiType />}
              onClick={() => setMode("text-to-image")}
              _hover={{ bg: mode === "text-to-image" ? "white" : "rgba(0,0,0,0.05)" }}
            >
              Text to Image
            </Button>
          </Box>
        </HStack>

        <HStack spacing={3}>
          <Badge
            bg="rgba(250, 204, 21, 0.15)"
            color="#A16207"
            px={3}
            py={1.5}
            borderRadius="full"
            fontSize="12px"
            fontFamily="'IBM Plex Mono', monospace"
            fontWeight="500"
          >
            <Icon as={FiZap} mr={1} fontSize="11px" />
            {credits} Credits
          </Badge>

        </HStack>
      </Flex>

      {/* Main Content - Split View */}
      <Flex h={{ base: "auto", lg: "calc(100vh - 140px)" }} flexDirection={{ base: "column", lg: "row" }}>
        {/* Left Side - Canvas/Output */}
        <Box flex={1} p={{ base: 4, lg: 6 }} display="flex" flexDirection="column" minH={{ base: "50vh", lg: "auto" }}>
          <Box
            flex={1}
            bg="white"
            borderRadius="20px"
            border="1px solid #E5E5E5"
            overflow="hidden"
            position="relative"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {/* Generated Result */}
            {generatedImage && !isProcessing && (
              <>
                {(() => {
                  // Check if the URL is a video file
                  const isGif = /\.gif(\?|$)/i.test(generatedImage);
                  const isVideo = (/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(generatedImage) || isVideoTool) && !isGif;

                  if (isVideo) {
                    return (
                      <Box
                        as="video"
                        src={generatedImage}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        w="100%"
                        h="100%"
                        maxH="100%"
                        maxW="100%"
                        borderRadius="12px"
                        style={{
                          objectFit: "contain",
                        }}
                        sx={{
                          "&::-webkit-media-controls-panel": {
                            backgroundColor: "rgba(0, 0, 0, 0.8)",
                          },
                        }}
                      />
                    );
                  }

                  return (
                    <ChakraImage src={generatedImage} alt="Generated" objectFit="contain" maxH="100%" maxW="100%" />
                  );
                })()}

                {/* Result overlay actions */}
                <HStack
                  position="absolute"
                  bottom={4}
                  left="50%"
                  transform="translateX(-50%)"
                  bg="rgba(0,0,0,0.8)"
                  backdropFilter="blur(10px)"
                  borderRadius="full"
                  p={1}
                  spacing={1}
                >
                  <Tooltip label="Like">
                    <IconButton
                      aria-label="Like"
                      icon={<FiThumbsUp />}
                      size="sm"
                      variant="ghost"
                      color={feedback === "like" ? "#86EFAC" : "white"}
                      borderRadius="full"
                      onClick={() => handleFeedback("like")}
                      _hover={{ bg: "rgba(255,255,255,0.1)" }}
                    />
                  </Tooltip>
                  <Tooltip label="Dislike">
                    <IconButton
                      aria-label="Dislike"
                      icon={<FiThumbsDown />}
                      size="sm"
                      variant="ghost"
                      color={feedback === "dislike" ? "#EF4444" : "white"}
                      borderRadius="full"
                      onClick={() => handleFeedback("dislike")}
                      _hover={{ bg: "rgba(255,255,255,0.1)" }}
                    />
                  </Tooltip>
                  <Box w="1px" h="20px" bg="rgba(255,255,255,0.2)" />
                  <Tooltip label="Download">
                    <IconButton aria-label="Download" icon={<FiDownload />} size="sm" variant="ghost" color="white" borderRadius="full" onClick={handleDownload} _hover={{ bg: "rgba(255,255,255,0.1)" }} />
                  </Tooltip>
                  <Tooltip label="Copy">
                    <IconButton
                      aria-label="Copy"
                      icon={<FiCopy />}
                      size="sm"
                      variant="ghost"
                      color="white"
                      borderRadius="full"
                      onClick={handleCopy}
                      _hover={{ bg: "rgba(255,255,255,0.1)" }}
                    />
                  </Tooltip>
                  <Tooltip label="Share">
                    <IconButton
                      aria-label="Share"
                      icon={<FiShare2 />}
                      size="sm"
                      variant="ghost"
                      color="white"
                      borderRadius="full"
                      onClick={handleShare}
                      _hover={{ bg: "rgba(255,255,255,0.1)" }}
                    />
                  </Tooltip>
                  <Box w="1px" h="20px" bg="rgba(255,255,255,0.2)" />
                  <Tooltip label="Regenerate">
                    <IconButton aria-label="Regenerate" icon={<FiRefreshCw />} size="sm" variant="ghost" color="white" borderRadius="full" onClick={handleGenerate} _hover={{ bg: "rgba(255,255,255,0.1)" }} />
                  </Tooltip>
                </HStack>
              </>
            )}

            {/* Generated Prompt (for image-to-prompt tool) */}
            {generatedPrompt && !isProcessing && (
              <VStack spacing={4} w="100%" p={6} align="stretch">
                <HStack justify="space-between" align="center">
                  <Text fontSize="18px" fontWeight="600" color="#1a1a1a" fontFamily="'General Sans', 'Inter', sans-serif">
                    Generated Prompt
                  </Text>
                  <HStack spacing={2}>
                    <Tooltip label="Copy prompt">
                      <IconButton
                        aria-label="Copy prompt"
                        icon={<FiCopy />}
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(generatedPrompt);
                            toast({
                              title: "Prompt copied!",
                              status: "success",
                              duration: 2000,
                              isClosable: true,
                              position: "top-right",
                            });
                          } catch (error) {
                            toast({
                              title: "Failed to copy",
                              status: "error",
                              duration: 2000,
                              isClosable: true,
                              position: "top-right",
                            });
                          }
                        }}
                      />
                    </Tooltip>
                    <Tooltip label="Regenerate">
                      <IconButton aria-label="Regenerate" icon={<FiRefreshCw />} size="sm" variant="ghost" onClick={handleGenerate} />
                    </Tooltip>
                  </HStack>
                </HStack>
                <Textarea
                  value={generatedPrompt}
                  readOnly
                  minH="200px"
                  fontSize="14px"
                  fontFamily="'IBM Plex Mono', monospace"
                  bg="#F9FAFB"
                  border="1px solid #E5E7EB"
                  borderRadius="12px"
                  _focus={{ borderColor: "#86EFAC", boxShadow: "0 0 0 3px rgba(134, 239, 172, 0.1)" }}
                />
              </VStack>
            )}

            {/* Processing State */}
            {isProcessing && (
              <VStack spacing={4}>
                <Box
                  w="60px"
                  h="60px"
                  borderRadius="full"
                  bg="linear-gradient(135deg, #86EFAC, #34D399)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  animation={`${pulse} 1.5s ease-in-out infinite`}
                >
                  <Spinner color="white" size="lg" thickness="3px" />
                </Box>
                <VStack spacing={1}>
                  <Text fontSize="16px" fontWeight="600" color="#1a1a1a" fontFamily="'General Sans', 'Inter', sans-serif">
                    Generating...
                  </Text>
                  <Text fontSize="13px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
                    This usually takes 10-20 seconds
                  </Text>
                </VStack>
              </VStack>
            )}

            {/* Empty State - Different based on mode */}
            {!generatedImage && !generatedPrompt && !isProcessing && (
              <VStack spacing={4} p={8}>
                <Box
                  w="80px"
                  h="80px"
                  borderRadius="20px"
                  bg="linear-gradient(135deg, rgba(134, 239, 172, 0.2), rgba(192, 132, 252, 0.1))"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  animation={`${float} 3s ease-in-out infinite`}
                >
                  <Icon as={BsStars} fontSize="32px" color="#86EFAC" />
                </Box>
                <VStack spacing={1}>
                  <Text fontSize="18px" fontWeight="600" color="#1a1a1a" fontFamily="'General Sans', 'Inter', sans-serif">
                    Your creation will appear here
                  </Text>
                  <Text fontSize="14px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif" textAlign="center">
                    {mode === "image-to-image"
                      ? "Upload an image to transform it"
                      : "Describe your scene and watch it come to life"}
                  </Text>
                </VStack>
              </VStack>
            )}
          </Box>

          {/* Bottom Quick Actions (shown when image exists) */}
          {generatedImage && !isProcessing && (
            <HStack
              mt={4}
              justify="center"
              spacing={2}
              bg="white"
              p={2}
              borderRadius="full"
              border="1px solid #E5E5E5"
              w="fit-content"
              mx="auto"
            >
              {[
                ...(isVideoTool ? [] : [{ icon: FiCrop, label: "Crop" }]),
                { icon: FiMaximize2, label: "Expand" },
                { icon: BsAspectRatioFill, label: "Resize" },
              ].map((action) => (
                <Tooltip key={action.label} label={action.label}>
                  <Button
                    size="sm"
                    variant="ghost"
                    color="#52525B"
                    borderRadius="full"
                    px={4}
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    fontSize="13px"
                    leftIcon={<Icon as={action.icon} />}
                    _hover={{ bg: "#F5F5F5" }}
                    onClick={() => {
                      if (action.label === "Crop") openCrop("generated");
                      else {
                        toast({
                          title: "Coming soon",
                          description: `${action.label} will be available soon.`,
                          status: "info",
                          duration: 2500,
                          isClosable: true,
                          position: "top-right",
                        });
                      }
                    }}
                  >
                    {action.label}
                  </Button>
                </Tooltip>
              ))}
            </HStack>
          )}
        </Box>

        {/* Right Side - Settings Panel */}
        <Box
          w={{ base: "100%", lg: "380px" }}
          bg="white"
          borderLeft={{ base: "none", lg: "1px solid #E5E5E5" }}
          borderTop={{ base: "1px solid #E5E5E5", lg: "none" }}
          position="relative"
          display="flex"
          flexDirection="column"
          h={{ base: "auto", lg: "100%" }}
        >
          {/* Scrollable Settings Area */}
          <Box
            flex="1"
            overflowY="auto"
            p={5}
            pb={2}
            css={{
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#D4D4D4",
                borderRadius: "3px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "#A1A1AA",
              },
            }}
          >
            <VStack spacing={5} align="stretch">
              {/* Video Model Capabilities Info Box */}
              {isVideoTool && (() => {
                const capabilities = getVideoModelCapabilities(tool.href);
                if (!capabilities) return null;

                return (
                  <Box
                    bg="linear-gradient(135deg, rgba(134, 239, 172, 0.1), rgba(99, 102, 241, 0.05))"
                    border="1px solid"
                    borderColor="rgba(134, 239, 172, 0.3)"
                    borderRadius="14px"
                    p={4}
                  >
                    <VStack align="stretch" spacing={3}>
                      <Flex align="center" gap={2}>
                        <Icon as={FiInfo} color="#10B981" fontSize="16px" />
                        <Text fontSize="13px" fontWeight="600" color="#1a1a1a" fontFamily="'General Sans', 'Inter', sans-serif">
                          {capabilities.modelType}
                        </Text>
                      </Flex>

                      <Text fontSize="12px" color="#52525B" fontFamily="'General Sans', 'Inter', sans-serif" lineHeight="1.5">
                        {capabilities.info}
                      </Text>

                      <Divider borderColor="rgba(134, 239, 172, 0.2)" />

                      <VStack align="stretch" spacing={1.5}>
                        <Flex align="center" gap={2}>
                          <Icon
                            as={capabilities.supportsAspectRatio ? FiCheck : FiX}
                            color={capabilities.supportsAspectRatio ? "#10B981" : "#A1A1AA"}
                            fontSize="14px"
                          />
                          <Text fontSize="11px" color={capabilities.supportsAspectRatio ? "#1a1a1a" : "#A1A1AA"} fontFamily="'General Sans', 'Inter', sans-serif">
                            Aspect Ratio Control
                          </Text>
                        </Flex>

                        <Flex align="center" gap={2}>
                          <Icon
                            as={capabilities.supportsNegativePrompt ? FiCheck : FiX}
                            color={capabilities.supportsNegativePrompt ? "#10B981" : "#A1A1AA"}
                            fontSize="14px"
                          />
                          <Text fontSize="11px" color={capabilities.supportsNegativePrompt ? "#1a1a1a" : "#A1A1AA"} fontFamily="'General Sans', 'Inter', sans-serif">
                            Negative Prompts
                          </Text>
                        </Flex>

                        <Flex align="center" gap={2}>
                          <Icon
                            as={capabilities.supportsImageInput ? FiCheck : FiX}
                            color={capabilities.supportsImageInput ? "#10B981" : "#A1A1AA"}
                            fontSize="14px"
                          />
                          <Text fontSize="11px" color={capabilities.supportsImageInput ? "#1a1a1a" : "#A1A1AA"} fontFamily="'General Sans', 'Inter', sans-serif">
                            Image Input
                          </Text>
                        </Flex>
                      </VStack>
                    </VStack>
                  </Box>
                );
              })()}

              {/* Model selector (AI Image Models) - Professional container with scroll */}
              {tool.category === "image-models" && siblingModels.length > 1 && (
                <Box>
                  <Flex justify="space-between" align="center" mb={3}>
                    <Text fontSize="13px" fontWeight="600" color="#1a1a1a" fontFamily="'General Sans', 'Inter', sans-serif">
                      Model
                    </Text>
                    <Badge
                      bg="rgba(99, 102, 241, 0.1)"
                      color="#4F46E5"
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      fontSize="10px"
                      fontFamily="'IBM Plex Mono', monospace"
                      fontWeight="500"
                    >
                      {siblingModels.length} MODELS
                    </Badge>
                  </Flex>
                  <Box
                    bg="#FAFAFA"
                    border="1px solid #E5E5E5"
                    borderRadius="14px"
                    overflow="hidden"
                  >
                    {/* Current selected model */}
                    <Flex
                      px={4}
                      py={3}
                      bg="white"
                      borderBottom="1px solid #E5E5E5"
                      align="center"
                      gap={3}
                    >
                      <Box
                        w="28px"
                        h="28px"
                        borderRadius="8px"
                        bg={tool.iconColor || "black"}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Icon as={tool.icon} color="white" fontSize="13px" />
                      </Box>
                      <Box flex={1} minW={0}>
                        <Text
                          fontSize="13px"
                          fontWeight="600"
                          color="#1a1a1a"
                          fontFamily="'General Sans', 'Inter', sans-serif"
                          noOfLines={1}
                        >
                          {tool.title}
                        </Text>
                        <Text
                          fontSize="11px"
                          color="#71717A"
                          fontFamily="'General Sans', 'Inter', sans-serif"
                          noOfLines={1}
                        >
                          Selected
                        </Text>
                      </Box>
                      <Icon as={FiChevronDown} color="#71717A" fontSize="14px" />
                    </Flex>

                    {/* Scrollable model list */}
                    <Box
                      maxH="180px"
                      overflowY="auto"
                      css={{
                        "&::-webkit-scrollbar": {
                          width: "6px",
                        },
                        "&::-webkit-scrollbar-track": {
                          background: "transparent",
                        },
                        "&::-webkit-scrollbar-thumb": {
                          background: "#D4D4D4",
                          borderRadius: "3px",
                        },
                        "&::-webkit-scrollbar-thumb:hover": {
                          background: "#A1A1AA",
                        },
                      }}
                    >
                      {siblingModels.map((m) => {
                        const isSelected = currentToolHref === toDashboardToolHref(m.href);
                        return (
                          <Flex
                            key={m.href}
                            px={4}
                            py={2.5}
                            align="center"
                            gap={3}
                            cursor="pointer"
                            bg={isSelected ? "rgba(134, 239, 172, 0.15)" : "transparent"}
                            borderLeft={isSelected ? "3px solid #10B981" : "3px solid transparent"}
                            _hover={{ bg: isSelected ? "rgba(134, 239, 172, 0.15)" : "#F5F5F5" }}
                            transition="all 0.15s ease"
                            onClick={() => {
                              if (!isSelected) router.push(toDashboardToolHref(m.href));
                            }}
                          >
                            <Box
                              w="24px"
                              h="24px"
                              borderRadius="6px"
                              bg={m.iconColor || "#71717A"}
                              opacity={isSelected ? 1 : 0.7}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              flexShrink={0}
                            >
                              <Icon as={m.icon} color="white" fontSize="11px" />
                            </Box>
                            <Text
                              flex={1}
                              fontSize="12px"
                              fontWeight={isSelected ? "600" : "500"}
                              color={isSelected ? "#1a1a1a" : "#52525B"}
                              fontFamily="'General Sans', 'Inter', sans-serif"
                              noOfLines={1}
                            >
                              {m.title}
                            </Text>
                            {isSelected && (
                              <Box w="6px" h="6px" borderRadius="full" bg="#10B981" />
                            )}
                          </Flex>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Reference Image Upload (for Image-to-Image) */}
              {mode === "image-to-image" && (
                <Box>
                  <Text fontSize="13px" fontWeight="600" color="#1a1a1a" fontFamily="'General Sans', 'Inter', sans-serif" mb={3}>
                    Reference Image
                  </Text>

                  <Box
                    borderRadius="16px"
                    border="2px dashed"
                    borderColor={isDragging ? "#86EFAC" : uploadedImage ? "#E5E5E5" : "#D4D4D4"}
                    bg={isDragging ? "rgba(134, 239, 172, 0.1)" : uploadedImage ? "#FAFAFA" : "white"}
                    p={uploadedImage ? 0 : 6}
                    cursor="pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    transition="all 0.2s ease"
                    overflow="hidden"
                    position="relative"
                    _hover={{ borderColor: "#86EFAC" }}
                  >
                    {uploadedImage ? (
                      <>
                        <ChakraImage
                          src={uploadedImage}
                          alt="Uploaded"
                          w="100%"
                          h="180px"
                          objectFit="cover"
                          onError={async () => {
                            // Fallback: some environments can fail to render blob: URLs.
                            if (!uploadedFile) return;
                            try {
                              const reader = new FileReader();
                              const dataUrl: string = await new Promise((resolve, reject) => {
                                reader.onerror = () => reject(new Error("Failed to read file"));
                                reader.onload = () => resolve(String(reader.result));
                                reader.readAsDataURL(uploadedFile);
                              });
                              setUploadedImage((prev) => {
                                if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
                                return dataUrl;
                              });
                            } catch (e) {
                              toast({
                                title: "Preview failed",
                                description:
                                  "We couldn't render this image preview. Try PNG/JPG/WebP.",
                                status: "error",
                                duration: 3500,
                                isClosable: true,
                                position: "top-right",
                              });
                            }
                          }}
                        />
                        <IconButton
                          aria-label="Remove"
                          icon={<FiX />}
                          size="sm"
                          position="absolute"
                          top={2}
                          right={2}
                          borderRadius="full"
                          bg="rgba(0,0,0,0.6)"
                          color="white"
                          _hover={{ bg: "rgba(0,0,0,0.8)" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReset();
                          }}
                        />
                        {!isVideoTool && (
                          <Button
                            size="sm"
                            position="absolute"
                            bottom={2}
                            left={2}
                            bg="rgba(0,0,0,0.7)"
                            color="white"
                            borderRadius="full"
                            fontFamily="'General Sans', 'Inter', sans-serif"
                            fontWeight="500"
                            fontSize="12px"
                            _hover={{ bg: "rgba(0,0,0,0.85)" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openCrop("uploaded");
                            }}
                          >
                            Crop
                          </Button>
                        )}
                      </>
                    ) : (
                      <VStack spacing={3}>
                        <Box
                          w="48px"
                          h="48px"
                          borderRadius="12px"
                          bg="rgba(134, 239, 172, 0.15)"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Icon as={FiUploadCloud} fontSize="24px" color="#86EFAC" />
                        </Box>
                        <VStack spacing={1}>
                          <Text fontSize="14px" fontWeight="500" color="#1a1a1a" fontFamily="'General Sans', 'Inter', sans-serif">
                            Click or drop an image here
                          </Text>
                          <Text fontSize="12px" color="#A1A1AA" fontFamily="'General Sans', 'Inter', sans-serif">
                            JPG, PNG or WEBP up to 10MB
                          </Text>
                        </VStack>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="#86EFAC"
                          color="#10B981"
                          borderRadius="full"
                          fontFamily="'General Sans', 'Inter', sans-serif"
                          fontWeight="500"
                          fontSize="13px"
                          _hover={{ bg: "rgba(134, 239, 172, 0.1)" }}
                        >
                          Choose File
                        </Button>
                      </VStack>
                    )}
                  </Box>
                </Box>
              )}

              {/* Prompt */}
              <Box>
                <Flex justify="space-between" align="center" mb={3}>
                  <Text fontSize="13px" fontWeight="600" color="#1a1a1a" fontFamily="'General Sans', 'Inter', sans-serif">
                    {mode === "image-to-image" ? "Additional Instructions" : "Prompt"}
                  </Text>
                  <Text fontSize="11px" color="#A1A1AA" fontFamily="'IBM Plex Mono', monospace">
                    {prompt.length}/500
                  </Text>
                </Flex>

                <Box position="relative">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                    placeholder={defaultPromptHint(mode)}
                    minH="120px"
                    borderRadius="14px"
                    border="1px solid #E5E5E5"
                    bg="#FAFAFA"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    fontSize="14px"
                    color="#1a1a1a"
                    _placeholder={{ color: "#A1A1AA" }}
                    _focus={{
                      borderColor: "#86EFAC",
                      bg: "white",
                      boxShadow: "0 0 0 3px rgba(134, 239, 172, 0.15)",
                    }}
                    resize="none"
                    pb={10}
                  />
                  <Button
                    size="sm"
                    position="absolute"
                    bottom={3}
                    right={3}
                    bg="black"
                    color="white"
                    borderRadius="full"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    fontWeight="500"
                    fontSize="12px"
                    leftIcon={<BsStars />}
                    onClick={enhancePrompt}
                    _hover={{ bg: "#1a1a1a" }}
                  >
                    Enhance
                  </Button>
                </Box>
              </Box>

              {/* Aspect Ratio */}
              <Box>
                <Text fontSize="13px" fontWeight="600" color="#1a1a1a" fontFamily="'General Sans', 'Inter', sans-serif" mb={3}>
                  Aspect Ratio
                </Text>
                <Flex wrap="wrap" gap={2}>
                  {(isVideoTool
                    ? (["16:9", "9:16"] as AspectRatio[])
                    : (["1:1", "3:2", "2:3", "16:9", "9:16"] as AspectRatio[])
                  ).map((ratio) => (
                    <Button
                      key={ratio}
                      size="sm"
                      variant={aspectRatio === ratio ? "solid" : "outline"}
                      bg={aspectRatio === ratio ? "black" : "transparent"}
                      color={aspectRatio === ratio ? "white" : "#52525B"}
                      borderColor="#E5E5E5"
                      borderRadius="10px"
                      fontFamily="'IBM Plex Mono', monospace"
                      fontWeight="500"
                      fontSize="12px"
                      flex={{ base: "1 1 30%", md: 1 }}
                      onClick={() => setAspectRatio(ratio)}
                      _hover={{
                        bg: aspectRatio === ratio ? "#1a1a1a" : "#F5F5F5",
                        borderColor: aspectRatio === ratio ? "#1a1a1a" : "#D4D4D4",
                      }}
                    >
                      {ratio}
                    </Button>
                  ))}
                </Flex>
              </Box>

              {/* Quality */}
              <Box>
                <Text fontSize="13px" fontWeight="600" color="#1a1a1a" fontFamily="'General Sans', 'Inter', sans-serif" mb={3}>
                  Quality
                </Text>
                <HStack spacing={2}>
                  {([
                    { value: "standard", label: "Standard" },
                    { value: "hd", label: "HD" },
                    { value: "ultra", label: "Ultra" },
                  ] as const).map((q) => (
                    <Button
                      key={q.value}
                      size="sm"
                      variant={quality === q.value ? "solid" : "outline"}
                      bg={quality === q.value ? "black" : "transparent"}
                      color={quality === q.value ? "white" : "#52525B"}
                      borderColor="#E5E5E5"
                      borderRadius="10px"
                      fontFamily="'General Sans', 'Inter', sans-serif"
                      fontWeight="500"
                      fontSize="12px"
                      flex={1}
                      onClick={() => setQuality(q.value)}
                      _hover={{
                        bg: quality === q.value ? "#1a1a1a" : "#F5F5F5",
                        borderColor: quality === q.value ? "#1a1a1a" : "#D4D4D4",
                      }}
                    >
                      {q.label}
                    </Button>
                  ))}
                </HStack>
              </Box>

              {/* Face Preservation Toggle (for Image-to-Image) */}
              {mode === "image-to-image" && (
                <Flex justify="space-between" align="center" p={4} bg="#FAFAFA" borderRadius="14px">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="13px" fontWeight="600" color="#1a1a1a" fontFamily="'General Sans', 'Inter', sans-serif">
                      Preserve Face
                    </Text>
                    <Text fontSize="12px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
                      Keep facial features recognizable
                    </Text>
                  </VStack>
                  <Switch isChecked={preserveFace} onChange={(e) => setPreserveFace(e.target.checked)} colorScheme="green" size="md" />
                </Flex>
              )}

              {/* Advanced Settings */}
              <Box>
                <Button
                  variant="ghost"
                  w="100%"
                  justifyContent="space-between"
                  color="#52525B"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="500"
                  fontSize="13px"
                  rightIcon={showAdvanced ? <FiChevronUp /> : <FiChevronDown />}
                  leftIcon={<FiSettings />}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  _hover={{ bg: "#F5F5F5" }}
                  borderRadius="10px"
                >
                  Advanced Settings
                </Button>

                <Collapse in={showAdvanced}>
                  <VStack spacing={4} mt={4} p={4} bg="#FAFAFA" borderRadius="14px">
                    <Box w="100%">
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="12px" fontWeight="500" color="#52525B" fontFamily="'General Sans', 'Inter', sans-serif">
                          Style Strength
                        </Text>
                        <Text fontSize="12px" color="#71717A" fontFamily="'IBM Plex Mono', monospace">
                          {styleStrength}%
                        </Text>
                      </Flex>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={styleStrength}
                        onChange={(e) => setStyleStrength(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#10B981" }}
                      />
                    </Box>

                    {!isVideoTool && (
                      <Box w="100%">
                        <Text fontSize="12px" fontWeight="500" color="#52525B" fontFamily="'General Sans', 'Inter', sans-serif" mb={2}>
                          Output Format
                        </Text>
                        <Select
                          size="sm"
                          borderRadius="10px"
                          fontFamily="'General Sans', 'Inter', sans-serif"
                          value={outputFormat}
                          onChange={(e) => setOutputFormat(e.target.value as "png" | "jpg" | "webp")}
                          color="#1a1a1a"
                          _focus={{ borderColor: "#10B981", boxShadow: "0 0 0 1px #10B981" }}
                        >
                          <option value="png">PNG</option>
                          <option value="jpg">JPG</option>
                          <option value="webp">WebP</option>
                        </Select>
                      </Box>
                    )}
                  </VStack>
                </Collapse>
              </Box>
            </VStack>
          </Box>

          {/* Animated Scroll Indicator */}
          <Box
            position="absolute"
            bottom="140px"
            left="50%"
            transform="translateX(-50%)"
            opacity={0.6}
            animation={`${float} 2s ease-in-out infinite`}
            pointerEvents="none"
          >
            <Icon as={FiChevronDown} color="#A1A1AA" fontSize="20px" />
          </Box>

          {/* Fixed Bottom Section - Generate Button */}
          <Box
            borderTop="1px solid #E5E5E5"
            bg="white"
            p={5}
            boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.05)"
          >
            <VStack spacing={3}>
              {/* Generate Button */}
              <Button
                w="100%"
                h="52px"
                bg={canGenerate ? "black" : "#E5E5E5"}
                color={canGenerate ? "white" : "#A1A1AA"}
                borderRadius="14px"
                fontFamily="'IBM Plex Mono', monospace"
                fontWeight="600"
                fontSize="14px"
                textTransform="uppercase"
                letterSpacing="0.5px"
                leftIcon={<Icon as={BsStars} />}
                onClick={handleGenerate}
                isLoading={isProcessing}
                loadingText="GENERATING..."
                isDisabled={!canGenerate || isRestrictedByDemo}
                _hover={{
                  bg: (canGenerate && !isRestrictedByDemo) ? "#1a1a1a" : "#E5E5E5",
                  transform: (canGenerate && !isRestrictedByDemo) ? "translateY(-1px)" : "none",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s ease"
              >
                Generate
              </Button>

              <Text fontSize="11px" color="#A1A1AA" fontFamily="'General Sans', 'Inter', sans-serif" textAlign="center">
                This will use {credits} credits
              </Text>
            </VStack>
          </Box>
        </Box>
      </Flex>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />

      {/* Crop Modal */}
      <Modal isOpen={isCropOpen} onClose={() => setIsCropOpen(false)} size="xl" isCentered>
        <ModalOverlay bg="rgba(0,0,0,0.4)" backdropFilter="blur(8px)" />
        <ModalContent borderRadius="20px" overflow="hidden">
          <ModalHeader fontFamily="'General Sans', 'Inter', sans-serif" fontWeight="600">
            Crop image
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box
              border="1px solid #E5E5E5"
              borderRadius="16px"
              overflow="hidden"
              bg="#FAFAFA"
            >
              <Cropper
                ref={cropperRef}
                src={cropTarget === "uploaded" ? uploadedImage || undefined : generatedImage || undefined}
                style={{ width: "100%", height: 420 }}
              />
            </Box>

            <HStack mt={4} justify="flex-end">
              <Button
                variant="ghost"
                onClick={() => setIsCropOpen(false)}
                color="#71717A"
                _hover={{ bg: "#F5F5F5", color: "#000000" }}
              >
                Cancel
              </Button>
              <Button bg="black" color="white" _hover={{ bg: "#1a1a1a" }} onClick={applyCrop}>
                Apply crop
              </Button>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}


