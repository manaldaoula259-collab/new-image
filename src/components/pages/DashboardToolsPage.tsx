"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { toolCategories, dashboardTools } from "@/data/dashboard";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Icon,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  VStack,
  Button,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { toDashboardToolHref } from "@/core/utils/toDashboardToolHref";
import { useState, useMemo } from "react";
import { FiSearch, FiArrowRight, FiStar, FiTrendingUp, FiZap } from "react-icons/fi";

// Tool image mapping - Using local images for FLUX tools
const getToolImage = (title: string): string => {
  const imageMap: Record<string, string> = {
    // FLUX Series - Using local images
    "FLUX 1.1 Pro": "/assets/ai-tools/FLUX 1.1 Pro.png",
    "FLUX 1.1 Pro Ultra": "/assets/ai-tools/FLUX 1.1 Pro Ultra.png",
    "FLUX Schnell": "/assets/ai-tools/FLUX Schnell.png",
    "FLUX Dev": "/assets/ai-tools/FLUX Dev.png",
    "FLUX Pro": "/assets/ai-tools/FLUX Pro.png",
    "FLUX Kontext Pro": "/assets/ai-tools/FLUX Kontext Pro.png",
    "FLUX Kontext Max": "/assets/ai-tools/FLUX Kontext Max.png",
    "FLUX Fill Pro": "/assets/ai-tools/FLUX Fill Pro.png",
    "FLUX Redux": "/assets/ai-tools/FLUX Redux.png",
    "FLUX Canny Pro": "/assets/ai-tools/FLUX Canny Pro.png",
    "FLUX Depth Pro": "/assets/ai-tools/FLUX Depth Pro.png",

    // Seedream Series - Using local images
    "Seedream 3.0": "/assets/ai-tools/Seedream 3.0.png",
    "Seedream 4.0": "/assets/ai-tools/Seedream 4.0.png",

    // Other Image Models - Using local images
    "Ideogram V3": "/assets/ai-tools/Ideogram V3.png",
    "Ideogram V2 Turbo": "/assets/ai-tools/Ideogram V2 Turbo.png",
    "Recraft V3": "/assets/ai-tools/Recraft V3.png",
    "Recraft V3 SVG": "/assets/ai-tools/Recraft V3 SVG.png",
    "Hidream I1 Full": "/assets/ai-tools/Hidream I1 Full.png",
    "Hidream I1 Dev": "/assets/ai-tools/Hidream I1 Dev.png",
    "Hidream I1 Fast": "/assets/ai-tools/Hidream I1 Fast.png",
    "Sana": "/assets/ai-tools/Sana.png",
    "Hunyuan Image": "/assets/ai-tools/Hunyuan Image.png",
    "Kling 2.0 Image": "/assets/ai-tools/Kling 2.0 Image.png",
    "Stable Diffusion 3.5 Large": "/assets/ai-tools/Stable Diffusion 3.5 Large.png",
    "Stable Diffusion 3.5 Large Turbo": "/assets/ai-tools/Stable Diffusion 3.5 Large Turbo.png",
    "SDXL": "/assets/ai-tools/SDXL.png",
    "SDXL Lightning": "/assets/ai-tools/SDXL Lightning.png",
    "Playground V3": "/assets/ai-tools/Playground V3.png",
    "Kolors": "/assets/ai-tools/Kolors.png",
    "Juggernaut XL": "/assets/ai-tools/Juggernaut XL.png",
    "RealVisXL V5": "/assets/ai-tools/RealVisXL V5.png",
    "Dalle 3 (via Replicate)": "/assets/ai-tools/Dalle 3 (via Replicate).png",
    "Midjourney Style": "/assets/ai-tools/Midjourney Style.png",
    "Dreamshaper XL": "/assets/ai-tools/Dreamshaper XL.png",
    "Proteus V0.5": "/assets/ai-tools/Proteus V0.5.png",
    "AnimagineXL V3.1": "/assets/ai-tools/AnimagineXL V3.1.png",
    "Pony Diffusion XL": "/assets/ai-tools/Pony Diffusion XL.png",
    "OpenJourney V4": "/assets/ai-tools/OpenJourney V4.png",
    "Pixart Sigma": "/assets/ai-tools/Pixart Sigma.png",
    "Pixart Sigma-1": "/assets/ai-tools/Pixart Sigma-1.png",
    "Kandinsky 3.0": "/assets/ai-tools/Kandinsky 3.0.png",
    "Qwen VL Image": "/assets/ai-tools/Qwen VL Image.png",
    "Wuerstchen": "/assets/ai-tools/Wuerstchen.png",

    // Face & Portrait Tools - Using local images
    "AI Face Swap": "/assets/ai-tools/AI Face Swap.png",
    "Face Restore": "/assets/ai-tools/GFPGAN Face Restore.png",
    "AI Headshot Generator": "/assets/ai-tools/AI Headshot Generator.png",

    // Style Transfer & Filters - Using local images
    "AI Style Transfer": "/assets/ai-tools/AI Style Transfer.png",
    "AI Anime Filter": "/assets/ai-tools/AI Anime Filter.png",
    "Convert to Studio Ghibli": "/assets/ai-tools/Convert to Studio Ghibli.png",
    "Convert Photo to Pixar": "/assets/ai-tools/Convert Photo to Pixar.png",
    "Convert Photo to Disney": "/assets/ai-tools/Convert Photo to Disney.png",
    "Convert Photo to Simpsons": "/assets/ai-tools/Convert Photo to Simpsons.png",
    "Convert Photo to Watercolor": "/assets/ai-tools/Convert Photo to Watercolor.png",
    "Convert Photo to Oil Painting": "/assets/ai-tools/Convert Photo to Oil Painting.png",
    "Convert to Action Figure": "/assets/ai-tools/Convert to Action Figure.png",
    "Convert Pet to Human": "/assets/ai-tools/Convert Pet to Human.png",
    "Convert Photo to 3D": "/assets/ai-tools/Convert Photo to 3D.png",
    "Convert Photo to Cartoon": "/assets/ai-tools/Convert Photo to Cartoon.png",
    "Convert Photo to Clay": "/assets/ai-tools/Convert Photo to Clay.png",
    "Convert Photo to Cyberpunk": "/assets/ai-tools/Convert Photo to Cyberpunk.png",
    "Convert Photo to Illustration": "/assets/ai-tools/Convert Photo to Illustration.png",
    "Convert Photo to Lego": "/assets/ai-tools/Convert Photo to Lego.png",
    "Convert Photo to Pixel": "/assets/ai-tools/Convert Photo to Pixel.png",

    // Image Generation - Using local images
    "AI Image Generator": "/assets/ai-tools/AI Image Generator.png",
    "AI Character Generator": "/assets/ai-tools/AI Character Generator.png",
    "AI Anime Generator": "/assets/ai-tools/AI Anime Generator.png",
    "AI Comic Generator": "/assets/ai-tools/AI Comic Generator.png",
    "AI Coloring Book Generator": "/assets/ai-tools/AI Coloring Book Generator.png",

    // Photo Editing - Using local images
    "Remove Background": "/assets/ai-tools/Remove Background.png",
    "Remove Object from Image": "/assets/ai-tools/Remove Object from Image.png",
    "Add Object into Image": "/assets/ai-tools/Add Object into Image.png",
    "AI Photo Enhancer": "/assets/ai-tools/AI Photo Enhancer.png",
    "AI Photo Expand": "/assets/ai-tools/AI Photo Expand.png",
    "Watermark Remover": "/assets/ai-tools/Watermark Remover.png",

    // Converters - Using local images
    "2D to 3D Converter": "/assets/ai-tools/2D to 3D Converter.png",
    "Vectorize Image": "/assets/ai-tools/Vectorize Image.png",
    "Image to Prompt": "/assets/ai-tools/Image to Prompt.png",

    // Sketch & Art - Using local images
    "Turn Sketch to Art": "/assets/ai-tools/Turn Sketch to Art.png",
    "AI Design Sketch": "/assets/ai-tools/AI Design Sketch.png",

    // Image Effects - Using local images
    "New Yorker Cartoon Generator": "/assets/ai-tools/New Yorker Cartoon Generator.png",
    "AI Album Cover Generator": "/assets/ai-tools/AI Album Cover Generator.png",
    "Kpop Demon Hunter Filter": "/assets/ai-tools/Kpop Demon Hunter Filter.png",
    "Pet Passport Photo Generator": "/assets/ai-tools/Pet Passport Photo Generator.png",
    "Labubu Doll Generator": "/assets/ai-tools/Labubu Doll Generator.png",
    "Ghibli Generator": "/assets/ai-tools/Ghibli Generator.png",
    "Zootopia Filter": "/assets/ai-tools/Zootopia Filter.png",
    "AI Christmas Filter": "/assets/ai-tools/AI Christmas Filter.png",
    "AI Halloween Filter": "/assets/ai-tools/AI Halloween Filter.png",
    "Halloween Costume Generator": "/assets/ai-tools/Halloween Costume Generator.png",
    "Pet Halloween Costume Generator": "/assets/ai-tools/Pet Halloween Costume Generator.png",

    // Effects
    "AI Bokeh Effect": "https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=400&h=300&fit=crop",
    "AI HDR Effect": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    "AI Vintage Effect": "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=300&fit=crop",
    "AI Glitch Effect": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop",
    "AI Neon Effect": "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=300&fit=crop",
    "AI Cyberpunk Effect": "https://images.unsplash.com/photo-1515705576963-95cad62945b6?w=400&h=300&fit=crop",
    "AI Double Exposure": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=300&fit=crop",

    // Upscalers - Using local images
    "Real-ESRGAN 4x+": "/assets/ai-tools/Real-ESRGAN 4x+.png",
    "Clarity Upscaler": "/assets/ai-tools/Clarity Upscaler.png",
    "SUPIR Upscaler": "/assets/ai-tools/SUPIR Upscaler.png",
    "Anime Upscaler": "/assets/ai-tools/Anime Upscaler.png",
    "GFPGAN Face Restore": "/assets/ai-tools/GFPGAN Face Restore.png",
    "CodeFormer": "/assets/ai-tools/CodeFormer.png",

    // ControlNet - Using local images
    "ControlNet Canny": "/assets/ai-tools/ControlNet Canny.png",
    "ControlNet Depth": "/assets/ai-tools/ControlNet Depth.png",
    "ControlNet Pose": "/assets/ai-tools/ControlNet Pose.png",
    "ControlNet Scribble": "/assets/ai-tools/ControlNet Scribble.png",
    "ControlNet Soft Edge": "/assets/ai-tools/ControlNet Soft Edge.png",
    "ControlNet Line Art": "/assets/ai-tools/ControlNet Line Art.png",
    "ControlNet QR Code": "/assets/ai-tools/ControlNet QR Code.png",
    "IP-Adapter": "/assets/ai-tools/IP-Adapter.png",
    "IP-Adapter Face": "/assets/ai-tools/IP-Adapter Face.png",

    // Portrait Tools - Using local images
    "InstantID": "/assets/ai-tools/InstantID.png",
    "PhotoMaker": "/assets/ai-tools/PhotoMaker.png",
    "Age Progression": "/assets/ai-tools/Age Progression.png",
    "Gender Swap": "/assets/ai-tools/Gender Swap.png",
    "AI Makeup": "/assets/ai-tools/AI Makeup.png",
    "Hair Style Changer": "/assets/ai-tools/Hair Style Changer.png",
    "Expression Editor": "/assets/ai-tools/Expression Editor.png",
    "AI Clothes Changer": "/assets/ai-tools/AI Clothes Changer.png",

    // Background Tools - Using local images
    "Background Remover Pro": "/assets/ai-tools/Background Remover Pro.png",
    "Background Generator": "/assets/ai-tools/Background Generator.png",
    "Background Blur": "/assets/ai-tools/Background Blur.png",
    "Background Replace": "/assets/ai-tools/Background Replace.png",

    // Video Models - Using local images
    "Kling 2.0 Video": "/assets/ai-tools/Kling 2.0 Video.png",
    "Hunyuan Video": "/assets/ai-tools/Hunyuan Video.png",
    "Minimax Video": "/assets/ai-tools/Minimax Video.png",
    "Wan 2.1 Video": "/assets/ai-tools/Wan 2.1 Video.png",
    "LTX Video": "/assets/ai-tools/LTX Video.png",
    "CogVideoX-5B": "/assets/ai-tools/CogVideoX-5B.png",
    "Stable Video Diffusion": "/assets/ai-tools/Stable Video Diffusion.png",
    "AnimateDiff Lightning": "/assets/ai-tools/AnimateDiff Lightning.png",
    "Luma Dream Machine": "/assets/ai-tools/Luma Dream Machine.png",
    "Runway Gen-3": "/assets/ai-tools/Runway Gen-3.png",
    "Pika Video": "/assets/ai-tools/Pika Video.png",
    "Image to Video": "/assets/ai-tools/Image to Video.png",

    // Old Photo
    "Old Photo Restoration": "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=400&h=300&fit=crop",
    "Photo Colorization": "https://images.unsplash.com/photo-1509909756405-be0199881695?w=400&h=300&fit=crop",
  };

  // Return mapped image or a default creative image
  return imageMap[title] || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop";
};

// Featured/Popular tools
const featuredToolNames = [
  "AI Face Swap",
  "Convert to Studio Ghibli",
  "Remove Background",
  "AI Image Generator",
];

const ToolCard = ({ tool, variant = "default" }: { tool: typeof dashboardTools[0]; variant?: "default" | "featured" }) => {
  const isFeatured = variant === "featured";

  return (
    <Box
      as={Link}
      href={toDashboardToolHref(tool.href)}
      bg="white"
      borderRadius={{ base: "14px", md: "16px" }}
      overflow="hidden"
      border="1px solid #E5E5E5"
      transition="all 0.25s ease"
      position="relative"
      _hover={{
        borderColor: "#6366f1",
        transform: "translateY(-4px)",
        boxShadow: "0 12px 30px rgba(99, 102, 241, 0.15)",
        "& .tool-image": {
          transform: "scale(1.05)",
        },
        "& .tool-arrow": {
          opacity: 1,
          transform: "translateX(0)",
        },
      }}
    >
      <Box
        position="relative"
        h="350px"
        bg="linear-gradient(135deg, #F8F7FF 0%, #FDF8F6 100%)"
        overflow="hidden"
      >
        <Box
          className="tool-image"
          position="absolute"
          inset={0}
          transition="transform 0.4s ease"
        >
          <Image
            src={getToolImage(tool.title)}
            alt={tool.title}
            fill
            style={{ objectFit: "cover" }}
          />
        </Box>

        {/* Gradient overlay */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="50%"
          bg="linear-gradient(to top, rgba(0,0,0,0.03) 0%, transparent 100%)"
        />
      </Box>

      <Box p={{ base: 3, md: 4 }}>
        <Flex align="center" justify="space-between" mb={2}>
          <HStack spacing={2}>
            <Flex
              w={{ base: "26px", md: "28px" }}
              h={{ base: "26px", md: "28px" }}
              borderRadius="8px"
              bg="#F5F3FF"
              align="center"
              justify="center"
              flexShrink={0}
            >
              <Icon as={tool.icon} fontSize={{ base: "12px", md: "14px" }} color="#6366f1" />
            </Flex>
            <Text
              fontSize={{ base: "13px", md: "14px" }}
              fontWeight="500"
              color="black"
              noOfLines={1}
              fontFamily="'General Sans', 'Inter', sans-serif"
            >
              {tool.title}
            </Text>
          </HStack>
          <Icon
            className="tool-arrow"
            as={FiArrowRight}
            fontSize="14px"
            color="#6366f1"
            opacity={0}
            transform="translateX(-5px)"
            transition="all 0.25s ease"
          />
        </Flex>
        <Text
          fontSize={{ base: "11px", md: "12px" }}
          color="#71717A"
          noOfLines={2}
          lineHeight="1.5"
          fontFamily="'General Sans', 'Inter', sans-serif"
        >
          {tool.description}
        </Text>
      </Box>
    </Box>
  );
};

const CategorySection = ({ category, index }: { category: typeof toolCategories[0]; index: number }) => {
  const colors = [
    { bg: "#F5F3FF", color: "#6366f1" },
    { bg: "#FEF3F2", color: "#E11D48" },
    { bg: "#F0FDF4", color: "#16A34A" },
    { bg: "#FEF9C3", color: "#CA8A04" },
    { bg: "#E0F2FE", color: "#0284C7" },
    { bg: "#FCE7F3", color: "#DB2777" },
  ];
  const colorSet = colors[index % colors.length];

  return (
    <Box mb={{ base: 8, md: 10 }}>
      <Flex align="center" justify="space-between" mb={{ base: 4, md: 5 }}>
        <HStack spacing={3}>
          <Flex
            w={{ base: "36px", md: "40px" }}
            h={{ base: "36px", md: "40px" }}
            borderRadius={{ base: "10px", md: "12px" }}
            bg={colorSet.bg}
            align="center"
            justify="center"
          >
            <Icon as={category.icon} fontSize={{ base: "16px", md: "18px" }} color={colorSet.color} />
          </Flex>
          <Box>
            <Text
              fontSize={{ base: "16px", md: "18px" }}
              fontWeight="500"
              color="black"
              fontFamily="'General Sans', 'Inter', sans-serif"
            >
              {category.label}
            </Text>
            <Text fontSize={{ base: "11px", md: "12px" }} color="#71717A">
              {category.tools.length} tools available
            </Text>
          </Box>
        </HStack>
      </Flex>

      <Grid
        templateColumns={{
          base: "repeat(2, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(5, 1fr)",
          lg: "repeat(5, 1fr)",
          xl: "repeat(5, 1fr)",
          "2xl": "repeat(5, 1fr)",
        }}
        gap={{ base: 3, md: 4 }}
      >
        {category.tools.map((tool) => (
          <ToolCard key={tool.title} tool={tool} />
        ))}
      </Grid>
    </Box>
  );
};

const DashboardToolsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const featuredTools = useMemo(() => {
    return dashboardTools.filter(t => featuredToolNames.includes(t.title));
  }, []);

  const filteredTools = useMemo(() => {
    if (!searchQuery) return null;
    return dashboardTools.filter(tool =>
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredCategories = useMemo(() => {
    if (selectedCategory) {
      return toolCategories.filter(c => c.id === selectedCategory);
    }
    return toolCategories;
  }, [selectedCategory]);

  return (
    <DashboardShell activeItem="ai-tools">
      {/* Hero Header */}
      <Box
        borderRadius={{ base: "16px", md: "20px" }}
        p={{ base: 5, md: 6, lg: 8 }}
        mb={{ base: 6, md: 8 }}
        position="relative"
        overflow="hidden"
      >
        {/* Background Image */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width="160%"
          height="160%"
          zIndex={0}
          sx={{
            transform: "translate(-50%, -50%) scale(1.1)",
            transformOrigin: "center center",
          }}
        >
          <Box position="relative" width="100%" height="100%">
            <Image
              src="/assets/landing_page/hero_bg.png"
              alt="Card Background"
              fill
              style={{
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </Box>
        </Box>

        <Box position="relative" zIndex={1} display="flex" flexDirection="column" alignItems="center" textAlign="center">
          <Box mb={{ base: 5, md: 6 }} width="100%">
            <HStack spacing={2} mb={2} justify="center">
              <Icon as={FiZap} color="white" fontSize="18px" />
              <Text
                fontSize={{ base: "11px", md: "12px" }}
                fontWeight="600"
                color="white"
                textTransform="uppercase"
                letterSpacing="1px"
              >
                {dashboardTools.length} AI Tools
              </Text>
            </HStack>
            <Heading
              as="h1"
              fontSize={{ base: "24px", sm: "28px", md: "32px", lg: "36px" }}
              fontWeight="500"
              color="white"
              letterSpacing="-0.02em"
              fontFamily="'General Sans', 'Inter', sans-serif"
              mb={2}
            >
              Explore AI Tools
            </Heading>
            <Text
              fontSize={{ base: "13px", md: "14px", lg: "15px" }}
              color="white"
              opacity={0.9}
              maxW="800px"
              mx="auto"
              fontFamily="'General Sans', 'Inter', sans-serif"
              noOfLines={1}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              Powerful tools for image generation, editing, style transfer, and creative automation
            </Text>
          </Box>

          {/* Search Bar */}
          <InputGroup maxW={{ base: "100%", md: "600px", lg: "700px" }} mx="auto">
            <InputLeftElement pointerEvents="none" h="48px">
              <Icon as={FiSearch} color="#A1A1AA" fontSize="18px" />
            </InputLeftElement>
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="white"
              border="1px solid #E5E5E5"
              borderRadius="12px"
              h="48px"
              fontSize="14px"
              fontFamily="'General Sans', 'Inter', sans-serif"
              color="#1a1a1a"
              _placeholder={{ color: "#A1A1AA" }}
              _focus={{
                borderColor: "#6366f1",
                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)"
              }}
            />
          </InputGroup>
        </Box>
      </Box>

      {/* Search Results */}
      {searchQuery && filteredTools && (
        <Box mb={{ base: 6, md: 8 }}>
          <Flex align="center" justify="space-between" mb={4}>
            <Text fontSize={{ base: "14px", md: "15px" }} color="#52525B">
              {filteredTools.length} results for &quot;{searchQuery}&quot;
            </Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              color="#6366f1"
              fontSize="13px"
              fontWeight="500"
            >
              Clear search
            </Button>
          </Flex>

          {filteredTools.length > 0 ? (
            <Grid
              templateColumns={{
                base: "repeat(2, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(5, 1fr)",
                lg: "repeat(5, 1fr)",
                xl: "repeat(5, 1fr)",
                "2xl": "repeat(5, 1fr)",
              }}
              gap={{ base: 3, md: 4 }}
            >
              {filteredTools.map((tool) => (
                <ToolCard key={tool.title} tool={tool} />
              ))}
            </Grid>
          ) : (
            <Box
              textAlign="center"
              py={12}
              bg="#F9FAFB"
              borderRadius="16px"
              border="1px solid #E5E5E5"
            >
              <Text fontSize="15px" color="#52525B" mb={2}>No tools found</Text>
              <Text fontSize="13px" color="#A1A1AA">Try a different search term</Text>
            </Box>
          )}
        </Box>
      )}

      {/* Featured Tools */}
      {!searchQuery && (
        <Box mb={{ base: 8, md: 10 }}>
          <Flex align="center" justify="space-between" mb={{ base: 4, md: 5 }}>
            <HStack spacing={3}>
              <Flex
                w={{ base: "36px", md: "40px" }}
                h={{ base: "36px", md: "40px" }}
                borderRadius={{ base: "10px", md: "12px" }}
                bg="linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)"
                align="center"
                justify="center"
              >
                <Icon as={FiStar} fontSize={{ base: "16px", md: "18px" }} color="#D97706" />
              </Flex>
              <Box>
                <Text
                  fontSize={{ base: "16px", md: "18px" }}
                  fontWeight="500"
                  color="black"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                >
                  Popular Tools
                </Text>
                <Text fontSize={{ base: "11px", md: "12px" }} color="#71717A">
                  Most used by creators
                </Text>
              </Box>
            </HStack>
          </Flex>

          <Grid
            templateColumns={{
              base: "repeat(2, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(4, 1fr)",
              xl: "repeat(4, 1fr)",
            }}
            gap={{ base: 3, md: 4 }}
          >
            {featuredTools.map((tool) => (
              <ToolCard key={tool.title} tool={tool} variant="featured" />
            ))}
          </Grid>
        </Box>
      )}

      {/* Category Filter Pills */}
      {!searchQuery && (
        <Flex
          gap={2}
          mb={{ base: 6, md: 8 }}
          flexWrap="wrap"
          pb={2}
        >
          <Button
            size="sm"
            px={4}
            h="36px"
            borderRadius="full"
            bg={selectedCategory === null ? "black" : "#F5F5F5"}
            color={selectedCategory === null ? "white" : "#52525B"}
            fontWeight="500"
            fontSize="13px"
            fontFamily="'General Sans', 'Inter', sans-serif"
            onClick={() => setSelectedCategory(null)}
            _hover={{
              bg: selectedCategory === null ? "black" : "#E5E5E5",
            }}
          >
            All Categories
          </Button>
          {toolCategories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              px={4}
              h="36px"
              borderRadius="full"
              bg={selectedCategory === cat.id ? "black" : "#F5F5F5"}
              color={selectedCategory === cat.id ? "white" : "#52525B"}
              fontWeight="500"
              fontSize="13px"
              fontFamily="'General Sans', 'Inter', sans-serif"
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              _hover={{
                bg: selectedCategory === cat.id ? "black" : "#E5E5E5",
              }}
            >
              {cat.label}
              <Text
                as="span"
                ml={1.5}
                fontSize="11px"
                color={selectedCategory === cat.id ? "rgba(255,255,255,0.6)" : "#A1A1AA"}
              >
                {cat.tools.length}
              </Text>
            </Button>
          ))}
        </Flex>
      )}

      {/* Categories with Tools */}
      {!searchQuery && filteredCategories.map((category, index) => (
        <CategorySection key={category.id} category={category} index={index} />
      ))}
    </DashboardShell>
  );
};

export default DashboardToolsPage;
