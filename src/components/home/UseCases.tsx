import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  chakra,
} from "@chakra-ui/react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import CharacterDesignImage from "@/../public/character-design.png";

type UseCaseKey =
  | "character-design"
  | "print-on-demand"
  | "product-photograph"
  | "game-assets"
  | "interior-design"
  | "marketing-assets";

type UseCaseContent = {
  key: UseCaseKey;
  label: string;
  title: string;
  description: string;
  highlight: string;
  images: Array<{
    src: string | StaticImageData;
    alt: string;
    translateX: { base: string; md: string };
    translateY: { base: string; md: string };
    zIndex: number;
    rotation: string;
    shadow: string;
  }>;
};

const useCaseData: UseCaseContent[] = [
  {
    key: "character-design",
    label: "Character Design",
    title: "Generate Consistent Characters",
    description:
      "With Dzine (formerly Stylar AI)'s diverse art styles and AI-assisted tools, designers can quickly create and customize characters for animations and games, including the conversion of ",
    highlight: "2D sketches into dynamic 3D characters.",
    images: [
      {
        src: CharacterDesignImage,
        alt: "Character concept illustration 1",
        translateX: { base: "-52%", md: "-56%" },
        translateY: { base: "16%", md: "12%" },
        zIndex: 1,
        rotation: "-6deg",
        shadow: "0 22px 45px rgba(11, 11, 19, 0.55)",
      },
      {
        src: CharacterDesignImage,
        alt: "Character concept illustration 2",
        translateX: { base: "0%", md: "0%" },
        translateY: { base: "0%", md: "-4%" },
        zIndex: 3,
        rotation: "0deg",
        shadow: "0 26px 55px rgba(12, 12, 20, 0.6)",
      },
      {
        src: CharacterDesignImage,
        alt: "Character concept illustration 3",
        translateX: { base: "52%", md: "56%" },
        translateY: { base: "18%", md: "14%" },
        zIndex: 2,
        rotation: "7deg",
        shadow: "0 22px 45px rgba(11, 11, 19, 0.55)",
      },
    ],
  },
  {
    key: "print-on-demand",
    label: "Print on Demand",
    title: "Design High-Impact Artwork",
    description:
      "Build cohesive collections for apparel, posters, and packaging with intelligent style variations that stay on-brand while exploring new directions.",
    highlight: "Launch-ready graphics in minutes.",
    images: [
      {
        src: "/image-to-image.jpg",
        alt: "Print on demand design 1",
        translateX: { base: "-48%", md: "-52%" },
        translateY: { base: "18%", md: "12%" },
        zIndex: 1,
        rotation: "-5deg",
        shadow: "0 20px 45px rgba(8, 8, 18, 0.5)",
      },
      {
        src: "/text-to-image.jpg",
        alt: "Print on demand design 2",
        translateX: { base: "0%", md: "0%" },
        translateY: { base: "-6%", md: "-6%" },
        zIndex: 3,
        rotation: "0deg",
        shadow: "0 26px 55px rgba(8, 8, 18, 0.58)",
      },
      {
        src: "/image-to-video.jpg",
        alt: "Print on demand design 3",
        translateX: { base: "48%", md: "52%" },
        translateY: { base: "16%", md: "12%" },
        zIndex: 2,
        rotation: "6deg",
        shadow: "0 20px 45px rgba(8, 8, 18, 0.5)",
      },
    ],
  },
  {
    key: "product-photograph",
    label: "Product Photograph",
    title: "Elevate Product Shoots",
    description:
      "Swap backgrounds, match lighting, and generate cinematic hero shots without reshoots. Perfect for ecommerce refreshes and seasonal campaigns.",
    highlight: "Consistent brand visuals at scale.",
    images: [
      {
        src: "/showcase-remove-background.jpg",
        alt: "Product photo enhancement 1",
        translateX: { base: "-50%", md: "-54%" },
        translateY: { base: "18%", md: "14%" },
        zIndex: 1,
        rotation: "-4deg",
        shadow: "0 20px 45px rgba(8, 9, 18, 0.5)",
      },
      {
        src: "/face-swap.jpg",
        alt: "Product photo enhancement 2",
        translateX: { base: "0%", md: "0%" },
        translateY: { base: "-6%", md: "-4%" },
        zIndex: 3,
        rotation: "0deg",
        shadow: "0 28px 55px rgba(8, 9, 18, 0.58)",
      },
      {
        src: "/image-to-image.jpg",
        alt: "Product photo enhancement 3",
        translateX: { base: "50%", md: "54%" },
        translateY: { base: "16%", md: "12%" },
        zIndex: 2,
        rotation: "5deg",
        shadow: "0 20px 45px rgba(8, 9, 18, 0.5)",
      },
    ],
  },
  {
    key: "game-assets",
    label: "Game Assets",
    title: "Concept Entire Worlds",
    description:
      "Experiment with lighting, moods, and prop variations rapidly. Turn loose sketches into finished scenes that match your gameplay vision.",
    highlight: "Cinematic-quality boards on demand.",
    images: [
      {
        src: "/showcase-combine-images.jpg",
        alt: "Game asset concept 1",
        translateX: { base: "-52%", md: "-56%" },
        translateY: { base: "16%", md: "12%" },
        zIndex: 1,
        rotation: "-6deg",
        shadow: "0 22px 45px rgba(7, 8, 18, 0.55)",
      },
      {
        src: "/showcase-generative-fill.jpg",
        alt: "Game asset concept 2",
        translateX: { base: "0%", md: "0%" },
        translateY: { base: "-6%", md: "-6%" },
        zIndex: 3,
        rotation: "0deg",
        shadow: "0 30px 55px rgba(7, 8, 18, 0.6)",
      },
      {
        src: "/showcase-text-effects.jpg",
        alt: "Game asset concept 3",
        translateX: { base: "52%", md: "56%" },
        translateY: { base: "18%", md: "14%" },
        zIndex: 2,
        rotation: "6deg",
        shadow: "0 22px 45px rgba(7, 8, 18, 0.55)",
      },
    ],
  },
  {
    key: "interior-design",
    label: "Interior Design",
    title: "Visualize Dream Spaces",
    description:
      "Render custom layouts, color palettes, and decor combinations instantly. Iterate with clients live and lock in approvals faster.",
    highlight: "Photo-real staging without staging costs.",
    images: [
      {
        src: "/image-to-image.jpg",
        alt: "Interior design concept 1",
        translateX: { base: "-50%", md: "-54%" },
        translateY: { base: "18%", md: "16%" },
        zIndex: 1,
        rotation: "-5deg",
        shadow: "0 22px 45px rgba(9, 10, 18, 0.52)",
      },
      {
        src: "/showcase-remove-object.jpg",
        alt: "Interior design concept 2",
        translateX: { base: "0%", md: "0%" },
        translateY: { base: "-6%", md: "-6%" },
        zIndex: 3,
        rotation: "0deg",
        shadow: "0 30px 55px rgba(9, 10, 18, 0.58)",
      },
      {
        src: "/text-to-image.jpg",
        alt: "Interior design concept 3",
        translateX: { base: "50%", md: "54%" },
        translateY: { base: "16%", md: "12%" },
        zIndex: 2,
        rotation: "6deg",
        shadow: "0 22px 45px rgba(9, 10, 18, 0.52)",
      },
    ],
  },
  {
    key: "marketing-assets",
    label: "Marketing Assets",
    title: "Ship Campaign-Ready Visuals",
    description:
      "Generate conversion-optimized graphics, social sets, and dynamic ad variations that feel handcrafted for every audience.",
    highlight: "Design once, adapt everywhere.",
    images: [
      {
        src: "/showcase-remove-object.jpg",
        alt: "Marketing asset concept 1",
        translateX: { base: "-50%", md: "-54%" },
        translateY: { base: "14%", md: "12%" },
        zIndex: 1,
        rotation: "-5deg",
        shadow: "0 22px 45px rgba(9, 10, 18, 0.52)",
      },
      {
        src: "/showcase-text-effects.jpg",
        alt: "Marketing asset concept 2",
        translateX: { base: "0%", md: "0%" },
        translateY: { base: "-6%", md: "-6%" },
        zIndex: 3,
        rotation: "0deg",
        shadow: "0 30px 55px rgba(9, 10, 18, 0.58)",
      },
      {
        src: "/showcase-generative-fill.jpg",
        alt: "Marketing asset concept 3",
        translateX: { base: "50%", md: "54%" },
        translateY: { base: "16%", md: "12%" },
        zIndex: 2,
        rotation: "6deg",
        shadow: "0 22px 45px rgba(9, 10, 18, 0.52)",
      },
    ],
  },
];

const UseCases = () => {
  const [activeKey, setActiveKey] = useState<UseCaseKey>("character-design");

  const activeContent = useMemo(
    () => useCaseData.find((item) => item.key === activeKey) ?? useCaseData[0],
    [activeKey]
  );

  return (
    <Box
      as="section"
      width="100%"
      bg="linear-gradient(180deg, #08090e 0%, #04040b 100%)"
      color="white"
      px={{ base: 6, md: 10, xl: 20 }}
      py={{ base: 16, md: 20 }}
    >
      <Stack
        maxW="1200px"
        marginX="auto"
        spacing={{ base: 10, md: 14 }}
        align="stretch"
      >
        <Stack spacing={4} textAlign="center" align="center">
          <Heading
            as="h2"
            fontSize={{
              base: "clamp(2.4rem, 4vw + 1rem, 3.5rem)",
              md: "clamp(3rem, 3vw + 1.25rem, 4rem)",
            }}
            fontWeight="800"
            letterSpacing="-0.02em"
            lineHeight="1.05"
          >
            Best Ways to Use Dzine AI Image Editor
          </Heading>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            color="rgba(226, 232, 240, 0.72)"
            maxW="48rem"
            marginX="auto"
          >
            What do the pros create with Dzine (formerly Stylar AI)?
          </Text>
        </Stack>

        <Box borderBottom="1px solid rgba(148, 163, 184, 0.12)" pb={2}>
          <Flex
            gap={{ base: 1.5, sm: 2, md: 3 }}
            wrap="nowrap"
            justify="center"
            overflowX="auto"
            px={{ base: 1, md: 0 }}
            py={0.5}
            sx={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              "&::-webkit-scrollbar": { display: "none" },
              WebkitOverflowScrolling: "touch",
            }}
          >
            {useCaseData.map((item) => {
              const isActive = item.key === activeKey;
              return (
                <Button
                  key={item.key}
                  onClick={() => setActiveKey(item.key)}
                  size="sm"
                  fontSize={{ base: "xs", sm: "xs", md: "sm" }}
                  fontWeight={isActive ? "700" : "600"}
                  color="black"
                  bg="white"
                  position="relative"
                  borderRadius="full"
                  px={{ base: 2.5, sm: 3, md: 3.5 }}
                  py={{ base: 1.5, md: 2 }}
                  minH={{ base: "32px", sm: "34px", md: "36px" }}
                  minW="fit-content"
                  whiteSpace="nowrap"
                  flexShrink={0}
                  cursor="pointer"
                  transition="all 300ms cubic-bezier(0.4, 0, 0.2, 1)"
                  border="1px solid rgba(0, 0, 0, 0.1)"
                  boxShadow={isActive ? "0 8px 20px rgba(0, 0, 0, 0.12)" : "0 4px 12px rgba(0, 0, 0, 0.08)"}
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.95)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                  }}
                  _active={{
                    bg: "rgba(255, 255, 255, 0.9)",
                    transform: "translateY(0)",
                  }}
                  _focus={{
                    outline: "2px solid rgba(255, 255, 255, 0.5)",
                    outlineOffset: "2px",
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Flex>
        </Box>

        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={{ base: 10, md: 14 }}
          alignItems="center"
        >
          <Stack
            spacing={{ base: 5, md: 6 }}
            maxW="32rem"
            textAlign={{ base: "center", md: "left" }}
            marginX={{ base: "auto", md: "0" }}
          >
            <Heading
              as="h3"
              fontSize={{ base: "2rem", md: "clamp(2.2rem, 2vw + 1rem, 3rem)" }}
              fontWeight="800"
              lineHeight="1.1"
            >
              {activeContent.title}
            </Heading>
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              color="rgba(226,232,240,0.75)"
              lineHeight="1.6"
            >
              {activeContent.description}
              <chakra.span fontWeight="700" color="white">
                {activeContent.highlight}
              </chakra.span>
            </Text>
          </Stack>

          <Flex
            position="relative"
            height={{ base: "320px", md: "420px" }}
            justify="center"
            align="center"
          >
            <Box
              position="absolute"
              inset={0}
              borderRadius="3xl"
              bg="linear-gradient(145deg, rgba(236,72,153,0.08), rgba(79,70,229,0.08))"
              filter="blur(60px)"
              opacity={0.7}
            />
            {activeContent.images.map((image, idx) => {
              const baseTransform = `translate(-50%, -50%) translate(${image.translateX.base}, ${image.translateY.base}) rotate(${image.rotation})`;
              const mdTransform = `translate(-50%, -50%) translate(${image.translateX.md}, ${image.translateY.md}) rotate(${image.rotation})`;
              const hoverBase = `translate(-50%, -50%) translate(${image.translateX.base}, calc(${image.translateY.base} - 6px)) rotate(${image.rotation})`;
              const hoverMd = `translate(-50%, -50%) translate(${image.translateX.md}, calc(${image.translateY.md} - 8px)) rotate(${image.rotation})`;
              const srcKey =
                typeof image.src === "string" ? image.src : image.src.src;

              return (
                <Box
                  key={`${activeContent.key}-${srcKey}-${idx}`}
                  position="absolute"
                  top="50%"
                  left="50%"
                  zIndex={image.zIndex}
                  width={{ base: "52%", md: "44%" }}
                  maxW={{ base: "200px", md: "260px" }}
                  borderRadius="2xl"
                  overflow="hidden"
                  transform={baseTransform}
                  boxShadow={image.shadow}
                  transition="transform 300ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    transform: hoverBase,
                    boxShadow: "0 32px 60px rgba(6, 7, 18, 0.6)",
                  }}
                  sx={{
                    aspectRatio: "3 / 4",
                    "@media (min-width: 48em)": {
                      transform: mdTransform,
                    },
                    "@media (min-width: 48em) and (hover: hover)": {
                      "&:hover": {
                        transform: hoverMd,
                      },
                    },
                  }}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 960px) 40vw, 80vw"
                    style={{ objectFit: "cover" }}
                    priority={activeKey === "character-design" && idx === 1}
                  />
                </Box>
              );
            })}
          </Flex>
        </SimpleGrid>
      </Stack>
    </Box>
  );
};

export default UseCases;

