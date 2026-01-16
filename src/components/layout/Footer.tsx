"use client";

import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  HStack,
  Link,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { SignUpButton } from "@clerk/nextjs";
import NextLink from "next/link";
import Image from "next/image";
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    aiPhotoFilter: [
      { label: "2D to 3D Converter", href: "/ai-photo-filter/2d-to-3d-converter" },
      { label: "AI Design Sketch", href: "/ai-photo-filter/ai-design-sketch" },
      { label: "Image to Prompt", href: "/ai-photo-filter/image-to-prompt" },
      { label: "AI Style Transfer", href: "/ai-photo-filter/ai-style-transfer" },
      { label: "Turn Sketch to Art", href: "/ai-photo-filter/turn-sketch-to-art" },
      { label: "AI Anime Filter", href: "/ai-photo-filter/ai-anime-filter" },
    ],
    aiImageEditor: [
      { label: "Add Object into Image", href: "/ai-image-editor/add-object-into-image" },
      { label: "Remove Object from Image", href: "/ai-image-editor/remove-object-from-image" },
      { label: "Remove Background", href: "/ai-image-editor/remove-background" },
      { label: "AI Photo Enhancer", href: "/ai-image-editor/ai-photo-enhancer" },
      { label: "AI Photo Expand", href: "/ai-image-editor/ai-photo-expand" },
      { label: "Vectorize Image", href: "/ai-image-editor/vectorize-image" },
    ],
    aiArtGenerator: [
      { label: "AI Character Generator", href: "/ai-art-generator/ai-character-generator" },
      { label: "AI Anime Generator", href: "/ai-art-generator/ai-anime-generator" },
      { label: "AI Comic Generator", href: "/ai-art-generator/ai-comic-generator" },
      { label: "AI Coloring Book Generator", href: "/ai-art-generator/ai-coloring-book-generator" },
    ],
  };

  const companyLinks = [
    { label: "Pricing", href: "/#pricing" },
    { label: "Prompts", href: "/prompts" },
  ];

  const legalLinks = [
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ];

  const socialLinks = [
    { icon: FiTwitter, href: "https://twitter.com", label: "Twitter", ariaLabel: "Follow us on Twitter" },
    { icon: FiGithub, href: "https://github.com", label: "GitHub", ariaLabel: "Visit our GitHub" },
    { icon: FiLinkedin, href: "https://linkedin.com", label: "LinkedIn", ariaLabel: "Connect on LinkedIn" },
    { icon: FiMail, href: "mailto:hey@webbuddy.agency", label: "Email", ariaLabel: "Send us an email" },
  ];

  return (
    <Box
      as="footer"
      width="100%"
      borderTop="1px solid rgba(148, 163, 184, 0.18)"
      bg="var(--bg-canvas)"
      backdropFilter="blur(18px)"
      mt="auto"
    >
      <Container maxW="1400px" px={{ base: 4, sm: 6, md: 10, xl: 20 }} py={{ base: 8, sm: 10, md: 16 }}>
        {/* Top Section - Brand & Description */}
        <VStack align="flex-start" spacing={{ base: 4, md: 6 }} mb={{ base: 8, md: 12 }}>
          {/* Logo and Button Row */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align={{ base: "flex-start", sm: "center" }}
            width="100%"
            gap={{ base: 3, sm: 4, md: 6 }}
          >
            <Flex
              as={NextLink}
              href="/"
              alignItems="center"
              justifyContent="flex-start"
              borderRadius="lg"
              p={1}
              bg="transparent"
              _hover={{ opacity: 0.8 }}
              transition="opacity 0.3s"
              gap={3}
              alignSelf={{ base: "flex-start", sm: "center" }}
            >
              <Image
                src="/assets/landing_page/logo-dark.svg"
                alt="MyDzine"
                width={240}
                height={60}
                style={{
                  width: "auto",
                  height: "auto",
                  maxWidth: "clamp(160px, 20vw, 240px)",
                  maxHeight: "clamp(40px, 5.5vw, 60px)",
                }}
              />
            </Flex>
            <Box width={{ base: "100%", sm: "auto" }}>
              <Button
                as={NextLink}
                href="/login"
                bg="white"
                color="black"
                border="1px solid rgba(0, 0, 0, 0.1)"
                size={{ base: "sm", md: "lg" }}
                px={{ base: 5, sm: 6, md: 8 }}
                fontSize={{ base: "xs", sm: "sm", md: "md" }}
                fontWeight="semibold"
                borderRadius="full"
                boxShadow="0 8px 24px rgba(0, 0, 0, 0.15)"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                width={{ base: "100%", sm: "auto" }}
                minH={{ base: "40px", md: "48px" }}
                _hover={{
                  bg: "rgba(255, 255, 255, 0.95)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
                }}
                _active={{
                  bg: "rgba(255, 255, 255, 0.9)",
                  transform: "translateY(0)",
                }}
              >
                Get Started
              </Button>
            </Box>
          </Flex>
          <Text
            fontSize={{ base: "xs", sm: "sm", md: "md" }}
            color="var(--text-muted)"
            lineHeight={{ base: "1.6", md: "1.7" }}
            maxW="600px"
          >
            Transform your creativity with AI-powered photo editing and art generation tools. 
            Create stunning visuals, enhance images, and bring your ideas to life with cutting-edge artificial intelligence.
          </Text>
        </VStack>

        <Divider borderColor="rgba(148, 163, 184, 0.12)" mb={{ base: 8, md: 12 }} />

        {/* Tools Section */}
        <SimpleGrid
          columns={{ base: 1, sm: 2, lg: 3 }}
          spacing={{ base: 6, sm: 8, md: 10, lg: 12 }}
          mb={{ base: 8, md: 12 }}
          alignItems="flex-start"
          templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
        >
          {/* AI Photo Filter Links */}
          <VStack align="flex-start" spacing={{ base: 3, md: 4 }} width="100%">
            <Text
              fontSize={{ base: "xs", md: "md" }}
              fontWeight="semibold"
              color="var(--text-primary)"
              textTransform="uppercase"
              letterSpacing="0.1em"
              mb={0}
              minH={{ base: "20px", md: "24px" }}
            >
              AI Photo Filter
            </Text>
            <VStack align="flex-start" spacing={{ base: 2, md: 2.5 }} width="100%">
              {footerLinks.aiPhotoFilter.map((link) => (
                <Link
                  key={link.href}
                  as={NextLink}
                  href={link.href}
                  fontSize={{ base: "xs", md: "sm" }}
                  color="var(--text-muted)"
                  display="block"
                  width="100%"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    color: "var(--text-primary)",
                    transform: "translateX(4px)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </VStack>
          </VStack>

          {/* AI Image Editor Links */}
          <VStack align="flex-start" spacing={{ base: 3, md: 4 }} width="100%">
            <Text
              fontSize={{ base: "xs", md: "md" }}
              fontWeight="semibold"
              color="var(--text-primary)"
              textTransform="uppercase"
              letterSpacing="0.1em"
              mb={0}
              minH={{ base: "20px", md: "24px" }}
            >
              AI Image Editor
            </Text>
            <VStack align="flex-start" spacing={{ base: 2, md: 2.5 }} width="100%">
              {footerLinks.aiImageEditor.map((link) => (
                <Link
                  key={link.href}
                  as={NextLink}
                  href={link.href}
                  fontSize={{ base: "xs", md: "sm" }}
                  color="var(--text-muted)"
                  display="block"
                  width="100%"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    color: "var(--text-primary)",
                    transform: "translateX(4px)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </VStack>
          </VStack>

          {/* AI Art Generator Links */}
          <VStack align="flex-start" spacing={{ base: 3, md: 4 }} width="100%">
            <Text
              fontSize={{ base: "xs", md: "md" }}
              fontWeight="semibold"
              color="var(--text-primary)"
              textTransform="uppercase"
              letterSpacing="0.1em"
              mb={0}
              minH={{ base: "20px", md: "24px" }}
            >
              AI Art Generator
            </Text>
            <VStack align="flex-start" spacing={{ base: 2, md: 2.5 }} width="100%">
              {footerLinks.aiArtGenerator.map((link) => (
                <Link
                  key={link.href}
                  as={NextLink}
                  href={link.href}
                  fontSize={{ base: "xs", md: "sm" }}
                  color="var(--text-muted)"
                  display="block"
                  width="100%"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    color: "var(--text-primary)",
                    transform: "translateX(4px)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </VStack>
          </VStack>
        </SimpleGrid>

        <Divider borderColor="rgba(148, 163, 184, 0.12)" mb={{ base: 6, md: 10 }} />

        {/* Bottom Section - Company Links & Contact */}
        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3 }}
          spacing={{ base: 5, sm: 6, md: 8 }}
          mb={{ base: 6, md: 10 }}
          alignItems="flex-start"
          templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }}
        >
          {/* Company Links */}
          <VStack align="flex-start" spacing={{ base: 2, md: 3 }} width="100%">
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="semibold"
              color="var(--text-primary)"
              textTransform="uppercase"
              letterSpacing="0.1em"
              mb={0}
              minH={{ base: "18px", md: "20px" }}
            >
              Company
            </Text>
            <VStack align="flex-start" spacing={{ base: 2, md: 2.5 }} width="100%">
              {companyLinks.map((link) => (
                <Link
                  key={link.href}
                  as={NextLink}
                  href={link.href}
                  fontSize={{ base: "xs", md: "sm" }}
                  color="var(--text-muted)"
                  display="block"
                  width="100%"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    color: "var(--text-primary)",
                    transform: "translateX(4px)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </VStack>
          </VStack>

          {/* Legal Links */}
          <VStack align="flex-start" spacing={{ base: 2, md: 3 }} width="100%">
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="semibold"
              color="var(--text-primary)"
              textTransform="uppercase"
              letterSpacing="0.1em"
              mb={0}
              minH={{ base: "18px", md: "20px" }}
            >
              Legal
            </Text>
            <VStack align="flex-start" spacing={{ base: 2, md: 2.5 }} width="100%">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  as={NextLink}
                  href={link.href}
                  fontSize={{ base: "xs", md: "sm" }}
                  color="var(--text-muted)"
                  display="block"
                  width="100%"
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                  _hover={{
                    color: "var(--text-primary)",
                    transform: "translateX(4px)",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </VStack>
          </VStack>

          {/* Contact Section */}
          <VStack align="flex-start" spacing={{ base: 2, md: 3 }} width="100%">
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              fontWeight="semibold"
              color="var(--text-primary)"
              textTransform="uppercase"
              letterSpacing="0.1em"
              mb={0}
              minH={{ base: "18px", md: "20px" }}
            >
              Contact
            </Text>
            <VStack align="flex-start" spacing={{ base: 2, md: 2.5 }} width="100%">
              <Link
                as={NextLink}
                href="mailto:hey@webbuddy.agency"
                fontSize={{ base: "xs", md: "sm" }}
                color="var(--text-muted)"
                display="block"
                width="100%"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{
                  color: "var(--text-primary)",
                  transform: "translateX(4px)",
                }}
                wordBreak="break-word"
              >
                hey@webbuddy.agency
              </Link>
            </VStack>
          </VStack>
        </SimpleGrid>

        {/* Bottom Bar */}
        <Divider borderColor="rgba(148, 163, 184, 0.12)" mb={{ base: 4, md: 6 }} />
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap={{ base: 2, sm: 4 }}
          width="100%"
        >
          <Text 
            fontSize={{ base: "xs", md: "sm" }} 
            color="var(--text-muted)"
            textAlign={{ base: "left", sm: "left" }}
          >
            © {currentYear} MyDzine. All rights reserved.
          </Text>
          <HStack
            spacing={2}
            flexWrap="wrap"
            justify={{ base: "flex-start", sm: "flex-end" }}
            color="var(--text-muted)"
          >
            <Text fontSize={{ base: "xs", md: "sm" }}>
              Crafted by WebBuddy LLC
            </Text>
            <Text opacity={0.6}>•</Text>
            <Link
              href="https://www.webbuddy.agency"
              isExternal
              fontSize={{ base: "xs", md: "sm" }}
              color="var(--text-muted)"
              textDecoration="underline"
              _hover={{ color: "var(--text-primary)" }}
              transition="color 0.2s"
            >
              www.webbuddy.agency
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;
