"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  List,
  ListItem,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";

interface FeatureSectionProps {
  badge: string;
  title: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  onClick?: (e: React.MouseEvent) => void;
  mediaType: "video" | "image";
  mediaSrc: string;
  secondaryMediaSrc?: string;
  reverse?: boolean;
  gradientDirection?: "left" | "right";
  backgroundImage?: string;
  svgVideoOverlay?: string;
  svgVideoOverlay2?: string;
  svgVideoOverlay3?: string;
  svgVideoOverlay4?: string;
  svgVideoOverlay5?: string;
  svgVideoOverlay6?: string;
}

const FeatureSection = ({
  badge,
  title,
  features,
  ctaText,
  ctaHref,
  onClick,
  mediaType,
  mediaSrc,
  secondaryMediaSrc,
  reverse = false,
  gradientDirection = "left",
  backgroundImage,
  svgVideoOverlay,
  svgVideoOverlay2,
  svgVideoOverlay3,
  svgVideoOverlay4,
  svgVideoOverlay5,
  svgVideoOverlay6,
}: FeatureSectionProps) => {
  return (
    <Box
      as="section"
      width="100%"
      py={{ base: 8, md: 12 }}
      bg="#fcfcfc"
    >
      <Container maxW="1400px" px={{ base: 4, md: 0 }}>
        <Box
          bg={backgroundImage ? "transparent" : "#f0f0f0"}
          borderRadius="16px"
          boxShadow="0px 42px 42px 0px rgba(0,0,0,0.09), 0px 11px 23px 0px rgba(0,0,0,0.1), 0px 0px 0px 1px rgba(0,0,0,0.05)"
          overflow="hidden"
          position="relative"
          minH={{ base: "auto", md: "560px", lg: "628px" }}
          backgroundImage={backgroundImage ? `url(${backgroundImage})` : undefined}
          backgroundSize="cover"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
        >
          {/* Gradient Background */}
          <Box
            position="absolute"
            top={0}
            left={gradientDirection === "left" ? 0 : "auto"}
            right={gradientDirection === "right" ? 0 : "auto"}
            bottom={0}
            width="60%"
            background={
              gradientDirection === "left"
                ? "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 30%, #7c3aed 60%, #6d28d9 100%)"
                : "linear-gradient(225deg, #a78bfa 0%, #8b5cf6 30%, #7c3aed 60%, #6d28d9 100%)"
            }
            opacity={0.3}
            filter="blur(80px)"
            zIndex={0}
          />

          <Flex
            direction={{ base: "column", lg: reverse ? "row-reverse" : "row" }}
            minH={{ base: "auto", md: "560px", lg: "628px" }}
            h={mediaSrc.includes('card3_img') ? "100%" : "auto"}
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
              {/* Badge */}
              <Flex align="center" gap={3}>
                <Box
                  bg="#573cff"
                  borderRadius="4px"
                  p={3}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Box as="span" color="white">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                    </svg>
                  </Box>
                </Box>
                <Text
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontWeight="600"
                  fontSize="14px"
                  letterSpacing="0.56px"
                  textTransform="uppercase"
                  color="#573cff"
                >
                  {badge}
                </Text>
              </Flex>

              {/* Title */}
              <Heading
                as="h3"
                fontFamily="'General Sans', 'Inter', sans-serif"
                fontWeight="500"
                fontSize={{ base: "36px", md: "48px", lg: "60px" }}
                lineHeight={{ base: "1.2", md: "66px" }}
                letterSpacing="-0.6px"
                color="black"
              >
                {title}
              </Heading>

              {/* Features List */}
              <List spacing={2} styleType="disc" pl={6}>
                {features.map((feature) => (
                  <ListItem
                    key={feature}
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    fontWeight="400"
                    fontSize={{ base: "16px", md: "20px" }}
                    lineHeight="34px"
                    color="black"
                  >
                    {feature}
                  </ListItem>
                ))}
              </List>

              {/* CTA Button */}
              {onClick ? (
                <Box
                  as="div"
                  display="inline-flex"
                  role="group"
                  mt={4}
                  onClick={onClick}
                  cursor="pointer"
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
                      {ctaText}
                    </Text>
                  </Button>
                </Box>
              ) : (
                <Box
                  as={Link}
                  href={ctaHref}
                  display="inline-flex"
                  role="group"
                  mt={4}
                  cursor="pointer"
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
                      {ctaText}
                    </Text>
                  </Button>
                </Box>
              )}
            </VStack>

            {/* Media Side */}
            <Flex
              flex={1}
              position="relative"
              align={{ base: "center", lg: (mediaSrc.endsWith('.svg') || mediaSrc.includes('card3_img') || mediaSrc.includes('card1_img')) ? "flex-end" : "center" }}
              justify={{ base: "center", lg: mediaSrc.endsWith('.svg') ? (reverse ? "flex-start" : "flex-end") : (mediaSrc.includes('card1_img') || mediaSrc.includes('card3_img')) ? (reverse ? "flex-start" : "flex-end") : "center" }}
              p={{ base: 4, lg: (mediaSrc.endsWith('.svg') || mediaSrc.includes('card3_img') || mediaSrc.includes('card1_img')) ? 0 : 6 }}
              minH={{ base: "250px", md: "300px", lg: (mediaSrc.endsWith('.svg') || mediaSrc.includes('card3_img') || mediaSrc.includes('card1_img')) ? "628px" : "auto" }}
              h={{ base: "auto", lg: (mediaSrc.endsWith('.svg') || mediaSrc.includes('card3_img') || mediaSrc.includes('card1_img')) ? "100%" : "auto" }}
            >
              {mediaType === "video" ? (
                <Box
                  position="relative"
                  width="100%"
                  height="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={4}
                >
                  {/* Main Video */}
                  <Box
                    borderRadius="24px"
                    overflow="hidden"
                    boxShadow="0 20px 60px rgba(0,0,0,0.2)"
                    transform="rotate(4deg)"
                    border="1px solid white"
                    maxW={{ base: "280px", md: "350px", lg: "450px" }}
                  >
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                      }}
                    >
                      <source src={mediaSrc} type="video/mp4" />
                    </video>
                  </Box>

                  {/* Secondary Video */}
                  {secondaryMediaSrc && (
                    <Box
                      position="absolute"
                      left={{ base: "10%", md: "5%" }}
                      bottom={{ base: "10%", md: "15%" }}
                      borderRadius="24px"
                      overflow="hidden"
                      boxShadow="0 20px 60px rgba(0,0,0,0.2)"
                      transform="rotate(-10deg)"
                      border="1px solid white"
                      maxW={{ base: "200px", md: "250px", lg: "300px" }}
                      zIndex={2}
                    >
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        style={{
                          width: "100%",
                          height: "auto",
                          display: "block",
                        }}
                      >
                        <source src={secondaryMediaSrc} type="video/mp4" />
                      </video>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box
                  position={{ base: "relative", lg: (mediaSrc.endsWith('.svg') || mediaSrc.includes('card3_img') || mediaSrc.includes('card1_img')) ? "absolute" : "relative" }}
                  bottom={{ base: "auto", lg: (mediaSrc.endsWith('.svg') || mediaSrc.includes('card3_img') || mediaSrc.includes('card1_img')) ? 0 : "auto" }}
                  top={{ base: "auto", lg: (mediaSrc.includes('card3_img') && reverse) ? 0 : "auto" }}
                  left={{ base: "auto", lg: ((mediaSrc.endsWith('.svg') && reverse) || (mediaSrc.includes('card3_img') && reverse) || (mediaSrc.includes('card1_img') && reverse)) ? 0 : "auto" }}
                  right={{ base: "auto", lg: ((mediaSrc.endsWith('.svg') && !reverse) || (mediaSrc.includes('card1_img') && !reverse) || (mediaSrc.includes('card3_img') && !reverse)) ? 0 : "auto" }}
                  overflow="visible"
                  maxW={{ base: "100%", lg: mediaSrc.endsWith('.svg') ? "none" : (mediaSrc.includes('card1_img') ? "690px" : "90%") }}
                  width={{ base: "100%", lg: mediaSrc.endsWith('.svg') ? "auto" : (mediaSrc.includes('card1_img') || mediaSrc.includes('card3_img') ? "100%" : "auto") }}
                  height={{ base: "auto", lg: mediaSrc.endsWith('.svg') ? (mediaSrc.includes('feature-card-2-v') ? "614px" : "415px") : (mediaSrc.includes('card3_img') ? "100%" : (mediaSrc.includes('card1_img') ? "415px" : "auto")) }}
                  alignSelf={{ base: "center", lg: (mediaSrc.endsWith('.svg') || mediaSrc.includes('card1_img') || mediaSrc.includes('card3_img')) ? "flex-end" : "auto" }}
                  ml={{ base: "auto", lg: (mediaSrc.endsWith('.svg') || mediaSrc.includes('card1_img') || mediaSrc.includes('card3_img')) ? 0 : "auto" }}
                  mr={{ base: "auto", lg: (mediaSrc.endsWith('.svg') || mediaSrc.includes('card1_img') || mediaSrc.includes('card3_img')) ? 0 : "auto" }}
                  px={{ base: 4, lg: 0 }}
                >
                  <img
                    src={mediaSrc}
                    alt={title}
                    style={{
                      width: "100%",
                      maxWidth: mediaSrc.includes('card1_img') ? "690px" : "100%",
                      height: "auto",
                      display: "block",
                      objectFit: mediaSrc.includes('card3_img') ? "cover" : undefined,
                    }}
                  />
                  {svgVideoOverlay && mediaSrc.endsWith('.svg') && (
                    <Box
                      position="absolute"
                      // Mobile position in SVG: x=60-275, y=76-415 (viewBox: 0 0 690 416)
                      // Converting to percentage: x=8.7%-39.9%, y=18.3%-99.8%
                      left="8.7%"
                      top="18.3%"
                      width="31.2%"
                      height="81.5%"
                      borderRadius="8px"
                      overflow="hidden"
                      zIndex={10}
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
                        <source src={svgVideoOverlay} type="video/mp4" />
                      </video>
                    </Box>
                  )}
                  {svgVideoOverlay2 && mediaSrc.endsWith('.svg') && (
                    <Box
                      position="absolute"
                      // Second row first card position in SVG: x=264, y=148, width=203, height=138 (viewBox: 0 0 690 416)
                      // Converting to percentage: left=38.26%, top=35.58%, width=29.42%, height=33.17%
                      left="38.26%"
                      top="35.58%"
                      width="29.42%"
                      height="33.17%"
                      borderRadius="10px"
                      overflow="hidden"
                      zIndex={10}
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
                        <source src={svgVideoOverlay2} type="video/mp4" />
                      </video>
                    </Box>
                  )}
                  {svgVideoOverlay3 && mediaSrc.endsWith('.svg') && (
                    <Box
                      position="absolute"
                      // Second row second card position in SVG: x=477, y=148, width=213, height=138 (viewBox: 0 0 690 416)
                      // Converting to percentage: left=69.13%, top=35.58%, width=30.87%, height=33.17%
                      left="69.13%"
                      top="35.58%"
                      width="30.87%"
                      height="33.17%"
                      borderRadius="10px"
                      overflow="hidden"
                      zIndex={10}
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
                        <source src={svgVideoOverlay3} type="video/mp4" />
                      </video>
                    </Box>
                  )}
                  {svgVideoOverlay4 && mediaSrc.endsWith('.svg') && (
                    <Box
                      position="absolute"
                      // First row third card position in SVG: x=589, y=0, width=101, height=138 (viewBox: 0 0 690 416)
                      // Converting to percentage: left=85.36%, top=0%, width=14.64%, height=33.17%
                      left="85.36%"
                      top="0%"
                      width="14.64%"
                      height="33.17%"
                      borderRadius="10px"
                      overflow="hidden"
                      zIndex={10}
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
                        <source src={svgVideoOverlay4} type={svgVideoOverlay4.endsWith('.webm') ? "video/webm" : "video/mp4"} />
                      </video>
                    </Box>
                  )}
                  {svgVideoOverlay5 && mediaSrc.endsWith('.svg') && mediaSrc.includes('feature-card-2-v') && (
                    <Box
                      position="absolute"
                      // Left rect card: x=0.33606, y=180.17, width=343.11, height=494.645
                      // Converting to percentage (viewBox 0 0 707 614): left=0.05%, top=29.34%, width=48.52%, height=80.66%
                      left="0.05%"
                      top="29.34%"
                      width="48.52%"
                      height="80.66%"
                      borderRadius="23.5px"
                      overflow="hidden"
                      zIndex={11}
                      style={{
                        transform: "rotate(-9.74deg)",
                        transformOrigin: "0.05% 29.34%",
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
                        <source src={svgVideoOverlay5} type={svgVideoOverlay5.endsWith('.webm') ? "video/webm" : "video/mp4"} />
                      </video>
                    </Box>
                  )}
                  {svgVideoOverlay6 && mediaSrc.endsWith('.svg') && mediaSrc.includes('feature-card-2-v') && (
                    <Box
                      position="absolute"
                      // Right path card: path coordinates M213.517 2.85409 to 722.918 73.6678 to 654.382 551.034 to 144.982 480.22
                      // Bounding box: left=144.982, top=34.8199, right=722.918, bottom=551.034
                      // Converting to percentage: left=20.5%, top=5.67%, width=81.7%, height=84.1%
                      left="20.5%"
                      top="5.67%"
                      width="81.7%"
                      height="84.1%"
                      borderRadius="10px"
                      overflow="hidden"
                      zIndex={9}
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
                        <source src={svgVideoOverlay6} type={svgVideoOverlay6.endsWith('.webm') ? "video/webm" : "video/mp4"} />
                      </video>
                    </Box>
                  )}
                </Box>
              )}
            </Flex>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
};

export default FeatureSection;

