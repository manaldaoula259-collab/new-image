import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";

const showcaseItems = [
  {
    title: "Portrait-to-Style Magic",
    description:
      "Transform real portraits into stylized avatars or cinematic illustrations while preserving facial detail, lighting, and personality.",
    cta: "Restyle portraits",
    href: "/ai-photo-filter/ai-style-transfer",
    image: "/showcase-ai-photo-filter.mp4",
    align: "left" as const,
  },
  {
    title: "Smart Image Blends",
    description:
      "Fuse multiple shots into one cohesive scene. Our AI harmonizes lighting, color, and perspective so every composite feels intentional.",
    cta: "Blend images together",
    href: "/ai-photo-filter/2d-to-3d-converter",
    image: "/showcase-combine-images.jpg",
    align: "right" as const,
  },
  {
    title: "Generative Rebuild",
    description:
      "Add, replace, or expand anything in seconds. Type what you need and see layouts evolve without ever opening a complex editor.",
    cta: "Modify with AI",
    href: "/ai-image-editor/add-object-into-image",
    image: "/showcase-generative-fill.jpg",
    align: "left" as const,
  },
  {
    title: "Instant Object Removal",
    description:
      "Erase people, logos, and distractions instantly. Just brush over areas you don't want—AI rebuilds the background automatically.",
    cta: "Remove unwanted objects",
    href: "/ai-art-generator/ai-anime-generator",
    image: "/showcase-remove-object.jpg",
    align: "right" as const,
  },
  {
    title: "Pro Background Switcher",
    description:
      "Swap complex backgrounds for studio-quality scenes with perfect edge detection—no manual masking required.",
    cta: "Swap backgrounds",
    href: "/ai-image-editor/remove-object-from-image",
    image: "/showcase-remove-background.jpg",
    align: "left" as const,
  },
  {
    title: "Dynamic Text & Logos",
    description:
      "Generate striking typography and logo concepts with layered textures, lighting, and motion-ready effects in a single click.",
    cta: "Design text effects",
    href: "/ai-photo-filter/turn-sketch-to-art",
    image: "/showcase-text-effects.jpg",
    align: "right" as const,
  },
];

const Showcase = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Stack
      as="section"
      spacing={{ base: 12, md: 16 }}
      py={{ base: 16, md: 20 }}
      px={{ base: 6, md: 10, xl: 20 }}
      mt={{ base: 12, md: 16 }}
      width="100%"
      maxW="1200px"
      marginX="auto"
    >
      <Stack spacing={4} textAlign="center" align="center">
        <Heading
          as="h2"
          fontSize={{ base: "clamp(2.2rem, 4vw + 1rem, 3.2rem)", md: "3.5rem" }}
          fontWeight="800"
          lineHeight="1.05"
          marginX="auto"
        >
          Create Anything With One AI Studio
        </Heading>
        <Text
          fontSize={{ base: "lg", md: "xl" }}
          color="rgba(226, 232, 240, 0.75)"
          maxW="42rem"
          marginX="auto"
        >
          Design, edit, and iterate faster than ever with AI-crafted workflows
          built for marketing teams, creators, and ambitious brands.
        </Text>
      </Stack>

      <Stack spacing={{ base: 10, md: 14 }}>
        {showcaseItems.map((item, index) => {
          const mediaBlock = (
            <Box
              key={`${item.title}-media`}
              borderRadius="2xl"
              overflow="hidden"
              w="100%"
              h={{ base: "260px", md: "320px" }}
              position="relative"
              border="1px solid rgba(255,255,255,0.08)"
              boxShadow="0 25px 60px rgba(8, 10, 22, 0.65)"
            >
              {item.image.endsWith(".mp4") ? (
                <video
                  src={item.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  style={{ objectFit: "cover" }}
                  priority={index < 2}
                />
              )}
            </Box>
          );

          const textBlock = (
            <Stack
              key={`${item.title}-text`}
              spacing={4}
              textAlign={{ base: "center", md: "left" }}
              maxW="32rem"
            >
              <Heading
                as="h3"
                fontSize={{ base: "2xl", md: "2.8rem" }}
                fontWeight="700"
                lineHeight="1.1"
              >
                {item.title}
              </Heading>
              <Text fontSize={{ base: "md", md: "lg" }} color="rgba(226,232,240,0.75)">
                {item.description}
              </Text>
              <Button
                as={Link}
                href={item.href}
                alignSelf={{ base: "center", md: "flex-start" }}
                bg="white"
                color="black"
                border="1px solid rgba(0, 0, 0, 0.1)"
                borderRadius="full"
                px={{ base: 6, md: 8 }}
                _hover={{
                  bg: "rgba(255, 255, 255, 0.95)",
                  transform: "translateY(-2px)",
                }}
                _active={{
                  bg: "rgba(255, 255, 255, 0.9)",
                  transform: "translateY(0)",
                }}
              >
                {item.cta}
              </Button>
            </Stack>
          );

          const content = (
            <SimpleGrid
              key={item.title}
              columns={{ base: 1, md: 2 }}
              spacing={{ base: 6, md: 12 }}
              alignItems="center"
            >
              {isMobile || item.align === "left" ? (
                <>
                  {mediaBlock}
                  {textBlock}
                </>
              ) : (
                <>
                  {textBlock}
                  {mediaBlock}
                </>
              )}
            </SimpleGrid>
          );

          return (
            <Flex key={item.title} justify="center" width="100%">
              {content}
            </Flex>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default Showcase;

