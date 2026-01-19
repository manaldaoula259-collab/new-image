"use client";

import {
  Box,
  Container,
  Flex,
  HStack,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import Image from "next/image";
import { FiLinkedin, FiInstagram, FiYoutube, FiTwitter } from "react-icons/fi";
import { SiTiktok } from "react-icons/si";

const FooterNew = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    aiPhotoFilter: {
      title: "AI Photo Filter",
      links: [
        { label: "2D to 3D Converter", href: "/ai-photo-filter/2d-to-3d-converter" },
        { label: "AI Design Sketch", href: "/ai-photo-filter/ai-design-sketch" },
        { label: "Image to Prompt", href: "/ai-photo-filter/image-to-prompt" },
        { label: "AI Style Transfer", href: "/ai-photo-filter/ai-style-transfer" },
        { label: "Turn Sketch to Art", href: "/ai-photo-filter/turn-sketch-to-art" },
        { label: "AI Anime Filter", href: "/ai-photo-filter/ai-anime-filter" },
      ],
    },
    aiImageEditor: {
      title: "AI Image Editor",
      links: [
        { label: "Add Object into Image", href: "/ai-image-editor/add-object-into-image" },
        { label: "Remove Object from Image", href: "/ai-image-editor/remove-object-from-image" },
        { label: "Remove Background", href: "/ai-image-editor/remove-background" },
        { label: "AI Photo Enhancer", href: "/ai-image-editor/ai-photo-enhancer" },
        { label: "AI Photo Expand", href: "/ai-image-editor/ai-photo-expand" },
        { label: "Vectorize Image", href: "/ai-image-editor/vectorize-image" },
      ],
    },
    aiArtGenerator: {
      title: "AI Art Generator",
      links: [
        { label: "AI Character Generator", href: "/ai-art-generator/ai-character-generator" },
        { label: "AI Anime Generator", href: "/ai-art-generator/ai-anime-generator" },
        { label: "AI Comic Generator", href: "/ai-art-generator/ai-comic-generator" },
        { label: "AI Coloring Book Generator", href: "/ai-art-generator/ai-coloring-book-generator" },
      ],
    },
    company: {
      title: "Company",
      links: [
        { label: "Pricing", href: "/#pricing" },
        { label: "Prompt", href: "/prompts" },
      ],
    },
  };

  const socialLinks = [
    { icon: FiLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: FiInstagram, href: "https://instagram.com", label: "Instagram" },
    { icon: FiYoutube, href: "https://youtube.com", label: "YouTube" },
    { icon: SiTiktok, href: "https://tiktok.com", label: "TikTok" },
    { icon: FiTwitter, href: "https://twitter.com", label: "Twitter" },
  ];

  const legalLinks = [
    { label: "Terms of service", href: "/terms" },
    { label: "Privacy policy", href: "/privacy" },
  ];

  return (
    <Box
      as="footer"
      width="100%"
      position="relative"
      overflow="hidden"
    >
      {/* Background Image - Rotated 180 degrees */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        width="100%"
        height="100%"
        zIndex={0}
        overflow="hidden"
      >
        <Box
          position="relative"
          width="100%"
          height="100%"
          minWidth="100%"
          minHeight="100%"
          sx={{
            transform: "rotate(180deg)",
            transformOrigin: "center center",
            "& img": {
              opacity: "1 !important",
            },
          }}
        >
          <Image
            src="/assets/landing_page/footer/bg.png"
            alt="Footer Background"
            fill
            style={{
              objectFit: "cover",
              objectPosition: "center",
              opacity: 1,
            }}
          />
        </Box>
      </Box>

      <Container maxW="1400px" px={{ base: 4, md: 8, lg: 12, xl: 16 }} position="relative" zIndex={1} py={{ base: 16, md: 20, lg: 24 }}>
        {/* Main Content - Logo/Description and Links */}
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ base: "flex-start", lg: "flex-start" }}
          mb={{ base: 12, md: 16, lg: 20 }}
          gap={{ base: 10, md: 12, lg: 16 }}
        >
          {/* Left Section - Logo, Description, Social */}
          <VStack align="flex-start" spacing={6} maxW={{ base: "100%", lg: "440px", xl: "480px" }} flexShrink={0}>
            {/* Logo - Top Position (Above paragraph text) */}
            <Box 
              position="relative" 
              display="inline-block"
              width="auto"
              height="auto"
              overflow="hidden"
              flexShrink={0}
              order={1}
            >
              <Image
                src="/assets/landing_page/logo-dark.svg"
                alt="MyDzine Logo"
                width={240}
                height={60}
                style={{ 
                  height: "auto",
                  width: "auto",
                  maxWidth: "240px",
                  maxHeight: "60px",
                }}
              />
            </Box>

            {/* Description/Paragraph Text - Below Logo */}
            <Text
              fontFamily="'General Sans', 'Inter', sans-serif"
              fontWeight="400"
              fontSize={{ base: "15px", md: "16px" }}
              lineHeight={{ base: "22px", md: "24px" }}
              color="white"
              opacity={0.95}
              order={2}
            >
              Transform your creativity with AI-powered photo editing and art generation tools. Create stunning visuals, enhance images, and bring your ideas to life with cutting-edge artificial intelligence.
            </Text>

            {/* Social Links - Below Description */}
            <HStack spacing={5} pt={2} order={3}>
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  isExternal
                  aria-label={social.label}
                  color="white"
                  _hover={{ opacity: 0.7, transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                >
                  <Box as={social.icon} size="24px" />
                </Link>
              ))}
            </HStack>
          </VStack>

          {/* Right Section - Navigation Links */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            flex={1}
            justify={{ base: "flex-start", lg: "flex-end" }}
            gap={{ base: 10, sm: 8, md: 10, lg: 12 }}
            flexWrap="nowrap"
            maxW={{ base: "100%", lg: "auto" }}
          >
            {Object.values(footerLinks).map((section) => (
              <VStack key={section.title} align="flex-start" spacing={5} minW={{ base: "140px", sm: "160px", md: "180px" }} flexShrink={0}>
                <Text
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="500"
                  fontSize={{ base: "15px", md: "16px" }}
                  lineHeight="19.2px"
                  letterSpacing="-0.16px"
                  color="white"
                  mb={2}
                >
                  {section.title}
                </Text>
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    as={NextLink}
                    href={link.href}
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    fontWeight="400"
                    fontSize={{ base: "14px", md: "15px" }}
                    lineHeight="22px"
                    color="white"
                    opacity={0.9}
                    _hover={{ opacity: 1, color: "white" }}
                    transition="opacity 0.2s"
                  >
                    {link.label}
                  </Link>
                ))}
              </VStack>
            ))}
          </Flex>
        </Flex>

        {/* Bottom Bar */}
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "center", md: "center" }}
          pt={{ base: 10, md: 12 }}
          borderTop="1px solid rgba(255,255,255,0.15)"
          gap={{ base: 4, md: 6 }}
          flexWrap="wrap"
        >
          <Text
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontWeight="400"
            fontSize={{ base: "12px", md: "13px" }}
            lineHeight="18px"
            color="white"
            opacity={0.9}
          >
            poweraitool • Copyright © {currentYear}
          </Text>

          <HStack spacing={2} flexWrap="wrap" justify={{ base: "center", md: "center" }}>
            <Text
              fontFamily="'General Sans', 'Inter', sans-serif"
              fontWeight="400"
              fontSize={{ base: "12px", md: "13px" }}
              lineHeight="18px"
              color="white"
              opacity={0.9}
            >
              Crafted by poweraitool 
            </Text>
            <Text color="white" opacity={0.5}>
              •
            </Text>
            <Link
              href="https://www.poweraitool.site"
              isExternal
              fontFamily="'General Sans', 'Inter', sans-serif"
              fontWeight="500"
              fontSize={{ base: "12px", md: "13px" }}
              lineHeight="18px"
              color="white"
              opacity={0.95}
              textDecoration="underline"
              _hover={{ opacity: 1 }}
              transition="opacity 0.2s"
            >
              www.poweraitool.site
            </Link>
          </HStack>

          <HStack spacing={{ base: 4, md: 6 }} flexWrap="wrap" justify="center">
            {legalLinks.map((link, index) => (
              <Box key={link.href} display="flex" alignItems="center">
                <Link
                  as={NextLink}
                  href={link.href}
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="400"
                  fontSize={{ base: "12px", md: "13px" }}
                  lineHeight="18px"
                  color="white"
                  opacity={0.9}
                  _hover={{ opacity: 1 }}
                  transition="opacity 0.2s"
                >
                  {link.label}
                </Link>
                {index < legalLinks.length - 1 && (
                  <Text color="white" opacity={0.5} mx={2}>•</Text>
                )}
              </Box>
            ))}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default FooterNew;

