"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  DashboardEmptyState,
  DashboardLoadingState,
} from "@/components/dashboard/DashboardStates";
import { useRecentMedia } from "@/hooks/useRecentMedia";
import {
  Box,
  Grid,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  HStack,
  Badge,
  Icon,
  IconButton,
  Tooltip,
  Flex,
} from "@chakra-ui/react";
import Image from "next/image";
import { useState, useMemo } from "react";
import { BsImage, BsChatSquareText } from "react-icons/bs";
import { FiDownload, FiExternalLink } from "react-icons/fi";
import { format } from "date-fns";

const DashboardMediaPage = () => {
  const { media, isLoading } = useRecentMedia();
  const [activeTab, setActiveTab] = useState(0);

  const images = useMemo(() => {
    return media.filter((item) => item.url);
  }, [media]);

  const prompts = useMemo(() => {
    return media.filter((item) => item.prompt && item.prompt.trim().length > 0);
  }, [media]);

  const downloadImage = async (url: string, filename?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || `image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <DashboardShell activeItem="media">
      {/* Page Header */}
      <Box mb={6}>
        <Heading
          as="h1"
          fontSize={{ base: "26px", md: "32px" }}
          fontWeight="500"
          color="black"
          letterSpacing="-0.02em"
          mb={2}
          fontFamily="'General Sans', 'Inter', sans-serif"
        >
          Media Library
        </Heading>
        <Text fontSize="14px" color="#A1A1AA" fontFamily="'General Sans', 'Inter', sans-serif">
          All your generated images and prompts in one place
        </Text>
      </Box>

      {/* Tabs */}
      <Tabs index={activeTab} onChange={setActiveTab} variant="unstyled">
        <TabList gap={2} mb={6}>
          <Tab
            px={4}
            py={2}
            fontSize="13px"
            fontWeight="500"
            fontFamily="'General Sans', 'Inter', sans-serif"
            borderRadius="full"
            color={activeTab === 0 ? "white" : "#52525B"}
            bg={activeTab === 0 ? "black" : "#F5F5F5"}
            border="none"
            _hover={{ bg: activeTab === 0 ? "black" : "#E5E5E5", color: activeTab === 0 ? "white" : "black" }}
            transition="all 0.2s"
          >
            <HStack spacing={2}>
              <Icon as={BsImage} color={activeTab === 0 ? "white" : "#52525B"} fontSize="14px" />
              <Text color={activeTab === 0 ? "white" : "#52525B"}>Images</Text>
              {images.length > 0 && (
                <Text
                  fontSize="11px"
                  fontWeight="500"
                  color={activeTab === 0 ? "rgba(255,255,255,0.6)" : "#71717A"}
                >
                  {images.length}
                </Text>
              )}
            </HStack>
          </Tab>
          <Tab
            px={4}
            py={2}
            fontSize="13px"
            fontWeight="500"
            fontFamily="'General Sans', 'Inter', sans-serif"
            borderRadius="full"
            color={activeTab === 1 ? "white" : "#52525B"}
            bg={activeTab === 1 ? "black" : "#F5F5F5"}
            border="none"
            _hover={{ bg: activeTab === 1 ? "black" : "#E5E5E5", color: activeTab === 1 ? "white" : "black" }}
            transition="all 0.2s"
          >
            <HStack spacing={2}>
              <Icon as={BsChatSquareText} color={activeTab === 1 ? "white" : "#52525B"} fontSize="14px" />
              <Text color={activeTab === 1 ? "white" : "#52525B"}>Prompts</Text>
              {prompts.length > 0 && (
                <Text
                  fontSize="11px"
                  fontWeight="500"
                  color={activeTab === 1 ? "rgba(255,255,255,0.6)" : "#71717A"}
                >
                  {prompts.length}
                </Text>
              )}
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Images Tab */}
          <TabPanel p={0}>
            {isLoading ? (
              <DashboardLoadingState label="Loading your images..." minH="300px" />
            ) : images.length === 0 ? (
              <DashboardEmptyState
                label="No images yet. Start creating with any AI tool to see your designs here."
                minH="300px"
              />
            ) : (
              <Grid
                templateColumns={{
                  base: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(4, 1fr)",
                  lg: "repeat(5, 1fr)",
                  xl: "repeat(6, 1fr)",
                  "2xl": "repeat(8, 1fr)",
                }}
                gap={{ base: 3, md: 4 }}
              >
                {images.map((item) => (
                  <Box
                    key={item.id}
                    position="relative"
                    bg="white"
                    borderRadius="14px"
                    overflow="hidden"
                    border="1px solid #F0F0F0"
                    role="group"
                    transition="all 0.2s"
                    _hover={{
                      borderColor: "#C084FC",
                      boxShadow: "0 4px 15px rgba(168, 85, 247, 0.08)",
                    }}
                  >
                    <Box position="relative" paddingTop="100%">
                      <Box position="absolute" inset={0}>
                        <Image
                          src={item.url}
                          alt="Generated media"
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </Box>
                      
                      <Flex
                        position="absolute"
                        inset={0}
                        bg="blackAlpha.500"
                        opacity={0}
                        _groupHover={{ opacity: 1 }}
                        transition="opacity 0.2s"
                        align="center"
                        justify="center"
                        gap={2}
                      >
                        <Tooltip label="Download" placement="top">
                          <IconButton
                            aria-label="Download"
                            icon={<Icon as={FiDownload} />}
                            size="sm"
                            bg="white"
                            color="#18181B"
                            borderRadius="8px"
                            _hover={{ bg: "#F5F5F5" }}
                            onClick={(e) => {
                              e.preventDefault();
                              downloadImage(item.url, `mydzine-${item.id}.png`);
                            }}
                          />
                        </Tooltip>
                        <Tooltip label="Open" placement="top">
                          <IconButton
                            aria-label="Open"
                            icon={<Icon as={FiExternalLink} />}
                            size="sm"
                            bg="white"
                            color="#18181B"
                            borderRadius="8px"
                            _hover={{ bg: "#F5F5F5" }}
                            onClick={() => window.open(item.url, "_blank")}
                          />
                        </Tooltip>
                      </Flex>
                    </Box>
                  </Box>
                ))}
              </Grid>
            )}
          </TabPanel>

          {/* Prompts Tab */}
          <TabPanel p={0}>
            {isLoading ? (
              <DashboardLoadingState label="Loading your prompts..." minH="300px" />
            ) : prompts.length === 0 ? (
              <DashboardEmptyState
                label="No prompts saved yet. Generate images with prompts to see them here."
                minH="300px"
              />
            ) : (
              <Grid
                templateColumns={{
                  base: "1fr",
                  md: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                  xl: "repeat(4, 1fr)",
                }}
                gap={{ base: 3, md: 4 }}
              >
                {prompts.map((item) => (
                  <Box
                    key={item.id}
                    bg="white"
                    borderRadius="16px"
                    overflow="hidden"
                    border="1px solid #E5E5E5"
                    transition="all 0.2s"
                    _hover={{
                      borderColor: "#D4D4D4",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    }}
                  >
                    {item.url && (
                      <Box position="relative" h="150px" bg="#FAFAFA">
                        <Image
                          src={item.url}
                          alt="Prompt preview"
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </Box>
                    )}
                    <VStack spacing={3} p={4} align="stretch">
                      <Text
                        fontSize="13px"
                        color="#18181B"
                        lineHeight="1.6"
                        noOfLines={4}
                      >
                        {item.prompt}
                      </Text>
                      <HStack justify="space-between" fontSize="12px" color="#A1A1AA">
                        <Text>{format(item.createdAt, "MMM d, yyyy")}</Text>
                        {item.source && (
                          <Badge
                            bg="#F5F5F5"
                            color="#71717A"
                            fontSize="10px"
                            fontWeight="500"
                            borderRadius="4px"
                            textTransform="capitalize"
                          >
                            {item.source.replace(/-/g, " ")}
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </Grid>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </DashboardShell>
  );
};

export default DashboardMediaPage;
