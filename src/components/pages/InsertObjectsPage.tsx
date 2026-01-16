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
  Textarea,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  BsPlusCircle,
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

const DEFAULT_RESULT_FILENAME = "insert-objects.jpg";

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

const InsertObjectsPage = () => {
  const [uploadedImage, setUploadedImage] = useState<FilePreview | null>(null);
  const [referenceImage, setReferenceImage] = useState<FilePreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState(DEFAULT_RESULT_FILENAME);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingToLibrary, setIsSavingToLibrary] = useState(false);
  const [isSavedToLibrary, setIsSavedToLibrary] = useState(false);
  const [objectDescription, setObjectDescription] = useState<string>("");
  const [lastPrompt, setLastPrompt] = useState<string>("");

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
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles?.[0]) {
        const preview = createPreviewMedia(acceptedFiles[0]);
        setUploadedImage(preview);
        setResultUrl(null);
        setResultFileName(DEFAULT_RESULT_FILENAME);
        setIsSavedToLibrary(false);
      }
    },
    onDropRejected: () => {
      toast({
        title: "Invalid file",
        description: "Please upload a PNG, JPEG, or WebP image (max 10MB)",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    },
  });

  const referenceDropzone = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
      "image/webp": [".webp"],
    },
    maxSize: 10000000,
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles?.[0]) {
        const preview = createPreviewMedia(acceptedFiles[0]);
        setReferenceImage(preview);
      }
    },
    onDropRejected: () => {
      toast({
        title: "Invalid file",
        description: "Please upload a PNG, JPEG, or WebP image (max 10MB)",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    },
  });

  const handleRemoveImage = () => {
    if (uploadedImage?.preview) {
      URL.revokeObjectURL(uploadedImage.preview);
    }
    setUploadedImage(null);
    setResultUrl(null);
    setResultFileName(DEFAULT_RESULT_FILENAME);
    setIsSavedToLibrary(false);
    setObjectDescription("");
  };

  const handleRemoveReference = () => {
    if (referenceImage?.preview) {
      URL.revokeObjectURL(referenceImage.preview);
    }
    setReferenceImage(null);
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

    if (!uploadedImage) {
      toast({
        title: "No image uploaded",
        description: "Upload an image to insert objects into it.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (!objectDescription.trim()) {
      toast({
        title: "Object description required",
        description: "Please describe what object you want to insert into the image.",
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

      const fileToUpload =
        uploadedImage instanceof File
          ? uploadedImage
          : new File(
              [uploadedImage as Blob],
              `upload-${Date.now()}.png`,
              { type: (uploadedImage as Blob).type || "image/png" }
            );

      const uploadFormData = new FormData();
      uploadFormData.append("file", fileToUpload);

      const uploadResponse = await fetch("/api/upload-image", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        let message = "Failed to upload image to S3.";
        try {
          const errorPayload = await uploadResponse.json();
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

      const { url: s3ImageUrl } = (await uploadResponse.json()) as { url: string };

      // Upload reference image if provided
      let referenceImageUrl: string | undefined;
      if (referenceImage) {
        const refFileToUpload =
          referenceImage instanceof File
            ? referenceImage
            : new File(
                [referenceImage as Blob],
                `reference-${Date.now()}.png`,
                { type: (referenceImage as Blob).type || "image/png" }
              );

        const refUploadFormData = new FormData();
        refUploadFormData.append("file", refFileToUpload);

        const refUploadResponse = await fetch("/api/upload-image", {
          method: "POST",
          body: refUploadFormData,
        });

        if (refUploadResponse.ok) {
          const { url } = (await refUploadResponse.json()) as { url: string };
          referenceImageUrl = url;
        }
      }

      const response = await fetch("/api/ai-image-editor/insert-objects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: s3ImageUrl,
          prompt: objectDescription.trim(),
          referenceImageUrl: referenceImageUrl,
        }),
      });

      if (!response.ok) {
        let message = "The object insertion service returned an unexpected error.";
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
        throw new Error("The object insertion service did not return a result URL.");
      }

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      setConversionProgress(100);
      setResultUrl(data.resultUrl);
      setResultFileName(deriveFileNameFromUrl(data.resultUrl));
      setLastPrompt(data.prompt || objectDescription.trim());

      toast({
        title: "Object inserted successfully!",
        description: "Your edited image is ready to download.",
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
        title: "Object insertion failed",
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
        throw new Error("Unable to download the edited image.");
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
        description: "We opened the edited image in a new tab so you can download it manually.",
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
          prompt: lastPrompt || "Insert objects into image",
          source: "insert-objects",
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

  const currentImage = uploadedImage?.preview;
  const currentReference = referenceImage?.preview;

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
              Insert Objects
            </Text>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="var(--text-muted)"
              maxW="3xl"
              lineHeight="1.7"
              px={4}
              fontWeight="400"
            >
              Add objects to your photos using visual references. Create more dynamic and personalized images with AI-powered object insertion.
            </Text>
          </MotionVStack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8} width="100%" maxW="7xl" mx="auto">
            <MotionBox
              borderRadius="2xl"
              overflow="hidden"
              bgGradient="linear(150deg, rgba(20, 30, 50, 0.95) 0%, rgba(25, 35, 55, 0.95) 50%, rgba(30, 40, 60, 0.92) 100%)"
              border="1px solid rgba(234, 179, 8, 0.16)"
              boxShadow="0 25px 90px rgba(202, 138, 4, 0.55)"
              minH={{ base: "350px", lg: "550px" }}
              position="relative"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              _hover={{ boxShadow: "0 30px 110px rgba(202, 138, 4, 0.65)" }}
            >
              <AnimatePresence mode="wait">
                {currentImage ? (
                  <MotionBox
                    key="image"
                    position="relative"
                    width="100%"
                    height="100%"
                    minH="550px"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Image
                      src={currentImage}
                      alt="Uploaded image"
                      width="100%"
                      height="100%"
                      objectFit="cover"
                    />
                    <IconButton
                      aria-label="Remove image"
                      icon={<BsX />}
                      position="absolute"
                      top={4}
                      right={4}
                      size="md"
                      borderRadius="full"
                      bg="rgba(0, 0, 0, 0.7)"
                      backdropFilter="blur(12px)"
                      color="white"
                      _hover={{ bg: "rgba(0, 0, 0, 0.9)", transform: "scale(1.1)" }}
                      onClick={handleRemoveImage}
                      transition="all 0.2s"
                    />
                    <Badge
                      position="absolute"
                      bottom={4}
                      left={4}
                      bg="rgba(30, 41, 59, 0.9)"
                      backdropFilter="blur(12px)"
                      color="white"
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="600"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Icon as={BsCheckCircle} color="#eab308" />
                      Image Ready
                    </Badge>
                  </MotionBox>
                ) : (
                  <MotionBox
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Center
                      minH="550px"
                      bgGradient="linear(165deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 50, 0.92) 55%, rgba(25, 35, 55, 0.9) 100%)"
                      flexDirection="column"
                      p={8}
                      position="relative"
                      overflow="hidden"
                    >
                      <Box
                        width="140px"
                        height="140px"
                        borderRadius="full"
                        bgGradient="linear(135deg, #eab308 0%, #caa004 55%, #a16207 100%)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow="0 28px 75px rgba(202, 138, 4, 0.45)"
                        mb={6}
                      >
                        <Icon as={BsPlusCircle} fontSize="4xl" color="white" />
                      </Box>
                      <Text fontSize="xl" fontWeight="700" color="white" textAlign="center">
                        Image Preview Area
                      </Text>
                      <Text fontSize="sm" color="rgba(226, 232, 240, 0.75)" textAlign="center" maxW="sm" mt={2}>
                        Upload an image to insert objects into it.
                      </Text>
                    </Center>
                  </MotionBox>
                )}
              </AnimatePresence>
            </MotionBox>

            <MotionBox
              borderRadius="2xl"
              bg="rgba(15, 23, 42, 0.95)"
              border="1px solid rgba(234, 179, 8, 0.18)"
              boxShadow="0 25px 90px rgba(202, 138, 4, 0.55)"
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
                  linear-gradient(rgba(234, 179, 8, 0.08) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(202, 138, 4, 0.08) 1px, transparent 1px)
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
                  ? "radial-gradient(circle at center, rgba(234, 179, 8, 0.12) 0%, transparent 70%)"
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
                _hover={{ bg: "rgba(234, 179, 8, 0.12)" }}
                position="relative"
                zIndex={1}
              >
                <input {...getInputProps()} />
                <MotionBox
                  width="120px"
                  height="120px"
                  borderRadius="full"
                  bgGradient="linear(135deg, #eab308 0%, #caa004 45%, #a16207 100%)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 30px 85px rgba(202, 138, 4, 0.45)"
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
                  {isDragActive ? "Drop your image here" : "Click or drag here to upload images"}
                </Text>
                <Text fontSize="sm" color="var(--text-muted)" textAlign="center" maxW="xs">
                  PNG, JPEG, WebP supported (max 10MB)
                </Text>
              </Center>

              {/* Reference Image Upload */}
              <VStack spacing={4} mt={6} position="relative" zIndex={1}>
                <Text fontSize="sm" fontWeight="600" color="white" textAlign="left" width="100%">
                  Visual Reference (Optional)
                </Text>
                {currentReference ? (
                  <Box position="relative" width="100%">
                    <Image
                      src={currentReference}
                      alt="Reference image"
                      borderRadius="xl"
                      maxH="120px"
                      objectFit="cover"
                      width="100%"
                    />
                    <IconButton
                      aria-label="Remove reference"
                      icon={<BsX />}
                      position="absolute"
                      top={2}
                      right={2}
                      size="sm"
                      borderRadius="full"
                      bg="rgba(239, 68, 68, 0.9)"
                      color="white"
                      onClick={handleRemoveReference}
                    />
                  </Box>
                ) : (
                  <Center
                    {...referenceDropzone.getRootProps()}
                    border="2px dashed rgba(234, 179, 8, 0.3)"
                    borderRadius="xl"
                    p={6}
                    cursor="pointer"
                    _hover={{ borderColor: "rgba(234, 179, 8, 0.5)", bg: "rgba(234, 179, 8, 0.05)" }}
                    transition="all 0.2s"
                  >
                    <input {...referenceDropzone.getInputProps()} />
                    <VStack spacing={2}>
                      <Icon as={BsPlusCircle} fontSize="2xl" color="rgba(234, 179, 8, 0.7)" />
                      <Text fontSize="xs" color="var(--text-muted)" textAlign="center">
                        Upload reference image (optional)
                      </Text>
                    </VStack>
                  </Center>
                )}
              </VStack>

              {/* Object Description Input */}
              <VStack spacing={4} mt={6} position="relative" zIndex={1}>
                <Text fontSize="sm" fontWeight="600" color="white" textAlign="left" width="100%">
                  Describe the object to insert
                </Text>
                <Textarea
                  placeholder="e.g., a red car, a golden retriever, a beautiful sunset, a flying bird..."
                  value={objectDescription}
                  onChange={(e) => setObjectDescription(e.target.value)}
                  bg="rgba(30, 41, 59, 0.8)"
                  border="1px solid rgba(234, 179, 8, 0.3)"
                  color="white"
                  _placeholder={{ color: "rgba(226, 232, 240, 0.5)" }}
                  _hover={{ borderColor: "rgba(234, 179, 8, 0.5)" }}
                  _focus={{ borderColor: "#eab308", boxShadow: "0 0 0 1px #eab308" }}
                  minH="100px"
                  resize="vertical"
                />
                <Text fontSize="xs" color="var(--text-muted)" textAlign="left" width="100%">
                  Be specific about what object you want to insert and where it should appear.
                </Text>
              </VStack>

              <Button
                size="lg"
                width="100%"
                mt={6}
                bgGradient="linear(135deg, #eab308 0%, #caa004 45%, #a16207 100%)"
                color="white"
                borderRadius="full"
                onClick={handleConvert}
                isLoading={isProcessing}
                isDisabled={!isLoaded || !isSignedIn || !currentImage || !objectDescription.trim() || isProcessing}
                leftIcon={<Icon as={BsPlusCircle} />}
                fontSize="md"
                fontWeight="700"
                height="60px"
                boxShadow="0 30px 80px rgba(202, 138, 4, 0.45)"
                _hover={{
                  bgGradient: "linear(135deg, #caa004 0%, #a16207 45%, #854d0e 100%)",
                  boxShadow: "0 36px 94px rgba(202, 138, 4, 0.55)",
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
                {isProcessing ? `Inserting object... ${conversionProgress}%` : "Insert Object"}
              </Button>
            </MotionBox>
          </SimpleGrid>

          <AnimatePresence>
            {resultUrl && (
              <MotionBox
                bgGradient="linear(150deg, rgba(15, 23, 42, 0.96) 0%, rgba(20, 30, 50, 0.94) 55%, rgba(25, 35, 55, 0.92) 100%)"
                border="1px solid rgba(234, 179, 8, 0.18)"
                borderRadius="2xl"
                padding={8}
                boxShadow="0 38px 95px rgba(202, 138, 4, 0.35)"
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
                  background: "radial-gradient(circle at top, rgba(234, 179, 8, 0.2) 0, rgba(234, 179, 8, 0) 70%)",
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
                        bgGradient="linear(135deg, #eab308 0%, #caa004 100%)"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Icon as={HiSparkles} color="white" fontSize="xl" />
                      </Box>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xl" fontWeight="700" color="var(--text-primary)">
                          Object Inserted Successfully!
                        </Text>
                        <Text fontSize="sm" color="var(--text-muted)">
                          Download your edited image or insert more objects
                        </Text>
                      </VStack>
                    </HStack>
                    <HStack spacing={3}>
                      <Button
                        size="md"
                        leftIcon={<BsBookmarkPlus />}
                        onClick={handleSaveToLibrary}
                        variant="outline"
                        colorScheme="yellow"
                        isDisabled={!resultUrl || isSavingToLibrary || isSavedToLibrary}
                        isLoading={isSavingToLibrary}
                      >
                        {isSavedToLibrary ? "Saved to Library" : "Save to Library"}
                      </Button>
                      <Button
                        size="md"
                        leftIcon={<BsDownload />}
                        onClick={handleDownload}
                        bgGradient="linear(135deg, #eab308 0%, #caa004 100%)"
                        color="white"
                        isLoading={isDownloading}
                        loadingText="Preparing..."
                        isDisabled={!resultUrl || isDownloading}
                        _hover={{ bgGradient: "linear(135deg, #caa004 0%, #a16207 100%)" }}
                      >
                        Download
                      </Button>
                    </HStack>
                  </HStack>
                  <Box
                    borderRadius="xl"
                    overflow="hidden"
                    border="1px solid rgba(234, 179, 8, 0.18)"
                    bg="rgba(30, 41, 59, 0.88)"
                    minH="320px"
                    maxH="500px"
                    position="relative"
                  >
                    <Image
                      src={resultUrl}
                      alt="Edited result"
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
                        bgGradient="linear(135deg, #eab308 0%, #caa004 100%)"
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

export default InsertObjectsPage;

