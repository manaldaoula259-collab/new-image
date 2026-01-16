"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
  SimpleGrid,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
  FormControl,
  FormLabel,
  FormHelperText,
  IconButton,
  Spinner,
  Switch,
  Textarea,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  Code,
} from "@chakra-ui/react";
import {
  FiShield,
  FiDatabase,
  FiServer,
  FiKey,
  FiEye,
  FiEyeOff,
  FiSave,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiCloud,
  FiLock,
} from "react-icons/fi";
import { useState, useEffect } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const AdminSettingsPage = () => {
  const toast = useToast();
  const { data, error, isLoading, mutate } = useSWR("/api/admin/settings", fetcher);

  const [showReplicateToken, setShowReplicateToken] = useState(false);
  const [showS3AccessKey, setShowS3AccessKey] = useState(false);
  const [showS3SecretKey, setShowS3SecretKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    replicateApiToken: "",
    s3Bucket: "",
    s3Region: "",
    s3AccessKey: "",
    s3SecretKey: "",
    s3Endpoint: "",
  });

  // Initialize form data when API data loads (only if form is empty)
  useEffect(() => {
    if (data && !formData.replicateApiToken && !formData.s3Bucket) {
      setFormData({
        replicateApiToken: data.replicateApiToken === "••••••••••••••••" ? "" : (data.replicateApiToken || ""),
        s3Bucket: data.s3Bucket || "",
        s3Region: data.s3Region || "",
        s3AccessKey: data.s3AccessKey === "••••••••••••••••" ? "" : (data.s3AccessKey || ""),
        s3SecretKey: data.s3SecretKey === "••••••••••••••••" ? "" : (data.s3SecretKey || ""),
        s3Endpoint: data.s3Endpoint || "",
      });
    }
  }, [data]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (section: "api" | "s3") => {
    setIsSaving(true);
    try {
      const payload = section === "api"
        ? { replicateApiToken: formData.replicateApiToken }
        : {
          s3Bucket: formData.s3Bucket,
          s3Region: formData.s3Region,
          s3AccessKey: formData.s3AccessKey,
          s3SecretKey: formData.s3SecretKey,
          s3Endpoint: formData.s3Endpoint,
        };

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      toast({
        title: "Settings validated successfully",
        description: data.message || "Please update your environment variables and restart the server.",
        status: "success",
        duration: 5000,
        position: "top",
        isClosable: true,
      });

      mutate();
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        status: "error",
        duration: 3000,
        position: "top",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async (type: "replicate" | "s3") => {
    try {
      const res = await fetch(`/api/admin/settings/test/${type}`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Connection test failed");

      toast({
        title: "Connection successful",
        status: "success",
        duration: 2000,
        position: "top",
      });
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message,
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <VStack spacing={4}>
          <Spinner size="lg" color="#6366f1" thickness="3px" />
          <Text fontSize="14px" color="#71717A">Loading settings...</Text>
        </VStack>
      </Flex>
    );
  }

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
          <HStack spacing={2} mb={1}>
            <Icon as={FiServer} fontSize="14px" color="#6366f1" />
            <Text
              fontSize="12px"
              color="#6366f1"
              fontWeight="600"
              fontFamily="'IBM Plex Mono', monospace"
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              System Configuration
            </Text>
          </HStack>
          <Heading
            fontSize={{ base: "28px", md: "34px", lg: "40px" }}
            fontWeight="600"
            color="black"
            letterSpacing="-0.02em"
            fontFamily="'General Sans', 'Inter', sans-serif"
          >
            Settings
          </Heading>
          <Text fontSize="14px" color="#71717A" mt={1} fontFamily="'General Sans', 'Inter', sans-serif">
            Configure API keys, storage, and system settings
          </Text>
        </Box>
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
        >
          Refresh
        </Button>
      </Flex>

      {/* Info Alert */}
      <Alert
        status="info"
        borderRadius="12px"
        mb={6}
        bg="rgba(99, 102, 241, 0.08)"
        border="1px solid rgba(99, 102, 241, 0.2)"
      >
        <AlertIcon color="#6366f1" />
        <Box flex={1}>
          <AlertDescription fontSize="13px" color="#4F46E5" fontFamily="'General Sans', 'Inter', sans-serif">
            <Text fontWeight="600" mb={1}>Configuration Note</Text>
            <Text>
              API keys and credentials are managed via environment variables for security.
              Use the form below to validate your configuration. To update values, modify your
              <Code fontSize="11px" mx={1} px={1.5} py={0.5} borderRadius="4px" bg="rgba(99, 102, 241, 0.1)">.env</Code>
              file and restart the server.
            </Text>
          </AlertDescription>
        </Box>
      </Alert>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* API Keys Section */}
        <Box
          bg="white"
          borderRadius={{ base: "16px", md: "20px" }}
          border="1px solid #E5E5E5"
          p={6}
          transition="all 0.2s"
          _hover={{ boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}
        >
          <HStack spacing={3} mb={5}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="rgba(99, 102, 241, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiShield} fontSize="20px" color="#6366f1" />
            </Flex>
            <Box flex={1}>
              <Text fontSize="16px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                API Keys
              </Text>
              <Text fontSize="12px" color="#71717A">
                Configure external API credentials
              </Text>
            </Box>
          </HStack>

          <VStack spacing={5} align="stretch">
            <FormControl>
              <FormLabel
                fontSize="13px"
                fontWeight="600"
                color="#52525B"
                fontFamily="'General Sans', 'Inter', sans-serif"
                mb={2}
              >
                Replicate API Token
              </FormLabel>
              <InputGroup>
                <Input
                  type={showReplicateToken ? "text" : "password"}
                  placeholder="r8_xxxxxxxxxxxxxxxxxxxxx"
                  value={formData.replicateApiToken}
                  onChange={(e) => handleInputChange("replicateApiToken", e.target.value)}
                  borderRadius="10px"
                  border="1px solid #E5E5E5"
                  bg="#FAFAFA"
                  color="black"
                  _placeholder={{ color: "gray.500" }}
                  fontSize="13px"
                  fontFamily="'IBM Plex Mono', monospace"
                  _focus={{
                    borderColor: "#6366f1",
                    boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                    bg: "white"
                  }}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showReplicateToken ? "Hide token" : "Show token"}
                    icon={<Icon as={showReplicateToken ? FiEyeOff : FiEye} />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplicateToken(!showReplicateToken)}
                    color="#A1A1AA"
                    _hover={{ color: "#6366f1" }}
                  />
                </InputRightElement>
              </InputGroup>
              <FormHelperText fontSize="11px" color="#A1A1AA" mt={1}>
                Your Replicate API token for AI model access
              </FormHelperText>
            </FormControl>

            <HStack spacing={3}>
              <Button
                onClick={() => handleSave("api")}
                isLoading={isSaving}
                bg="black"
                color="white"
                borderRadius="10px"
                fontSize="13px"
                fontFamily="'IBM Plex Mono', monospace"
                textTransform="uppercase"
                letterSpacing="0.5px"
                h="40px"
                px={5}
                leftIcon={<Icon as={FiSave} fontSize="14px" />}
                _hover={{ bg: "#1a1a1a" }}
                flex={1}
              >
                Save API Keys
              </Button>
              <Button
                onClick={() => handleTestConnection("replicate")}
                variant="outline"
                borderColor="#E5E5E5"
                color="#52525B"
                borderRadius="10px"
                fontSize="13px"
                fontFamily="'General Sans', 'Inter', sans-serif"
                h="40px"
                px={4}
                _hover={{ bg: "#F5F5F5" }}
              >
                Test
              </Button>
            </HStack>

            {data?.replicateConfigured && (
              <Alert status="success" borderRadius="10px" bg="rgba(16, 185, 129, 0.1)" border="1px solid rgba(16, 185, 129, 0.2)">
                <AlertIcon color="#10B981" />
                <AlertDescription fontSize="12px" color="#16A34A">
                  Replicate API is configured and active
                </AlertDescription>
              </Alert>
            )}
          </VStack>
        </Box>

        {/* S3 Storage Section */}
        <Box
          bg="white"
          borderRadius={{ base: "16px", md: "20px" }}
          border="1px solid #E5E5E5"
          p={6}
          transition="all 0.2s"
          _hover={{ boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}
        >
          <HStack spacing={3} mb={5}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="rgba(16, 185, 129, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiCloud} fontSize="20px" color="#10B981" />
            </Flex>
            <Box flex={1}>
              <Text fontSize="16px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                S3 Storage
              </Text>
              <Text fontSize="12px" color="#71717A">
                Configure AWS S3 bucket for media storage
              </Text>
            </Box>
          </HStack>

          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel
                fontSize="13px"
                fontWeight="600"
                color="#52525B"
                fontFamily="'General Sans', 'Inter', sans-serif"
                mb={2}
              >
                Bucket Name
              </FormLabel>
              <Input
                placeholder="my-bucket-name"
                value={formData.s3Bucket}
                onChange={(e) => handleInputChange("s3Bucket", e.target.value)}
                borderRadius="10px"
                border="1px solid #E5E5E5"
                bg="#FAFAFA"
                color="black"
                _placeholder={{ color: "gray.500" }}
                fontSize="13px"
                _focus={{
                  borderColor: "#10B981",
                  boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
                  bg: "white"
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize="13px"
                fontWeight="600"
                color="#52525B"
                fontFamily="'General Sans', 'Inter', sans-serif"
                mb={2}
              >
                Region
              </FormLabel>
              <Input
                placeholder="us-east-1"
                value={formData.s3Region}
                onChange={(e) => handleInputChange("s3Region", e.target.value)}
                borderRadius="10px"
                border="1px solid #E5E5E5"
                bg="#FAFAFA"
                color="black"
                _placeholder={{ color: "gray.500" }}
                fontSize="13px"
                _focus={{
                  borderColor: "#10B981",
                  boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
                  bg: "white"
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize="13px"
                fontWeight="600"
                color="#52525B"
                fontFamily="'General Sans', 'Inter', sans-serif"
                mb={2}
              >
                Access Key ID
              </FormLabel>
              <InputGroup>
                <Input
                  type={showS3AccessKey ? "text" : "password"}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  value={formData.s3AccessKey}
                  onChange={(e) => handleInputChange("s3AccessKey", e.target.value)}
                  borderRadius="10px"
                  border="1px solid #E5E5E5"
                  bg="#FAFAFA"
                  color="black"
                  _placeholder={{ color: "gray.500" }}
                  fontSize="13px"
                  fontFamily="'IBM Plex Mono', monospace"
                  _focus={{
                    borderColor: "#10B981",
                    boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
                    bg: "white"
                  }}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showS3AccessKey ? "Hide key" : "Show key"}
                    icon={<Icon as={showS3AccessKey ? FiEyeOff : FiEye} />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowS3AccessKey(!showS3AccessKey)}
                    color="#A1A1AA"
                    _hover={{ color: "#10B981" }}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize="13px"
                fontWeight="600"
                color="#52525B"
                fontFamily="'General Sans', 'Inter', sans-serif"
                mb={2}
              >
                Secret Access Key
              </FormLabel>
              <InputGroup>
                <Input
                  type={showS3SecretKey ? "text" : "password"}
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  value={formData.s3SecretKey}
                  onChange={(e) => handleInputChange("s3SecretKey", e.target.value)}
                  borderRadius="10px"
                  border="1px solid #E5E5E5"
                  bg="#FAFAFA"
                  color="black"
                  _placeholder={{ color: "gray.500" }}
                  fontSize="13px"
                  fontFamily="'IBM Plex Mono', monospace"
                  _focus={{
                    borderColor: "#10B981",
                    boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
                    bg: "white"
                  }}
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showS3SecretKey ? "Hide key" : "Show key"}
                    icon={<Icon as={showS3SecretKey ? FiEyeOff : FiEye} />}
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowS3SecretKey(!showS3SecretKey)}
                    color="#A1A1AA"
                    _hover={{ color: "#10B981" }}
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel
                fontSize="13px"
                fontWeight="600"
                color="#52525B"
                fontFamily="'General Sans', 'Inter', sans-serif"
                mb={2}
              >
                Endpoint (Optional)
              </FormLabel>
              <Input
                placeholder="https://s3.amazonaws.com"
                value={formData.s3Endpoint}
                onChange={(e) => handleInputChange("s3Endpoint", e.target.value)}
                borderRadius="10px"
                border="1px solid #E5E5E5"
                bg="#FAFAFA"
                color="black"
                _placeholder={{ color: "gray.500" }}
                fontSize="13px"
                _focus={{
                  borderColor: "#10B981",
                  boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
                  bg: "white"
                }}
              />
              <FormHelperText fontSize="11px" color="#A1A1AA" mt={1}>
                Leave empty for default AWS endpoint
              </FormHelperText>
            </FormControl>

            <HStack spacing={3}>
              <Button
                onClick={() => handleSave("s3")}
                isLoading={isSaving}
                bg="black"
                color="white"
                borderRadius="10px"
                fontSize="13px"
                fontFamily="'IBM Plex Mono', monospace"
                textTransform="uppercase"
                letterSpacing="0.5px"
                h="40px"
                px={5}
                leftIcon={<Icon as={FiSave} fontSize="14px" />}
                _hover={{ bg: "#1a1a1a" }}
                flex={1}
              >
                Save S3 Config
              </Button>
              <Button
                onClick={() => handleTestConnection("s3")}
                variant="outline"
                borderColor="#E5E5E5"
                color="#52525B"
                borderRadius="10px"
                fontSize="13px"
                fontFamily="'General Sans', 'Inter', sans-serif"
                h="40px"
                px={4}
                _hover={{ bg: "#F5F5F5" }}
              >
                Test
              </Button>
            </HStack>

            {data?.s3Bucket && (
              <Alert status="success" borderRadius="10px" bg="rgba(16, 185, 129, 0.1)" border="1px solid rgba(16, 185, 129, 0.2)">
                <AlertIcon color="#10B981" />
                <AlertDescription fontSize="12px" color="#16A34A">
                  S3 storage is configured: {data.s3Bucket}
                </AlertDescription>
              </Alert>
            )}
          </VStack>
        </Box>

        {/* Database Section */}
        <Box
          bg="white"
          borderRadius={{ base: "16px", md: "20px" }}
          border="1px solid #E5E5E5"
          p={6}
          transition="all 0.2s"
          _hover={{ boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}
        >
          <HStack spacing={3} mb={4}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="rgba(16, 185, 129, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiDatabase} fontSize="20px" color="#10B981" />
            </Flex>
            <Box flex={1}>
              <Text fontSize="16px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                Database
              </Text>
              <Text fontSize="12px" color="#71717A">
                MongoDB connection settings
              </Text>
            </Box>
          </HStack>
          <VStack spacing={3} align="stretch">
            <Box p={3} bg="#FAFAFA" borderRadius="10px" border="1px solid #E5E5E5">
              <Text fontSize="13px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif" lineHeight="1.6">
                MongoDB connection configured via environment variables.
              </Text>
            </Box>
            <Alert status="info" borderRadius="10px" bg="rgba(99, 102, 241, 0.1)" border="1px solid rgba(99, 102, 241, 0.2)">
              <AlertIcon color="#6366f1" />
              <AlertDescription fontSize="12px" color="#4F46E5">
                Database credentials are managed securely through environment variables
              </AlertDescription>
            </Alert>
          </VStack>
        </Box>

        {/* System Information */}
        <Box
          bg="white"
          borderRadius={{ base: "16px", md: "20px" }}
          border="1px solid #E5E5E5"
          p={6}
          transition="all 0.2s"
          _hover={{ boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}
        >
          <HStack spacing={3} mb={4}>
            <Flex
              w="44px"
              h="44px"
              borderRadius="12px"
              bg="rgba(113, 113, 122, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiServer} fontSize="20px" color="#71717A" />
            </Flex>
            <Box flex={1}>
              <Text fontSize="16px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                System Information
              </Text>
              <Text fontSize="12px" color="#71717A">
                Environment and system details
              </Text>
            </Box>
          </HStack>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between" p={3} bg="#FAFAFA" borderRadius="10px" border="1px solid #E5E5E5">
              <HStack spacing={2}>
                <Icon as={FiServer} fontSize="14px" color="#71717A" />
                <Text fontSize="13px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
                  Environment
                </Text>
              </HStack>
              <Badge
                bg="rgba(99, 102, 241, 0.15)"
                color="#4F46E5"
                px={3}
                py={1.5}
                borderRadius="full"
                fontSize="11px"
                fontFamily="'IBM Plex Mono', monospace"
                fontWeight="600"
                textTransform="uppercase"
              >
                {data?.environment || "development"}
              </Badge>
            </HStack>
            {data?.nodeVersion && (
              <HStack justify="space-between" p={3} bg="#FAFAFA" borderRadius="10px" border="1px solid #E5E5E5">
                <Text fontSize="13px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
                  Node Version
                </Text>
                <Badge
                  bg="rgba(113, 113, 122, 0.1)"
                  color="#52525B"
                  px={3}
                  py={1.5}
                  borderRadius="full"
                  fontSize="11px"
                  fontFamily="'IBM Plex Mono', monospace"
                  fontWeight="500"
                >
                  {data.nodeVersion}
                </Badge>
              </HStack>
            )}
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default AdminSettingsPage;
