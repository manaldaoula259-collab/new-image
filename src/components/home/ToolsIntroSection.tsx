"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

const ToolsIntroSection = () => {
  return (
    <Box
      as="section"
      width="100%"
      py={{ base: 12, md: 20 }}
    >
      <Container maxW="1400px" px={{ base: 4, md: 0 }}>
        <VStack spacing={{ base: 4, md: 6 }} textAlign="center" maxW="800px" mx="auto">
          <Heading
            as="h2"
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontWeight="500"
            fontSize={{ base: "36px", md: "48px", lg: "60px" }}
            lineHeight={{ base: "1.2", md: "66px" }}
            letterSpacing="-0.6px"
            color="black"
          >
            Top 19 Innovative Tools for Boosting Revenue
          </Heading>
          <Text
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontWeight="400"
            fontSize={{ base: "16px", md: "20px" }}
            lineHeight="28px"
            color="black"
          >
            The platform includes 19 AI tools organized into three categories that you can monetize:
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default ToolsIntroSection;

