"use client";

import {
  Box,
  Button,
  Stack,
  Text,
  HStack,
} from "@chakra-ui/react";
import { useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

const heroCards = [
  {
    title: "2D to 3D Converter",
    image: "/tool-2d-to-3d-converter.png",
    bg: "linear-gradient(180deg, rgba(112, 48, 5, 0.7) 0%, rgba(15, 12, 6, 0.95) 100%)",
  },
  {
    title: "Add Object into Image",
    image: "/tool-add-object-into-image.png",
    bg: "linear-gradient(180deg, rgba(96, 40, 5, 0.7) 0%, rgba(12, 7, 3, 0.95) 100%)",
  },
  {
    title: "AI Anime Generator",
    image: "/tool-ai-anime-generator.png",
    bg: "linear-gradient(180deg, rgba(7, 84, 36, 0.7) 0%, rgba(4, 22, 12, 0.95) 100%)",
  },
  {
    title: "AI Character Generator",
    image: "/tool-ai-character-generator.png",
    bg: "linear-gradient(180deg, rgba(8, 52, 96, 0.7) 0%, rgba(5, 15, 23, 0.95) 100%)",
  },
  {
    title: "AI Coloring Book Generator",
    image: "/tool-ai-coloring-book-generator.png",
    bg: "linear-gradient(180deg, rgba(71, 0, 82, 0.7) 0%, rgba(18, 5, 26, 0.95) 100%)",
  },
  {
    title: "AI Comic Generator",
    image: "/tool-ai-comic-generator.png",
    bg: "linear-gradient(180deg, rgba(4, 73, 37, 0.7) 0%, rgba(3, 18, 11, 0.95) 100%)",
  },
  {
    title: "AI Design Sketch",
    image: "/tool-ai-design-sketch.png",
    bg: "linear-gradient(180deg, rgba(8, 58, 73, 0.7) 0%, rgba(4, 18, 24, 0.95) 100%)",
  },
  {
    title: "AI Photo Expand",
    image: "/tool-ai-photo-expand.png",
    bg: "linear-gradient(180deg, rgba(64, 0, 88, 0.7) 0%, rgba(22, 6, 38, 0.95) 100%)",
  },
  {
    title: "Image to Prompt",
    image: "/tool-image-to-prompt.png",
    bg: "linear-gradient(180deg, rgba(7, 84, 36, 0.7) 0%, rgba(4, 22, 12, 0.95) 100%)",
  },
  {
    title: "Remove Object from Image",
    image: "/tool-remove-object-from-image.png",
    bg: "linear-gradient(180deg, rgba(112, 48, 5, 0.7) 0%, rgba(15, 12, 6, 0.95) 100%)",
  },
  {
    title: "Turn Sketch to Art",
    image: "/tool-turn-sketch-to-art.png",
    bg: "linear-gradient(180deg, rgba(96, 40, 5, 0.7) 0%, rgba(12, 7, 3, 0.95) 100%)",
  },
  {
    title: "Vectorize Image",
    image: "/tool-vectorize-image.png",
    bg: "linear-gradient(180deg, rgba(8, 52, 96, 0.7) 0%, rgba(5, 15, 23, 0.95) 100%)",
  },
];

const Hero = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame
    let animationFrameId: number | null = null;
    let isPaused = false;

    const autoScroll = () => {
      if (scrollContainer && !isPaused) {
        scrollPosition += scrollSpeed;
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        
        // Reset to start when reaching the end of first set of cards for seamless loop
        const firstSetWidth = scrollContainer.scrollWidth / 2;
        if (scrollPosition >= firstSetWidth) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationFrameId = requestAnimationFrame(autoScroll);
    };

    // Pause on hover
    const handleMouseEnter = () => {
      isPaused = true;
    };

    const handleMouseLeave = () => {
      isPaused = false;
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    // Start auto-scroll
    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <Box
      as="section"
      width="100%"
      minHeight={{ base: "85vh", sm: "88vh", md: "90vh" }}
      bgImage="url('/Group%201.png')"
      bgSize={{ base: "cover", sm: "cover", md: "cover" }}
      bgRepeat="no-repeat"
      bgPosition={{ base: "center top", md: "center top" }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      px={{ base: 2, sm: 3, md: 6 }}
      pt={{ base: "75px", sm: "85px", md: "120px" }}
      pb={{ base: 6, sm: 8, md: 12 }}
      position="relative"
      overflow="hidden"
    >
      <Stack
        position="relative"
        maxW="90rem"
        zIndex={1}
        spacing={{ base: 5, sm: 6, md: 8 }}
        align="center"
        pt={{ base: 12, sm: 16, md: 32 }}
        pb={{ base: 4, md: 0 }}
        width="100%"
      >
        <Text
          as="h1"
          textTransform="none"
          fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontWeight="700"
          letterSpacing="-0.03em"
          lineHeight={{ base: "1.2", sm: "1.15", md: "1.05" }}
          fontSize={{ base: "clamp(1.5rem, 6vw + 0.5rem, 2rem)", sm: "clamp(1.75rem, 5vw + 0.5rem, 2.5rem)", md: "60px" }}
          color="#FFFFFF"
          px={{ base: 2, sm: 3, md: 0 }}
          width="100%"
        >
          <Box as="span" display="block">
            One Subscription,
          </Box>
          <Box as="span" display="block">
            Unlimited AI Visual Power
          </Box>
        </Text>
        <Text
          fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          fontWeight="500"
          fontSize={{ base: "clamp(0.75rem, 3vw + 0.25rem, 0.9375rem)", sm: "clamp(0.875rem, 2.5vw + 0.25rem, 1rem)", md: "30px" }}
          lineHeight={{ base: "1.5", sm: "1.55", md: "1.6" }}
          color="#FFFFFF99"
          px={{ base: 3, sm: 4, md: 0 }}
          maxW={{ base: "100%", md: "64rem" }}
          width="100%"
        >
          Cut Costs &amp; Boost Efficiency: Ditch Multiple Pricey AI Design Tools
        </Text>
        <Stack spacing={{ base: 6, sm: 8, md: 10 }} align="center" width="100%">
          <Button
            as={Link}
            href={isSignedIn ? "/dashboard/ai-tools" : "/login"}
            size={{ base: "sm", sm: "md", md: "lg" }}
            px={{ base: 6, sm: 8, md: 12 }}
            fontSize={{ base: "xs", sm: "sm", md: "md" }}
            bg="white"
            color="black"
            border="1px solid rgba(0, 0, 0, 0.1)"
            borderRadius="full"
            boxShadow="0 16px 45px rgba(10, 10, 14, 0.45)"
            minH={{ base: "40px", sm: "44px", md: "48px" }}
            width={{ base: "90%", sm: "auto" }}
            maxW={{ base: "320px", sm: "none" }}
            _hover={{
              bg: "rgba(255, 255, 255, 0.95)",
              transform: "translateY(-2px)",
            }}
            _active={{
              bg: "rgba(255, 255, 255, 0.9)",
              transform: "translateY(0)",
            }}
          >
            Start for free today
          </Button>

          <Box width="100%" maxW="full" px={{ base: 0, sm: 1, md: 4 }} mt={{ base: 2, md: 0 }}>
            <HStack
              ref={scrollRef}
              spacing={{ base: 2, sm: 2.5, md: 4, lg: 5 }}
              overflowX="auto"
              overflowY="hidden"
              py={{ base: 2, md: 2 }}
              px={{ base: 2, sm: 2, md: 4 }}
              width="100%"
              alignItems="stretch"
              sx={{
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
                scrollBehavior: "smooth",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {/* Duplicate cards for seamless infinite scroll */}
              {[...heroCards, ...heroCards].map((card, index) => (
                <Box
                  key={`${card.title}-${index}`}
                  borderRadius="xl"
                  width={{ base: "140px", sm: "160px", md: "232px" }}
                  minW={{ base: "140px", sm: "160px", md: "232px" }}
                  height={{ base: "180px", sm: "210px", md: "304px" }}
                  overflow="hidden"
                  bg={card.bg}
                  border="1px solid rgba(255,255,255,0.08)"
                  boxShadow="0 18px 55px rgba(8, 8, 12, 0.6)"
                  display="flex"
                  flexDirection="column"
                  flexShrink={0}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "0 24px 65px rgba(8, 8, 12, 0.8)",
                  }}
                >
                  <Stack
                    minHeight={{ base: "48px", sm: "56px", md: "72px" }}
                    px={{ base: 2, sm: 2.5, md: 4 }}
                    py={{ base: 1.5, sm: 2, md: 3 }}
                    align="flex-start"
                    justify="center"
                    flexShrink={0}
                  >
                    <Text 
                      fontSize={{ base: "0.625rem", sm: "xs", md: "md" }} 
                      fontWeight="700" 
                      color="white"
                      lineHeight={{ base: "1.25", md: "1.3" }}
                      noOfLines={2}
                    >
                      {card.title}
                    </Text>
                  </Stack>
                  <Box
                    width="100%"
                    flex="1"
                    minHeight="0"
                    backgroundImage={`url('${card.image}')`}
                    backgroundSize="cover"
                    backgroundPosition="center"
                  />
                </Box>
              ))}
            </HStack>
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Hero;
