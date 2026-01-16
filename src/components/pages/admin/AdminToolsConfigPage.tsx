"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  HStack,
  Icon,
  useToast,
  Spinner,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  SimpleGrid,
  TableContainer,
} from "@chakra-ui/react";
import {
  FiSettings,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { dashboardTools } from "@/data/dashboard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ToolConfig {
  _id?: string;
  toolSlug: string;
  modelIdentifier: string;
  promptTemplate: string;
  negativePrompt?: string;
  defaultAspectRatio?: string;
  defaultOutputFormat?: string;
  creditsCost?: number;
  enabled: boolean;
}

const AdminToolsConfigPage = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data, error, isLoading, mutate } = useSWR("/api/admin/tools/config", fetcher);

  const [editingConfig, setEditingConfig] = useState<ToolConfig | null>(null);
  const [formData, setFormData] = useState<Partial<ToolConfig>>({
    toolSlug: "",
    modelIdentifier: "stability-ai/sdxl:7762fd02304d6fdf5a62ef993962e12c1196a70c24f0144d541185ce992d743a",
    promptTemplate: "",
    negativePrompt: "",
    defaultAspectRatio: "1:1",
    defaultOutputFormat: "jpg",
    creditsCost: 5,
    enabled: true,
  });

  const configs = data?.configs || [];
  const configMap = new Map<string, ToolConfig>(configs.map((c: ToolConfig) => [c.toolSlug, c]));

  // Get all unique tool slugs from dashboard tools
  const allToolSlugs = dashboardTools
    .map(tool => {
      // Extract slug from href (e.g., "/ai-art-generator/ai-character-generator" -> "ai-art-generator/ai-character-generator")
      const slug = tool.href.replace(/^\//, "");
      return { slug, title: tool.title, href: tool.href };
    })
    .filter((item, index, self) =>
      index === self.findIndex(t => t.slug === item.slug)
    );

  const handleEdit = (config: ToolConfig) => {
    setEditingConfig(config);
    setFormData({
      toolSlug: config.toolSlug,
      modelIdentifier: config.modelIdentifier,
      promptTemplate: config.promptTemplate,
      negativePrompt: config.negativePrompt || "",
      defaultAspectRatio: config.defaultAspectRatio || "1:1",
      defaultOutputFormat: config.defaultOutputFormat || "jpg",
      creditsCost: config.creditsCost || 5,
      enabled: config.enabled,
    });
    onOpen();
  };

  const handleNew = () => {
    setEditingConfig(null);
    setFormData({
      toolSlug: "",
      modelIdentifier: "stability-ai/sdxl:7762fd02304d6fdf5a62ef993962e12c1196a70c24f0144d541185ce992d743a",
      promptTemplate: "",
      negativePrompt: "",
      defaultAspectRatio: "1:1",
      defaultOutputFormat: "jpg",
      creditsCost: 5,
      enabled: true,
    });
    onOpen();
  };

  const handleSave = async () => {
    if (!formData.toolSlug || !formData.modelIdentifier || !formData.promptTemplate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      const res = await fetch("/api/admin/tools/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save");
      }

      toast({
        title: "Success",
        description: "Tool configuration saved",
        status: "success",
        duration: 2000,
      });
      mutate();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleDelete = async (toolSlug: string) => {
    if (!confirm(`Are you sure you want to delete configuration for ${toolSlug}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/tools/config/${encodeURIComponent(toolSlug)}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast({
        title: "Success",
        description: "Configuration deleted",
        status: "success",
        duration: 2000,
      });
      mutate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

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
          <Text
            fontSize="13px"
            color="#A1A1AA"
            fontWeight="500"
            mb={1}
            fontFamily="'General Sans', 'Inter', sans-serif"
          >
            Tools Configuration
          </Text>
          <Heading
            fontSize={{ base: "26px", md: "32px", lg: "36px" }}
            fontWeight="500"
            color="black"
            letterSpacing="-0.02em"
            fontFamily="'General Sans', 'Inter', sans-serif"
          >
            Model & Prompt Settings
          </Heading>
        </Box>
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
          leftIcon={<Icon as={FiPlus} />}
          onClick={handleNew}
          _hover={{ bg: "#1a1a1a" }}
        >
          Add Configuration
        </Button>
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" minH="400px">
          <Spinner size="lg" color="#6366f1" />
        </Flex>
      ) : (
        <Box
          bg="white"
          borderRadius={{ base: "16px", md: "20px" }}
          border="1px solid #E5E5E5"
          w="100%"
          maxW="100%"
          overflowX="auto"
        >
          <Table variant="simple" minW="800px">
            <Thead bg="#FAFAFA">
              <Tr>
                <Th fontSize="12px" fontWeight="600" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif" py={4} px={6}>
                  Tool
                </Th>
                <Th fontSize="12px" fontWeight="600" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif" py={4}>
                  Model
                </Th>
                <Th fontSize="12px" fontWeight="600" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif" py={4}>
                  Status
                </Th>
                <Th fontSize="12px" fontWeight="600" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif" py={4}>
                  Credits
                </Th>
                <Th fontSize="12px" fontWeight="600" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif" py={4} textAlign="right" px={6}>
                  Actions
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {allToolSlugs.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={12}>
                    <Text fontSize="14px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
                      No tools found
                    </Text>
                  </Td>
                </Tr>
              ) : (
                allToolSlugs.map((tool) => {
                  const config = configMap.get(tool.slug);
                  return (
                    <Tr key={tool.slug} _hover={{ bg: "#FAFAFA" }} transition="all 0.15s">
                      <Td fontSize="13px" color="black" fontFamily="'General Sans', 'Inter', sans-serif" py={4} px={6}>
                        <VStack align="flex-start" spacing={0}>
                          <Text fontWeight="500">{tool.title}</Text>
                          <Text fontSize="11px" color="#A1A1AA">{tool.slug}</Text>
                        </VStack>
                      </Td>
                      <Td fontSize="12px" color="#52525B" fontFamily="'IBM Plex Mono', monospace" py={4}>
                        {config?.modelIdentifier || "Not configured"}
                      </Td>
                      <Td py={4}>
                        {config ? (
                          <Badge
                            bg={config.enabled ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"}
                            color={config.enabled ? "#16A34A" : "#DC2626"}
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="10px"
                            fontFamily="'IBM Plex Mono', monospace"
                          >
                            {config.enabled ? (
                              <HStack spacing={1}>
                                <Icon as={FiCheckCircle} fontSize="10px" />
                                <Text>Enabled</Text>
                              </HStack>
                            ) : (
                              <HStack spacing={1}>
                                <Icon as={FiXCircle} fontSize="10px" />
                                <Text>Disabled</Text>
                              </HStack>
                            )}
                          </Badge>
                        ) : (
                          <Badge
                            bg="rgba(113, 113, 122, 0.15)"
                            color="#71717A"
                            px={2}
                            py={1}
                            borderRadius="full"
                            fontSize="10px"
                            fontFamily="'IBM Plex Mono', monospace"
                          >
                            Not configured
                          </Badge>
                        )}
                      </Td>
                      <Td fontSize="12px" color="#52525B" fontFamily="'IBM Plex Mono', monospace" py={4}>
                        {config?.creditsCost || "-"}
                      </Td>
                      <Td py={4} textAlign="right" px={6}>
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
                            p={1}
                            minW="160px"
                            boxShadow="0 10px 40px rgba(0,0,0,0.08)"
                          >
                            <MenuItem
                              onClick={() => config ? handleEdit(config) : handleEdit({ ...formData, toolSlug: tool.slug } as ToolConfig)}
                              bg="transparent"
                              color="#52525B"
                              fontFamily="'General Sans', 'Inter', sans-serif"
                              fontSize="13px"
                              borderRadius="8px"
                              _hover={{ bg: "#F5F5F5", color: "black" }}
                              _focus={{ bg: "#F5F5F5" }}
                              icon={<Icon as={FiEdit2} fontSize="14px" color="#6366f1" />}
                            >
                              {config ? "Edit" : "Configure"}
                            </MenuItem>
                            {config && (
                              <MenuItem
                                onClick={() => handleDelete(config.toolSlug)}
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
                            )}
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Edit/Add Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={{ base: "full", md: "xl" }}
        isCentered
        scrollBehavior="inside"
        motionPreset="slideInBottom"
      >
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
                <Icon as={FiSettings} fontSize="18px" color="#6366f1" />
              </Flex>
              <Text color="black" fontWeight="600">{editingConfig ? "Edit Tool Configuration" : "Add Tool Configuration"}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />
          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <FormControl isRequired>
                <FormLabel
                  fontSize="14px"
                  fontWeight="600"
                  color="black"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  mb={2}
                >
                  Tool Slug
                </FormLabel>
                <Select
                  value={formData.toolSlug}
                  onChange={(e) => setFormData({ ...formData, toolSlug: e.target.value })}
                  isDisabled={!!editingConfig}
                  borderRadius="10px"
                  border="1px solid #E5E5E5"
                  bg="#FAFAFA"
                  fontSize="14px"
                  color="black"
                  _focus={{
                    borderColor: "#6366f1",
                    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                    bg: "white"
                  }}
                >
                  <option value="">Select a tool</option>
                  {allToolSlugs.map((tool) => (
                    <option key={tool.slug} value={tool.slug}>
                      {tool.title} ({tool.slug})
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel
                  fontSize="14px"
                  fontWeight="600"
                  color="black"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  mb={2}
                >
                  Model Identifier
                </FormLabel>
                <Input
                  value={formData.modelIdentifier}
                  onChange={(e) => setFormData({ ...formData, modelIdentifier: e.target.value })}
                  placeholder="e.g., stability-ai/sdxl:7762fd02304d6fdf5a62ef993962e12c1196a70c24f0144d541185ce992d743a"
                  borderRadius="10px"
                  border="1px solid #E5E5E5"
                  bg="#FAFAFA"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontSize="14px"
                  color="black"
                  _focus={{
                    borderColor: "#6366f1",
                    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                    bg: "white"
                  }}
                  _placeholder={{ color: "gray.500" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel
                  fontSize="14px"
                  fontWeight="600"
                  color="black"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  mb={2}
                >
                  Prompt Template
                </FormLabel>
                <Textarea
                  value={formData.promptTemplate}
                  onChange={(e) => setFormData({ ...formData, promptTemplate: e.target.value })}
                  placeholder="Use {{prompt}} as placeholder for user input. Example: Create amazing art: {{prompt}}. High quality, detailed..."
                  minH="120px"
                  borderRadius="10px"
                  border="1px solid #E5E5E5"
                  bg="#FAFAFA"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  fontSize="14px"
                  color="black"
                  _focus={{
                    borderColor: "#6366f1",
                    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                    bg: "white"
                  }}
                  _placeholder={{ color: "gray.500" }}
                />
                <Text fontSize="11px" color="#A1A1AA" mt={1}>
                  Use {"{{prompt}}"} to insert the user&apos;s input
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel
                  fontSize="14px"
                  fontWeight="600"
                  color="black"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  mb={2}
                >
                  Negative Prompt (optional)
                </FormLabel>
                <Input
                  value={formData.negativePrompt}
                  onChange={(e) => setFormData({ ...formData, negativePrompt: e.target.value })}
                  placeholder="e.g., text, watermark, low quality"
                  borderRadius="10px"
                  border="1px solid #E5E5E5"
                  bg="#FAFAFA"
                  fontSize="14px"
                  color="black"
                  _focus={{
                    borderColor: "#6366f1",
                    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                    bg: "white"
                  }}
                  _placeholder={{ color: "gray.500" }}
                />
              </FormControl>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <FormControl>
                  <FormLabel
                    fontSize="14px"
                    fontWeight="600"
                    color="black"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    mb={2}
                  >
                    Aspect Ratio
                  </FormLabel>
                  <Select
                    value={formData.defaultAspectRatio}
                    onChange={(e) => setFormData({ ...formData, defaultAspectRatio: e.target.value })}
                    borderRadius="10px"
                    border="1px solid #E5E5E5"
                    bg="#FAFAFA"
                    fontSize="14px"
                    color="black"
                    _focus={{
                      borderColor: "#6366f1",
                      boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                      bg: "white"
                    }}
                  >
                    <option value="1:1">1:1</option>
                    <option value="3:2">3:2</option>
                    <option value="2:3">2:3</option>
                    <option value="16:9">16:9</option>
                    <option value="9:16">9:16</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel
                    fontSize="14px"
                    fontWeight="600"
                    color="black"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    mb={2}
                  >
                    Output Format
                  </FormLabel>
                  <Select
                    value={formData.defaultOutputFormat}
                    onChange={(e) => setFormData({ ...formData, defaultOutputFormat: e.target.value })}
                    borderRadius="10px"
                    border="1px solid #E5E5E5"
                    bg="#FAFAFA"
                    fontSize="14px"
                    color="black"
                    _focus={{
                      borderColor: "#6366f1",
                      boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                      bg: "white"
                    }}
                  >
                    <option value="jpg">JPG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel
                    fontSize="14px"
                    fontWeight="600"
                    color="black"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    mb={2}
                  >
                    Credits Cost
                  </FormLabel>
                  <Input
                    type="number"
                    value={formData.creditsCost}
                    onChange={(e) => setFormData({ ...formData, creditsCost: parseInt(e.target.value) || 5 })}
                    borderRadius="10px"
                    border="1px solid #E5E5E5"
                    bg="#FAFAFA"
                    fontSize="14px"
                    color="black"
                    min={1}
                    _focus={{
                      borderColor: "#6366f1",
                      boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                      bg: "white"
                    }}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl display="flex" alignItems="center" justifyContent="space-between" p={3} bg="#FAFAFA" borderRadius="10px">
                <Box>
                  <FormLabel mb={0} fontSize="14px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                    Enabled
                  </FormLabel>
                  <Text fontSize="12px" color="#71717A">
                    Enable or disable this tool configuration
                  </Text>
                </Box>
                <Switch
                  isChecked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  colorScheme="purple"
                  size="lg"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid #F0F0F0" pt={4} gap={3}>
            <Button
              variant="outline"
              onClick={onClose}
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
              Save Configuration
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminToolsConfigPage;


