"use client";

import { createPreviewMedia } from "@/core/utils/upload";
import {
  Box,
  Button,
  Center,
  HStack,
  Icon,
  Image,
  Text,
  VStack,
  useToast,
  IconButton,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  BsEraser,
  BsDownload,
  BsX,
  BsBookmarkPlus,
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { useQueryClient } from "react-query";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "../layout/PageContainer";
import CreditsDisplay from "../common/CreditsDisplay";
import NextImage from "next/image";
import { Container } from "@chakra-ui/react";

type FilePreview = (File | Blob) & { preview: string };

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const DEFAULT_RESULT_FILENAME = "remove-background.png";

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

const removeBackgroundExamples = [
  {
    id: 1,
    src: "/assets/remove-background/1.png",
    alt: "Remove background example 1",
  },
  {
    id: 2,
    src: "/assets/remove-background/2.png",
    alt: "Remove background example 2",
  },
  {
    id: 3,
    src: "/assets/remove-background/3.png",
    alt: "Remove background example 3",
  },
];

const RemoveBackgroundPage = () => {
  const [uploadedImage, setUploadedImage] = useState<FilePreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultFileName, setResultFileName] = useState(DEFAULT_RESULT_FILENAME);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingToLibrary, setIsSavingToLibrary] = useState(false);
  const [isSavedToLibrary, setIsSavedToLibrary] = useState(false);

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

  const handleRemoveImage = () => {
    if (uploadedImage?.preview) {
      URL.revokeObjectURL(uploadedImage.preview);
    }
    setUploadedImage(null);
    setResultUrl(null);
    setResultFileName(DEFAULT_RESULT_FILENAME);
    setIsSavedToLibrary(false);
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
        description: "Upload an image to remove its background.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setIsProcessing(true);
    setResultUrl(null);
    setResultFileName(DEFAULT_RESULT_FILENAME);
    setIsSavedToLibrary(false);

    try {
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

      const response = await fetch("/api/ai-image-editor/remove-background", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: s3ImageUrl,
        }),
      });

      if (!response.ok) {
        let message = "The background removal service returned an unexpected error.";
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
        throw new Error("The background removal service did not return a result URL.");
      }

      setResultUrl(data.resultUrl);
      setResultFileName(deriveFileNameFromUrl(data.resultUrl));

      toast({
        title: "Background removed!",
        description: "Your image with removed background is ready to download.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      toast({
        title: "Background removal failed",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) return;
    setIsDownloading(true);
    try {
      const response = await fetch(resultUrl);
      if (!response.ok) {
        throw new Error("Unable to download the image.");
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
        description: "We opened the image in a new tab so you can download it manually.",
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
          prompt: "Remove background from image",
          source: "remove-background",
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

  return (
    <Box
      as="section"
      width="100%"
      minH="100vh"
      position="relative"
      overflow="hidden"
      bg="#FCFCFC"
    >
      {/* Background Image */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        width="100%"
        height="100%"
        zIndex={0}
      >
        <NextImage
          src="/assets/landing_page/hero_bg.png"
          alt="Page Background"
          fill
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
          priority
        />
      </Box>

      <PageContainer pb={16} position="relative" zIndex={2}>
        <Container maxW="1400px" px={{ base: 4, md: 8 }}>
          <VStack spacing={10} width="100%" align="stretch">
            {/* Header */}
            <MotionVStack
              spacing={4}
              align="center"
              textAlign="center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              pt={{ base: 8, md: 12 }}
            >
              <Box maxW={{ base: "100%", md: "900px" }}>
                <Text
                  as="h1"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="500"
                  fontSize={{ base: "36px", md: "48px", lg: "60px" }}
                  lineHeight={{ base: "1.2", md: "66px" }}
                  letterSpacing="-0.6px"
                  color="white"
                >
                  Remove Background
                </Text>
              </Box>
              <Box maxW={{ base: "100%", md: "800px" }}>
                <Text
                  as="p"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="400"
                  fontSize={{ base: "16px", md: "20px" }}
                  lineHeight={{ base: "24px", md: "30px" }}
                  color="white"
                  opacity={0.9}
                >
                  Erase backgrounds with a simple tap. Remove backgrounds from your images instantly with AI-powered editing.
                </Text>
              </Box>
            </MotionVStack>

          {/* Main Content */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} width="100%">
            {/* Upload Section */}
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Box
                bg="#f0f0f0"
                borderRadius="16px"
                boxShadow="0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)"
                overflow="hidden"
                position="relative"
                p={{ base: 6, md: 8 }}
                height="100%"
              >
                {/* Credits Display */}
                <Box position="absolute" top={4} right={4} zIndex={10}>
                  <CreditsDisplay variant="image" />
                </Box>
                <VStack spacing={4} height="100%">
                  <AnimatePresence mode="wait">
                  {currentImage ? (
                    <MotionBox
                      key="image"
                      width="100%"
                      flex="1"
                      position="relative"
                      borderRadius="xl"
                      overflow="hidden"
                      border="1px solid rgba(0, 0, 0, 0.1)"
                      bg="white"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      minH="400px"
                    >
                      <Image
                        src={currentImage}
                        alt="Uploaded image"
                        width="100%"
                        height="100%"
                        objectFit="contain"
                      />
                      <IconButton
                        aria-label="Remove image"
                        icon={<BsX />}
                        position="absolute"
                        top={3}
                        right={3}
                        size="sm"
                        borderRadius="full"
                        bg="rgba(0, 0, 0, 0.6)"
                        backdropFilter="blur(8px)"
                        color="white"
                        _hover={{ bg: "rgba(0, 0, 0, 0.8)", transform: "scale(1.1)" }}
                        onClick={handleRemoveImage}
                        transition="all 0.2s"
                      />
                    </MotionBox>
                  ) : (
                    <MotionBox
                      key="upload"
                      width="100%"
                      flex="1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Center
                        {...getRootProps()}
                        flexDirection="column"
                        cursor="pointer"
                        p={12}
                        borderRadius="xl"
                        border="2px dashed"
                        borderColor={isDragActive ? "#573cff" : "rgba(0, 0, 0, 0.2)"}
                        bg={isDragActive ? "rgba(87, 60, 255, 0.05)" : "white"}
                        minH="400px"
                        transition="all 0.3s"
                        _hover={{
                          borderColor: "#573cff",
                          bg: "rgba(87, 60, 255, 0.05)",
                        }}
                        position="relative"
                        zIndex={1}
                      >
                        <input {...getInputProps()} />
                        <VStack spacing={4}>
                          <Box
                            width="80px"
                            height="80px"
                            borderRadius="full"
                            bg="#573cff"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            boxShadow="0 8px 24px rgba(87, 60, 255, 0.3)"
                          >
                            <Icon as={BsEraser} fontSize="2xl" color="white" />
                          </Box>
                          <VStack spacing={2}>
                            <Text
                              fontFamily="'General Sans', 'Inter', sans-serif"
                              fontSize="lg"
                              fontWeight="600"
                              color="black"
                              textAlign="center"
                            >
                              {isDragActive ? "Drop your image here" : "Click or drag to upload"}
                            </Text>
                            <Text
                              fontFamily="'General Sans', 'Inter', sans-serif"
                              fontSize="sm"
                              color="rgba(0, 0, 0, 0.6)"
                              textAlign="center"
                            >
                              PNG, JPEG, WebP (max 10MB)
                            </Text>
                          </VStack>
                        </VStack>
                      </Center>
                    </MotionBox>
                  )}
                </AnimatePresence>

                <Button
                  size="lg"
                  width="100%"
                  onClick={handleConvert}
                  isLoading={isProcessing}
                  isDisabled={!isLoaded || !isSignedIn || !currentImage || isProcessing}
                  height={{ base: "56px", md: "72px" }}
                  px={0}
                  borderRadius="8px"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontWeight="500"
                  fontSize={{ base: "13px", md: "15px" }}
                  letterSpacing="0.6px"
                  textTransform="uppercase"
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-start"
                  gap={0}
                  overflow="hidden"
                  bg="black"
                  color="white"
                  _hover={{
                    bg: "#1a1a1a",
                  }}
                  _active={{
                    bg: "#1a1a1a",
                  }}
                >
                  <Box
                    bg="#573cff"
                    borderRadius="4px"
                    w={{ base: "48px", md: "64px" }}
                    h={{ base: "48px", md: "64px" }}
                    minW={{ base: "48px", md: "64px" }}
                    minH={{ base: "48px", md: "64px" }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    ml={{ base: "4px", md: "4px" }}
                    mt={{ base: "4px", md: "4px" }}
                    mb={{ base: "4px", md: "4px" }}
                    flexShrink={0}
                  >
                    <Icon as={BsEraser} fontSize="xl" color="white" />
                  </Box>
                  <Text px={{ base: 4, md: 6 }} py={{ base: 3, md: 4 }} flex="1" textAlign="left">
                    {isProcessing ? "REMOVING BACKGROUND..." : "REMOVE BACKGROUND"}
                  </Text>
                </Button>
              </VStack>
            </Box>
          </MotionBox>

            {/* Result Section */}
            <MotionBox
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Box
                bg="#f0f0f0"
                borderRadius="16px"
                boxShadow="0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)"
                overflow="hidden"
                position="relative"
                p={{ base: 6, md: 8 }}
                height="100%"
              >
                <VStack spacing={4} height="100%">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <MotionBox
                      key="loading"
                      width="100%"
                      flex="1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Center flexDirection="column" minH="400px" gap={4}>
                        <Spinner size="xl" color="#573cff" thickness="4px" mb={4} />
                        <Text
                          fontFamily="'General Sans', 'Inter', sans-serif"
                          color="black"
                          fontSize="lg"
                          fontWeight="600"
                        >
                          Removing background...
                        </Text>
                        <Text
                          fontFamily="'General Sans', 'Inter', sans-serif"
                          color="rgba(0, 0, 0, 0.6)"
                          fontSize="sm"
                        >
                          This may take a few moments
                        </Text>
                      </Center>
                    </MotionBox>
                  ) : resultUrl ? (
                    <MotionBox
                      key="result"
                      width="100%"
                      flex="1"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <VStack spacing={4} width="100%" height="100%">
                        <Box
                          width="100%"
                          flex="1"
                          borderRadius="xl"
                          overflow="hidden"
                          border="1px solid rgba(0, 0, 0, 0.1)"
                          bg="white"
                          minH="400px"
                          position="relative"
                          bgImage="repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(148, 163, 184, 0.05) 10px, rgba(148, 163, 184, 0.05) 20px)"
                        >
                          <Image
                            src={resultUrl}
                            alt="Background removed result"
                            width="100%"
                            height="100%"
                            objectFit="contain"
                          />
                        </Box>
                        <HStack spacing={3} width="100%">
                          <Button
                            size="md"
                            leftIcon={<BsBookmarkPlus />}
                            onClick={handleSaveToLibrary}
                            variant="outline"
                            isDisabled={isSavingToLibrary || isSavedToLibrary}
                            isLoading={isSavingToLibrary}
                            flex="1"
                            borderColor="rgba(0, 0, 0, 0.2)"
                            color="black"
                            _hover={{
                              bg: "rgba(0, 0, 0, 0.05)",
                              borderColor: "rgba(0, 0, 0, 0.3)",
                            }}
                            fontFamily="'General Sans', 'Inter', sans-serif"
                          >
                            {isSavedToLibrary ? "Saved" : "Save to Library"}
                          </Button>
                          <Button
                            size="md"
                            leftIcon={<BsDownload />}
                            onClick={handleDownload}
                            isLoading={isDownloading}
                            loadingText="Preparing..."
                            isDisabled={isDownloading}
                            flex="1"
                            bg="black"
                            color="white"
                            _hover={{
                              bg: "#1a1a1a",
                            }}
                            fontFamily="'General Sans', 'Inter', sans-serif"
                          >
                            Download
                          </Button>
                        </HStack>
                      </VStack>
                    </MotionBox>
                  ) : (
                    <MotionBox
                      key="placeholder"
                      width="100%"
                      flex="1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Center flexDirection="column" minH="400px" gap={4}>
                        <Box
                          width="80px"
                          height="80px"
                          borderRadius="full"
                          bg="white"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          border="2px dashed"
                          borderColor="rgba(0, 0, 0, 0.2)"
                        >
                          <Icon as={BsEraser} fontSize="2xl" color="rgba(0, 0, 0, 0.4)" />
                        </Box>
                        <VStack spacing={2}>
                          <Text
                            fontFamily="'General Sans', 'Inter', sans-serif"
                            fontSize="lg"
                            fontWeight="600"
                            color="black"
                            textAlign="center"
                          >
                            Image with removed background will appear here
                          </Text>
                          <Text
                            fontFamily="'General Sans', 'Inter', sans-serif"
                            fontSize="sm"
                            color="rgba(0, 0, 0, 0.6)"
                            textAlign="center"
                          >
                            Upload an image to remove its background
                          </Text>
                        </VStack>
                      </Center>
                    </MotionBox>
                  )}
                </AnimatePresence>
              </VStack>
            </Box>
          </MotionBox>
        </SimpleGrid>

            {/* Example Images Section */}
            <MotionVStack
              spacing={6}
              width="100%"
              pt={8}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Text
                as="h2"
                fontFamily="'General Sans', 'Inter', sans-serif"
                fontSize={{ base: "28px", md: "36px", lg: "48px" }}
                fontWeight="500"
                color="white"
                textAlign="center"
                letterSpacing="-0.6px"
              >
                Example Background Removal Results
              </Text>
              <Box maxW="3xl" mx="auto">
                <Text
                  as="p"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontSize={{ base: "16px", md: "20px" }}
                  fontWeight="400"
                  color="white"
                  textAlign="center"
                  lineHeight={{ base: "24px", md: "30px" }}
                  opacity={0.9}
                >
                  Instantly remove backgrounds with precision, perfect for product photos and portraits.
                </Text>
              </Box>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} width="100%">
                {removeBackgroundExamples.map((example, index) => (
                  <MotionBox
                    key={example.id}
                    borderRadius="16px"
                    overflow="hidden"
                    border="1px solid rgba(0, 0, 0, 0.1)"
                    bg="white"
                    boxShadow="0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.03 }}
                    cursor="pointer"
                  >
                    <Image
                      src={example.src}
                      alt={example.alt}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      borderRadius="16px"
                      fallbackSrc="https://via.placeholder.com/400x400/f0f0f0/999999?text=Example"
                    />
                  </MotionBox>
                ))}
              </SimpleGrid>
            </MotionVStack>
      </VStack>
    </Container>
  </PageContainer>
</Box>
  );
};

export default RemoveBackgroundPage;
