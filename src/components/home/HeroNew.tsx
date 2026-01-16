"use client";

import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Container,
} from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useAuthModal } from "@/contexts/auth-modal-context";

const videoShowcases = [
  { src: "/assets/landing_page/vid_1.mp4", type: "video/mp4" },
  { src: "/assets/landing_page/vid_2.webm", type: "video/webm" },
  { src: "/assets/landing_page/vid_3.mp4", type: "video/mp4" },
];

const HeroNew = () => {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useAuthModal();

  return (
    <Box
      as="section"
      width="100%"
      minHeight="100vh"
      position="relative"
      overflow="hidden"
      bg="#fcfcfc"
      mt={{ base: "-80px", md: "-100px" }}
      pt={{ base: "80px", md: "100px" }}
    >
      {/* Background Image */}
      <Box
        position="absolute"
        top={{ base: "-80px", md: "-100px", lg: "-100px" }}
        left={0}
        right={0}
        bottom={0}
        width="100%"
        height={{ base: "calc(100% + 80px)", md: "calc(100% + 100px)", lg: "calc(100% + 100px)" }}
        zIndex={0}
      >
        <Image
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

      <Container maxW="1400px" position="relative" zIndex={2} pt={{ base: "120px", md: "140px", lg: "186px" }} px={{ base: 4, md: 8 }}>
        {/* Hero Content */}
        <Flex
          direction="column"
          align="center"
          textAlign="center"
          gap={{ base: 6, md: 8 }}
        >
          {/* Main Heading */}
          <Box
            as="h1"
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontWeight="500"
            fontSize={{ base: "32px", sm: "42px", md: "56px", lg: "70px" }}
            lineHeight={{ base: "1.15", md: "1.2", lg: "90px" }}
            letterSpacing={{ base: "-1.5px", md: "-2.8px" }}
            color="white"
            maxW={{ base: "100%", md: "1000px", lg: "1117px", xl: "1117px", "2xl": "1117px" }}
            px={{ base: 2, md: 0 }}
            textAlign="center"
          >
            Build, Launch, and Monetize{" "}
            <Box as="span" display={{ base: "inline", lg: "block" }}>
              AI Image Tools — Without Engineering
            </Box>
          </Box>

          {/* Subtitle */}
          <Text
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontWeight="500"
            fontSize={{ base: "14px", sm: "16px", md: "20px" }}
            lineHeight={{ base: "24px", md: "30px" }}
            color="white"
            maxW={{ base: "100%", md: "800px", lg: "877px", xl: "877px", "2xl": "877px" }}
            px={{ base: 4, md: 0 }}
          >
            MyDzine is a complete SaaS platform for AI image generation, editing, and creative automation.
          </Text>

          {/* CTA Button */}
          {isSignedIn ? (
            <Box
              as={Link}
              href="/dashboard/ai-tools"
              display="inline-flex"
              role="group"
            >
              <Button
                bg="black"
                color="white"
                height={{ base: "56px", md: "72px" }}
                px={0}
                borderRadius="8px"
                fontFamily="'IBM Plex Mono', monospace"
                fontWeight="500"
                fontSize={{ base: "13px", md: "15px" }}
                letterSpacing="0.6px"
                textTransform="uppercase"
                display="flex"
                alignItems="center"
                gap={0}
                overflow="hidden"
                position="relative"
                _hover={{
                  bg: "#1a1a1a",
                }}
                _active={{
                  bg: "#1a1a1a",
                }}
              >
                <Box
                  as="span"
                  position="absolute"
                  left={{ base: "4px", md: "4px" }}
                  top={{ base: "4px", md: "4px" }}
                  bottom={{ base: "4px", md: "4px" }}
                  bg="#573cff"
                  borderRadius="4px"
                  w={{ base: "48px", md: "64px" }}
                  transition="width 0.3s ease, border-radius 0.3s ease"
                  _groupHover={{
                    w: "calc(100% - 8px)",
                    borderRadius: "4px",
                  }}
                />
                <Box
                  as="span"
                  position="absolute"
                  left={{ base: "28px", md: "36px" }}
                  top="50%"
                  transform="translate(-50%, -50%)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  zIndex={2}
                >
                  <Image
                    src="/assets/landing_page/btn_arrow.svg"
                    alt="Arrow"
                    width={20}
                    height={20}
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
                  />
                </Box>
                <Text
                  as="span"
                  pl={{ base: "60px", md: "80px" }}
                  pr={{ base: 4, md: 6 }}
                  py={{ base: 3, md: 4 }}
                  position="relative"
                  zIndex={1}
                  transition="color 0.3s ease"
                  _groupHover={{
                    color: "white",
                  }}
                >
                  START FOR FREE
                </Text>
              </Button>
            </Box>
          ) : (
            <Box
              display="inline-flex"
              role="group"
            >
              <Button
                onClick={openSignIn}
                bg="black"
                color="white"
                height={{ base: "56px", md: "72px" }}
                px={0}
                borderRadius="8px"
                fontFamily="'IBM Plex Mono', monospace"
                fontWeight="500"
                fontSize={{ base: "13px", md: "15px" }}
                letterSpacing="0.6px"
                textTransform="uppercase"
                display="flex"
                alignItems="center"
                gap={0}
                overflow="hidden"
                position="relative"
                _hover={{
                  bg: "#1a1a1a",
                }}
                _active={{
                  bg: "#1a1a1a",
                }}
              >
                <Box
                  as="span"
                  position="absolute"
                  left={{ base: "4px", md: "4px" }}
                  top={{ base: "4px", md: "4px" }}
                  bottom={{ base: "4px", md: "4px" }}
                  bg="#573cff"
                  borderRadius="4px"
                  w={{ base: "48px", md: "64px" }}
                  transition="width 0.3s ease, border-radius 0.3s ease"
                  _groupHover={{
                    w: "calc(100% - 8px)",
                    borderRadius: "4px",
                  }}
                />
                <Box
                  as="span"
                  position="absolute"
                  left={{ base: "28px", md: "36px" }}
                  top="50%"
                  transform="translate(-50%, -50%)"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  zIndex={2}
                >
                  <Image
                    src="/assets/landing_page/btn_arrow.svg"
                    alt="Arrow"
                    width={20}
                    height={20}
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
                  />
                </Box>
                <Text
                  as="span"
                  pl={{ base: "60px", md: "80px" }}
                  pr={{ base: 4, md: 6 }}
                  py={{ base: 3, md: 4 }}
                  position="relative"
                  zIndex={1}
                  transition="color 0.3s ease"
                  _groupHover={{
                    color: "white",
                  }}
                >
                  START FOR FREE
                </Text>
              </Button>
            </Box>
          )}
        </Flex>
      </Container>

      {/* Video Showcase Section - Fluid Container */}
      <Box
        mt={{ base: 10, md: 16, lg: "186px" }}
        position="relative"
        pb={8}
        width="100%"
      >
        <HStack
          spacing={{ base: 3, md: 4 }}
          rowGap={{ base: 4, md: 0 }}
          justify="center"
          py={4}
          px={{ base: 4, md: 8 }}
          flexWrap={{ base: "wrap", md: "nowrap" }}
        >
          {videoShowcases.map((video, index) => (
            <Box
              key={index}
              width={{ base: "280px", sm: "350px", md: "450px", lg: "582px" }}
              height={{ base: "180px", sm: "230px", md: "300px", lg: "381px" }}
              borderRadius="10px"
              overflow="hidden"
              flexShrink={0}
              bg="white"
              boxShadow="0 20px 60px rgba(0, 0, 0, 0.15)"
              transition="transform 0.3s ease"
              mb={{ base: 4, md: 0 }}
              _hover={{
                transform: "scale(1.02)",
              }}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              >
                <source src={video.src} type={video.type} />
              </video>
            </Box>
          ))}
        </HStack>
      </Box>
    </Box>
  );
};

export default HeroNew;
