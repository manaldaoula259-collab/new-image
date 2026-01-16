"use client";

import { Box, HStack, Icon, Spinner, Text } from "@chakra-ui/react";
import { useUserCredits } from "@/hooks/useUserCredits";
import { IoIosFlash } from "react-icons/io";
import { BsChatSquareText } from "react-icons/bs";

interface CreditsDisplayProps {
  variant?: "image" | "prompt" | "both";
}

const CreditsDisplay = ({ variant = "both" }: CreditsDisplayProps) => {
  const { totals, isLoading: isLoadingCredits } = useUserCredits();

  const showImageCredits = variant === "image" || variant === "both";
  const showPromptCredits = variant === "prompt" || variant === "both";

  return (
    <Box
      borderRadius="xl"
      border="1px solid rgba(148, 163, 184, 0.15)"
      bg="rgba(15, 23, 42, 0.92)"
      backdropFilter="blur(20px)"
      boxShadow="0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset"
      px={{ base: 3, md: 4 }}
      py={{ base: 2.5, md: 3 }}
      w="fit-content"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        bg: "rgba(15, 23, 42, 0.98)",
        borderColor: "rgba(148, 163, 184, 0.25)",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08) inset",
        transform: "translateY(-2px)",
      }}
    >
      <HStack spacing={3} align="center">
        {showImageCredits && (
          <HStack spacing={2} align="center">
            <Icon
              as={IoIosFlash}
              color="rgba(251, 191, 36, 0.95)"
              fontSize={{ base: "16px", md: "18px" }}
            />
            <Box>
              <Text
                fontSize={{ base: "9px", md: "10px" }}
                fontWeight="500"
                color="rgba(148, 163, 184, 0.7)"
                letterSpacing="0.02em"
                lineHeight="1"
                mb={0.5}
              >
                Credits
              </Text>
              <Text
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="700"
                color="rgba(248, 250, 252, 0.98)"
                lineHeight="1"
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                {isLoadingCredits ? (
                  <Spinner size="xs" color="rgba(251, 191, 36, 0.8)" />
                ) : (
                  totals.totalCredits.toLocaleString()
                )}
              </Text>
            </Box>
          </HStack>
        )}

        {showPromptCredits && (
          <HStack spacing={2} align="center">
            <Icon
              as={BsChatSquareText}
              color="rgba(148, 163, 184, 0.85)"
              fontSize={{ base: "16px", md: "18px" }}
            />
            <Box>
              <Text
                fontSize={{ base: "9px", md: "10px" }}
                fontWeight="500"
                color="rgba(148, 163, 184, 0.7)"
                letterSpacing="0.02em"
                lineHeight="1"
                mb={0.5}
              >
                Prompt
              </Text>
              <Text
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="700"
                color="rgba(200, 210, 220, 0.95)"
                lineHeight="1"
                sx={{ fontVariantNumeric: "tabular-nums" }}
              >
                {isLoadingCredits ? (
                  <Spinner size="xs" color="rgba(148, 163, 184, 0.6)" />
                ) : (
                  totals.totalPromptWizardCredits.toLocaleString()
                )}
              </Text>
            </Box>
          </HStack>
        )}
      </HStack>
    </Box>
  );
};

export default CreditsDisplay;

