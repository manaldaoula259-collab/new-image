"use client";

import { dashboardPricingPlans } from "@/data/dashboard";
import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";

const PricingSectionNew = () => {
  return (
    <Box
      as="section"
      id="pricing"
      width="100%"
      py={{ base: 16, md: 24 }}
    >
      <Container maxW="1400px" px={{ base: 4, md: 0 }}>
        {/* Section Header */}
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
            Pick a plan
            <Box as="span" display="block">or get started for free</Box>
          </Heading>
          <Text
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontWeight="400"
            fontSize={{ base: "16px", md: "20px" }}
            lineHeight="28px"
            color="black"
          >
            Plans for creators, marketers, and agencies of all sizes.
          </Text>
        </VStack>

        {/* Pricing Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {dashboardPricingPlans.map((plan) => (
            <Box
              key={plan.name}
              bg="white"
              borderRadius="8px"
              border={plan.highlight ? "1px solid #573cff" : "1px solid #f0f0f0"}
              overflow="hidden"
              p={{ base: 6, md: 8 }}
              position="relative"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-4px)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
              }}
            >
              {/* Popular Badge */}
              {plan.highlight && (
                <Badge
                  position="absolute"
                  top={4}
                  right={4}
                  bg="#573cff"
                  color="white"
                  borderRadius="2px"
                  px={3}
                  py={1}
                  fontFamily="'IBM Plex Mono', monospace"
                  fontWeight="500"
                  fontSize="15px"
                  letterSpacing="0.6px"
                  textTransform="uppercase"
                >
                  MOST POPULAR
                </Badge>
              )}

              <VStack align="flex-start" spacing={4}>
                {/* Plan Name */}
                <Text
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="500"
                  fontSize={{ base: "20px", md: "24px" }}
                  lineHeight="24px"
                  letterSpacing="-0.24px"
                  color="black"
                >
                  {plan.name}
                </Text>

                {/* Description */}
                <Text
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="400"
                  fontSize="14px"
                  lineHeight="18.2px"
                  letterSpacing="-0.14px"
                  color="black"
                >
                  {plan.description}
                </Text>

                {/* Price */}
                <Box>
                  <Text
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    fontWeight="500"
                    fontSize={{ base: "32px", md: "40px" }}
                    lineHeight="40px"
                    letterSpacing="-0.8px"
                    color="black"
                  >
                    {plan.price}
                  </Text>
                  <Text
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    fontWeight="500"
                    fontSize="14px"
                    lineHeight="14px"
                    letterSpacing="-0.14px"
                    color="black"
                    mt={2}
                  >
                    {plan.pricePerCredit}
                  </Text>
                </Box>

                {/* Credits Info */}
                <VStack align="flex-start" spacing={2} pt={4}>
                  <Text
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    fontWeight="500"
                    fontSize="14px"
                    lineHeight="18.2px"
                    letterSpacing="-0.14px"
                    color="black"
                  >
                    {plan.promptCredits.toLocaleString()} prompt wizard credits included
                  </Text>
                  <Text
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    fontWeight="400"
                    fontSize="14px"
                    lineHeight="18.2px"
                    letterSpacing="-0.14px"
                    color="black"
                  >
                    Credits never expire. Use them across trainings, predictions, and HD exports.
                  </Text>
                </VStack>

                {/* CTA Button */}
                <Button
                  as={Link}
                  href={plan.ctaHref}
                  bg="black"
                  color="white"
                  width="100%"
                  height={{ base: "56px", md: "66px" }}
                  borderRadius="8px"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontWeight="500"
                  fontSize="15px"
                  letterSpacing="0.6px"
                  textTransform="uppercase"
                  mt={4}
                  _hover={{
                    bg: "#1a1a1a",
                    transform: "translateY(-2px)",
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                >
                  BUY {plan.credits.toLocaleString()} CREDITS
                </Button>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default PricingSectionNew;

