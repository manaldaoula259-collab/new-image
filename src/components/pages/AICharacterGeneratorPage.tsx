"use client";

import {
  Box,
  Button,
  HStack,
  Input,
  SimpleGrid,
  Text,
  VStack,
  Image,
  useToast,
  Badge,
  Icon,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiSparkles } from "react-icons/hi";
import { BsDownload, BsBookmarkPlus } from "react-icons/bs";
import { useQueryClient } from "react-query";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import PageContainer from "../layout/PageContainer";
import CreditsDisplay from "../common/CreditsDisplay";
import NextImage from "next/image";
import { Container } from "@chakra-ui/react";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const characterExamples = [
  {
    id: 1,
    src: "/prompts/romy/cyberpunk.png",
    alt: "Cyberpunk character",
    label: "Cyberpunk",
  },
  {
    id: 2,
    src: "/prompts/romy/paladin.png",
    alt: "Paladin character",
    label: "Paladin",
  },
  {
    id: 3,
    src: "/prompts/romy/harry-potter.png",
    alt: "Harry Potter character",
    label: "Wizard",
  },
  {
    id: 4,
    src: "/prompts/romy/elf.png",
    alt: "Elf character",
    label: "Fantasy Elf",
  },
];

const DEFAULT_RESULT_FILENAME = "ai-character.jpg";

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

const AICharacterGeneratorPage = () => {
  const [prompt, setPrompt] = useState("");
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

    if (!prompt.trim()) {
      toast({
        title: "Please enter a description",
        description: "Describe what character you want to generate.",
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
      const response = await fetch("/api/ai-art-generator/ai-character-generator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
        }),
      });

      if (!response.ok) {
        let message = "Character generation failed.";
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
        throw new Error("Character generation did not return a result URL.");
      }

      setResultUrl(data.resultUrl);
      setResultFileName(deriveFileNameFromUrl(data.resultUrl));

      toast({
        title: "Character generated!",
        description: "Your character is ready to download.",
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
        throw new Error("Unable to download the character.");
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
        description: "We opened the character in a new tab so you can download it manually.",
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
          prompt: prompt || "AI Character Generator",
          source: "ai-character-generator",
        }),
      });

      if (!response.ok) {
        let message = "Failed to save character to your library.";
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
            : "Unable to save this character. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsSavingToLibrary(false);
    }
  };

  const handleExampleClick = (example: typeof characterExamples[0]) => {
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
                  AI Character Generator
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
                  Convert text to images in seconds with poweraitool&apos;s free AI character generator. It also helps you create unique characters from pictures of people, animals, toys, or fantastical beings - no ads or watermarks.
                </Text>
              </Box>
            </MotionVStack>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              width="100%"
              maxW="4xl"
              mx="auto"
            >
              <Box
                bg="#f0f0f0"
                borderRadius="16px"
                boxShadow="0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)"
                p={{ base: 6, md: 8 }}
                position="relative"
                overflow="hidden"
              >
                {/* Credits Display */}
                <Box position="absolute" top={4} right={4} zIndex={10}>
                  <CreditsDisplay variant="image" />
                </Box>
                <VStack spacing={4} position="relative" zIndex={1}>
                  <HStack
                    spacing={3}
                    flexDirection={{ base: "column", sm: "row" }}
                    width="100%"
                  >
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
                      flex="1"
                      height="56px"
                      fontSize={{ base: "md", md: "lg" }}
                      borderRadius="xl"
                      fontFamily="'General Sans', 'Inter', sans-serif"
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    />
                    <Button
                      size="lg"
                      height={{ base: "56px", md: "72px" }}
                      px={8}
                      onClick={handleGenerate}
                      isLoading={isGenerating}
                      isDisabled={!isLoaded || !isSignedIn}
                      loadingText="GENERATING..."
                      width={{ base: "100%", sm: "auto" }}
                      minW={{ base: "100%", sm: "180px" }}
                      borderRadius="8px"
                      fontFamily="'IBM Plex Mono', monospace"
                      fontWeight="500"
                      fontSize={{ base: "13px", md: "15px" }}
                      letterSpacing="0.6px"
                      textTransform="uppercase"
                      bg="black"
                      color="white"
                      _hover={{
                        bg: "#1a1a1a",
                      }}
                      _active={{
                        bg: "#1a1a1a",
                      }}
                      leftIcon={<Icon as={HiSparkles} />}
                    >
                      Generate
                    </Button>
                  </HStack>
                  {prompt && (
                    <AnimatePresence>
                      <MotionBox
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        width="100%"
                        overflow="hidden"
                      >
                        <HStack
                          spacing={2}
                          p={3}
                          borderRadius="lg"
                          bg="rgba(87, 60, 255, 0.1)"
                          border="1px solid rgba(87, 60, 255, 0.2)"
                        >
                          <Icon as={HiSparkles} color="#573cff" />
                          <Text
                            fontSize="sm"
                            color="black"
                            fontFamily="'General Sans', 'Inter', sans-serif"
                          >
                            Ready to generate: <strong>{prompt}</strong>
                          </Text>
                        </HStack>
                      </MotionBox>
                    </AnimatePresence>
                  )}
                </VStack>
              </Box>
            </MotionBox>

            <AnimatePresence>
              {isGenerating && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  width="100%"
                  maxW="4xl"
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
                        Generating your character...
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
                  maxW="4xl"
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
                          Character Generated
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
                      >
                        <Image
                          src={resultUrl}
                          alt="Generated character"
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
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <VStack spacing={2}>
                <Text
                  as="h2"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontSize={{ base: "24px", md: "32px", lg: "40px" }}
                  color="white"
                  textAlign="center"
                  fontWeight="500"
                  letterSpacing="-0.6px"
                >
                  No idea? Try these inspirations.
                </Text>
                <Text
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontSize="sm"
                  color="rgba(255, 255, 255, 0.7)"
                  textAlign="center"
                >
                  Click on any example to use it as your prompt
                </Text>
              </VStack>
              <SimpleGrid
                columns={{ base: 2, md: 4 }}
                spacing={{ base: 4, md: 6 }}
                width="100%"
              >
                {characterExamples.map((example, index) => (
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
                      fallbackSrc="https://via.placeholder.com/400x400/f0f0f0/999999?text=Character+Example"
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
                        bg="rgba(0, 0, 0, 0.7)"
                        backdropFilter="blur(12px)"
                        color="white"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="600"
                        textTransform="uppercase"
                        letterSpacing="0.05em"
                        fontFamily="'IBM Plex Mono', monospace"
                        border="1px solid rgba(255, 255, 255, 0.2)"
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

export default AICharacterGeneratorPage;
