"use client";

import SignUpForm from "@/components/layout/SignUpForm";
import { Box, Flex, Icon, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import Image from "next/image";
import NextImage from "next/image";
import { FiArrowLeft } from "react-icons/fi";

const SignUpPage = () => (
  <Flex
    flex="1"
    minH="100vh"
    flexDirection="column"
    bg="#fcfcfc"
    position="relative"
    overflow="hidden"
  >
    {/* Background Image */}
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      width="100%"
      height="100vh"
      minHeight="100vh"
      zIndex={0}
      pointerEvents="none"
    >
      <NextImage
        src="/assets/landing_page/hero_bg.png"
        alt="Hero Background"
        fill
        style={{
          objectFit: "cover",
          objectPosition: "center",
        }}
        priority
      />
    </Box>
    {/* Custom Header */}
    <Box
      as="header"
      width="100%"
      px={{ base: 3, sm: 4, md: 6, lg: 8 }}
      py={{ base: 3, sm: 4, md: 5 }}
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={2000}
      bg="transparent"
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        maxW="1400px"
        mx="auto"
        gap={{ base: 2, sm: 3 }}
      >
        <Flex
          as={NextLink}
          href="/"
          alignItems="center"
          gap={{ base: 2, sm: 3 }}
          _hover={{ opacity: 0.8 }}
          transition="opacity 0.3s"
          flexShrink={0}
        >
          <Image
            src="/assets/landing_page/logo-dark.svg"
            alt="MyDzine"
            width={150}
            height={46}
            style={{
              width: "auto",
              height: "auto",
              maxWidth: "clamp(140px, 18vw, 220px)",
              maxHeight: "clamp(34px, 4.6vw, 56px)",
            }}
          />
        </Flex>
        <Link
          as={NextLink}
          href="/"
          display="flex"
          alignItems="center"
          gap={{ base: 1, sm: 2 }}
          fontSize={{ base: "xs", sm: "sm", md: "md" }}
          color="white"
          fontWeight="500"
          fontFamily="'General Sans', 'Inter', sans-serif"
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          _hover={{
            color: "rgba(255, 255, 255, 0.8)",
            transform: "translateX(-4px)",
          }}
          px={{ base: 2, sm: 3 }}
          py={{ base: 1.5, sm: 2 }}
          flexShrink={0}
        >
          <Icon as={FiArrowLeft} fontSize={{ base: "sm", sm: "md" }} />
          <Text display={{ base: "none", sm: "block" }}>Back to Home</Text>
        </Link>
      </Flex>
    </Box>

    {/* Main Content */}
    <Flex
      flex="1"
      align="center"
      justify="center"
      px={{ base: 3, sm: 4, md: 6 }}
      py={{ base: 6, sm: 8, md: 12 }}
      pt={{ base: "120px", sm: "140px", md: "160px" }}
      pb={{ base: 6, sm: 8, md: 12 }}
      width="100%"
      position="relative"
      zIndex={1}
      minH="100vh"
    >
      <SignUpForm />
    </Flex>
  </Flex>
);

export default SignUpPage;
