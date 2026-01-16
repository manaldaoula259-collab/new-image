"use client";

import CharacterSwitcher, {
  TCharacter,
} from "@/components/home/CharacterSwitcher";
import TiltImage from "@/components/home/TiltImage";
import PageContainer from "@/components/layout/PageContainer";
import { prompts } from "@/core/utils/prompts";
import { Button, Divider, Flex, HStack, Text, VStack, Box, Container } from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";
import { BsArrowRight } from "react-icons/bs";
import NextImage from "next/image";

const title = "AI Prompts Inspiration";
export const description =
  "Our free AI prompt covers a wide range of themes and topics to help you create a unique avatar. Use theme with our Studio or your Stable Diffusion or Dreambooth models.";

const PromptsListPage = () => {
  const [character, setCharacter] = useState<TCharacter>("romy");

  return (
    <Box
      as="section"
      width="100%"
      minHeight="100vh"
      position="relative"
      overflow="visible"
      bg="#fcfcfc"
    >
      {/* Background Image - Fixed Height */}
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

      <PageContainer pb={16} position="relative" zIndex={2}>
        <Container maxW="1400px" px={{ base: 4, md: 8 }}>
          <VStack
            width="100%"
            mb={10}
            flex="1"
            alignItems="flex-start"
            pt={{ base: 8, md: 12 }}
          >
            <Box maxW={{ base: "100%", md: "900px" }}>
              <Text
                as="h1"
                fontFamily="'General Sans', 'Inter', sans-serif"
                fontWeight="500"
                fontSize={{ base: "36px", md: "48px", lg: "60px" }}
                lineHeight={{ base: "1.2", md: "66px" }}
                letterSpacing="-0.6px"
                color="white"
              >
                {title}
              </Text>
            </Box>
            <Box maxW={{ base: "100%", md: "800px" }}>
              <Text
                as="p"
                fontFamily="'General Sans', 'Inter', sans-serif"
                fontWeight="400"
                fontSize={{ base: "16px", md: "20px" }}
                lineHeight={{ base: "24px", md: "30px" }}
                color="white"
                opacity={0.9}
              >
                {description}
              </Text>
            </Box>
          </VStack>

          <Flex
            position="relative"
            alignItems="space-between"
            flexDirection={{ base: "column", md: "row-reverse" }}
            gap={8}
          >
            <Flex mb={{ base: 6, md: 0 }} justifyContent="center" flex="1">
              <CharacterSwitcher
                onCharacterChange={(character) => {
                  setCharacter(character);
                }}
              />
            </Flex>
            <VStack
              flex="2"
              spacing={4}
              divider={<Divider borderColor="rgba(0, 0, 0, 0.1)" />}
            >
              {prompts.map((prompt) => (
                <Flex
                  key={prompt.label}
                  p={6}
                  gap={6}
                  borderRadius="16px"
                  bg="#f0f0f0"
                  boxShadow="0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)"
                  width="100%"
                  flexDirection={{ base: "column", sm: "row" }}
                >
                  <Box flexShrink={0}>
                    <TiltImage character={character} slug={prompt.slug} />
                  </Box>
                  <VStack
                    justifyContent="space-between"
                    alignItems="flex-start"
                    flex="1"
                    spacing={4}
                  >
                    <VStack alignItems="flex-start" spacing={2}>
                      <Text
                        textTransform="capitalize"
                        fontWeight="600"
                        fontSize={{ base: "xl", md: "2xl" }}
                        as="h3"
                        fontFamily="'General Sans', 'Inter', sans-serif"
                        color="black"
                      >
                        {prompt.label} prompt
                      </Text>
                      <Text
                        noOfLines={3}
                        fontSize="sm"
                        fontFamily="'IBM Plex Mono', monospace"
                        color="rgba(0, 0, 0, 0.7)"
                        lineHeight="1.6"
                      >
                        {prompt.prompt}
                      </Text>
                    </VStack>
                    <HStack
                      justifyContent="flex-end"
                      width="100%"
                      textAlign="right"
                    >
                      <Button
                        bg="black"
                        color="white"
                        border="none"
                        rightIcon={<BsArrowRight />}
                        href={`/prompts/dreambooth/${prompt.slug}`}
                        as={Link}
                        size="md"
                        fontFamily="'General Sans', 'Inter', sans-serif"
                        fontWeight="500"
                        borderRadius="8px"
                        _hover={{
                          bg: "#1a1a1a",
                        }}
                        _active={{
                          bg: "#1a1a1a",
                        }}
                      >
                        View
                      </Button>
                    </HStack>
                  </VStack>
                </Flex>
              ))}
            </VStack>
          </Flex>
        </Container>
      </PageContainer>
    </Box>
  );
};

export default PromptsListPage;
