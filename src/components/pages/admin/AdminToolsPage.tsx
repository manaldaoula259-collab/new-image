"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  HStack,
  Icon,
  Badge,
  useToast,
  Spinner,
  VStack,
  Code,
} from "@chakra-ui/react";
import { FiRefreshCw, FiCpu, FiCheckCircle, FiAlertCircle, FiSettings } from "react-icons/fi";
import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch" }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
};

const AdminToolsPage = () => {
  const toast = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data, error, isLoading, mutate } = useSWR("/api/admin/tools/catalog", fetcher, {
    onError: (err) => {
      console.error("Catalog fetch error:", err);
    },
  });

  const handleRefreshCatalog = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/tools/catalog/refresh", { method: "POST" });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to refresh" }));
        throw new Error(errorData.error || "Failed to refresh");
      }
      toast({ title: "Catalog refreshed", status: "success", duration: 2000 });
      mutate();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to refresh catalog", 
        status: "error", 
        duration: 3000 
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Box>
      {/* Header */}
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
            Tools & Models
          </Text>
          <Heading
            fontSize={{ base: "26px", md: "32px", lg: "36px" }}
            fontWeight="500"
            color="black"
            letterSpacing="-0.02em"
            fontFamily="'General Sans', 'Inter', sans-serif"
          >
            Replicate Model Catalog
          </Heading>
        </Box>
        <HStack spacing={3}>
          <Button
            as={Link}
            href="/admin/tools/config"
            size="sm"
            variant="outline"
            borderColor="#E5E5E5"
            color="#52525B"
            borderRadius="8px"
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontSize="12px"
            h="36px"
            px={4}
            leftIcon={<Icon as={FiSettings} />}
            _hover={{ bg: "#F5F5F5", borderColor: "#D4D4D4" }}
          >
            Configure Tools
          </Button>
          <Button
            size="sm"
            bg="black"
            color="white"
            borderRadius="8px"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="11px"
            textTransform="uppercase"
            letterSpacing="0.5px"
            h="36px"
            px={4}
            leftIcon={<Icon as={FiRefreshCw} />}
            onClick={handleRefreshCatalog}
            isLoading={isRefreshing}
            _hover={{ bg: "#1a1a1a" }}
          >
            Refresh Catalog
          </Button>
        </HStack>
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" minH="400px">
          <VStack spacing={3}>
            <Spinner size="lg" color="#6366f1" thickness="2px" />
            <Text fontSize="13px" color="#A1A1AA" fontFamily="'General Sans', 'Inter', sans-serif">
              Loading catalog...
            </Text>
          </VStack>
        </Flex>
      ) : error ? (
        <Box 
          bg="white" 
          borderRadius={{ base: "16px", md: "20px" }} 
          border="1px solid #E5E5E5" 
          p={8}
          textAlign="center"
        >
          <VStack spacing={4}>
            <Box
              w="48px"
              h="48px"
              borderRadius="12px"
              bg="rgba(239, 68, 68, 0.1)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiAlertCircle} fontSize="24px" color="#EF4444" />
            </Box>
            <VStack spacing={2}>
              <Text fontSize="16px" fontWeight="500" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                Failed to load catalog
              </Text>
              <Text fontSize="13px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
                {error.message || "An error occurred while fetching the catalog"}
              </Text>
            </VStack>
            <Button
              size="sm"
              bg="black"
              color="white"
              borderRadius="8px"
              fontFamily="'IBM Plex Mono', monospace"
              fontSize="11px"
              textTransform="uppercase"
              letterSpacing="0.5px"
              h="36px"
              px={4}
              leftIcon={<Icon as={FiRefreshCw} />}
              onClick={() => mutate()}
              _hover={{ bg: "#1a1a1a" }}
            >
              Retry
            </Button>
          </VStack>
        </Box>
      ) : (
        <Box 
          bg="white" 
          borderRadius={{ base: "16px", md: "20px" }} 
          border="1px solid #E5E5E5" 
          p={6}
        >
          <VStack spacing={4} align="stretch">
            <HStack spacing={3}>
              <Flex
                w="40px"
                h="40px"
                borderRadius="10px"
                bg="rgba(99, 102, 241, 0.1)"
                align="center"
                justify="center"
              >
                <Icon as={FiCpu} fontSize="20px" color="#6366f1" />
              </Flex>
              <Text fontSize="14px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                Catalog Status
              </Text>
            </HStack>
            {data?.catalog ? (
              <>
                <HStack spacing={2}>
                  <Icon as={FiCheckCircle} color="#10B981" fontSize="16px" />
                  <Text fontSize="13px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
                    Last updated: {new Date(data.catalog.lastUpdated).toLocaleString()}
                  </Text>
                </HStack>
                <Box>
                  <Text fontSize="12px" fontWeight="600" color="#71717A" mb={2} fontFamily="'General Sans', 'Inter', sans-serif">
                    Total Models:{" "}
                    <Badge 
                      bg="rgba(99, 102, 241, 0.15)" 
                      color="#4F46E5" 
                      px={2} 
                      py={0.5} 
                      borderRadius="full" 
                      fontSize="11px" 
                      fontFamily="'IBM Plex Mono', monospace"
                      fontWeight="500"
                    >
                      {data.catalog.modelCount || 0}
                    </Badge>
                  </Text>
                </Box>
                {data.catalog.sampleModels && data.catalog.sampleModels.length > 0 && (
                  <Box mt={4}>
                    <Text fontSize="12px" fontWeight="600" color="#71717A" mb={2} fontFamily="'General Sans', 'Inter', sans-serif">
                      Sample Models (first 10):
                    </Text>
                    <VStack spacing={2} align="stretch" mt={2}>
                      {data.catalog.sampleModels.slice(0, 10).map((model: string, idx: number) => (
                        <Code 
                          key={idx} 
                          fontSize="11px" 
                          p={2} 
                          borderRadius="6px" 
                          bg="#FAFAFA" 
                          color="#52525B" 
                          fontFamily="'IBM Plex Mono', monospace"
                          border="1px solid #E5E5E5"
                        >
                          {model}
                        </Code>
                      ))}
                    </VStack>
                  </Box>
                )}
              </>
            ) : (
              <Box
                bg="#FAFAFA"
                borderRadius="12px"
                p={6}
                textAlign="center"
              >
                <VStack spacing={3}>
                  <Icon as={FiCpu} fontSize="32px" color="#A1A1AA" />
                  <Text fontSize="13px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
                    No catalog data available
                  </Text>
                  <Text fontSize="12px" color="#A1A1AA" fontFamily="'General Sans', 'Inter', sans-serif">
                    Click &quot;Refresh Catalog&quot; to load models from Replicate
                  </Text>
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default AdminToolsPage;
