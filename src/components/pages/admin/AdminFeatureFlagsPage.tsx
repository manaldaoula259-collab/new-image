"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Button,
  useToast,
  Spinner,
  Switch,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import {
  FiFlag,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiSearch,
  FiToggleLeft,
  FiToggleRight,
  FiUsers,
  FiPercent,
  FiRefreshCw,
  FiFilter,
  FiCheck,
  FiX,
  FiCopy,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface FeatureFlag {
  _id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetUsers?: string[];
  targetUserGroups?: string[];
  conditions?: any;
  metadata?: {
    category?: string;
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

const AdminFeatureFlagsPage = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterEnabled, setFilterEnabled] = useState<"all" | "enabled" | "disabled">("all");
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [deletingFlag, setDeletingFlag] = useState<FeatureFlag | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [formData, setFormData] = useState({
    key: "",
    name: "",
    description: "",
    enabled: false,
    rolloutPercentage: 100,
    targetUserGroups: [] as string[],
    category: "general",
    tags: [] as string[],
  });

  const { data, error, isLoading, mutate } = useSWR("/api/admin/feature-flags", fetcher);

  useEffect(() => {
    if (editingFlag) {
      setFormData({
        key: editingFlag.key,
        name: editingFlag.name,
        description: editingFlag.description || "",
        enabled: editingFlag.enabled,
        rolloutPercentage: editingFlag.rolloutPercentage,
        targetUserGroups: editingFlag.targetUserGroups || [],
        category: editingFlag.metadata?.category || "general",
        tags: editingFlag.metadata?.tags || [],
      });
      setTags(editingFlag.metadata?.tags || []);
    } else {
      setFormData({
        key: "",
        name: "",
        description: "",
        enabled: false,
        rolloutPercentage: 100,
        targetUserGroups: [],
        category: "general",
        tags: [],
      });
      setTags([]);
    }
  }, [editingFlag]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setFormData(prev => ({ ...prev, tags: newTags }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(t => t !== tagToRemove);
    setTags(newTags);
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const handleSave = async () => {
    try {
      const url = editingFlag
        ? `/api/admin/feature-flags/${editingFlag._id}`
        : "/api/admin/feature-flags";

      const method = editingFlag ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save feature flag");
      }

      toast({
        title: editingFlag ? "Feature flag updated" : "Feature flag created",
        status: "success",
        duration: 2000,
        position: "top",
      });

      mutate();
      onClose();
      setEditingFlag(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      const res = await fetch(`/api/admin/feature-flags/${flag._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !flag.enabled }),
      });

      if (!res.ok) throw new Error("Failed to toggle feature flag");

      toast({
        title: flag.enabled ? "Feature flag disabled" : "Feature flag enabled",
        status: "success",
        duration: 2000,
        position: "top",
      });

      mutate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingFlag) return;

    try {
      const res = await fetch(`/api/admin/feature-flags/${deletingFlag._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete feature flag");

      toast({
        title: "Feature flag deleted",
        status: "success",
        duration: 2000,
        position: "top",
      });

      mutate();
      onDeleteClose();
      setDeletingFlag(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };

  const openEditModal = (flag: FeatureFlag) => {
    setEditingFlag(flag);
    onOpen();
  };

  const openDeleteModal = (flag: FeatureFlag) => {
    setDeletingFlag(flag);
    onDeleteOpen();
  };

  const filteredFlags = data?.flags?.filter((flag: FeatureFlag) => {
    const matchesSearch =
      flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterEnabled === "all") return matchesSearch;
    if (filterEnabled === "enabled") return matchesSearch && flag.enabled;
    if (filterEnabled === "disabled") return matchesSearch && !flag.enabled;
    return matchesSearch;
  }) || [];

  const enabledCount = data?.flags?.filter((f: FeatureFlag) => f.enabled).length || 0;
  const totalCount = data?.flags?.length || 0;

  return (
    <Box w="100%" maxW="100%" overflowX="hidden" minW="0">
      {/* Header */}
      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        mb={{ base: 6, md: 8 }}
        gap={4}
      >
        <Box>
          <HStack spacing={2} mb={1}>
            <Icon as={FiFlag} fontSize="14px" color="#6366f1" />
            <Text
              fontSize="12px"
              color="#6366f1"
              fontWeight="600"
              fontFamily="'IBM Plex Mono', monospace"
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              Feature Management
            </Text>
          </HStack>
          <Heading
            fontSize={{ base: "28px", md: "34px", lg: "40px" }}
            fontWeight="600"
            color="black"
            letterSpacing="-0.02em"
            fontFamily="'General Sans', 'Inter', sans-serif"
          >
            Feature Flags
          </Heading>
          <Text fontSize="14px" color="#71717A" mt={1} fontFamily="'General Sans', 'Inter', sans-serif">
            Control feature rollouts and A/B testing
          </Text>
        </Box>
        <Flex gap={3} wrap="wrap">
          <Button
            onClick={() => mutate()}
            size="sm"
            variant="outline"
            borderColor="#E5E5E5"
            color="#52525B"
            borderRadius="10px"
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontSize="13px"
            h="40px"
            px={4}
            leftIcon={<Icon as={FiRefreshCw} fontSize="14px" />}
            _hover={{ bg: "#F5F5F5", borderColor: "#D4D4D4" }}
            flex={{ base: 1, sm: "auto" }}
          >
            Refresh
          </Button>
          <Button
            onClick={() => {
              setEditingFlag(null);
              onOpen();
            }}
            size="sm"
            bg="black"
            color="white"
            borderRadius="10px"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="12px"
            textTransform="uppercase"
            letterSpacing="0.5px"
            h="40px"
            px={5}
            leftIcon={<Icon as={FiPlus} fontSize="14px" />}
            _hover={{ bg: "#1a1a1a" }}
            flex={{ base: 1, sm: "auto" }}
          >
            New Flag
          </Button>
        </Flex>
      </Flex>

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={{ base: 2, md: 4 }} mb={6} minW="0">
        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #E5E5E5"
          p={{ base: 3, md: 5 }}
          minW="0"
          position="relative"
          overflow="hidden"
          transition="all 0.2s"
          _hover={{
            borderColor: "#6366f1",
            boxShadow: "0 4px 15px rgba(99, 102, 241, 0.08)",
            transform: "translateY(-2px)",
          }}
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            w="80px"
            h="80px"
            borderRadius="full"
            bg="linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)"
            filter="blur(20px)"
          />
          <Flex justify="space-between" align="flex-start" mb={3}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="linear-gradient(135deg, #6366f1 0%, #8B5CF6 100%)"
              align="center"
              justify="center"
              boxShadow="0 4px 12px rgba(99, 102, 241, 0.3)"
            >
              <Icon as={FiFlag} fontSize="20px" color="white" />
            </Flex>
          </Flex>
          <Text fontSize={{ base: "24px", md: "38px" }} fontWeight="700" color="black" lineHeight="1" fontFamily="'General Sans', 'Inter', sans-serif">
            {totalCount.toLocaleString()}
          </Text>
          <Text fontSize="13px" color="#71717A" mt={1} fontFamily="'General Sans', 'Inter', sans-serif">
            Total Flags
          </Text>
        </Box>
        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #E5E5E5"
          p={{ base: 3, md: 5 }}
          minW="0"
          position="relative"
          overflow="hidden"
          transition="all 0.2s"
          _hover={{
            borderColor: "#10B981",
            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.08)",
            transform: "translateY(-2px)",
          }}
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            w="80px"
            h="80px"
            borderRadius="full"
            bg="linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)"
            filter="blur(20px)"
          />
          <Flex justify="space-between" align="flex-start" mb={3}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="linear-gradient(135deg, #10B981 0%, #22C55E 100%)"
              align="center"
              justify="center"
              boxShadow="0 4px 12px rgba(16, 185, 129, 0.3)"
            >
              <Icon as={FiCheck} fontSize="20px" color="white" />
            </Flex>
          </Flex>
          <Text fontSize={{ base: "24px", md: "38px" }} fontWeight="700" color="#10B981" lineHeight="1" fontFamily="'General Sans', 'Inter', sans-serif">
            {enabledCount.toLocaleString()}
          </Text>
          <Text fontSize="13px" color="#71717A" mt={1} fontFamily="'General Sans', 'Inter', sans-serif">
            Enabled
          </Text>
        </Box>
        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #E5E5E5"
          p={{ base: 3, md: 5 }}
          minW="0"
          position="relative"
          overflow="hidden"
          transition="all 0.2s"
          _hover={{
            borderColor: "#71717A",
            boxShadow: "0 4px 15px rgba(113, 113, 122, 0.08)",
            transform: "translateY(-2px)",
          }}
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            w="80px"
            h="80px"
            borderRadius="full"
            bg="linear-gradient(135deg, rgba(113, 113, 122, 0.1) 0%, rgba(161, 161, 170, 0.05) 100%)"
            filter="blur(20px)"
          />
          <Flex justify="space-between" align="flex-start" mb={3}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="linear-gradient(135deg, #71717A 0%, #A1A1AA 100%)"
              align="center"
              justify="center"
              boxShadow="0 4px 12px rgba(113, 113, 122, 0.3)"
            >
              <Icon as={FiX} fontSize="20px" color="white" />
            </Flex>
          </Flex>
          <Text fontSize={{ base: "24px", md: "38px" }} fontWeight="700" color="#71717A" lineHeight="1" fontFamily="'General Sans', 'Inter', sans-serif">
            {(totalCount - enabledCount).toLocaleString()}
          </Text>
          <Text fontSize="13px" color="#71717A" mt={1} fontFamily="'General Sans', 'Inter', sans-serif">
            Disabled
          </Text>
        </Box>
        <Box
          bg="white"
          borderRadius="16px"
          border="1px solid #E5E5E5"
          p={{ base: 3, md: 5 }}
          minW="0"
          position="relative"
          overflow="hidden"
          transition="all 0.2s"
          _hover={{
            borderColor: "#6366f1",
            boxShadow: "0 4px 15px rgba(99, 102, 241, 0.08)",
            transform: "translateY(-2px)",
          }}
        >
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            w="80px"
            h="80px"
            borderRadius="full"
            bg="linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)"
            filter="blur(20px)"
          />
          <Flex justify="space-between" align="flex-start" mb={3}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="linear-gradient(135deg, #6366f1 0%, #8B5CF6 100%)"
              align="center"
              justify="center"
              boxShadow="0 4px 12px rgba(99, 102, 241, 0.3)"
            >
              <Icon as={FiPercent} fontSize="20px" color="white" />
            </Flex>
          </Flex>
          <Text fontSize={{ base: "24px", md: "38px" }} fontWeight="700" color="#6366f1" lineHeight="1" fontFamily="'General Sans', 'Inter', sans-serif">
            {totalCount > 0 ? Math.round((enabledCount / totalCount) * 100) : 0}%
          </Text>
          <Text fontSize="13px" color="#71717A" mt={1} fontFamily="'General Sans', 'Inter', sans-serif">
            Active Rate
          </Text>
        </Box>
      </SimpleGrid>

      {/* Filters */}
      <Box
        bg="white"
        borderRadius="16px"
        border="1px solid #E5E5E5"
        p={4}
        mb={4}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={4}
          align={{ base: "stretch", md: "center" }}
        >
          <InputGroup flex={{ base: "1", md: "1 1 auto" }} maxW={{ base: "100%", md: "400px" }}>
            <InputLeftElement pointerEvents="none" pl={2}>
              <Icon as={FiSearch} color="gray.500" fontSize="16px" />
            </InputLeftElement>
            <Input
              placeholder="Search feature flags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="12px"
              border="1px solid #E5E5E5"
              bg="white"
              color="black"
              fontSize="14px"
              h="44px"
              pl={10}
              _placeholder={{ color: "gray.500" }}
              _focus={{
                borderColor: "#6366f1",
                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                bg: "white"
              }}
            />
          </InputGroup>

          <Select
            value={filterEnabled}
            onChange={(e) => setFilterEnabled(e.target.value as any)}
            borderRadius="12px"
            border="1px solid #E5E5E5"
            bg="white"
            color="black"
            fontSize="14px"
            h="44px"
            w={{ base: "100%", md: "180px" }}
            _focus={{ borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)" }}
          >
            <option value="all">All Flags</option>
            <option value="enabled">Enabled Only</option>
            <option value="disabled">Disabled Only</option>
          </Select>
        </Flex>
      </Box>

      {/* Feature Flags Table */}
      {isLoading ? (
        <Flex justify="center" align="center" minH="400px" bg="white" borderRadius="20px" border="1px solid #E5E5E5">
          <VStack spacing={4}>
            <Spinner size="lg" color="#6366f1" thickness="3px" />
            <Text fontSize="14px" color="#71717A">Loading feature flags...</Text>
          </VStack>
        </Flex>
      ) : (
        <TableContainer
          bg="white"
          borderRadius={{ base: "16px", md: "20px" }}
          border="1px solid #E5E5E5"
          w="100%"
          maxW="100%"
          minW="0"
          overflowX="auto"
          whiteSpace="nowrap"
        >
          <Table variant="simple">
            <Thead bg="#FAFAFA">
              <Tr>
                <Th fontSize="11px" fontWeight="600" color="#71717A" py={4} px={6} textTransform="uppercase">
                  Feature
                </Th>
                <Th fontSize="11px" fontWeight="600" color="#71717A" py={4} px={4} textTransform="uppercase">
                  Status
                </Th>
                <Th fontSize="11px" fontWeight="600" color="#71717A" py={4} px={4} textTransform="uppercase">
                  Rollout
                </Th>
                <Th fontSize="11px" fontWeight="600" color="#71717A" py={4} px={4} textTransform="uppercase">
                  Category
                </Th>
                <Th fontSize="11px" fontWeight="600" color="#71717A" py={4} px={4} textTransform="uppercase">
                  Tags
                </Th>
                <Th fontSize="11px" fontWeight="600" color="#71717A" py={4} textAlign="right" px={6} textTransform="uppercase">
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredFlags.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={16}>
                    <VStack spacing={4}>
                      <Icon as={FiFlag} fontSize="48px" color="#A1A1AA" />
                      <Text fontSize="15px" fontWeight="500" color="#52525B" fontFamily="'General Sans', 'Inter', sans-serif">
                        No feature flags found
                      </Text>
                      <Text fontSize="13px" color="#A1A1AA">
                        {searchQuery ? "Try a different search term" : "Create your first feature flag"}
                      </Text>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                filteredFlags.map((flag: FeatureFlag) => (
                  <Tr
                    key={flag._id}
                    _hover={{ bg: "#FAFAFA" }}
                    transition="all 0.15s"
                  >
                    <Td py={4} px={6}>
                      <Box>
                        <Text fontSize="14px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                          {flag.name}
                        </Text>
                        <Text fontSize="12px" color="#71717A" fontFamily="'IBM Plex Mono', monospace" mt={0.5}>
                          {flag.key}
                        </Text>
                        {flag.description && (
                          <Text fontSize="12px" color="#A1A1AA" mt={1} noOfLines={1}>
                            {flag.description}
                          </Text>
                        )}
                      </Box>
                    </Td>
                    <Td py={4} px={4}>
                      <Switch
                        isChecked={flag.enabled}
                        onChange={() => handleToggle(flag)}
                        colorScheme="purple"
                        size="md"
                        sx={{
                          "span.chakra-switch__track:not([data-checked])": {
                            backgroundColor: "#E2E8F0", // gray.200 equivalent, explicit hex for visibility
                          },
                          "span.chakra-switch__track:not([data-checked]):hover": {
                            backgroundColor: "#CBD5E0", // gray.300 on hover
                          },
                        }}
                      />
                    </Td>
                    <Td py={4} px={4}>
                      <HStack spacing={2}>
                        <Icon as={FiPercent} fontSize="14px" color="#71717A" />
                        <Text fontSize="13px" color="black" fontWeight="500" fontFamily="'General Sans', 'Inter', sans-serif">
                          {flag.rolloutPercentage}%
                        </Text>
                      </HStack>
                    </Td>
                    <Td py={4} px={4}>
                      <Badge
                        bg="rgba(99, 102, 241, 0.1)"
                        color="#6366f1"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="11px"
                        fontWeight="500"
                      >
                        {flag.metadata?.category || "general"}
                      </Badge>
                    </Td>
                    <Td py={4} px={4}>
                      <HStack spacing={1} flexWrap="wrap">
                        {flag.metadata?.tags?.slice(0, 2).map((tag: string) => (
                          <Badge
                            key={tag}
                            bg="#F5F5F5"
                            color="#52525B"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontSize="10px"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {flag.metadata?.tags && flag.metadata.tags.length > 2 && (
                          <Badge
                            bg="#F5F5F5"
                            color="#52525B"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            fontSize="10px"
                          >
                            +{flag.metadata.tags.length - 2}
                          </Badge>
                        )}
                      </HStack>
                    </Td>
                    <Td py={4} textAlign="right" px={6}>
                      <HStack spacing={1} justify="flex-end">
                        <Tooltip label="Edit" hasArrow>
                          <IconButton
                            aria-label="Edit"
                            icon={<Icon as={FiEdit2} fontSize="14px" />}
                            size="sm"
                            variant="ghost"
                            color="#52525B"
                            onClick={() => openEditModal(flag)}
                            _hover={{ bg: "rgba(99, 102, 241, 0.1)", color: "#6366f1" }}
                          />
                        </Tooltip>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                            aria-label="Actions"
                            _hover={{ bg: "#F5F5F5" }}
                          />
                          <MenuList
                            bg="white"
                            border="1px solid #E5E5E5"
                            borderRadius="12px"
                            p={1.5}
                            minW="180px"
                            boxShadow="0 10px 40px rgba(0,0,0,0.08)"
                          >
                            <MenuItem
                              onClick={() => {
                                navigator.clipboard.writeText(flag.key);
                                toast({
                                  title: "Copied to clipboard",
                                  status: "success",
                                  duration: 2000,
                                });
                              }}
                              bg="transparent"
                              color="#52525B"
                              icon={<Icon as={FiCopy} fontSize="14px" color="#71717A" />}
                              fontSize="13px"
                              fontFamily="'General Sans', 'Inter', sans-serif"
                              borderRadius="8px"
                              _hover={{ bg: "#F5F5F5", color: "black" }}
                              _focus={{ bg: "#F5F5F5" }}
                            >
                              Copy Key
                            </MenuItem>
                            <Box h="1px" bg="#F0F0F0" my={1} />
                            <MenuItem
                              onClick={() => openDeleteModal(flag)}
                              bg="transparent"
                              color="#EF4444"
                              fontFamily="'General Sans', 'Inter', sans-serif"
                              fontSize="13px"
                              borderRadius="8px"
                              _hover={{ bg: "#FEF2F2", color: "#DC2626" }}
                              _focus={{ bg: "#FEF2F2" }}
                              icon={<Icon as={FiTrash2} fontSize="14px" />}
                            >
                              Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>

        </TableContainer>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={isOpen} onClose={() => { onClose(); setEditingFlag(null); }} size={{ base: "full", md: "xl" }} isCentered>
        <ModalOverlay bg="rgba(0,0,0,0.4)" backdropFilter="blur(8px)" />
        <ModalContent bg="white" borderRadius="20px" mx={4}>
          <ModalHeader
            borderBottom="1px solid #F0F0F0"
            pb={4}
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontSize="18px"
            fontWeight="600"
          >
            <HStack spacing={3}>
              <Flex
                w="40px"
                h="40px"
                borderRadius="12px"
                bg="rgba(99, 102, 241, 0.1)"
                align="center"
                justify="center"
              >
                <Icon as={FiFlag} fontSize="18px" color="#6366f1" />
              </Flex>
              <Text color="black" fontWeight="600">{editingFlag ? "Edit Feature Flag" : "Create Feature Flag"}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />

          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <FormControl isRequired>
                <FormLabel fontSize="14px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif" mb={2}>
                  Feature Key
                </FormLabel>
                <Input
                  placeholder="new-feature-name"
                  value={formData.key}
                  onChange={(e) => handleInputChange("key", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  isDisabled={!!editingFlag}
                  borderRadius="10px"
                  border="1px solid #E5E5E5"
                  bg="#FAFAFA"
                  fontSize="14px"
                  color="black"
                  fontFamily="'IBM Plex Mono', monospace"
                  _focus={{ borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)", bg: "white" }}
                  _placeholder={{ color: "#A1A1AA" }}
                />
                <FormHelperText fontSize="12px" color="#71717A" mt={1}>
                  Unique identifier (lowercase, hyphens only)
                </FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="14px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif" mb={2}>
                  Feature Name
                </FormLabel>
                <Input
                  placeholder="New Feature Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  borderRadius="10px"
                  border="1px solid #E5E5E5"
                  bg="#FAFAFA"
                  fontSize="14px"
                  color="black"
                  _focus={{ borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)", bg: "white" }}
                  _placeholder={{ color: "#A1A1AA" }}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="14px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif" mb={2}>
                  Description
                </FormLabel>
                <Textarea
                  placeholder="Describe what this feature does..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  borderRadius="10px"
                  border="1px solid #E5E5E5"
                  bg="#FAFAFA"
                  fontSize="14px"
                  color="black"
                  rows={3}
                  _focus={{ borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)", bg: "white" }}
                  _placeholder={{ color: "#A1A1AA" }}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel fontSize="14px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif" mb={2}>
                    Category
                  </FormLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    borderRadius="10px"
                    border="1px solid #E5E5E5"
                    bg="#FAFAFA"
                    fontSize="14px"
                    color="black"
                    _focus={{ borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)", bg: "white" }}
                  >
                    <option value="general">General</option>
                    <option value="ui">UI/UX</option>
                    <option value="ai">AI Features</option>
                    <option value="payment">Payment</option>
                    <option value="beta">Beta</option>
                    <option value="experimental">Experimental</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="14px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif" mb={2}>
                    Rollout Percentage
                  </FormLabel>
                  <NumberInput
                    value={formData.rolloutPercentage}
                    onChange={(_, val) => handleInputChange("rolloutPercentage", val || 0)}
                    min={0}
                    max={100}
                  >
                    <NumberInputField
                      borderRadius="10px"
                      border="1px solid #E5E5E5"
                      bg="#FAFAFA"
                      fontSize="14px"
                      color="black"
                      _focus={{ borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)", bg: "white" }}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText fontSize="12px" color="#71717A" mt={1}>
                    0-100% of users
                  </FormHelperText>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel fontSize="14px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif" mb={2}>
                  Tags
                </FormLabel>
                <InputGroup>
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    borderRadius="10px"
                    border="1px solid #E5E5E5"
                    bg="#FAFAFA"
                    fontSize="14px"
                    color="black"
                    _focus={{ borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)", bg: "white" }}
                    _placeholder={{ color: "#A1A1AA" }}
                  />
                  <InputRightElement>
                    <Button
                      size="sm"
                      onClick={addTag}
                      bg="#6366f1"
                      color="white"
                      borderRadius="8px"
                      _hover={{ bg: "#4F46E5" }}
                    >
                      Add
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <HStack spacing={2} mt={2} flexWrap="wrap">
                  {tags.map((tag) => (
                    <Tag key={tag} size="md" borderRadius="full" bg="rgba(99, 102, 241, 0.1)" color="#6366f1">
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => removeTag(tag)} />
                    </Tag>
                  ))}
                </HStack>
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between" p={3} bg="#FAFAFA" borderRadius="10px">
                <Box>
                  <FormLabel mb={0} fontSize="14px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                    Enable Feature
                  </FormLabel>
                  <Text fontSize="12px" color="#71717A">
                    Turn this feature on/off
                  </Text>
                </Box>
                <Switch
                  isChecked={formData.enabled}
                  onChange={(e) => handleInputChange("enabled", e.target.checked)}
                  colorScheme="purple"
                  size="lg"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px solid #F0F0F0" pt={4} gap={3}>
            <Button
              variant="outline"
              onClick={() => { onClose(); setEditingFlag(null); }}
              borderRadius="10px"
              borderColor="#E5E5E5"
              color="#52525B"
              fontSize="13px"
              fontFamily="'General Sans', 'Inter', sans-serif"
              _hover={{ bg: "#F5F5F5", color: "black", borderColor: "#D4D4D4" }}
            >
              Cancel
            </Button>
            <Button
              bg="black"
              color="white"
              onClick={handleSave}
              borderRadius="10px"
              fontSize="13px"
              fontFamily="'IBM Plex Mono', monospace"
              textTransform="uppercase"
              letterSpacing="0.5px"
              _hover={{ bg: "#1a1a1a" }}
            >
              {editingFlag ? "Update Flag" : "Create Flag"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered size="md">
        <ModalOverlay bg="rgba(0,0,0,0.4)" backdropFilter="blur(8px)" />
        <ModalContent bg="white" borderRadius="20px" mx={4}>
          <ModalHeader fontFamily="'General Sans', 'Inter', sans-serif" fontSize="18px" fontWeight="600">
            Delete Feature Flag
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <Text fontSize="14px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
              Are you sure you want to delete <strong>{deletingFlag?.name}</strong>? This action cannot be undone.
            </Text>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button
              variant="outline"
              onClick={onDeleteClose}
              borderRadius="10px"
              borderColor="#E5E5E5"
              color="#52525B"
              fontSize="13px"
              fontFamily="'General Sans', 'Inter', sans-serif"
              _hover={{ bg: "#F5F5F5", color: "black", borderColor: "#D4D4D4" }}
            >
              Cancel
            </Button>
            <Button
              bg="#EF4444"
              color="white"
              onClick={handleDelete}
              borderRadius="10px"
              fontSize="13px"
              fontFamily="'IBM Plex Mono', monospace"
              textTransform="uppercase"
              letterSpacing="0.5px"
              _hover={{ bg: "#DC2626" }}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box >
  );
};

export default AdminFeatureFlagsPage;

