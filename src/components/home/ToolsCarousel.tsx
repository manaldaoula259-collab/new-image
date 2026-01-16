"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { FiArrowUpRight } from "react-icons/fi";

const tools = [
  // AI Photo Filters (6 tools)
  {
    title: "Image to Prompt",
    description: "Upload an image and get an instant ready-to-use prompt for any diffusion model.",
    href: "/ai-photo-filter/image-to-prompt",
    gradientBg: "/assets/landing_page/more-tools/1.png",
    backgroundImage: "/assets/landing_page/more-tools/Image to Prompt.png",
    image: "/tool-image-to-prompt.png",
  },
  {
    title: "AI Design Sketch",
    description: "Turn photos into hand-drawn sketches with AI precision.",
    href: "/ai-photo-filter/ai-design-sketch",
    gradientBg: "/assets/landing_page/more-tools/2.png",
    backgroundImage: "/assets/landing_page/more-tools/AI Design Sketch.png",
    image: "/tool-ai-design-sketch.png",
  },
  {
    title: "AI Anime Filter",
    description: "Convert photos into stunning anime-style artwork instantly.",
    href: "/ai-photo-filter/ai-anime-filter",
    gradientBg: "/assets/landing_page/more-tools/3.png",
    backgroundImage: "/assets/landing_page/more-tools/AI Anime Generator.png",
    image: "/tool-ai-anime-filter.png",
  },
  {
    title: "2D to 3D Converter",
    description: "Transform 2D images into realistic 3D models—instantly and effortlessly.",
    href: "/ai-photo-filter/2d-to-3d-converter",
    gradientBg: "/assets/landing_page/more-tools/4.png",
    backgroundImage: "/assets/landing_page/more-tools/2D to 3D Converter.png",
    image: "/tool-2d-to-3d-converter.png",
  },
  {
    title: "Turn Sketch to Art",
    description: "Transform rough sketches into polished artwork with AI enhancement.",
    href: "/ai-photo-filter/turn-sketch-to-art",
    gradientBg: "/assets/landing_page/more-tools/5.png",
    backgroundImage: "/assets/landing_page/more-tools/Turn Sketch to Art.png",
    image: "/tool-turn-sketch-to-art.png",
  },
  {
    title: "AI Style Transfer",
    description: "Turn any photo into art instantly with AI—painterly, neon, abstract, and more.",
    href: "/ai-photo-filter/ai-style-transfer",
    gradientBg: "/assets/landing_page/more-tools/1.png",
    backgroundImage: "/assets/landing_page/more-tools/AI Style Transfer.png",
    image: "/tool-ai-style-transfer.png",
  },
  // AI Image Editors (8 tools)
  {
    title: "Remove Background",
    description: "Cut out subjects with crisp, studio-quality edges.",
    href: "/ai-image-editor/remove-background",
    gradientBg: "/assets/landing_page/more-tools/2.png",
    backgroundImage: "/assets/landing_page/more-tools/Remove Background.png",
    image: "/tool-remove-background.png",
  },
  {
    title: "Remove Object from Image",
    description: "Erase distractions while keeping backgrounds intact.",
    href: "/ai-image-editor/remove-object-from-image",
    gradientBg: "/assets/landing_page/more-tools/3.png",
    backgroundImage: "/assets/landing_page/more-tools/Remove Object into Image.png",
    image: "/tool-remove-object-from-image.png",
  },
  {
    title: "Add Object into Image",
    description: "Insert new elements seamlessly into any scene.",
    href: "/ai-image-editor/add-object-into-image",
    gradientBg: "/assets/landing_page/more-tools/4.png",
    backgroundImage: "/assets/landing_page/more-tools/Add Object into Image.png",
    image: "/tool-add-object-into-image.png",
  },
  {
    title: "AI Photo Enhancer",
    description: "Upscale and sharpen photos while keeping natural detail.",
    href: "/ai-image-editor/ai-photo-enhancer",
    gradientBg: "/assets/landing_page/more-tools/5.png",
    backgroundImage: "/assets/landing_page/more-tools/AI Photo Enhancer.png",
    image: "/tool-ai-photo-enhancer.png",
  },
  {
    title: "AI Photo Expand",
    description: "Extend image borders with realistic AI-generated context.",
    href: "/ai-image-editor/ai-photo-expand",
    gradientBg: "/assets/landing_page/more-tools/1.png",
    backgroundImage: "/assets/landing_page/more-tools/AI Photo Expand.png",
    image: "/tool-ai-photo-expand.png",
  },
  {
    title: "Vectorize Image",
    description: "Convert raster graphics into clean vector artwork.",
    href: "/ai-image-editor/vectorize-image",
    gradientBg: "/assets/landing_page/more-tools/2.png",
    backgroundImage: "/assets/landing_page/more-tools/Vectorize Image.png",
    image: "/tool-vectorize-image.png",
  },
  // AI Art Generators (5 tools)
  {
    title: "AI Character Generator",
    description: "Create consistent characters ready for storytelling.",
    href: "/ai-art-generator/ai-character-generator",
    gradientBg: "/assets/landing_page/more-tools/3.png",
    backgroundImage: "/assets/landing_page/more-tools/AI Character Generator.png",
    image: "/tool-ai-character-generator.png",
  },
  {
    title: "AI Anime Generator",
    description: "Generate stylized anime characters and scenes.",
    href: "/ai-art-generator/ai-anime-generator",
    gradientBg: "/assets/landing_page/more-tools/4.png",
    backgroundImage: "/assets/landing_page/more-tools/AI Anime Generator.png",
    image: "/tool-ai-anime-generator.png",
  },
  {
    title: "AI Comic Generator",
    description: "Turn prompts into bold comic-book panels.",
    href: "/ai-art-generator/ai-comic-generator",
    gradientBg: "/assets/landing_page/more-tools/5.png",
    backgroundImage: "/assets/landing_page/more-tools/AI Comic Generator.png",
    image: "/tool-ai-comic-generator.png",
  },
  {
    title: "AI Coloring Book Generator",
    description: "Produce line art perfect for coloring books and activities.",
    href: "/ai-art-generator/ai-coloring-book-generator",
    gradientBg: "/assets/landing_page/more-tools/1.png",
    backgroundImage: "/assets/landing_page/more-tools/AI Coloring Book Generator.png",
    image: "/tool-ai-coloring-book-generator.png",
  },
];

const ToolsCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 420;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScrollButtons, 300);
    }
  };

  return (
    <Box
      as="section"
      width="100%"
      py={{ base: 16, md: 24 }}
      bg="#FCFCFC"
    >
      <Container maxW="1400px" px={{ base: 4, md: 0 }}>
        {/* Section Header */}
        <Flex
          justify="space-between"
          align="center"
          mb={{ base: 8, md: 12 }}
          flexWrap="wrap"
          gap={4}
        >
          <Text
            as="h2"
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontWeight="500"
            fontSize={{ base: "36px", md: "48px", lg: "60px" }}
            lineHeight={{ base: "1.2", md: "66px" }}
            letterSpacing="-0.6px"
            color="black"
          >
            Explore more tools
          </Text>
          
          <HStack spacing={2}>
            <Box
              as="button"
              aria-label="Scroll left"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              cursor={canScrollLeft ? "pointer" : "not-allowed"}
              opacity={canScrollLeft ? 1 : 0.5}
              _hover={canScrollLeft ? { opacity: 0.8 } : {}}
              _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
              transition="opacity 0.2s"
            >
              <Image
                src="/assets/landing_page/more-tools/arrow_left.svg"
                alt=""
                width={48}
                height={48}
              />
            </Box>
            <Box
              as="button"
              aria-label="Scroll right"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              cursor={canScrollRight ? "pointer" : "not-allowed"}
              opacity={canScrollRight ? 1 : 0.5}
              _hover={canScrollRight ? { opacity: 0.8 } : {}}
              _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
              transition="opacity 0.2s"
            >
              <Image
                src="/assets/landing_page/more-tools/arrow_right.svg"
                alt=""
                width={48}
                height={48}
              />
            </Box>
          </HStack>
        </Flex>
      </Container>

      {/* Tools Grid - Full Width Scrolling */}
      <Box
        ref={scrollRef}
        overflowX="auto"
        onScroll={checkScrollButtons}
        width="100%"
        sx={{
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          WebkitOverflowScrolling: "touch",
        }}
      >
        <HStack 
          spacing={6} 
          pb={4} 
          pt={2}
          align="stretch"
          pl={{ base: 4, md: "max(16px, calc((100vw - 1400px) / 2))" }}
          pr={{ base: 4, md: "max(16px, calc((100vw - 1400px) / 2))" }}
        >
            {tools.map((tool) => (
              <Box
                key={tool.title}
                bg="white"
                borderRadius="24px"
                boxShadow="0px 81px 48px 0px rgba(0,0,0,0.06)"
                overflow="hidden"
                minW={{ base: "320px", md: "400px" }}
                maxW={{ base: "320px", md: "400px" }}
                flexShrink={0}
              >
                {/* Tool Preview */}
                <Box
                  m={2}
                  borderRadius="16px"
                  overflow="hidden"
                  bg="#f0f0f0"
                  height={{ base: "180px", md: "220px" }}
                  position="relative"
                  backdropFilter="blur(5px)"
                >
                  {/* Background Image (1-5.png) */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    width="100%"
                    height="100%"
                    sx={{
                      "& img": {
                        alt: "",
                        textIndent: "-9999px",
                      },
                    }}
                  >
                    <Image
                      src={tool.gradientBg}
                      alt=""
                      fill
                      unoptimized
                      role="presentation"
                      aria-hidden="true"
                      style={{
                        objectFit: "cover",
                        objectPosition: "center",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </Box>
                  
                  {/* Background Image Overlay - Rotated */}
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%) rotate(-24deg)"
                    width="200px"
                    height="200px"
                    zIndex={0}
                    sx={{
                      "& img": {
                        alt: "",
                        textIndent: "-9999px",
                      },
                    }}
                  >
                    <Image
                      src={tool.backgroundImage}
                      alt=""
                      fill
                      unoptimized
                      role="presentation"
                      aria-hidden="true"
                      style={{
                        objectFit: "contain",
                        objectPosition: "center",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </Box>
                  
                  {/* Tool Image */}
                  <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%) rotate(-24deg)"
                    width="200px"
                    height="200px"
                    zIndex={1}
                    sx={{
                      "& img": {
                        alt: "",
                        textIndent: "-9999px",
                        font: "0/0 a",
                        color: "transparent",
                      },
                    }}
                  >
                    <img
                      src={tool.image}
                      alt=""
                      role="presentation"
                      aria-hidden="true"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </Box>
                </Box>

                {/* Tool Info */}
                <VStack align="flex-start" p={6} spacing={3}>
                  <Text
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    fontWeight="500"
                    fontSize={{ base: "18px", md: "20px" }}
                    lineHeight="20px"
                    letterSpacing="-0.2px"
                    color="black"
                  >
                    {tool.title}
                  </Text>
                  <Text
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    fontWeight="400"
                    fontSize={{ base: "16px", md: "18px" }}
                    lineHeight="25.2px"
                    color="black"
                    minH="50px"
                  >
                    {tool.description}
                  </Text>
                  <Button
                    as={Link}
                    href={tool.href}
                    variant="link"
                    fontFamily="'IBM Plex Mono', monospace"
                    fontWeight="500"
                    fontSize="15px"
                    letterSpacing="0.6px"
                    color="#573cff"
                    rightIcon={<FiArrowUpRight />}
                    _hover={{ textDecoration: "none", opacity: 0.8 }}
                  >
                    EXPLORE
                  </Button>
                </VStack>
              </Box>
            ))}
          </HStack>
        </Box>
    </Box>
  );
};

export default ToolsCarousel;

