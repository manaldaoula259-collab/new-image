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
} from "@chakra-ui/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiSparkles } from "react-icons/hi";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import PageContainer from "../layout/PageContainer";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const vectorExamples = [
  {
    id: 1,
    src: "/prompts/romy/kawaii.png",
    alt: "Sushi vector illustration",
    label: "Sushi",
  },
  {
    id: 2,
    src: "/prompts/romy/cyberpunk.png",
    alt: "Car vector illustration",
    label: "Vintage Car",
  },
  {
    id: 3,
    src: "/prompts/romy/elf.png",
    alt: "Forest trees vector",
    label: "Forest Trees",
  },
  {
    id: 4,
    src: "/prompts/romy/paladin.png",
    alt: "Coffee vector illustration",
    label: "Coffee",
  },
];

const AIVectorImageGeneratorPage = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const toast = useToast();
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
        description: "Describe what vector image you want to generate.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // NOTE: Vector image generation feature is planned for future implementation
      // This will integrate with an AI model (e.g., Replicate, OpenAI DALL-E) to generate vector-style images
      // Implementation should include:
      // 1. API route to handle generation requests
      // 2. Integration with AI service
      // 3. Image processing and storage
      // 4. Progress tracking and result display
      
      // Placeholder implementation - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setIsGenerating(false);
      toast({
        title: "Feature coming soon",
        description: "Vector image generation will be available in a future update.",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Generation failed",
        description: "An error occurred. Please try again later.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleExampleClick = (example: typeof vectorExamples[0]) => {
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
    <Box bg="var(--bg-canvas)" minH="100vh" width="100%">
      <PageContainer pb={16}>
        <VStack spacing={12} width="100%" align="stretch" maxW="6xl" mx="auto">
          <MotionVStack
            spacing={6}
            align="center"
            textAlign="center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Text
              fontSize={{ base: "clamp(2rem, 5vw + 1rem, 3.5rem)", md: "3.5rem" }}
              fontWeight="900"
              letterSpacing="-0.03em"
              color="white"
              lineHeight="1.1"
              bgGradient="linear(to-r, white, rgba(255,255,255,0.8))"
              bgClip="text"
            >
              AI Vector Generator
            </Text>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="rgba(255, 255, 255, 0.8)"
              maxW="3xl"
              lineHeight="1.7"
              px={4}
              fontWeight="400"
            >
              poweraitool&apos;s AI Vector Generator lets you instantly generate and customize crisp, scalable vectors—perfect for all your creative adventures!
            </Text>
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
              borderRadius="2xl"
              p={{ base: 6, md: 8 }}
              backgroundColor="var(--bg-surface)"
              border="1px solid var(--border-subtle)"
              boxShadow="0 30px 60px rgba(8, 14, 26, 0.55)"
              position="relative"
              overflow="hidden"
              _before={{
                content: '""',
                position: "absolute",
                inset: 0,
                backgroundImage: `
                  linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: "24px 24px",
                borderRadius: "2xl",
                pointerEvents: "none",
              }}
            >
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
                    backgroundColor="var(--bg-surfaceMuted)"
                    border="1px solid var(--border-subtle)"
                    color="var(--text-primary)"
                    _placeholder={{ color: "var(--text-muted)" }}
                    _focus={{
                      borderColor: "var(--border-emphasis)",
                      boxShadow: "0 0 0 3px rgba(148, 163, 184, 0.1)",
                      backgroundColor: "rgba(13, 22, 36, 0.85)",
                    }}
                    _hover={{
                      borderColor: "rgba(148, 163, 184, 0.35)",
                      backgroundColor: "rgba(13, 22, 36, 0.8)",
                    }}
                    flex="1"
                    height="56px"
                    fontSize={{ base: "md", md: "lg" }}
                    borderRadius="xl"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  />
                  <Button
                    size="lg"
                    height="56px"
                    px={8}
                    variant="brand"
                    fontWeight="700"
                    fontSize={{ base: "md", md: "lg" }}
                    borderRadius="full"
                    onClick={handleGenerate}
                    isLoading={isGenerating}
                    isDisabled={!isLoaded || !isSignedIn}
                    loadingText="Generating..."
                    width={{ base: "100%", sm: "auto" }}
                    minW={{ base: "100%", sm: "140px" }}
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
                        bg="rgba(148, 163, 184, 0.08)"
                        border="1px solid rgba(148, 163, 184, 0.15)"
                      >
                        <Icon as={HiSparkles} color="var(--text-muted)" />
                        <Text fontSize="sm" color="var(--text-muted)">
                          Ready to generate: <strong>{prompt}</strong>
                        </Text>
                      </HStack>
                    </MotionBox>
                  </AnimatePresence>
                )}
              </VStack>
            </Box>
          </MotionBox>

          <MotionVStack
            spacing={6}
            width="100%"
            maxW="6xl"
            mx="auto"
            pt={4}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <VStack spacing={2}>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                color="rgba(255, 255, 255, 0.9)"
                textAlign="center"
                fontWeight="600"
              >
                No idea? Try these inspirations.
              </Text>
              <Text
                fontSize="sm"
                color="rgba(255, 255, 255, 0.5)"
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
              {vectorExamples.map((example, index) => (
                <MotionBox
                  key={example.id}
                  borderRadius="2xl"
                  overflow="hidden"
                  border="1px solid var(--border-subtle)"
                  bg="white"
                  boxShadow="0 8px 30px rgba(8, 14, 26, 0.4)"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  cursor="pointer"
                  onClick={() => handleExampleClick(example)}
                  position="relative"
                  sx={{ aspectRatio: "1" }}
                  _hover={{
                    borderColor: "var(--border-emphasis)",
                    boxShadow: "0 16px 50px rgba(8, 14, 26, 0.6)",
                    "& .overlay": {
                      opacity: 1,
                    },
                    "& .badge-container": {
                      transform: "translateY(0)",
                    },
                  }}
                >
                  <Image
                    src={example.src}
                    alt={example.alt}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    borderRadius="2xl"
                  />
                  <Box
                    className="overlay"
                    position="absolute"
                    inset={0}
                    bgGradient="linear(to-t, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)"
                    borderRadius="2xl"
                    opacity={0}
                    transition="opacity 0.3s"
                  />
                  <VStack
                    className="badge-container"
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    p={4}
                    spacing={2}
                    transform="translateY(100%)"
                    transition="transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  >
                    <Badge
                      bg="rgba(255, 255, 255, 0.15)"
                      backdropFilter="blur(12px)"
                      color="white"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="600"
                      textTransform="uppercase"
                      letterSpacing="0.05em"
                    >
                      {example.label}
                    </Badge>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </MotionVStack>
        </VStack>
      </PageContainer>
    </Box>
  );
};

export default AIVectorImageGeneratorPage;

