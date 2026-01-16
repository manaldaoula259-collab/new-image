"use client";

import {
  Box,
  Button,
  Center,
  HStack,
  Input,
  SimpleGrid,
  Text,
  VStack,
  Image,
  useToast,
  Icon,
  IconButton,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { BsArrowUp, BsX, BsDownload, BsBookmarkPlus } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { useQueryClient } from "react-query";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createPreviewMedia } from "@/core/utils/upload";
import PageContainer from "../layout/PageContainer";
import CreditsDisplay from "../common/CreditsDisplay";
import NextImage from "next/image";
import { Container } from "@chakra-ui/react";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

type FilePreview = (File | Blob) & { preview: string };

const coloringExamples = [
  {
    id: 1,
    src: "/prompts/romy/kawaii.png",
    alt: "Dolphin coloring page",
    label: "Dolphin",
  },
  {
    id: 2,
    src: "/prompts/romy/elf.png",
    alt: "Floral pattern coloring page",
    label: "Floral Pattern",
  },
  {
    id: 3,
    src: "/prompts/romy/paladin.png",
    alt: "Leaf pattern coloring page",
    label: "Leaf Pattern",
  },
  {
    id: 4,
    src: "/prompts/romy/cyberpunk.png",
    alt: "Deer coloring page",
    label: "Deer",
  },
];

const DEFAULT_RESULT_FILENAME = "ai-coloring-book.png";

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

const AIColoringBookGeneratorPage = () => {
  const [prompt, setPrompt] = useState("");
  const [uploadedImage, setUploadedImage] = useState<FilePreview | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
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
  };

  const handleGenerate = async () => {
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

    if (!prompt.trim() && !uploadedImage) {
      toast({
        title: "Please enter a description or upload an image",
        description: "Describe what coloring page you want to generate or upload a photo.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setIsGenerating(true);
    setResultUrl(null);
    setResultFileName(DEFAULT_RESULT_FILENAME);
    setIsSavedToLibrary(false);

    try {
      let imageUrl: string | undefined;

      // If image is uploaded, upload it to S3 first
      if (uploadedImage) {
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
        imageUrl = s3ImageUrl;
      }

      // Call the coloring book generator API
      const response = await fetch("/api/ai-art-generator/ai-coloring-book-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim() || undefined,
          imageUrl: imageUrl || undefined,
        }),
      });

      if (!response.ok) {
        let message = "Coloring book generation failed.";
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
        throw new Error("Coloring book generation did not return a result URL.");
      }

      setResultUrl(data.resultUrl);
      setResultFileName(deriveFileNameFromUrl(data.resultUrl));

      toast({
        title: "Coloring page generated!",
        description: "Your coloring book page is ready to download.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
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
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!resultUrl) return;

    setIsDownloading(true);
    try {
      const response = await fetch(resultUrl);
      if (!response.ok) {
        throw new Error("Unable to download the coloring page.");
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
        description: "We opened the coloring page in a new tab so you can download it manually.",
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: resultUrl,
          prompt: prompt || "AI Coloring Book Generator",
          source: "ai-coloring-book-generator",
        }),
      });

      if (!response.ok) {
        let message = "Failed to save coloring page to your library.";
        try {
          const errorPayload = await response.json();
          if (errorPayload?.error) {
            message = errorPayload.error;
          } else if (errorPayload?.details) {
            message = errorPayload.details;
          } else if (errorPayload?.message) {
            message = errorPayload.message;
          }
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
        description:
          error instanceof Error
            ? error.message
            : "Unable to save this coloring page. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsSavingToLibrary(false);
    }
  };

  const handleExampleClick = (example: typeof coloringExamples[0]) => {
    setPrompt(example.label);
    toast({
      title: "Example selected",
      description: `Using "${example.label}" as your prompt.`,
      status: "success",
      duration: 2000,
      isClosable: true,
      position: "top-right",
    });
  };

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
          <VStack spacing={12} width="100%" align="stretch">
            <MotionVStack
              spacing={6}
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
                  AI Coloring Book Generator
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
                  Upload photos or enter text to create any coloring page you (or your child) can imagine with Dzine AI coloring book generator. Now, transform your ideas into coloring books with just a few clicks.
                </Text>
              </Box>
            </MotionVStack>

          <MotionBox
            width="100%"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <SimpleGrid
              columns={{ base: 1, lg: 2 }}
              spacing={8}
              width="100%"
            >
            <MotionBox
              borderRadius="16px"
              overflow="hidden"
              bg="#f0f0f0"
              boxShadow="0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)"
              minH={{ base: "400px", lg: "500px" }}
              position="relative"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Center
                minH={{ base: "400px", lg: "500px" }}
                p={8}
                flexDirection="column"
              >
                <Text
                  fontSize="lg"
                  color="black"
                  textAlign="center"
                  mb={4}
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="600"
                >
                  Example Coloring Page
                </Text>
                <Box
                  width="100%"
                  maxW="400px"
                  sx={{ aspectRatio: "1" }}
                  borderRadius="xl"
                  overflow="hidden"
                  border="1px solid rgba(0, 0, 0, 0.1)"
                  bg="white"
                >
                  <Image
                    src="/prompts/romy/kawaii.png"
                    alt="Example coloring page"
                    width="100%"
                    height="100%"
                    objectFit="contain"
                  />
                </Box>
              </Center>
            </MotionBox>

            <MotionBox
              borderRadius="16px"
              bg="#f0f0f0"
              boxShadow="0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)"
              minH={{ base: "400px", lg: "500px" }}
              position="relative"
              overflow="hidden"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <VStack
                spacing={6}
                p={{ base: 6, md: 8 }}
                height="100%"
                position="relative"
                zIndex={1}
              >
                {/* Credits Display */}
                <Box position="absolute" top={4} right={4} zIndex={10}>
                  <CreditsDisplay variant="image" />
                </Box>
                
                <AnimatePresence mode="wait">
                  {uploadedImage ? (
                    <MotionBox
                      key="image"
                      width="100%"
                      flex="1"
                      position="relative"
                      borderRadius="xl"
                      overflow="hidden"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Image
                        src={uploadedImage.preview}
                        alt="Uploaded image"
                        width="100%"
                        height="100%"
                        objectFit="contain"
                        borderRadius="xl"
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
                        zIndex={10}
                      />
                    </MotionBox>
                  ) : (
                    <Center
                      key="upload"
                      {...getRootProps()}
                      flexDirection="column"
                      cursor="pointer"
                      flex="1"
                      width="100%"
                      borderRadius="xl"
                      transition="all 300ms cubic-bezier(0.4, 0, 0.2, 1)"
                      bg={isDragActive ? "rgba(87, 60, 255, 0.1)" : "rgba(87, 60, 255, 0.05)"}
                      border="2px dashed"
                      borderColor={isDragActive ? "#573cff" : "rgba(87, 60, 255, 0.3)"}
                      _hover={{ bg: "rgba(87, 60, 255, 0.08)", borderColor: "#573cff" }}
                      p={8}
                    >
                      <input {...getInputProps()} />
                      <Box
                        width="120px"
                        height="120px"
                        borderRadius="full"
                        bg="#573cff"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        mb={6}
                        boxShadow="0 20px 50px rgba(87, 60, 255, 0.3)"
                        transition="all 0.3s"
                        _groupHover={{ transform: "scale(1.05)" }}
                      >
                        <Icon as={BsArrowUp} fontSize="4xl" color="white" />
                      </Box>
                      <Text
                        fontSize="xl"
                        fontWeight="700"
                        color="black"
                        mb={2}
                        textAlign="center"
                        fontFamily="'General Sans', 'Inter', sans-serif"
                      >
                        {isDragActive
                          ? "Drop your image here"
                          : "Click or drag here to upload images"}
                      </Text>
                      <Text
                        fontSize="sm"
                        color="rgba(0, 0, 0, 0.6)"
                        textAlign="center"
                        maxW="xs"
                        fontFamily="'General Sans', 'Inter', sans-serif"
                      >
                        PNG, JPEG, WebP supported (max 10MB)
                      </Text>
                    </Center>
                  )}
                </AnimatePresence>

                <VStack spacing={4} width="100%">
                  <Text
                    fontSize="sm"
                    color="rgba(0, 0, 0, 0.6)"
                    textAlign="center"
                    fontWeight="500"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                  >
                    OR
                  </Text>
                  <Input
                    size="lg"
                    placeholder="Describe what you want"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !isGenerating) {
                        handleGenerate();
                      }
                    }}
                    bg="white"
                    border="1px solid rgba(0, 0, 0, 0.1)"
                    color="black"
                    _placeholder={{ color: "rgba(0, 0, 0, 0.5)" }}
                    _focus={{
                      borderColor: "#573cff",
                      boxShadow: "0 0 0 3px rgba(87, 60, 255, 0.1)",
                    }}
                    _hover={{
                      borderColor: "rgba(0, 0, 0, 0.3)",
                    }}
                    width="100%"
                    height="56px"
                    fontSize={{ base: "md", md: "lg" }}
                    borderRadius="xl"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  />
                  <Button
                    size="lg"
                    width="100%"
                    height="56px"
                    bg="black"
                    color="white"
                    fontWeight="500"
                    fontSize={{ base: "13px", md: "15px" }}
                    letterSpacing="0.6px"
                    textTransform="uppercase"
                    borderRadius="8px"
                    fontFamily="'IBM Plex Mono', monospace"
                    onClick={handleGenerate}
                    isLoading={isGenerating}
                    isDisabled={!isLoaded || !isSignedIn}
                    loadingText="GENERATING..."
                    leftIcon={
                      <Box
                        bg="#573cff"
                        borderRadius="4px"
                        w="40px"
                        h="40px"
                        minW="40px"
                        minH="40px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Icon as={HiSparkles} fontSize="xl" color="white" />
                      </Box>
                    }
                    _hover={{
                      bg: "#1a1a1a",
                    }}
                    _active={{
                      bg: "#1a1a1a",
                    }}
                  >
                    Generate Coloring Page
                  </Button>
                </VStack>
              </VStack>
            </MotionBox>
            </SimpleGrid>
          </MotionBox>

            <AnimatePresence>
              {isGenerating && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  width="100%"
                  maxW="7xl"
                  mx="auto"
                >
                  <Box
                    bg="#f0f0f0"
                    borderRadius="16px"
                    boxShadow="0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)"
                    p={12}
                  >
                    <Center flexDirection="column" gap={4}>
                      <Spinner size="xl" color="#573cff" thickness="4px" mb={4} />
                      <Text
                        fontFamily="'General Sans', 'Inter', sans-serif"
                        color="black"
                        fontSize="lg"
                        fontWeight="600"
                      >
                        Generating your coloring page...
                      </Text>
                      <Text
                        fontFamily="'General Sans', 'Inter', sans-serif"
                        color="rgba(0, 0, 0, 0.6)"
                        fontSize="sm"
                        mt={2}
                      >
                        This may take a few moments
                      </Text>
                    </Center>
                  </Box>
                </MotionBox>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {resultUrl && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  width="100%"
                  maxW="7xl"
                  mx="auto"
                >
                  <Box
                    bg="#f0f0f0"
                    borderRadius="16px"
                    boxShadow="0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)"
                    p={8}
                  >
                    <VStack spacing={4}>
                      <HStack width="100%" justify="space-between" flexWrap="wrap" gap={3}>
                        <Text
                          fontSize="xl"
                          fontWeight="700"
                          color="black"
                          fontFamily="'General Sans', 'Inter', sans-serif"
                        >
                          Coloring Page Generated
                        </Text>
                        <HStack spacing={3}>
                          <Button
                            size="md"
                            leftIcon={<BsBookmarkPlus />}
                            onClick={handleSaveToLibrary}
                            variant="outline"
                            isDisabled={!resultUrl || isSavingToLibrary || isSavedToLibrary}
                            isLoading={isSavingToLibrary}
                            borderColor="rgba(0, 0, 0, 0.2)"
                            color="black"
                            _hover={{
                              bg: "rgba(0, 0, 0, 0.05)",
                              borderColor: "rgba(0, 0, 0, 0.3)",
                            }}
                            fontFamily="'General Sans', 'Inter', sans-serif"
                          >
                            {isSavedToLibrary ? "Saved to Library" : "Save to Library"}
                          </Button>
                          <Button
                            size="md"
                            leftIcon={<BsDownload />}
                            onClick={handleDownload}
                            isLoading={isDownloading}
                            loadingText="Preparing..."
                            isDisabled={!resultUrl || isDownloading}
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
                      </HStack>
                      <Box
                        borderRadius="xl"
                        overflow="hidden"
                        border="1px solid rgba(0, 0, 0, 0.1)"
                        bg="white"
                        width="100%"
                        position="relative"
                        sx={{ aspectRatio: "1" }}
                        maxW="600px"
                        mx="auto"
                      >
                        <Image
                          src={resultUrl}
                          alt="Generated coloring page"
                          width="100%"
                          height="100%"
                          objectFit="contain"
                        />
                      </Box>
                    </VStack>
                  </Box>
                </MotionBox>
              )}
            </AnimatePresence>

            <MotionVStack
              spacing={6}
              width="100%"
              pt={8}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Box maxW="3xl" mx="auto">
                <Text
                  as="h2"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontSize={{ base: "28px", md: "36px", lg: "48px" }}
                  fontWeight="500"
                  color="white"
                  textAlign="center"
                  letterSpacing="-0.6px"
                >
                  Try AI coloring book generator with one of these
                </Text>
              </Box>
              <SimpleGrid
                columns={{ base: 2, md: 4 }}
                spacing={{ base: 4, md: 6 }}
                width="100%"
              >
                {coloringExamples.map((example, index) => (
                  <MotionBox
                    key={example.id}
                    borderRadius="16px"
                    overflow="hidden"
                    border="1px solid rgba(0, 0, 0, 0.1)"
                    bg="white"
                    boxShadow="0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.03 }}
                    cursor="pointer"
                    onClick={() => handleExampleClick(example)}
                    position="relative"
                    sx={{ aspectRatio: "1" }}
                  >
                    <Image
                      src={example.src}
                      alt={example.alt}
                      width="100%"
                      height="100%"
                      objectFit="cover"
                      borderRadius="16px"
                      filter="grayscale(100%) contrast(1.2)"
                      fallbackSrc="https://via.placeholder.com/400x400/f0f0f0/999999?text=Coloring+Example"
                    />
                    <Box
                      position="absolute"
                      inset={0}
                      bg="linear-gradient(185deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.6) 78%)"
                      pointerEvents="none"
                      borderRadius="16px"
                    />
                    <VStack
                      position="absolute"
                      bottom={4}
                      left={4}
                      right={4}
                      spacing={2}
                      align="flex-start"
                    >
                      <Badge
                        bg="rgba(87, 60, 255, 0.7)"
                        backdropFilter="blur(8px)"
                        color="white"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="600"
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                        fontFamily="'IBM Plex Mono', monospace"
                      >
                        {example.label}
                      </Badge>
                    </VStack>
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

export default AIColoringBookGeneratorPage;

