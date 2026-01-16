"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { toolCategories, dashboardTools } from "@/data/dashboard";
import { useRecentMedia } from "@/hooks/useRecentMedia";
import {
  DashboardEmptyState,
  DashboardLoadingState,
} from "@/components/dashboard/DashboardStates";
import { useUser } from "@clerk/nextjs";
import { useUserCredits } from "@/hooks/useUserCredits";
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Icon,
  Text,
  HStack,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { toDashboardToolHref } from "@/core/utils/toDashboardToolHref";
import { 
  FiArrowRight, 
  FiZap, 
  FiImage, 
  FiCpu, 
  FiTrendingUp,
  FiStar,
  FiClock,
  FiPlus,
  FiLayers,
  FiGrid,
} from "react-icons/fi";

// Featured tools for quick access (shown in Quick Access section)
const featuredTools = [
  dashboardTools.find(t => t.title === "AI Face Swap"),
  dashboardTools.find(t => t.title === "Convert to Studio Ghibli"),
  dashboardTools.find(t => t.title === "Remove Background"),
  dashboardTools.find(t => t.title === "AI Image Generator"),
  dashboardTools.find(t => t.title === "AI Anime Filter"),
  dashboardTools.find(t => t.title === "Convert Photo to Pixar"),
  dashboardTools.find(t => t.title === "AI Style Transfer"),
  dashboardTools.find(t => t.title === "AI Photo Enhancer"),
  dashboardTools.find(t => t.title === "2D to 3D Converter"),
  dashboardTools.find(t => t.title === "Remove Object from Image"),
  dashboardTools.find(t => t.title === "Vectorize Image"),
].filter(Boolean) as typeof dashboardTools;

// Popular tools for showcase (subset)
const popularTools = featuredTools.slice(0, 4);

const DashboardPage = () => {
  const { user } = useUser();
  const { media: recentMedia, isLoading: isFetchingMedia } = useRecentMedia(6);
  const { totals } = useUserCredits();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardShell activeItem="home">
      {/* Welcome Header - Clean and Minimal */}
      <Flex 
        justify="space-between" 
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        mb={{ base: 6, md: 8 }}
        gap={4}
      >
        <Box>
          <Text 
            fontSize="13px" 
            color="#A1A1AA" 
            fontWeight="500" 
            mb={1}
            fontFamily="'General Sans', 'Inter', sans-serif"
          >
            {getGreeting()}, {user?.firstName || "Creator"}
          </Text>
          <Heading
            as="h1"
            fontSize={{ base: "26px", md: "32px", lg: "36px" }}
            fontWeight="500"
            color="black"
            letterSpacing="-0.02em"
            fontFamily="'General Sans', 'Inter', sans-serif"
          >
            What will you create today?
          </Heading>
        </Box>
        
        <HStack spacing={3}>
          <Box textAlign="right" display={{ base: "none", md: "block" }}>
            <Text fontSize="11px" color="#71717A" fontWeight="500" textTransform="uppercase" letterSpacing="0.5px">
              Credits
            </Text>
            <Text fontSize="20px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
              {totals.totalCredits.toLocaleString()}
            </Text>
          </Box>
          <Box
            as={Link}
            href="/dashboard/pricing"
            display="inline-flex"
            role="group"
          >
            <Button
              bg="white"
              color="black"
              height="56px"
              px={0}
              borderRadius="8px"
              fontFamily="'IBM Plex Mono', monospace"
              fontWeight="500"
              fontSize="13px"
              letterSpacing="0.6px"
              textTransform="uppercase"
              display="flex"
              alignItems="center"
              gap={0}
              overflow="hidden"
              width="auto"
              minW="auto"
              position="relative"
              border="1px solid #E5E5E5"
              _hover={{
                bg: "#FAFAFA",
                borderColor: "#D4D4D8",
              }}
              _active={{
                bg: "#F5F5F5",
              }}
            >
              <Box
                position="absolute"
                left="4px"
                top="4px"
                bottom="4px"
                bg="#573cff"
                borderRadius="4px"
                w="48px"
                transition="width 0.3s ease, border-radius 0.3s ease"
                _groupHover={{
                  w: "calc(100% - 8px)",
                  borderRadius: "4px",
                }}
              />
              <Box
                position="absolute"
                left="28px"
                top="50%"
                transform="translate(-50%, -50%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex={2}
              >
                <Icon as={FiZap} color="white" size="20px" />
              </Box>
              <Text 
                pl="60px"
                pr={4} 
                py={3}
                position="relative"
                zIndex={1}
                transition="color 0.3s ease"
                _groupHover={{
                  color: "white",
                }}
              >
                Add Credits
              </Text>
            </Button>
          </Box>
        </HStack>
      </Flex>

      {/* Bento Grid Layout - Fully Responsive */}
      <Grid
        templateColumns={{ 
          base: "1fr", 
          md: "1fr 1fr", 
          lg: "repeat(12, 1fr)",
          xl: "repeat(12, 1fr)",
          "2xl": "repeat(12, 1fr)"
        }}
        templateRows={{ base: "auto", lg: "auto auto" }}
        gap={{ base: 4, md: 4, lg: 5 }}
        mb={{ base: 6, md: 8 }}
      >
        {/* Main CTA - Large Card with Background Image */}
        <Box
          gridColumn={{ base: "1", md: "1 / -1", lg: "span 7", xl: "span 7" }}
          gridRow={{ lg: "span 2" }}
          borderRadius={{ base: "16px", md: "20px" }}
          p={{ base: 5, md: 6, lg: 8 }}
          position="relative"
          overflow="hidden"
          minH={{ base: "240px", sm: "280px", md: "300px", lg: "340px" }}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          border="1px solid #E8E5F0"
        >
          {/* Background Image */}
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width="160%"
            height="160%"
            zIndex={0}
            sx={{
              transform: "translate(-50%, -50%) scale(1.1)",
              transformOrigin: "center center",
            }}
          >
            <Box position="relative" width="100%" height="100%">
              <Image
                src="/assets/landing_page/hero_bg.png"
                alt="Card Background"
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </Box>
          </Box>
          
          <Box position="relative" zIndex={1}>
            <HStack spacing={2} mb={{ base: 3, md: 4 }}>
              <Box w="8px" h="8px" borderRadius="full" bg="white" />
              <Text fontSize={{ base: "10px", md: "11px" }} fontWeight="600" color="white" textTransform="uppercase" letterSpacing="1px">
                Featured
              </Text>
            </HStack>
            
            <Text 
              fontSize={{ base: "24px", sm: "28px", md: "32px", lg: "38px", xl: "42px" }} 
              fontWeight="500" 
              color="white" 
              lineHeight="1.1"
              maxW={{ base: "100%", lg: "400px" }}
              fontFamily="'General Sans', 'Inter', sans-serif"
              mb={{ base: 2, md: 3 }}
            >
              Turn your ideas into stunning visuals
            </Text>
            
            <Text 
              fontSize={{ base: "13px", md: "14px", lg: "15px" }} 
              color="white" 
              opacity={0.9}
              maxW={{ base: "100%", lg: "340px" }} 
              lineHeight="1.6" 
              fontFamily="'General Sans', 'Inter', sans-serif"
              display={{ base: "none", sm: "block" }}
            >
              {dashboardTools.length}+ AI tools ready to transform your creative workflow
            </Text>
          </Box>

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
              alignSelf="flex-start"
              position="relative"
              _hover={{
                bg: "#1a1a1a",
              }}
              _active={{
                bg: "#1a1a1a",
              }}
            >
              <Box
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
                Browse All Tools
              </Text>
            </Button>
          </Box>
        </Box>

        {/* Quick Stats - With Accent */}
        <Box
          gridColumn={{ base: "1", md: "1", lg: "span 5" }}
          bg="white"
          borderRadius={{ base: "16px", md: "20px" }}
          border="1px solid #E5E5E5"
          p={{ base: 4, md: 5, lg: 6 }}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top="-30px"
            right="-30px"
            w="80px"
            h="80px"
            borderRadius="full"
            bg="linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)"
            filter="blur(20px)"
          />
          <Text fontSize={{ base: "10px", md: "11px" }} fontWeight="600" color="#52525B" textTransform="uppercase" letterSpacing="1px" mb={{ base: 3, md: 4 }}>
            Your Stats
          </Text>
          
          <Grid templateColumns="repeat(2, 1fr)" gap={{ base: 3, md: 4 }}>
            <Box>
              <Text fontSize={{ base: "24px", sm: "28px", md: "32px" }} fontWeight="600" color="black" lineHeight="1" fontFamily="'General Sans', 'Inter', sans-serif">
                {recentMedia.length}
              </Text>
              <Text fontSize={{ base: "11px", md: "12px" }} color="#71717A" mt={1}>Designs created</Text>
            </Box>
            <Box>
              <Text fontSize={{ base: "24px", sm: "28px", md: "32px" }} fontWeight="600" color="black" lineHeight="1" fontFamily="'General Sans', 'Inter', sans-serif">
                {totals.totalCredits > 0 ? "HD" : "—"}
              </Text>
              <Text fontSize={{ base: "11px", md: "12px" }} color="#71717A" mt={1}>Export quality</Text>
            </Box>
          </Grid>
        </Box>

        {/* Featured Tool */}
        <Box
          gridColumn={{ base: "1", md: "2", lg: "span 5" }}
          as={Link}
          href={featuredTools[0] ? toDashboardToolHref(featuredTools[0].href) : "/dashboard/ai-tools"}
          bg="linear-gradient(135deg, #FDF8F6 0%, #F8F5FF 100%)"
          borderRadius={{ base: "16px", md: "20px" }}
          border="1px solid #EBE5F0"
          p={{ base: 4, md: 5, lg: 6 }}
          transition="all 0.2s"
          _hover={{ transform: "translateY(-2px)", boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}
        >
          <HStack justify="space-between" mb={{ base: 3, md: 4 }}>
            <Text fontSize={{ base: "10px", md: "11px" }} fontWeight="600" color="#6366f1" textTransform="uppercase" letterSpacing="1px">
              Try Now
            </Text>
            <Icon as={FiArrowRight} color="#6366f1" fontSize={{ base: "14px", md: "16px" }} />
          </HStack>
          
          <Flex align="center" gap={3}>
            <Flex
              w={{ base: "40px", md: "44px", lg: "48px" }}
              h={{ base: "40px", md: "44px", lg: "48px" }}
              borderRadius={{ base: "10px", md: "12px" }}
              bg="white"
              align="center"
              justify="center"
              border="1px solid #E5E5E5"
              flexShrink={0}
            >
              <Icon as={featuredTools[0]?.icon || FiImage} fontSize={{ base: "18px", md: "20px", lg: "22px" }} color="#6366f1" />
            </Flex>
            <Box overflow="hidden">
              <Text fontSize={{ base: "14px", md: "15px", lg: "16px" }} fontWeight="500" color="black" fontFamily="'General Sans', 'Inter', sans-serif" noOfLines={1}>
                {featuredTools[0]?.title || "AI Face Swap"}
              </Text>
              <Text fontSize={{ base: "11px", md: "12px" }} color="#52525B" noOfLines={1}>
                Most popular this week
              </Text>
            </Box>
          </Flex>
        </Box>
      </Grid>

      {/* Quick Access Tools - Responsive Grid */}
      <Box mb={{ base: 6, md: 8 }}>
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize={{ base: "12px", md: "13px" }} fontWeight="600" color="#52525B" textTransform="uppercase" letterSpacing="0.5px">
            Quick Access
          </Text>
          <Button
            as={Link}
            href="/dashboard/ai-tools"
            variant="ghost"
            size="sm"
            rightIcon={<Icon as={FiArrowRight} />}
            color="#52525B"
            fontSize={{ base: "11px", md: "12px" }}
            fontWeight="500"
            _hover={{ color: "black" }}
          >
            See all
          </Button>
        </Flex>

        <Grid 
          templateColumns={{ 
            base: "repeat(2, 1fr)", 
            sm: "repeat(3, 1fr)", 
            md: "repeat(4, 1fr)", 
            lg: "repeat(5, 1fr)",
            xl: "repeat(6, 1fr)",
            "2xl": "repeat(8, 1fr)"
          }}
          gap={{ base: 2, md: 3 }}
        >
          {featuredTools.map((tool, index) => (
            <Box
              key={tool.href}
              as={Link}
                      href={toDashboardToolHref(tool.href)}
              bg="white"
              borderRadius={{ base: "12px", md: "14px" }}
              border="1px solid #E5E5E5"
              p={{ base: 3, md: 4 }}
              transition="all 0.2s"
              _hover={{
                borderColor: "#6366f1",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
              }}
            >
              <Flex
                w={{ base: "36px", md: "40px" }}
                h={{ base: "36px", md: "40px" }}
                borderRadius={{ base: "8px", md: "10px" }}
                bg={index % 2 === 0 
                  ? "#F5F3FF"
                  : "#FEF3F2"
                }
                align="center"
                justify="center"
                mb={{ base: 2, md: 3 }}
              >
                <Icon as={tool.icon} fontSize={{ base: "16px", md: "18px" }} color={index % 2 === 0 ? "#6366f1" : "#E11D48"} />
              </Flex>
              <Text fontSize={{ base: "12px", md: "13px" }} fontWeight="500" color="black" noOfLines={1} fontFamily="'General Sans', 'Inter', sans-serif">
                {tool.title}
              </Text>
            </Box>
          ))}
        </Grid>
      </Box>

      {/* Recent Work & Categories - Responsive Layout */}
      <Grid 
        templateColumns={{ 
          base: "1fr", 
          lg: "1fr 1fr",
          xl: "3fr 2fr",
          "2xl": "2fr 1fr"
        }} 
        gap={{ base: 4, md: 5, lg: 6 }}
      >
        {/* Recent Designs - Clean Gallery */}
        <Box>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize={{ base: "12px", md: "13px" }} fontWeight="600" color="#52525B" textTransform="uppercase" letterSpacing="0.5px">
              Recent Designs
            </Text>
            {recentMedia.length > 0 && (
              <Button
                as={Link}
                href="/dashboard/media"
                variant="ghost"
                size="sm"
                rightIcon={<Icon as={FiArrowRight} />}
                color="#52525B"
                fontSize={{ base: "11px", md: "12px" }}
                fontWeight="500"
                _hover={{ color: "black" }}
              >
                View all
              </Button>
            )}
          </Flex>

          {isFetchingMedia ? (
            <DashboardLoadingState label="Loading..." minH={{ base: "150px", md: "200px" }} />
          ) : recentMedia.length === 0 ? (
            <Box
              bg="#F9FAFB"
              borderRadius={{ base: "14px", md: "16px" }}
              p={{ base: 6, md: 8, lg: 10 }}
              textAlign="center"
              border="1px solid #E5E5E5"
            >
              <Box
                w={{ base: "52px", md: "64px" }}
                h={{ base: "52px", md: "64px" }}
                borderRadius={{ base: "12px", md: "16px" }}
                bg="white"
                border="1px solid #E5E5E5"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
                mb={{ base: 3, md: 4 }}
              >
                <Icon as={FiImage} fontSize={{ base: "20px", md: "24px" }} color="#6366f1" />
              </Box>
              <Text fontSize={{ base: "14px", md: "15px" }} fontWeight="500" color="black" mb={2} fontFamily="'General Sans', 'Inter', sans-serif">
                Your canvas awaits
              </Text>
              <Text fontSize={{ base: "12px", md: "13px" }} color="#52525B" mb={{ base: 4, md: 5 }} fontFamily="'General Sans', 'Inter', sans-serif">
                Create something amazing with AI
              </Text>
              <Box
                as={Link}
                href="/dashboard/ai-tools"
                display="inline-flex"
                role="group"
              >
                <Button
                  bg="white"
                  color="black"
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
                  width="auto"
                  minW="auto"
                  position="relative"
                  border="1px solid #E5E5E5"
                  _hover={{
                    bg: "#FAFAFA",
                    borderColor: "#D4D4D8",
                  }}
                  _active={{
                    bg: "#F5F5F5",
                  }}
                >
                  <Box
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
                    Start Creating
                  </Text>
                </Button>
              </Box>
            </Box>
          ) : (
            <Grid 
              templateColumns={{ 
                base: "repeat(2, 1fr)", 
                sm: "repeat(3, 1fr)", 
                md: "repeat(3, 1fr)",
                lg: "repeat(3, 1fr)",
                xl: "repeat(4, 1fr)",
                "2xl": "repeat(5, 1fr)"
              }} 
              gap={{ base: 2, md: 3 }}
            >
              {recentMedia.slice(0, 6).map((media) => (
                <Box
                  key={media.id}
                  position="relative"
                  paddingTop="100%"
                  borderRadius={{ base: "10px", md: "14px" }}
                  overflow="hidden"
                  bg="#F5F5F5"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    transform: "scale(1.02)",
                  }}
                >
                  <Box position="absolute" inset={0}>
                    <Image
                      src={media.url}
                      alt="Recent design"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </Box>
                </Box>
              ))}
            </Grid>
          )}
        </Box>

        {/* Categories - Responsive Grid/List */}
        <Box>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize={{ base: "12px", md: "13px" }} fontWeight="600" color="#52525B" textTransform="uppercase" letterSpacing="0.5px">
              Categories
            </Text>
          </Flex>

          <Grid 
            templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "1fr" }}
            gap={2}
          >
            {toolCategories.slice(0, 6).map((category, index) => (
              <Box
                key={category.id}
                as={Link}
                href="/dashboard/ai-tools"
                bg="white"
                borderRadius={{ base: "12px", md: "14px" }}
                border="1px solid #E5E5E5"
                p={{ base: 3, md: 4 }}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                transition="all 0.2s"
                _hover={{
                  borderColor: "#6366f1",
                  bg: "#FAFAFA",
                }}
              >
                <HStack spacing={{ base: 2, md: 3 }}>
                  <Flex
                    w={{ base: "32px", md: "36px" }}
                    h={{ base: "32px", md: "36px" }}
                    borderRadius={{ base: "8px", md: "10px" }}
                    bg={index % 3 === 0 
                      ? "#F5F3FF"
                      : index % 3 === 1
                      ? "#FEF3F2"
                      : "#F0FDF4"
                    }
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Icon 
                      as={category.icon} 
                      fontSize={{ base: "14px", md: "16px" }}
                      color={index % 3 === 0 ? "#6366f1" : index % 3 === 1 ? "#E11D48" : "#16A34A"} 
                    />
                  </Flex>
                  <Box overflow="hidden">
                    <Text fontSize={{ base: "13px", md: "14px" }} fontWeight="500" color="black" fontFamily="'General Sans', 'Inter', sans-serif" noOfLines={1}>
                      {category.label}
                    </Text>
                    <Text fontSize={{ base: "10px", md: "11px" }} color="#71717A">
                      {category.tools.length} tools
                    </Text>
                  </Box>
                </HStack>
                <Icon as={FiArrowRight} fontSize={{ base: "12px", md: "14px" }} color="#A1A1AA" flexShrink={0} />
              </Box>
            ))}
          </Grid>
        </Box>
      </Grid>
    </DashboardShell>
  );
};

export default DashboardPage;
