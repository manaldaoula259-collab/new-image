"use client";

import { dashboardPricingPlans } from "@/data/dashboard";
import {
  Badge,
  Box,
  Button,
  Divider,
  Heading,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

const PricingSection = () => {
  return (
    <Stack
      as="section"
      id="pricing"
      spacing={{ base: 12, md: 16 }}
      py={{ base: 16, md: 24 }}
      px={{ base: 6, md: 10, xl: 20 }}
      width="100%"
      maxW="1400px"
      marginX="auto"
      bg="var(--bg-canvas)"
    >
      {/* Header */}
      <Stack spacing={4} textAlign="center" align="center">
        <Heading
          as="h2"
          fontSize={{ base: "clamp(2.2rem, 4vw + 1rem, 3.2rem)", md: "3.5rem" }}
          fontWeight="800"
          lineHeight="1.05"
          color="var(--text-primary)"
        >
          Simple, Transparent Pricing
        </Heading>
        <Text
          fontSize={{ base: "lg", md: "xl" }}
          color="var(--text-muted)"
          maxW="42rem"
        >
          Scale your creative workflow with flexible credit packs. Credits power trainings, predictions, and HD upscales.
        </Text>
      </Stack>

      {/* Credit-Based Pricing */}
      <Stack spacing={6}>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} maxW="1200px" marginX="auto" width="100%">
          {dashboardPricingPlans.map((plan) => (
            <Box
              key={plan.name}
              borderRadius="2xl"
              border="1px solid rgba(148, 163, 184, 0.22)"
              bg={plan.highlight ? "rgba(30, 41, 59, 0.85)" : "rgba(15, 23, 42, 0.7)"}
              boxShadow={
                plan.highlight
                  ? "0 32px 80px rgba(8, 12, 30, 0.55)"
                  : "0 24px 60px rgba(0, 0, 0, 0.4)"
              }
              backdropFilter="blur(24px)"
              position="relative"
              overflow="hidden"
              px={{ base: 6, md: 7 }}
              py={{ base: 8, md: 9 }}
              display="flex"
              flexDirection="column"
              gap={6}
              transition="all 250ms cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                transform: "translateY(-6px)",
                boxShadow: plan.highlight
                  ? "0 40px 100px rgba(8, 12, 30, 0.65)"
                  : "0 32px 80px rgba(0, 0, 0, 0.5)",
              }}
            >
              {plan.highlight && (
                <Badge
                  variant="solid"
                  colorScheme="yellow"
                  position="absolute"
                  top={5}
                  right={5}
                  borderRadius="full"
                  px={4}
                  py={1}
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="0.12em"
                >
                  Most Popular
                </Badge>
              )}

              <Stack spacing={3}>
                <Heading as="h3" size="md" color="var(--text-primary)">
                  {plan.name}
                </Heading>
                <Text fontSize="sm" color="var(--text-muted)">
                  {plan.description}
                </Text>
              </Stack>

              <Box>
                <Text fontSize="4xl" fontWeight="extrabold" color="var(--text-primary)">
                  {plan.price}
                </Text>
                <Text fontSize="sm" color="var(--text-muted)">
                  {plan.pricePerCredit}
                </Text>
              </Box>

              <Divider borderColor="rgba(148, 163, 184, 0.2)" />

              <Stack spacing={4}>
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" color="var(--text-primary)">
                    {plan.credits.toLocaleString()} credits
                  </Text>
                  <Text fontSize="sm" color="var(--text-muted)">
                    {plan.promptCredits.toLocaleString()} prompt wizard credits included
                  </Text>
                </Box>
                <Text fontSize="sm" color="var(--text-muted)">
                  Credits never expire. Use them across trainings, predictions, and HD exports.
                </Text>
              </Stack>

              <Button
                as={Link}
                href={plan.ctaHref}
                bg="white"
                color="black"
                border="1px solid rgba(0, 0, 0, 0.1)"
                size="lg"
                rightIcon={<Icon as={FiArrowRight} />}
                mt="auto"
                borderRadius="full"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.95)",
                  transform: "translateY(-2px)",
                }}
                _active={{
                  bg: "rgba(255, 255, 255, 0.9)",
                  transform: "translateY(0)",
                }}
              >
                {plan.ctaLabel}
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>

      {/* Footer Note */}
      <Box textAlign="center" pt={4}>
        <Text fontSize="sm" color="var(--text-muted)">
          All plans include access to all AI tools. No hidden fees. Cancel anytime.
        </Text>
      </Box>
    </Stack>
  );
};

export default PricingSection;

