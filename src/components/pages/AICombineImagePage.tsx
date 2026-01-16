"use client";

import { createPreviewMedia } from "@/core/utils/upload";
import {
  Box,
  Button,
  Center,
  HStack,
  Icon,
  Image,
  SimpleGrid,
  Text,
  VStack,
  useToast,
  IconButton,
  Badge,
  Spinner,
  Textarea,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  BsLayers,
  BsDownload,
  BsX,
  BsArrowUp,
  BsCheckCircle,
  BsBookmarkPlus,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { useQueryClient } from "react-query";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "../layout/PageContainer";

type FilePreview = (File | Blob) & { preview: string };

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const DEFAULT_RESULT_FILENAME = "ai-combine-image.jpg";

const deriveFileNameFromUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    const segment = parsed.pathname.split("/").filter((x) => x).pop();
    if (segment && segment.includes(".")) {
      return decodeURIComponent(segment);
    }
  } catch {
    // ignore malformed URLs
  }
  return DEFAULT_RESULT_FILENAME;
};

const AICombineImagePage = () => {
  const [uploadedImages, setUploadedImages] = useState<FilePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState(DEFAULT_RESULT_FILENAME);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingToLibrary, setIsSavingToLibrary] = useState(false);
  const [isSavedToLibrary, setIsSavedToLibrary] = useState(false);
  const [mergePrompt, setMergePrompt] = useState<string>("");

  const toast = useToast();
  const queryClient = useQueryClient();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
      "image/webp": [".webp"],
    },
    maxSize: 10000000,
    multiple: true,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const previews = acceptedFiles.map((file) => createPreviewMedia(file));
        setUploadedImages((prev) => [...prev, ...previews]);
        setResultUrl(null);
        setResultFileName(DEFAULT_RESULT_FILENAME);
        setIsSavedToLibrary(false);
      }
    },
    onDropRejected: () => {
      toast({
        title: "Invalid file",
        description: "Please upload PNG, JPEG, or WebP images (max 10MB each)",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    },
  });

  const handleRemoveImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    if (uploadedImages[index]?.preview) {
      URL.revokeObjectURL(uploadedImages[index].preview);
    }
    setUploadedImages(newImages);
    if (newImages.length === 0) {
      setResultUrl(null);
      setResultFileName(DEFAULT_RESULT_FILENAME);
      setIsSavedToLibrary(false);
    }
  };

  const handleClearAll = () => {
    uploadedImages.forEach((img) => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    setUploadedImages([]);
    setResultUrl(null);
    setResultFileName(DEFAULT_RESULT_FILENAME);
    setIsSavedToLibrary(false);
    setMergePrompt("");
  };

  const handleConvert = async () => {
    if (!isLoaded) {
      toast({
        title: "Please wait",
        description: "Checking authentication status...",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (!isSignedIn) {
      toast({
        title: "Sign in required",
        description: "Please sign in to use this feature.",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
      // Delay redirect to allow toast to show
      setTimeout(() => {
        router.push("/login");
      }, 100);
      return;
    }

    if (uploadedImages.length === 0) {
      toast({
        title: "No images uploaded",
        description: "Upload at least one image to combine.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setIsProcessing(true);
    setConversionProgress(0);
    setResultUrl(null);
    setResultFileName(DEFAULT_RESULT_FILENAME);
    setIsSavedToLibrary(false);

    let progressInterval: ReturnType<typeof setInterval> | null = null;

    try {
      progressInterval = setInterval(() => {
        setConversionProgress((prev) => {
          if (prev >= 90) {
            if (progressInterval) {
              clearInterval(progressInterval);
              progressInterval = null;
            }
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Upload all images to S3
      const uploadPromises = uploadedImages.map(async (img) => {
        const fileToUpload =
          img instanceof File
            ? img
            : new File(
                [img as Blob],
                `upload-${Date.now()}-${Math.random()}.png`,
                { type: (img as Blob).type || "image/png" }
              );

        const uploadFormData = new FormData();
        uploadFormData.append("file", fileToUpload);

        const uploadResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload image: ${fileToUpload.name}`);
        }

        const { url } = (await uploadResponse.json()) as { url: string };
        return url;
      });

      const s3ImageUrls = await Promise.all(uploadPromises);

      // Pass S3 URLs to combine API
      const response = await fetch("/api/ai-image-editor/ai-combine-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrls: s3ImageUrls,
          prompt: mergePrompt.trim() || undefined,
        }),
      });

      if (!response.ok) {
        let message = "The image combination service returned an unexpected error.";
        try {
          const errorPayload = await response.json();
          if (errorPayload?.error) {
            message = errorPayload.error;
          } else if (errorPayload?.details) {
            message = errorPayload.details;
          }
        } catch {
          // ignore JSON parsing issues
        }
        throw new Error(message);
      }

      const data = (await response.json()) as {
        resultUrl?: string;
        prompt?: string;
      };

      if (!data?.resultUrl) {
        throw new Error("The image combination service did not return a result URL.");
      }

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      setConversionProgress(100);
      setResultUrl(data.resultUrl);
      setResultFileName(deriveFileNameFromUrl(data.resultUrl));

      toast({
        title: "Images combined successfully!",
        description: "Your merged image is ready to download.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      toast({
        title: "Image combination failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setIsProcessing(false);
      setTimeout(() => setConversionProgress(0), 1000);
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    setIsDownloading(true);
    try {
      const response = await fetch(resultUrl);
      if (!response.ok) {
        throw new Error("Unable to download the combined image.");
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = resultFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      window.open(resultUrl, "_blank", "noopener,noreferrer");
      toast({
        title: "Opened result in new tab",
        description: "We opened the combined image in a new tab so you can download it manually.",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!resultUrl || isSavingToLibrary || isSavedToLibrary) return;
    setIsSavingToLibrary(true);
    try {
      const response = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: resultUrl,
          prompt: mergePrompt.trim() || "AI Combine Image - Merged images",
          source: "ai-combine-image",
        }),
      });
      if (!response.ok) {
        let message = "Failed to save image to your library.";
        try {
          const errorPayload = await response.json();
          if (errorPayload?.error) message = errorPayload.error;
          else if (errorPayload?.details) message = errorPayload.details;
          else if (errorPayload?.message) message = errorPayload.message;
        } catch {
          // ignore parsing errors
        }
        throw new Error(message);
      }
      const payload = await response.json().catch(() => null);
      
      // Invalidate the media query cache to refresh the media page
      queryClient.invalidateQueries(["recent-media"]);
      
      toast({
        title: payload?.message ?? "Saved to Media Library",
        description: "You can find it anytime under Dashboard → Media.",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
      setIsSavedToLibrary(true);
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Unable to save this image. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsSavingToLibrary(false);
    }
  };

  return (
    <Box bg="var(--bg-canvas)" minH="100vh" width="100%">
      <PageContainer>
        <VStack spacing={12} width="100%" align="stretch" pb={16}>
          <MotionVStack
            spacing={5}
            align="center"
            textAlign="center"
            pt={0}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Text
              fontSize={{ base: "clamp(1.75rem, 4vw + 1rem, 2.75rem)", md: "2.75rem" }}
              fontWeight="900"
              letterSpacing="-0.03em"
              color="white"
              lineHeight="1.1"
              bgGradient="linear(to-r, white, rgba(255,255,255,0.8))"
              bgClip="text"
            >
              AI Combine Image
            </Text>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="var(--text-muted)"
              maxW="3xl"
              lineHeight="1.7"
              px={4}
              fontWeight="400"
            >
              Merge images and layers with AI-powered editing. Achieve seamless structural match and consistent styling in just a few clicks.
            </Text>
          </MotionVStack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} width="100%" maxW="7xl" mx="auto">
            <MotionBox
              borderRadius="2xl"
              overflow="hidden"
              bgGradient="linear(150deg, rgba(20, 30, 50, 0.95) 0%, rgba(25, 35, 55, 0.95) 50%, rgba(30, 40, 60, 0.92) 100%)"
              border="1px solid rgba(59, 130, 246, 0.16)"
              boxShadow="0 25px 90px rgba(37, 99, 235, 0.55)"
              minH={{ base: "350px", lg: "550px" }}
              position="relative"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              _hover={{ boxShadow: "0 30px 110px rgba(37, 99, 235, 0.65)" }}
            >
              {uploadedImages.length > 0 ? (
                <VStack p={4} spacing={4} minH="550px" align="stretch">
                  <HStack justify="space-between">
                    <Badge colorScheme="blue" px={4} py={2} borderRadius="full" fontSize="sm">
                      {uploadedImages.length} image{uploadedImages.length > 1 ? "s" : ""} uploaded
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={handleClearAll}
                      leftIcon={<BsX />}
                    >
                      Clear All
                    </Button>
                  </HStack>
                  <Wrap spacing={4}>
                    {uploadedImages.map((img, index) => (
                      <WrapItem key={index} position="relative">
                        <Box
                          borderRadius="xl"
                          overflow="hidden"
                          border="2px solid rgba(59, 130, 246, 0.3)"
                          width="150px"
                          height="150px"
                        >
                          <Image
                            src={img.preview}
                            alt={`Uploaded image ${index + 1}`}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                          />
                        </Box>
                        <IconButton
                          aria-label="Remove image"
                          icon={<BsX />}
                          position="absolute"
                          top={-2}
                          right={-2}
                          size="sm"
                          borderRadius="full"
                          bg="rgba(239, 68, 68, 0.9)"
                          color="white"
                          onClick={() => handleRemoveImage(index)}
                        />
                      </WrapItem>
                    ))}
                  </Wrap>
                </VStack>
              ) : (
                <Center
                  minH="550px"
                  bgGradient="linear(165deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 50, 0.92) 55%, rgba(25, 35, 55, 0.9) 100%)"
                  flexDirection="column"
                  p={8}
                >
                  <Box
                    width="140px"
                    height="140px"
                    borderRadius="full"
                    bgGradient="linear(135deg, #3b82f6 0%, #2563eb 55%, #1d4ed8 100%)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow="0 28px 75px rgba(37, 99, 235, 0.45)"
                    mb={6}
                  >
                    <Icon as={BsLayers} fontSize="4xl" color="white" />
                  </Box>
                  <Text fontSize="xl" fontWeight="700" color="white" textAlign="center">
                    Upload Images to Combine
                  </Text>
                  <Text fontSize="sm" color="rgba(226, 232, 240, 0.75)" textAlign="center" maxW="sm" mt={2}>
                    Upload multiple images to merge them together.
                  </Text>
                </Center>
              )}
            </MotionBox>

            <MotionBox
              borderRadius="2xl"
              bg="rgba(15, 23, 42, 0.95)"
              border="1px solid rgba(59, 130, 246, 0.18)"
              boxShadow="0 25px 90px rgba(37, 99, 235, 0.55)"
              p={8}
              display="flex"
              flexDirection="column"
              justifyContent="center"
              minH={{ base: "350px", lg: "550px" }}
              position="relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              overflow="hidden"
              _before={{
                content: '""',
                position: "absolute",
                inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.08) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(37, 99, 235, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: "28px 28px",
                borderRadius: "2xl",
                pointerEvents: "none",
              }}
              _after={{
                content: '""',
                position: "absolute",
                inset: 0,
                background: isDragActive
                  ? "radial-gradient(circle at center, rgba(59, 130, 246, 0.12) 0%, transparent 70%)"
                  : "none",
                borderRadius: "2xl",
                pointerEvents: "none",
                transition: "all 0.3s",
              }}
            >
              <Center
                {...getRootProps()}
                flexDirection="column"
                cursor="pointer"
                p={6}
                borderRadius="xl"
                transition="all 300ms cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{ bg: "rgba(59, 130, 246, 0.12)" }}
                position="relative"
                zIndex={1}
              >
                <input {...getInputProps()} />
                <MotionBox
                  width="120px"
                  height="120px"
                  borderRadius="full"
                  bgGradient="linear(135deg, #3b82f6 0%, #2563eb 45%, #1d4ed8 100%)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 30px 85px rgba(37, 99, 235, 0.45)"
                  mb={6}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    isDragActive
                      ? {
                          scale: [1, 1.1, 1],
                          rotate: [0, 10, -10, 0],
                        }
                      : {
                          scale: 1,
                          rotate: 0,
                        }
                  }
                  transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
                >
                  <Icon as={BsArrowUp} fontSize="5xl" color="white" />
                </MotionBox>
                <Text fontSize="lg" fontWeight="700" color="white" mb={2} textAlign="center">
                  {isDragActive ? "Drop your images here" : "Click or drag here to upload images"}
                </Text>
                <Text fontSize="sm" color="var(--text-muted)" textAlign="center" maxW="xs">
                  PNG, JPEG, WebP supported (max 10MB each)
                </Text>
              </Center>

              <VStack spacing={4} mt={6} position="relative" zIndex={1}>
                <Text fontSize="sm" fontWeight="600" color="white" textAlign="left" width="100%">
                  Merge instructions (optional)
                </Text>
                <Textarea
                  placeholder="e.g., Blend the images together, create a collage, merge horizontally..."
                  value={mergePrompt}
                  onChange={(e) => setMergePrompt(e.target.value)}
                  bg="rgba(30, 41, 59, 0.8)"
                  border="1px solid rgba(59, 130, 246, 0.3)"
                  color="white"
                  _placeholder={{ color: "rgba(226, 232, 240, 0.5)" }}
                  _hover={{ borderColor: "rgba(59, 130, 246, 0.5)" }}
                  _focus={{ borderColor: "#3b82f6", boxShadow: "0 0 0 1px #3b82f6" }}
                  minH="80px"
                  resize="vertical"
                />
              </VStack>

              <Button
                size="lg"
                width="100%"
                mt={6}
                bgGradient="linear(135deg, #3b82f6 0%, #2563eb 45%, #1d4ed8 100%)"
                color="white"
                borderRadius="full"
                onClick={handleConvert}
                isLoading={isProcessing}
                isDisabled={!isLoaded || !isSignedIn || uploadedImages.length === 0 || isProcessing}
                leftIcon={<Icon as={BsLayers} />}
                fontSize="md"
                fontWeight="700"
                height="60px"
                boxShadow="0 30px 80px rgba(37, 99, 235, 0.45)"
                _hover={{
                  bgGradient: "linear(135deg, #2563eb 0%, #1d4ed8 45%, #1e40af 100%)",
                  boxShadow: "0 36px 94px rgba(37, 99, 235, 0.55)",
                  transform: "translateY(-3px)",
                }}
                _disabled={{
                  opacity: 0.5,
                  cursor: "not-allowed",
                  _hover: { transform: "none" },
                }}
                position="relative"
                zIndex={1}
                transition="all 0.3s"
              >
                {isProcessing ? `Combining images... ${conversionProgress}%` : "Combine Images"}
              </Button>
            </MotionBox>
          </SimpleGrid>

          <AnimatePresence>
            {resultUrl && (
              <MotionBox
                bgGradient="linear(150deg, rgba(15, 23, 42, 0.96) 0%, rgba(20, 30, 50, 0.94) 55%, rgba(25, 35, 55, 0.92) 100%)"
                border="1px solid rgba(59, 130, 246, 0.18)"
                borderRadius="2xl"
                padding={8}
                boxShadow="0 38px 95px rgba(37, 99, 235, 0.35)"
                position="relative"
                overflow="hidden"
                maxW="5xl"
                mx="auto"
                width="100%"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                _before={{
                  content: '""',
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at top, rgba(59, 130, 246, 0.2) 0, rgba(59, 130, 246, 0) 70%)",
                  pointerEvents: "none",
                }}
              >
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
                    <HStack spacing={3}>
                      <Box
                        width="40px"
                        height="40px"
                        borderRadius="full"
                        bgGradient="linear(135deg, #3b82f6 0%, #2563eb 100%)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={HiSparkles} color="white" fontSize="xl" />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xl" fontWeight="700" color="var(--text-primary)">
                          Images Combined Successfully!
                        </Text>
                        <Text fontSize="sm" color="var(--text-muted)">
                          Download your merged image or combine more
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack spacing={3}>
                      <Button
                        size="md"
                        leftIcon={<BsBookmarkPlus />}
                        onClick={handleSaveToLibrary}
                        variant="outline"
                        colorScheme="blue"
                        isDisabled={!resultUrl || isSavingToLibrary || isSavedToLibrary}
                        isLoading={isSavingToLibrary}
                      >
                        {isSavedToLibrary ? "Saved to Library" : "Save to Library"}
                      </Button>
                      <Button
                        size="md"
                        leftIcon={<BsDownload />}
                        onClick={handleDownload}
                        bgGradient="linear(135deg, #3b82f6 0%, #2563eb 100%)"
                        color="white"
                        isLoading={isDownloading}
                        loadingText="Preparing..."
                        isDisabled={!resultUrl || isDownloading}
                        _hover={{ bgGradient: "linear(135deg, #2563eb 0%, #1d4ed8 100%)" }}
                      >
                        Download
                      </Button>
                    </HStack>
                  </HStack>
                  <Box
                    borderRadius="xl"
                    overflow="hidden"
                    border="1px solid rgba(59, 130, 246, 0.18)"
                    bg="rgba(30, 41, 59, 0.88)"
                    minH="320px"
                    maxH="500px"
                    position="relative"
                  >
                    <Image
                      src={resultUrl}
                      alt="Combined result"
                      width="100%"
                      height="100%"
                      objectFit="contain"
                    />
                    <Box
                      position="absolute"
                      inset={0}
                      background="linear-gradient(180deg, rgba(8, 14, 26, 0) 0%, rgba(8, 14, 26, 0.78) 100%)"
                    />
                    <VStack
                      position="absolute"
                      bottom={4}
                      left={4}
                      right={4}
                      align="flex-start"
                      spacing={2}
                      zIndex={1}
                    >
                      <Badge
                        bgGradient="linear(135deg, #3b82f6 0%, #2563eb 100%)"
                        color="white"
                        px={4}
                        py={1.5}
                        borderRadius="full"
                        fontSize="xs"
                        textTransform="uppercase"
                        letterSpacing="0.08em"
                      >
                        {resultFileName}
                      </Badge>
                      <Badge colorScheme="green" px={4} py={1.5} borderRadius="full" fontSize="xs">
                        Ready to Download
                      </Badge>
                    </VStack>
                  </Box>
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>
        </VStack>
      </PageContainer>
    </Box>
  );
};

export default AICombineImagePage;

