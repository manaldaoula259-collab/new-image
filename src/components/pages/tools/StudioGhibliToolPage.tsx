"use client";

import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  VStack,
  HStack,
  Badge,
  Spinner,
  useToast,
  keyframes,
  Image as ChakraImage,
  IconButton,
  Tooltip,
  Textarea,
  Select,
  Switch,
  Collapse,
} from "@chakra-ui/react";
import { useState, useCallback, useRef } from "react";
import {
  FiUploadCloud,
  FiDownload,
  FiRefreshCw,
  FiZap,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiImage,
  FiType,
  FiCrop,
  FiMaximize2,
  FiSettings,
  FiCopy,
  FiThumbsUp,
  FiThumbsDown,
  FiShare2,
} from "react-icons/fi";
import { BsStars } from "react-icons/bs";

// Animations
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

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

const StudioGhibliToolPage = () => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [mode, setMode] = useState<Mode>("image-to-image");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [quality, setQuality] = useState<Quality>("hd");
  const [preserveFace, setPreserveFace] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [styleStrength, setStyleStrength] = useState(75);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  // File handling
  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        status: "error",
        duration: 3000,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setGeneratedImage(null);
    };
    reader.readAsDataURL(file);
  }, [toast]);

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

  // Generate
  const handleGenerate = useCallback(async () => {
    if (mode === "image-to-image" && !uploadedImage) {
      toast({
        title: "No image uploaded",
        description: "Please upload an image first",
        status: "warning",
        duration: 3000,
      });
      return;
    }
    if (mode === "text-to-image" && !prompt.trim()) {
      toast({
        title: "No prompt provided",
        description: "Please describe what you want to create",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);

    try {
      if (mode !== "image-to-image") {
        throw new Error("Studio Ghibli currently supports Image to Image only.");
      }
      if (!uploadedImage) throw new Error("Please upload an image.");

      // Convert data URL to File for upload
      const blob = await (await fetch(uploadedImage)).blob();
      const fileToUpload = new File([blob], `upload-${Date.now()}.png`, { type: blob.type || "image/png" });

      const uploadFormData = new FormData();
      uploadFormData.append("file", fileToUpload);

      const uploadResponse = await fetch("/api/upload-image", { method: "POST", body: uploadFormData });
      if (!uploadResponse.ok) {
        const err = await uploadResponse.json().catch(() => ({}));
        throw new Error(err?.error || err?.details || "Failed to upload image.");
      }
      const { url: s3ImageUrl } = (await uploadResponse.json()) as { url: string };

      const response = await fetch("/api/ai-photo-converter/studio-ghibli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: s3ImageUrl,
          prompt,
          aspectRatio,
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || err?.details || "Ghibli generation failed.");
      }
      const data = (await response.json()) as { resultUrl?: string };
      if (!data?.resultUrl) throw new Error("No resultUrl returned by server.");

      setGeneratedImage(data.resultUrl);
      setFeedback(null); // Reset feedback for new generation
      toast({ title: "✨ Creation complete!", status: "success", duration: 3000 });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        status: "error",
        duration: 3500,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [mode, uploadedImage, prompt, aspectRatio, toast]);

  const handleReset = useCallback(() => {
    setUploadedImage(null);
    setGeneratedImage(null);
  }, []);

  const handleDownload = useCallback(() => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "ghibli-artwork.png";
    link.click();
  }, [generatedImage]);

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
          prompt: prompt || "Studio Ghibli Artwork",
          source: "studio-ghibli",
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
              title: "Studio Ghibli Artwork",
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
  }, [generatedImage, prompt, toast]);

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

  const enhancePrompt = useCallback(() => {
    if (!prompt.trim()) return;
    setPrompt(prompt + ", in the style of Studio Ghibli, soft watercolor, magical atmosphere, hand-painted anime aesthetic");
    toast({
      title: "Prompt enhanced!",
      status: "success",
      duration: 2000,
    });
  }, [prompt, toast]);

  const canGenerate = mode === "image-to-image" ? !!uploadedImage : !!prompt.trim();

  return (
    <Box minH="calc(100vh - 80px)" bg="#FAFAFA">
      {/* Top Header */}
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
              <Icon as={BsStars} color="white" fontSize="16px" />
            </Box>
            <Text
              fontSize="16px"
              fontWeight="600"
              color="#1a1a1a"
              fontFamily="'General Sans', 'Inter', sans-serif"
              display={{ base: "none", md: "block" }}
            >
              Studio Ghibli
            </Text>
          </HStack>

          {/* Mode Toggle */}
          <Box
            bg="#F5F5F5"
            borderRadius="full"
            p="3px"
            display="flex"
          >
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
            1 Credit
          </Badge>
        </HStack>
      </Flex>

      {/* Main Content - Split View */}
      <Flex h={{ base: "auto", lg: "calc(100vh - 140px)" }} flexDirection={{ base: "column", lg: "row" }}>
        {/* Left Side - Canvas/Output */}
        <Box
          flex={1}
          p={{ base: 4, lg: 6 }}
          display="flex"
          flexDirection="column"
          minH={{ base: "50vh", lg: "auto" }}
        >
          {/* Canvas Container */}
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
                <ChakraImage
                  src={generatedImage ?? undefined}
                  alt="Generated"
                  objectFit="contain"
                  maxH="100%"
                  maxW="100%"
                />

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
                    <IconButton
                      aria-label="Download"
                      icon={<FiDownload />}
                      size="sm"
                      variant="ghost"
                      color="white"
                      borderRadius="full"
                      onClick={handleDownload}
                      _hover={{ bg: "rgba(255,255,255,0.1)" }}
                    />
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
                    <IconButton
                      aria-label="Regenerate"
                      icon={<FiRefreshCw />}
                      size="sm"
                      variant="ghost"
                      color="white"
                      borderRadius="full"
                      onClick={handleGenerate}
                      _hover={{ bg: "rgba(255,255,255,0.1)" }}
                    />
                  </Tooltip>
                </HStack>
              </>
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
                  <Text
                    fontSize="16px"
                    fontWeight="600"
                    color="#1a1a1a"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                  >
                    Creating your Ghibli artwork...
                  </Text>
                  <Text
                    fontSize="13px"
                    color="#71717A"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                  >
                    This usually takes 10-20 seconds
                  </Text>
                </VStack>
              </VStack>
            )}

            {/* Empty State - Different based on mode */}
            {!generatedImage && !isProcessing && (
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
                  <Text
                    fontSize="18px"
                    fontWeight="600"
                    color="#1a1a1a"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    textAlign="center"
                  >
                    Your Ghibli creation will appear here
                  </Text>
                  <Text
                    fontSize="14px"
                    color="#71717A"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    textAlign="center"
                  >
                    {mode === "image-to-image"
                      ? "Upload an image to transform it into Ghibli style"
                      : "Describe your scene and watch it come to life"
                    }
                  </Text>
                </VStack>
              </VStack>
            )}
          </Box>

          {/* Bottom Quick Actions (shown when image exists) */}
          {generatedImage && (
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
                { icon: FiCrop, label: "Crop" },
                { icon: FiMaximize2, label: "Expand" },
                { icon: FiMaximize2, label: "Resize" },
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
          overflowY="auto"
          p={5}
          h={{ base: "auto", lg: "100%" }}
        >
          <VStack spacing={5} align="stretch">
            {/* Reference Image Upload (for Image-to-Image) */}
            {mode === "image-to-image" && (
              <Box>
                <Text
                  fontSize="13px"
                  fontWeight="600"
                  color="#1a1a1a"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  mb={3}
                >
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
                        src={uploadedImage ?? undefined}
                        alt="Uploaded"
                        w="100%"
                        h="180px"
                        objectFit="cover"
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
                        <Text
                          fontSize="14px"
                          fontWeight="500"
                          color="#1a1a1a"
                          fontFamily="'General Sans', 'Inter', sans-serif"
                        >
                          Click or drop an image here
                        </Text>
                        <Text
                          fontSize="12px"
                          color="#A1A1AA"
                          fontFamily="'General Sans', 'Inter', sans-serif"
                        >
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
                <Text
                  fontSize="13px"
                  fontWeight="600"
                  color="#1a1a1a"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                >
                  {mode === "image-to-image" ? "Additional Instructions" : "Prompt"}
                  {mode === "text-to-image" && (
                    <Text as="span" color="#EF4444" ml={1}>*</Text>
                  )}
                </Text>
                <Text
                  fontSize="11px"
                  color="#A1A1AA"
                  fontFamily="'IBM Plex Mono', monospace"
                >
                  {prompt.length}/500
                </Text>
              </Flex>

              <Box position="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                  placeholder={mode === "image-to-image"
                    ? "Describe any specific changes or style preferences..."
                    : "Describe your scene in detail. E.g., 'A cozy cottage on a hill surrounded by wildflowers, sunset lighting, peaceful atmosphere'"
                  }
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
              <Text
                fontSize="13px"
                fontWeight="600"
                color="#1a1a1a"
                fontFamily="'General Sans', 'Inter', sans-serif"
                mb={3}
              >
                Aspect Ratio
              </Text>
              <Flex wrap="wrap" gap={2}>
                {(["1:1", "3:2", "2:3", "16:9", "9:16"] as AspectRatio[]).map((ratio) => (
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
              <Text
                fontSize="13px"
                fontWeight="600"
                color="#1a1a1a"
                fontFamily="'General Sans', 'Inter', sans-serif"
                mb={3}
              >
                Quality
              </Text>
              <Flex wrap="wrap" gap={2}>
                {([
                  { value: "standard", label: "Standard", credits: 3 },
                  { value: "hd", label: "HD", credits: 5 },
                  { value: "ultra", label: "Ultra", credits: 8 },
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
                    flex={{ base: "1 1 auto", md: 1 }}
                    onClick={() => setQuality(q.value)}
                    _hover={{
                      bg: quality === q.value ? "#1a1a1a" : "#F5F5F5",
                      borderColor: quality === q.value ? "#1a1a1a" : "#D4D4D4",
                    }}
                  >
                    {q.label}
                  </Button>
                ))}
              </Flex>
            </Box>

            {/* Face Preservation Toggle (for Image-to-Image) */}
            {mode === "image-to-image" && (
              <Flex
                justify="space-between"
                align="center"
                p={4}
                bg="#FAFAFA"
                borderRadius="14px"
              >
                <VStack align="start" spacing={0}>
                  <Text
                    fontSize="13px"
                    fontWeight="600"
                    color="#1a1a1a"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                  >
                    Preserve Face
                  </Text>
                  <Text
                    fontSize="12px"
                    color="#71717A"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                  >
                    Keep facial features recognizable
                  </Text>
                </VStack>
                <Switch
                  isChecked={preserveFace}
                  onChange={(e) => setPreserveFace(e.target.checked)}
                  colorScheme="green"
                  size="md"
                />
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
                      style={{
                        width: "100%",
                        accentColor: "#10B981",
                      }}
                    />
                  </Box>

                  <Box w="100%">
                    <Text fontSize="12px" fontWeight="500" color="#52525B" fontFamily="'General Sans', 'Inter', sans-serif" mb={2}>
                      Output Format
                    </Text>
                    <Select
                      size="sm"
                      borderRadius="10px"
                      fontFamily="'General Sans', 'Inter', sans-serif"
                      defaultValue="png"
                    >
                      <option value="png">PNG</option>
                      <option value="jpg">JPG</option>
                      <option value="webp">WebP</option>
                    </Select>
                  </Box>
                </VStack>
              </Collapse>
            </Box>

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
              isDisabled={!canGenerate}
              _hover={{
                bg: canGenerate ? "#1a1a1a" : "#E5E5E5",
                transform: canGenerate ? "translateY(-1px)" : "none",
              }}
              _active={{
                transform: "translateY(0)",
              }}
              transition="all 0.2s ease"
            >
              Generate
            </Button>

            {/* Credits info */}
            <Text
              fontSize="11px"
              color="#A1A1AA"
              fontFamily="'General Sans', 'Inter', sans-serif"
              textAlign="center"
            >
              This will use 1 credit
            </Text>
          </VStack>
        </Box>
      </Flex>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />
    </Box >
  );
};

export default StudioGhibliToolPage;
