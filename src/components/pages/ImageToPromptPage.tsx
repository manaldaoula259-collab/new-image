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
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  BsChatText,
  BsX,
  BsClipboard,
  BsClipboardCheck,
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

const examplePromptImages = [
  {
    id: 1,
    src: "/image-to-prompt-example-portrait.jpg",
    alt: "Vibrant typographic prompt result",
  },
  {
    id: 2,
    src: "/image-to-prompt-example-product.webp",
    alt: "Atmospheric art prompt result",
  },
  {
    id: 3,
    src: "/image-to-prompt-example-environment.avif",
    alt: "Product prompt render",
  },
];

const ImageToPromptPage = () => {
  const [uploadedImage, setUploadedImage] = useState<FilePreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSavingPrompt, setIsSavingPrompt] = useState(false);
  const [isPromptSaved, setIsPromptSaved] = useState(false);
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);

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
        setGeneratedPrompt(null);
        setCopied(false);
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
    setGeneratedPrompt(null);
    setCopied(false);
    setIsPromptSaved(false);
    setSavedImageUrl(null);
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
        description: "Upload an image to generate a detailed prompt.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setIsProcessing(true);
    setCopied(false);
    setGeneratedPrompt(null);

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
      setSavedImageUrl(s3ImageUrl);

      const response = await fetch("/api/ai-photo-filter/image-to-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: s3ImageUrl,
        }),
      });

      if (!response.ok) {
        let message = "The prompt generation service returned an unexpected error.";
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
        prompt?: string;
      };

      if (!data?.prompt) {
        throw new Error("The prompt generation service did not return a prompt.");
      }

      setGeneratedPrompt(data.prompt);
      setIsPromptSaved(false); // Reset saved state when new prompt is generated

      toast({
        title: "Prompt generated!",
        description: "Copy the prompt and try it in your favorite model.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      toast({
        title: "Prompt generation failed",
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

  const handleCopy = async () => {
    if (!generatedPrompt) return;

    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast({
        title: "Prompt copied",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
        status: "error",
        duration: 2500,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleSavePrompt = async () => {
    if (!generatedPrompt || isSavingPrompt || isPromptSaved) return;

    setIsSavingPrompt(true);
    try {
      const response = await fetch("/api/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: savedImageUrl || uploadedImage?.preview || "",
          prompt: generatedPrompt,
          source: "image-to-prompt",
        }),
      });

      if (!response.ok) {
        let message = "Failed to save prompt to your library.";
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
        description: "You can find it in Dashboard → Media → Prompts tab.",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
      setIsPromptSaved(true);
    } catch (error) {
      toast({
        title: "Save failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to save this prompt. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsSavingPrompt(false);
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
                  AI Image-to-Prompt Generator
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
                  Upload any reference image and instantly receive a polished, ready-to-use text prompt—ideal for recreating the look in your favorite diffusion model.
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
                  <CreditsDisplay variant="prompt" />
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
                      minH="300px"
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
                        minH="300px"
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
                            <Icon as={BsChatText} fontSize="2xl" color="white" />
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
                    <Icon as={BsChatText} fontSize="xl" color="white" />
                  </Box>
                  <Text px={{ base: 4, md: 6 }} py={{ base: 3, md: 4 }} flex="1" textAlign="left">
                    {isProcessing ? "ANALYZING..." : "GENERATE PROMPT"}
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
                          Analyzing image...
                        </Text>
                        <Text
                          fontFamily="'General Sans', 'Inter', sans-serif"
                          color="rgba(0, 0, 0, 0.6)"
                          fontSize="sm"
                        >
                          Generating detailed prompt
                        </Text>
                      </Center>
                    </MotionBox>
                  ) : generatedPrompt ? (
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
                        <HStack width="100%" justify="space-between" align="start">
                          <HStack spacing={3} align="center">
                            <Box
                              width="40px"
                              height="40px"
                              borderRadius="full"
                              bg="#573cff"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Icon as={HiSparkles} color="white" fontSize="xl" />
                            </Box>
                            <VStack align="start" spacing={0}>
                              <Text
                                fontFamily="'General Sans', 'Inter', sans-serif"
                                fontSize="lg"
                                fontWeight="700"
                                color="black"
                              >
                                Prompt Ready!
                              </Text>
                              <Text
                                fontFamily="'General Sans', 'Inter', sans-serif"
                                fontSize="sm"
                                color="rgba(0, 0, 0, 0.6)"
                              >
                                Copy and use in your favorite model
                              </Text>
                            </VStack>
                          </HStack>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              leftIcon={<Icon as={BsBookmarkPlus} />}
                              onClick={handleSavePrompt}
                              variant="outline"
                              isDisabled={isSavingPrompt || isPromptSaved}
                              isLoading={isSavingPrompt}
                              borderColor="rgba(0, 0, 0, 0.2)"
                              color="black"
                              _hover={{
                                bg: "rgba(0, 0, 0, 0.05)",
                                borderColor: "rgba(0, 0, 0, 0.3)",
                              }}
                              fontFamily="'General Sans', 'Inter', sans-serif"
                            >
                              {isPromptSaved ? "Saved" : "Save"}
                            </Button>
                            <Button
                              size="sm"
                              leftIcon={<Icon as={copied ? BsClipboardCheck : BsClipboard} />}
                              onClick={handleCopy}
                              variant="outline"
                              borderColor="rgba(0, 0, 0, 0.2)"
                              color="black"
                              _hover={{
                                bg: "rgba(0, 0, 0, 0.05)",
                                borderColor: "rgba(0, 0, 0, 0.3)",
                              }}
                              fontFamily="'General Sans', 'Inter', sans-serif"
                            >
                              {copied ? "Copied" : "Copy"}
                            </Button>
                          </HStack>
                        </HStack>
                        <Box
                          borderRadius="xl"
                          border="1px solid rgba(0, 0, 0, 0.1)"
                          bg="white"
                          padding={6}
                          width="100%"
                          flex="1"
                          overflowY="auto"
                          maxH="400px"
                        >
                          <Text
                            fontFamily="'General Sans', 'Inter', sans-serif"
                            fontSize={{ base: "sm", md: "md" }}
                            color="black"
                            lineHeight="1.75"
                            letterSpacing="0.01em"
                            whiteSpace="pre-wrap"
                          >
                            {generatedPrompt}
                          </Text>
                        </Box>
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
                          <Icon as={BsChatText} fontSize="2xl" color="rgba(0, 0, 0, 0.4)" />
                        </Box>
                        <VStack spacing={2}>
                          <Text
                            fontFamily="'General Sans', 'Inter', sans-serif"
                            fontSize="lg"
                            fontWeight="600"
                            color="black"
                            textAlign="center"
                          >
                            Generated prompt will appear here
                          </Text>
                          <Text
                            fontFamily="'General Sans', 'Inter', sans-serif"
                            fontSize="sm"
                            color="rgba(0, 0, 0, 0.6)"
                            textAlign="center"
                          >
                            Upload an image to generate a detailed prompt
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

            {/* Example Prompt Images Section */}
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
                Example Prompt Outputs
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
                  Real prompts crafted from various reference images—use them as inspiration when refining your own prompts.
                </Text>
              </Box>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} width="100%">
                {examplePromptImages.map((example, index) => (
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
                      fallbackSrc="https://via.placeholder.com/400x400/f0f0f0/999999?text=Prompt+Example"
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

export default ImageToPromptPage;
