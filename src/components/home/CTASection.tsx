"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import Image from "next/image";
import { useAuthModal } from "@/contexts/auth-modal-context";

const CTASection = () => {
  const { openSignIn } = useAuthModal();

  return (
    <Box
      as="section"
      width="100%"
      py={{ base: 8, md: 12 }}
      bg="#fcfcfc"
    >
      <Container maxW="1400px" px={{ base: 4, md: 0 }}>
        <Box
          borderRadius="16px"
          boxShadow="0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1)"
          overflow="hidden"
          position="relative"
          minH={{ base: "auto", md: "560px" }}
          bgImage="/assets/landing_page/cta/bg.png"
          bgSize="cover"
          bgPosition="center"
          bgRepeat="no-repeat"
        >

          <Flex
            direction={{ base: "column", lg: "row" }}
            minH={{ base: "auto", md: "560px" }}
            position="relative"
            zIndex={1}
          >
            {/* Content Side */}
            <VStack
              flex={1}
              align="flex-start"
              justify="center"
              p={{ base: 6, md: 10, lg: 14 }}
              spacing={{ base: 4, md: 6 }}
            >
              {/* Title */}
              <Heading
                as="h3"
                fontFamily="'General Sans', 'Inter', sans-serif"
                fontWeight="500"
                fontSize={{ base: "36px", md: "48px", lg: "60px" }}
                lineHeight={{ base: "1.2", md: "66px" }}
                letterSpacing="-0.6px"
                color="black"
                width={{ base: "100%", md: "688px" }}
                maxW={{ base: "100%", md: "688px" }}
              >
                Ready to launch your own AI creative platform?
              </Heading>

              {/* Target Audience */}
              <Flex gap={4} flexWrap="wrap">
                <Text
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="400"
                  fontSize={{ base: "16px", md: "20px" }}
                  lineHeight="28px"
                  color="black"
                >
                  SaaS buyers
                </Text>
                <Text
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="400"
                  fontSize={{ base: "16px", md: "20px" }}
                  lineHeight="28px"
                  color="black"
                >
                  Founders
                </Text>
                <Text
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="400"
                  fontSize={{ base: "16px", md: "20px" }}
                  lineHeight="28px"
                  color="black"
                >
                  Agencies
                </Text>
              </Flex>

              {/* CTA Button */}
              <Box
                display="inline-flex"
                role="group"
                mt={4}
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
                    GET STARTED FOR FREE
                  </Text>
                </Button>
              </Box>
            </VStack>

            {/* Image Side */}
            <Flex
              flex={1}
              position="relative"
              align="center"
              justify="center"
              p={{ base: 4, md: 6 }}
              minH={{ base: "300px", md: "400px", lg: "auto" }}
            >
              <Box
                position="relative"
                width="100%"
                height="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {/* Right Side Image */}
                <Box
                  as="img"
                  src="/assets/landing_page/cta/right_img.png"
                  alt="CTA Image"
                  width={{ base: "280px", md: "400px", lg: "540px" }}
                  height="auto"
                  objectFit="contain"
                  position="relative"
                  zIndex={2}
                />
              </Box>
            </Flex>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default CTASection;

