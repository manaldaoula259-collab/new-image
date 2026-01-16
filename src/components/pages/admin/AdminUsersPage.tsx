"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  VStack,
  Icon,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
  Spinner,
  Avatar,
  Button,
  Select,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Tooltip,
  Tabs,
  TabList,
  Tab,
  TableContainer,
  Checkbox,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiMoreVertical,
  FiTrash2,
  FiZap,
  FiUser,
  FiUsers,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiMail,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiUserPlus,
  FiUserX,
  FiUserCheck,
  FiChevronDown,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiImage,
  FiActivity,
} from "react-icons/fi";
import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface User {
  _id: string;
  userId: string;
  email?: string;
  credits: number;
  promptWizardCredits: number;
  createdAt: string;
  updatedAt?: string;
  generationCount?: number;
  lastActive?: string;
}

const AdminUsersPage = () => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"createdAt" | "credits">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterTab, setFilterTab] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newCredits, setNewCredits] = useState(0);
  const [newPromptCredits, setNewPromptCredits] = useState(0);

  const { data, error, isLoading, mutate } = useSWR("/api/admin/users", fetcher);

  const handleEditCredits = async () => {
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.userId}/credits`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credits: newCredits,
          promptWizardCredits: newPromptCredits,
        }),
      });
      if (!res.ok) throw new Error("Failed to update credits");
      toast({
        title: "Credits updated successfully",
        status: "success",
        duration: 2000,
        position: "top",
      });
      mutate();
      onEditClose();
    } catch (error: any) {
      toast({
        title: "Error updating credits",
        description: error.message,
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setNewCredits(user.credits || 0);
    setNewPromptCredits(user.promptWizardCredits || 0);
    onEditOpen();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      toast({
        title: "User deleted",
        status: "success",
        duration: 2000,
        position: "top",
      });
      mutate();
    } catch (error: any) {
      toast({
        title: "Error deleting user",
        description: error.message,
        status: "error",
        duration: 3000,
        position: "top",
      });
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u: User) => u.userId));
    }
  };



  // Filter and sort users
  let filteredUsers = data?.users?.filter((u: User) => {
    const matchesSearch =
      u.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterTab === 0) return matchesSearch; // All users
    if (filterTab === 1) return matchesSearch && (u.credits || 0) > 0; // Active (with credits)
    if (filterTab === 2) return matchesSearch && (u.credits || 0) === 0; // No credits
    return matchesSearch;
  }) || [];

  // Sort users
  filteredUsers = [...filteredUsers].sort((a: User, b: User) => {
    const aVal = sortField === "createdAt"
      ? new Date(a.createdAt).getTime()
      : (a.credits || 0);
    const bVal = sortField === "createdAt"
      ? new Date(b.createdAt).getTime()
      : (b.credits || 0);
    return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
  });

  const handleRefresh = async () => {
    try {
      await mutate();
      toast({
        title: "Data refreshed",
        status: "info",
        duration: 2000,
        position: "top",
      });
    } catch (e) {
      toast({
        title: "Failed to refresh",
        status: "error",
        duration: 2000,
        position: "top",
      });
    }
  };

  const handleExport = () => {
    if (!filteredUsers || filteredUsers.length === 0) {
      toast({
        title: "No users to export",
        status: "warning",
        duration: 2000,
        position: "top",
      });
      return;
    }

    const headers = ["User ID", "Email", "Credits", "Prompt Credits", "Joined Date"];
    const csvContent = [
      headers.join(","),
      ...filteredUsers.map((user: User) => [
        user.userId,
        // Wrap strings in quotes to handle commas
        `"${user.email || ""}"`,
        user.credits,
        user.promptWizardCredits,
        `"${new Date(user.createdAt).toISOString()}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats calculations
  const totalUsers = data?.users?.length || 0;
  const activeUsers = data?.users?.filter((u: User) => (u.credits || 0) > 0).length || 0;
  const totalCredits = data?.users?.reduce((acc: number, u: User) => acc + (u.credits || 0), 0) || 0;
  const avgCredits = totalUsers > 0 ? Math.round(totalCredits / totalUsers) : 0;

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
            <Icon as={FiUsers} fontSize="14px" color="#6366f1" />
            <Text
              fontSize="12px"
              color="#6366f1"
              fontWeight="600"
              fontFamily="'IBM Plex Mono', monospace"
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              User Management
            </Text>
          </HStack>
          <Heading
            fontSize={{ base: "28px", md: "34px", lg: "40px" }}
            fontWeight="600"
            color="black"
            letterSpacing="-0.02em"
            fontFamily="'General Sans', 'Inter', sans-serif"
          >
            All Users
          </Heading>
          <Text fontSize="14px" color="#71717A" mt={1} fontFamily="'General Sans', 'Inter', sans-serif">
            Manage and monitor user accounts and credits
          </Text>
        </Box>
        <Flex gap={3} wrap="wrap">
          <Button
            onClick={handleRefresh}
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
            onClick={handleExport}
            size="sm"
            variant="outline"
            borderColor="#E5E5E5"
            color="#52525B"
            borderRadius="10px"
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontSize="13px"
            h="40px"
            px={4}
            leftIcon={<Icon as={FiDownload} fontSize="14px" />}
            _hover={{ bg: "#F5F5F5", borderColor: "#D4D4D4" }}
            flex={{ base: 1, sm: "auto" }}
          >
            Export
          </Button>
        </Flex>
      </Flex>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
        <Box
          bg="white"
          borderRadius="14px"
          border="1px solid #E5E5E5"
          p={4}
          transition="all 0.2s"
          _hover={{ borderColor: "#6366f1", boxShadow: "0 4px 15px rgba(99, 102, 241, 0.08)" }}
        >
          <HStack spacing={3} mb={2}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="rgba(99, 102, 241, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiUsers} fontSize="16px" color="#6366f1" />
            </Flex>
            <Text fontSize="11px" fontWeight="600" color="#71717A" textTransform="uppercase" letterSpacing="0.5px">
              Total Users
            </Text>
          </HStack>
          <Text fontSize="28px" fontWeight="700" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
            {totalUsers.toLocaleString()}
          </Text>
        </Box>

        <Box
          bg="white"
          borderRadius="14px"
          border="1px solid #E5E5E5"
          p={4}
          transition="all 0.2s"
          _hover={{ borderColor: "#10B981", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.08)" }}
        >
          <HStack spacing={3} mb={2}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="rgba(16, 185, 129, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiUserCheck} fontSize="16px" color="#10B981" />
            </Flex>
            <Text fontSize="11px" fontWeight="600" color="#71717A" textTransform="uppercase" letterSpacing="0.5px">
              Active Users
            </Text>
          </HStack>
          <Text fontSize="28px" fontWeight="700" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
            {activeUsers.toLocaleString()}
          </Text>
        </Box>

        <Box
          bg="white"
          borderRadius="14px"
          border="1px solid #E5E5E5"
          p={4}
          transition="all 0.2s"
          _hover={{ borderColor: "#F59E0B", boxShadow: "0 4px 15px rgba(245, 158, 11, 0.08)" }}
        >
          <HStack spacing={3} mb={2}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="rgba(245, 158, 11, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiZap} fontSize="16px" color="#F59E0B" />
            </Flex>
            <Text fontSize="11px" fontWeight="600" color="#71717A" textTransform="uppercase" letterSpacing="0.5px">
              Total Credits
            </Text>
          </HStack>
          <Text fontSize="28px" fontWeight="700" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
            {totalCredits.toLocaleString()}
          </Text>
        </Box>

        <Box
          bg="white"
          borderRadius="14px"
          border="1px solid #E5E5E5"
          p={4}
          transition="all 0.2s"
          _hover={{ borderColor: "#8B5CF6", boxShadow: "0 4px 15px rgba(139, 92, 246, 0.08)" }}
        >
          <HStack spacing={3} mb={2}>
            <Flex
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="rgba(139, 92, 246, 0.1)"
              align="center"
              justify="center"
            >
              <Icon as={FiActivity} fontSize="16px" color="#8B5CF6" />
            </Flex>
            <Text fontSize="11px" fontWeight="600" color="#71717A" textTransform="uppercase" letterSpacing="0.5px">
              Avg Credits
            </Text>
          </HStack>
          <Text fontSize="28px" fontWeight="700" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
            {avgCredits.toLocaleString()}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Filters and Search */}
      <VStack spacing={4} align="stretch" mb={4}>
        {/* Tabs */}
        <Tabs
          variant="soft-rounded"
          colorScheme="purple"
          size="sm"
          index={filterTab}
          onChange={(index) => setFilterTab(index)}
        >
          <Box overflowX="auto" pb={2} maxW="100%">
            <TabList bg="#F5F5F5" p={1} borderRadius="10px" w="fit-content">
              <Tab
                fontSize="12px"
                fontWeight="500"
                fontFamily="'General Sans', 'Inter', sans-serif"
                borderRadius="8px"
                color="gray.600"
                _selected={{ bg: "white", color: "black", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                whiteSpace="nowrap"
              >
                All Users ({totalUsers})
              </Tab>
              <Tab
                fontSize="12px"
                fontWeight="500"
                fontFamily="'General Sans', 'Inter', sans-serif"
                borderRadius="8px"
                color="gray.600"
                _selected={{ bg: "white", color: "black", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                whiteSpace="nowrap"
              >
                Active ({activeUsers})
              </Tab>
              <Tab
                fontSize="12px"
                fontWeight="500"
                fontFamily="'General Sans', 'Inter', sans-serif"
                borderRadius="8px"
                color="gray.600"
                _selected={{ bg: "white", color: "black", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
                whiteSpace="nowrap"
              >
                No Credits ({totalUsers - activeUsers})
              </Tab>
            </TabList>
          </Box>
        </Tabs>

        {/* Search and Date Filter */}
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={3}
          align={{ base: "stretch", md: "center" }}
        >
          <InputGroup
            size="md"
            flex={{ base: "1", md: "1 1 auto" }}
            maxW={{ base: "100%", md: "400px" }}
          >
            <InputLeftElement pointerEvents="none" pl={2}>
              <Icon as={FiSearch} color="#A1A1AA" fontSize="16px" />
            </InputLeftElement>
            <Input
              placeholder="Search by user ID or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="12px"
              border="1px solid #E5E5E5"
              bg="white"
              fontSize="14px"
              h="44px"
              pl={10}
              _focus={{
                borderColor: "#6366f1",
                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                bg: "white"
              }}
              _placeholder={{ color: "gray.500" }}
              color="black"
            />
          </InputGroup>

          <Menu>
            <MenuButton
              as={Button}
              size="md"
              variant="outline"
              borderColor="#E5E5E5"
              rightIcon={<Icon as={FiChevronDown} fontSize="14px" color="#71717A" />}
              fontSize="14px"
              fontFamily="'General Sans', 'Inter', sans-serif"
              fontWeight="500"
              color="#52525B"
              borderRadius="12px"
              bg="#FAFAFA"
              h="44px"
              px={4}
              minW={{ base: "100%", md: "140px" }}
              _hover={{ bg: "#F5F5F5", borderColor: "#D4D4D4", color: "black" }}
              _active={{ bg: "#F0F0F0" }}
            >
              <HStack spacing={2}>
                <Icon as={FiCalendar} fontSize="14px" color="#71717A" />
                <Text color="#52525B">Date</Text>
              </HStack>
            </MenuButton>
            <MenuList
              bg="white"
              border="1px solid #E5E5E5"
              borderRadius="12px"
              boxShadow="0 10px 40px rgba(0,0,0,0.08)"
              p={1}
              minW="180px"
            >
              <MenuItem
                onClick={() => { setSortField("createdAt"); setSortOrder("desc"); }}
                bg="transparent"
                color="#52525B"
                fontSize="13px"
                fontFamily="'General Sans', 'Inter', sans-serif"
                borderRadius="8px"
                _hover={{ bg: "#F5F5F5", color: "black" }}
                _focus={{ bg: "#F5F5F5" }}
                icon={<Icon as={FiArrowDown} fontSize="14px" color="#71717A" />}
              >
                Newest First
              </MenuItem>
              <MenuItem
                onClick={() => { setSortField("createdAt"); setSortOrder("asc"); }}
                bg="transparent"
                color="#52525B"
                fontSize="13px"
                fontFamily="'General Sans', 'Inter', sans-serif"
                borderRadius="8px"
                _hover={{ bg: "#F5F5F5", color: "black" }}
                _focus={{ bg: "#F5F5F5" }}
                icon={<Icon as={FiArrowUp} fontSize="14px" color="#71717A" />}
              >
                Oldest First
              </MenuItem>
              <Box h="1px" bg="#F0F0F0" my={1} />
              <MenuItem
                onClick={() => { setSortField("credits"); setSortOrder("desc"); }}
                bg="transparent"
                color="#52525B"
                fontSize="13px"
                fontFamily="'General Sans', 'Inter', sans-serif"
                borderRadius="8px"
                _hover={{ bg: "#F5F5F5", color: "black" }}
                _focus={{ bg: "#F5F5F5" }}
                icon={<Icon as={FiZap} fontSize="14px" color="#F59E0B" />}
              >
                Most Credits
              </MenuItem>
              <MenuItem
                onClick={() => { setSortField("credits"); setSortOrder("asc"); }}
                bg="transparent"
                color="#52525B"
                fontSize="13px"
                fontFamily="'General Sans', 'Inter', sans-serif"
                borderRadius="8px"
                _hover={{ bg: "#F5F5F5", color: "black" }}
                _focus={{ bg: "#F5F5F5" }}
                icon={<Icon as={FiZap} fontSize="14px" color="#F59E0B" />}
              >
                Least Credits
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </VStack>

      {/* Users Table */}
      {isLoading ? (
        <Flex justify="center" align="center" minH="400px" bg="white" borderRadius="20px" border="1px solid #E5E5E5">
          <VStack spacing={4}>
            <Spinner size="lg" color="#6366f1" thickness="3px" />
            <Text fontSize="14px" color="#71717A">Loading users...</Text>
          </VStack>
        </Flex>
      ) : (
        <Box
          bg="white"
          borderRadius={{ base: "16px", md: "20px" }}
          border="1px solid #E5E5E5"
          overflow="hidden"
        >
          <TableContainer>
            <Table variant="simple">
              <Thead bg="#FAFAFA">
                <Tr>
                  <Th w="40px" px={4} py={4}>
                    <Checkbox
                      isChecked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      isIndeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                      onChange={toggleAllUsers}
                      colorScheme="purple"
                    />
                  </Th>
                  <Th
                    fontSize="11px"
                    fontWeight="600"
                    color="#71717A"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    py={4}
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Email
                  </Th>
                  <Th
                    fontSize="11px"
                    fontWeight="600"
                    color="#71717A"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    py={4}
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Credits
                  </Th>
                  <Th
                    fontSize="11px"
                    fontWeight="600"
                    color="#71717A"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    py={4}
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Prompt Credits
                  </Th>
                  <Th
                    fontSize="11px"
                    fontWeight="600"
                    color="#71717A"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    py={4}
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Joined
                  </Th>
                  <Th
                    fontSize="11px"
                    fontWeight="600"
                    color="#71717A"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    py={4}
                    textAlign="right"
                    px={6}
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={16}>
                      <VStack spacing={4}>
                        <Flex
                          w="64px"
                          h="64px"
                          borderRadius="16px"
                          bg="#F5F5F5"
                          align="center"
                          justify="center"
                        >
                          <Icon as={FiUser} fontSize="28px" color="#A1A1AA" />
                        </Flex>
                        <Text fontSize="15px" fontWeight="500" color="#52525B" fontFamily="'General Sans', 'Inter', sans-serif">
                          No users found
                        </Text>
                        <Text fontSize="13px" color="#A1A1AA">
                          {searchQuery ? "Try a different search term" : "No users have registered yet"}
                        </Text>
                      </VStack>
                    </Td>
                  </Tr>
                ) : (
                  filteredUsers.map((user: User) => (
                    <Tr
                      key={user._id}
                      _hover={{ bg: "#FAFAFA" }}
                      transition="all 0.15s"
                      bg={selectedUsers.includes(user.userId) ? "rgba(99, 102, 241, 0.04)" : "transparent"}
                    >
                      <Td px={4} py={4}>
                        <Checkbox
                          isChecked={selectedUsers.includes(user.userId)}
                          onChange={() => toggleUserSelection(user.userId)}
                          colorScheme="purple"
                        />
                      </Td>
                      <Td py={4}>
                        <HStack spacing={3}>
                          <Box position="relative">
                            <Avatar
                              size="sm"
                              name={user.email || user.userId || "User"}
                              bg="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                            />
                            <Box
                              position="absolute"
                              bottom="0"
                              right="0"
                              w="8px"
                              h="8px"
                              bg={(user.credits || 0) > 0 ? "#22C55E" : "#A1A1AA"}
                              borderRadius="full"
                              border="1.5px solid white"
                            />
                          </Box>
                          <Box>
                            <Text
                              fontSize="13px"
                              fontWeight="600"
                              color="black"
                              fontFamily="'General Sans', 'Inter', sans-serif"
                              maxW="200px"
                              noOfLines={1}
                              title={user.email || user.userId}
                            >
                              {user.email || (
                                <Text as="span" color="gray.500" fontFamily="'IBM Plex Mono', monospace">
                                  {user.userId}
                                </Text>
                              )}
                            </Text>
                          </Box>
                        </HStack>
                      </Td>
                      <Td py={4}>
                        <HStack spacing={2}>
                          <Badge
                            bg={(user.credits || 0) > 0 ? "rgba(245, 158, 11, 0.15)" : "#F5F5F5"}
                            color={(user.credits || 0) > 0 ? "#D97706" : "#A1A1AA"}
                            px={3}
                            py={1.5}
                            borderRadius="full"
                            fontSize="12px"
                            fontFamily="'IBM Plex Mono', monospace"
                            fontWeight="600"
                          >
                            <HStack spacing={1}>
                              <Icon as={FiZap} fontSize="10px" />
                              <Text>{user.credits || 0}</Text>
                            </HStack>
                          </Badge>
                        </HStack>
                      </Td>
                      <Td py={4}>
                        <Badge
                          bg={(user.promptWizardCredits || 0) > 0 ? "rgba(99, 102, 241, 0.15)" : "#F5F5F5"}
                          color={(user.promptWizardCredits || 0) > 0 ? "#4F46E5" : "#A1A1AA"}
                          px={3}
                          py={1.5}
                          borderRadius="full"
                          fontSize="12px"
                          fontFamily="'IBM Plex Mono', monospace"
                          fontWeight="600"
                        >
                          {user.promptWizardCredits || 0}
                        </Badge>
                      </Td>
                      <Td py={4}>
                        <VStack align="flex-start" spacing={0}>
                          <Text fontSize="12px" color="black" fontFamily="'General Sans', 'Inter', sans-serif" fontWeight="500">
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Text>
                          <Text fontSize="10px" color="#A1A1AA">
                            {new Date(user.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </VStack>
                      </Td>
                      <Td py={4} textAlign="right" px={6}>
                        <HStack spacing={1} justify="flex-end">
                          <Tooltip label="Edit Credits" hasArrow>
                            <IconButton
                              aria-label="Edit credits"
                              icon={<Icon as={FiEdit2} fontSize="14px" />}
                              size="sm"
                              variant="ghost"
                              color="#52525B"
                              onClick={() => openEditModal(user)}
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
                                onClick={() => openEditModal(user)}
                                bg="transparent"
                                color="#52525B"
                                fontFamily="'General Sans', 'Inter', sans-serif"
                                fontSize="13px"
                                borderRadius="8px"
                                _hover={{ bg: "#F5F5F5" }}
                                icon={<Icon as={FiZap} fontSize="14px" color="#F59E0B" />}
                              >
                                Edit Credits
                              </MenuItem>
                              <MenuItem
                                bg="transparent"
                                color="#52525B"
                                fontFamily="'General Sans', 'Inter', sans-serif"
                                fontSize="13px"
                                borderRadius="8px"
                                _hover={{ bg: "#F5F5F5" }}
                                icon={<Icon as={FiImage} fontSize="14px" color="#6366f1" />}
                              >
                                View Media
                              </MenuItem>
                              <MenuItem
                                bg="transparent"
                                color="#52525B"
                                fontFamily="'General Sans', 'Inter', sans-serif"
                                fontSize="13px"
                                borderRadius="8px"
                                _hover={{ bg: "#F5F5F5" }}
                                icon={<Icon as={FiMail} fontSize="14px" color="#71717A" />}
                              >
                                Send Email
                              </MenuItem>
                              <Box h="1px" bg="#F0F0F0" my={1} />
                              <MenuItem
                                onClick={() => handleDeleteUser(user.userId)}
                                bg="transparent"
                                color="#EF4444"
                                fontFamily="'General Sans', 'Inter', sans-serif"
                                fontSize="13px"
                                borderRadius="8px"
                                _hover={{ bg: "#FEF2F2" }}
                                icon={<Icon as={FiTrash2} fontSize="14px" />}
                              >
                                Delete User
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

          {/* Table Footer */}
          {filteredUsers.length > 0 && (
            <Flex
              justify="space-between"
              align="center"
              p={4}
              borderTop="1px solid #F0F0F0"
              bg="#FAFAFA"
            >
              <Text fontSize="12px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
                Showing {filteredUsers.length} of {totalUsers} users
                {selectedUsers.length > 0 && ` • ${selectedUsers.length} selected`}
              </Text>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="#E5E5E5"
                  fontSize="12px"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  borderRadius="8px"
                  _hover={{ bg: "white" }}
                  isDisabled
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="#E5E5E5"
                  fontSize="12px"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  borderRadius="8px"
                  _hover={{ bg: "white" }}
                  isDisabled
                >
                  Next
                </Button>
              </HStack>
            </Flex>
          )}
        </Box>
      )}

      {/* Edit Credits Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} isCentered size="md">
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
                bg="rgba(245, 158, 11, 0.1)"
                align="center"
                justify="center"
              >
                <Icon as={FiZap} fontSize="18px" color="#F59E0B" />
              </Flex>
              <Box>
                <Text>Edit User Credits</Text>
                <Text fontSize="12px" fontWeight="400" color="#71717A" mt={0.5}>
                  {editingUser?.userId}
                </Text>
              </Box>
            </HStack>
          </ModalHeader>
          <ModalCloseButton top={4} right={4} />

          <ModalBody py={6}>
            <VStack spacing={5} align="stretch">
              <FormControl>
                <FormLabel
                  fontSize="14px"
                  fontWeight="600"
                  color="black"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  mb={2}
                >
                  Generation Credits
                </FormLabel>
                <NumberInput
                  value={newCredits}
                  onChange={(_, val) => setNewCredits(val || 0)}
                  min={0}
                >
                  <NumberInputField
                    borderRadius="10px"
                    border="1px solid #E5E5E5"
                    bg="#FAFAFA"
                    fontSize="14px"
                    color="black"
                    fontFamily="'IBM Plex Mono', monospace"
                    _focus={{ borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)", bg: "white" }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="11px" color="#A1A1AA" mt={1}>
                  Credits used for image generation
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
                  Prompt Wizard Credits
                </FormLabel>
                <NumberInput
                  value={newPromptCredits}
                  onChange={(_, val) => setNewPromptCredits(val || 0)}
                  min={0}
                >
                  <NumberInputField
                    borderRadius="10px"
                    border="1px solid #E5E5E5"
                    bg="#FAFAFA"
                    fontSize="14px"
                    color="black"
                    fontFamily="'IBM Plex Mono', monospace"
                    _focus={{ borderColor: "#6366f1", boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)", bg: "white" }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="11px" color="#A1A1AA" mt={1}>
                  Credits used for AI prompt enhancement
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter borderTop="1px solid #F0F0F0" pt={4} gap={3}>
            <Button
              variant="outline"
              onClick={onEditClose}
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
              onClick={handleEditCredits}
              borderRadius="10px"
              fontSize="13px"
              fontFamily="'IBM Plex Mono', monospace"
              textTransform="uppercase"
              letterSpacing="0.5px"
              _hover={{ bg: "#1a1a1a" }}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdminUsersPage;
