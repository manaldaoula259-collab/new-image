"use client";

import {
  Box,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";

const steps = [
  {
    number: "1",
    title: (
      <>
        Sign Up &<br />
        Create Account
      </>
    ),
    description: (
      <>
        Get started with free<br />
        credits or subscription.
      </>
    ),
    icon: "/assets/landing_page/how-it-works/1.png",
    altText: "Sign Up and Create Account",
  },
  {
    number: "2",
    title: (
      <>
        Choose a<br />
        Tool
      </>
    ),
    description: "Select from generation, editing, or enhancement tools.",
    icon: "/assets/landing_page/how-it-works/2.png",
    altText: "Choose a Tool",
  },
  {
    number: "3",
    title: (
      <>
        Generate or<br />
        Edit
      </>
    ),
    description: "Create, edit, and export high-quality visuals instantly.",
    icon: "/assets/landing_page/how-it-works/3.png",
    altText: "Generate or Edit",
  },
];

const HowItWorksSection = () => {
  return (
    <Box
      as="section"
      width="100%"
      pt={{ base: "100px", md: "100px" }}
      pb={{ base: 16, md: 24 }}
      position="relative"
      overflow="hidden"
    >
      {/* Background Image */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        width="100%"
        height="100%"
        zIndex={0}
      >
        <Image
          src="/assets/landing_page/how-it-works/bg.png"
          alt="How It Works Background"
          fill
          style={{
            objectFit: "cover",
            objectPosition: "center",
          }}
          priority
        />
      </Box>

      <Container maxW="1400px" px={{ base: 4, md: 0 }} position="relative" zIndex={1}>
        {/* Section Title */}
        <VStack spacing={{ base: 4, md: 6 }} textAlign="center" mb={{ base: 12, md: 16 }}>
          <Heading
            as="h2"
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontWeight="500"
            fontSize={{ base: "36px", md: "48px", lg: "60px" }}
            lineHeight={{ base: "1.2", md: "66px" }}
            letterSpacing="-0.6px"
            color="black"
          >
            How MyDzine Works in
            <Box as="span" display="block">3 Simple Steps</Box>
          </Heading>
        </VStack>

        {/* Steps Grid */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 6, md: 8 }}>
          {steps.map((step) => (
            <Box
              key={step.number}
              position="relative"
              borderRadius="8px"
              overflow="hidden"
              bg="rgba(255, 255, 255, 0.1)"
              backdropFilter="blur(5px)"
              p={{ base: 6, md: 8 }}
              minH={{ base: "280px", md: "365px" }}
            >
              {/* Gradient Overlay */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                background="radial-gradient(ellipse at bottom left, rgba(255,255,255,0.2) 0%, transparent 70%)"
                opacity={0.2}
                zIndex={0}
              />

              {/* White Background Overlay */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="rgba(255, 255, 255, 0.1)"
                zIndex={0}
              />

              <VStack
                align="flex-start"
                spacing={4}
                position="relative"
                zIndex={1}
                height="100%"
              >
                {/* Icon */}
                <Box
                  position="relative"
                  width="100px"
                  height="100px"
                  flexShrink={0}
                >
                  <Image
                    src={step.icon}
                    alt={step.altText}
                    fill
                    style={{
                      objectFit: "contain",
                    }}
                  />
                </Box>

                {/* Step Number */}
                <Text
                  position="absolute"
                  top={{ base: "-30px", md: "-30px" }}
                  right={{ base: 4, md: 6 }}
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="500"
                  fontSize={{ base: "100px", md: "156px" }}
                  lineHeight="1"
                  letterSpacing="-1.56px"
                  color="white"
                  opacity={0.3}
                >
                  {step.number}
                </Text>

                {/* Title */}
                <Text
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="500"
                  fontSize={{ base: "28px", md: "36px" }}
                  lineHeight={{ base: "1.2", md: "46.8px" }}
                  letterSpacing="-0.36px"
                  color="white"
                  mt="auto"
                  mb={2}
                  whiteSpace="normal"
                  wordBreak="break-word"
                  maxW="100%"
                >
                  {step.title}
                </Text>

                {/* Description */}
                <Text
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="500"
                  fontSize={{ base: "16px", md: "18px" }}
                  lineHeight="21.6px"
                  letterSpacing="-0.18px"
                  color="white"
                  mt={2}
                >
                  {step.description}
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;

