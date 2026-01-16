"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
  Input,
  HStack,
  Icon,
  useToast,
  Spinner,
  IconButton,
  VStack,
} from "@chakra-ui/react";
import { FiSearch, FiTrash2, FiImage } from "react-icons/fi";
import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const AdminMediaPage = () => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const { data, error, isLoading, mutate } = useSWR("/api/admin/media", fetcher);

  const handleDelete = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this media?")) return;
    try {
      const res = await fetch(`/api/admin/media/${mediaId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Media deleted", status: "success", duration: 2000 });
      mutate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, status: "error", duration: 3000 });
    }
  };

  const filteredMedia = data?.media?.filter((m: any) =>
    m.prompt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.userId?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
            Media Management
          </Text>
          <Heading
            fontSize={{ base: "26px", md: "32px", lg: "36px" }}
            fontWeight="500"
            color="black"
            letterSpacing="-0.02em"
            fontFamily="'General Sans', 'Inter', sans-serif"
          >
            All Media Files
          </Heading>
        </Box>
        <InputGroup size="sm" w={{ base: "100%", md: "240px" }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FiSearch} color="#A1A1AA" />
          </InputLeftElement>
          <Input
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            borderRadius="8px"
            border="1px solid #E5E5E5"
            bg="white"
            _focus={{ borderColor: "#6366f1", boxShadow: "0 0 0 1px #6366f1" }}
          />
        </InputGroup>
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="lg" color="#6366f1" />
        </Flex>
      ) : filteredMedia.length === 0 ? (
        <Box
          bg="white"
          borderRadius={{ base: "16px", md: "20px" }}
          border="1px solid #E5E5E5"
          p={12}
          textAlign="center"
        >
          <VStack spacing={3}>
            <Icon as={FiImage} fontSize="48px" color="#A1A1AA" />
            <Text fontSize="14px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
              No media files found
            </Text>
          </VStack>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={4}>
          {filteredMedia.map((item: any) => (
            <Box
              key={item.id}
              bg="white"
              borderRadius={{ base: "12px", md: "14px" }}
              border="1px solid #E5E5E5"
              overflow="hidden"
              position="relative"
              transition="all 0.2s"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                borderColor: "#6366f1",
              }}
              role="group"
            >
              <Box position="relative" w="100%" pt="100%" bg="#FAFAFA">
                <Image
                  src={item.url}
                  alt={item.prompt || "Generated image"}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                />
                <Box
                  position="absolute"
                  top={2}
                  right={2}
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  transition="opacity 0.2s"
                >
                  <IconButton
                    aria-label="Delete"
                    icon={<FiTrash2 />}
                    size="sm"
                    bg="rgba(0,0,0,0.7)"
                    color="white"
                    borderRadius="full"
                    onClick={() => handleDelete(item.id)}
                    _hover={{ bg: "rgba(0,0,0,0.9)" }}
                  />
                </Box>
              </Box>
              {item.prompt && (
                <Box p={3}>
                  <Text 
                    fontSize="11px" 
                    color="#71717A" 
                    noOfLines={2} 
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    lineHeight="1.4"
                  >
                    {item.prompt}
                  </Text>
                </Box>
              )}
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default AdminMediaPage;
