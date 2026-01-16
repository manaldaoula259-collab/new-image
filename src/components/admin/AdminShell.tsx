"use client";

import {
  Box,
  Button,
  Flex,
  Icon,
  Text,
  HStack,
  Avatar,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  VStack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
  Badge,
  Collapse,
  Tooltip,
} from "@chakra-ui/react";
import Link from "next/link";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  FiLogOut,
  FiMenu,
  FiSettings,
  FiUsers,
  FiImage,
  FiCpu,
  FiBarChart2,
  FiShield,
  FiHome,
  FiHelpCircle,
  FiEdit3,
  FiChevronDown,
  FiChevronRight,
  FiDatabase,
  FiActivity,
  FiLayers,
  FiTool,
  FiGrid,
  FiSliders,
  FiPieChart,
  FiTrendingUp,
  FiBell,
  FiExternalLink,
  FiFlag,
} from "react-icons/fi";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface AdminShellProps {
  activeItem: string;
  children: React.ReactNode;
}

// Admin navigation categories with collapsible sections
const adminNavCategories = [
  {
    id: "overview",
    label: "Overview",
    icon: FiGrid,
    items: [
      { key: "home", label: "Dashboard", icon: FiHome, href: "/admin" },
      { key: "analytics", label: "Analytics", icon: FiBarChart2, href: "/admin/analytics" },
    ],
  },
  {
    id: "management",
    label: "Management",
    icon: FiLayers,
    items: [
      { key: "users", label: "Users", icon: FiUsers, href: "/admin/users" },
      { key: "media", label: "Media Library", icon: FiImage, href: "/admin/media" },
    ],
  },
  {
    id: "tools",
    label: "Tools & Config",
    icon: FiTool,
    items: [
      { key: "tools", label: "AI Models", icon: FiCpu, href: "/admin/tools" },
      { key: "tools-config", label: "Tool Config", icon: FiSliders, href: "/admin/tools/config" },
    ],
  },
  {
    id: "features",
    label: "Features",
    icon: FiLayers,
    items: [
      { key: "feature-flags", label: "Feature Flags", icon: FiFlag, href: "/admin/feature-flags" },
    ],
  },
  {
    id: "system",
    label: "System",
    icon: FiSettings,
    items: [
      { key: "settings", label: "Settings", icon: FiSettings, href: "/admin/settings" },
    ],
  },
];

// Sidebar Category Component
const SidebarCategory = ({
  category,
  isExpanded,
  onToggle,
  currentPath,
  onClose,
}: {
  category: typeof adminNavCategories[0];
  isExpanded: boolean;
  onToggle: () => void;
  currentPath: string;
  onClose?: () => void;
}) => {
  const hasActiveChild = category.items.some(item =>
    currentPath === item.href || (item.href !== "/admin" && currentPath.startsWith(item.href))
  );

  return (
    <Box>
      <Button
        onClick={onToggle}
        variant="ghost"
        w="100%"
        justifyContent="space-between"
        h="38px"
        px={3}
        borderRadius="10px"
        color={isExpanded || hasActiveChild ? "black" : "#52525B"}
        bg={isExpanded ? "rgba(99, 102, 241, 0.06)" : "transparent"}
        fontWeight="500"
        fontSize="12px"
        fontFamily="'General Sans', 'Inter', sans-serif"
        _hover={{
          bg: "rgba(99, 102, 241, 0.08)",
          color: "black",
        }}
        transition="all 0.2s"
      >
        <HStack spacing={2.5}>
          <Flex
            w="28px"
            h="28px"
            borderRadius="8px"
            bg={isExpanded || hasActiveChild ? "rgba(99, 102, 241, 0.1)" : "#F5F5F5"}
            align="center"
            justify="center"
            transition="all 0.2s"
          >
            <Icon
              as={category.icon}
              fontSize="14px"
              color={isExpanded || hasActiveChild ? "#6366f1" : "#71717A"}
            />
          </Flex>
          <Text>{category.label}</Text>
        </HStack>
        <HStack spacing={1.5}>
          <Badge
            fontSize="9px"
            fontWeight="600"
            color="#A1A1AA"
            bg="transparent"
            fontFamily="'IBM Plex Mono', monospace"
          >
            {category.items.length}
          </Badge>
          <Icon
            as={isExpanded ? FiChevronDown : FiChevronRight}
            fontSize="12px"
            color="#A1A1AA"
            transition="transform 0.2s"
          />
        </HStack>
      </Button>

      <Collapse in={isExpanded} animateOpacity>
        <VStack spacing={0.5} align="stretch" py={1.5} pl={2}>
          {category.items.map((item) => {
            const isActive = currentPath === item.href || (item.href !== "/admin" && currentPath.startsWith(item.href));
            return (
              <Button
                key={item.key}
                as={Link}
                href={item.href}
                variant="ghost"
                w="100%"
                justifyContent="flex-start"
                h="34px"
                px={3}
                pl={10}
                borderRadius="8px"
                color={isActive ? "#6366f1" : "#52525B"}
                bg={isActive ? "rgba(99, 102, 241, 0.08)" : "transparent"}
                fontWeight={isActive ? "600" : "400"}
                fontSize="12px"
                fontFamily="'General Sans', 'Inter', sans-serif"
                position="relative"
                onClick={onClose}
                _hover={{
                  bg: "#F5F5F5",
                  color: "black",
                }}
                _before={isActive ? {
                  content: '""',
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  w: "3px",
                  h: "16px",
                  bg: "#6366f1",
                  borderRadius: "full",
                } : undefined}
              >
                <Icon as={item.icon} fontSize="14px" mr={2} />
                {item.label}
              </Button>
            );
          })}
        </VStack>
      </Collapse>
    </Box>
  );
};

const SidebarContent = ({
  user,
  currentPath,
  expandedCategories,
  setExpandedCategories,
  onClose,
}: {
  user: any;
  currentPath: string;
  expandedCategories: Record<string, boolean>;
  setExpandedCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onClose?: () => void;
}) => {
  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Flex direction="column" h="100%">
      {/* Logo */}
      <Flex h="60px" align="center" px={4} borderBottom="1px solid #F0F0F0">
        <Link href="/admin">
          <HStack spacing={2}>
            <Image
              src="/assets/landing_page/logo-light.svg"
              alt="MyDzine"
              width={100}
              height={24}
              style={{
                height: "24px",
                width: "auto",
              }}
            />
            <Badge
              bg="linear-gradient(135deg, #6366f1 0%, #8B5CF6 100%)"
              color="white"
              fontSize="9px"
              fontWeight="600"
              px={1.5}
              py={0.5}
              borderRadius="4px"
              textTransform="uppercase"
              letterSpacing="0.5px"
            >
              Admin
            </Badge>
          </HStack>
        </Link>
      </Flex>

      {/* Quick Stats */}
      <Box px={3} py={3} borderBottom="1px solid #F0F0F0">
        <Flex
          bg="linear-gradient(135deg, #F8F7FF 0%, #FDF8F6 100%)"
          borderRadius="12px"
          p={3}
          border="1px solid #E8E5F0"
          justify="space-between"
          align="center"
        >
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="10px" fontWeight="600" color="#6366f1" textTransform="uppercase" letterSpacing="0.5px">
              Admin Panel
            </Text>
            <Text fontSize="11px" color="#71717A">
              Full Access
            </Text>
          </VStack>
          <Flex
            w="36px"
            h="36px"
            borderRadius="10px"
            bg="white"
            align="center"
            justify="center"
            boxShadow="0 2px 8px rgba(0,0,0,0.06)"
          >
            <Icon as={FiShield} fontSize="16px" color="#6366f1" />
          </Flex>
        </Flex>
      </Box>

      {/* Navigation Categories */}
      <Box flex={1} overflowY="auto" py={2} px={2}>
        <VStack spacing={1} align="stretch">
          {adminNavCategories.map((category) => (
            <SidebarCategory
              key={category.id}
              category={category}
              isExpanded={expandedCategories[category.id] ?? true}
              onToggle={() => toggleCategory(category.id)}
              currentPath={currentPath}
              onClose={onClose}
            />
          ))}
        </VStack>
      </Box>

      {/* Switch to User View */}
      <Box px={3} py={2}>
        <Button
          as={Link}
          href="/dashboard"
          w="100%"
          h="42px"
          bg="black"
          color="white"
          borderRadius="10px"
          fontSize="12px"
          fontWeight="500"
          fontFamily="'IBM Plex Mono', monospace"
          textTransform="uppercase"
          letterSpacing="0.5px"
          leftIcon={<Icon as={FiExternalLink} fontSize="14px" />}
          _hover={{
            bg: "#1a1a1a",
            transform: "translateY(-1px)",
          }}
          transition="all 0.2s"
        >
          User Dashboard
        </Button>
      </Box>

      {/* User Section */}
      <Box px={3} py={3} borderTop="1px solid #E5E5E5" bg="#FAFAFA">
        <Menu placement="top-start">
          <MenuButton
            as={Button}
            variant="ghost"
            w="100%"
            h="auto"
            p={2.5}
            borderRadius="12px"
            bg="white"
            border="1px solid #E5E5E5"
            _hover={{
              bg: "#F5F3FF",
              borderColor: "#6366f1",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.08)",
            }}
            transition="all 0.2s"
          >
            <Flex align="center" gap={2.5}>
              <Box position="relative">
                <Avatar
                  size="sm"
                  name={user?.firstName || "Admin"}
                  src={user?.imageUrl}
                  bg="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                />
                <Box
                  position="absolute"
                  bottom="-1px"
                  right="-1px"
                  w="10px"
                  h="10px"
                  bg="#22C55E"
                  borderRadius="full"
                  border="2px solid white"
                />
              </Box>
              <Box flex={1} textAlign="left" overflow="hidden">
                <Text fontSize="13px" fontWeight="600" color="black" noOfLines={1} fontFamily="'General Sans', 'Inter', sans-serif">
                  {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "Admin"}
                </Text>
                <Text fontSize="10px" color="#71717A" noOfLines={1}>
                  Administrator
                </Text>
              </Box>
              <Icon as={FiChevronDown} fontSize="14px" color="#A1A1AA" />
            </Flex>
          </MenuButton>
          <MenuList
            bg="white"
            border="1px solid #E5E5E5"
            borderRadius="16px"
            boxShadow="0 20px 60px rgba(0,0,0,0.12)"
            py={2}
            px={2}
            minW="260px"
          >
            {/* User info header in dropdown */}
            <Box px={3} py={3} mb={2} bg="#F9FAFB" borderRadius="12px">
              <Flex align="center" gap={3}>
                <Avatar
                  size="md"
                  name={user?.firstName || "Admin"}
                  src={user?.imageUrl}
                  bg="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                />
                <Box>
                  <Text fontSize="14px" fontWeight="600" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                    {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "Admin"}
                  </Text>
                  <Text fontSize="11px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif" noOfLines={1}>
                    {user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress}
                  </Text>
                  <Badge
                    mt={1}
                    bg="rgba(99, 102, 241, 0.1)"
                    color="#6366f1"
                    fontSize="9px"
                    fontWeight="600"
                    px={2}
                    py={0.5}
                    borderRadius="full"
                  >
                    Admin Access
                  </Badge>
                </Box>
              </Flex>
            </Box>
            <MenuItem
              as={Link}
              href="/dashboard"
              icon={<Icon as={FiShield} fontSize="16px" color="#6366f1" />}
              fontSize="13px"
              fontFamily="'General Sans', 'Inter', sans-serif"
              color="#52525B"
              bg="transparent"
              borderRadius="10px"
              h="42px"
              _hover={{ bg: "#F5F3FF", color: "black" }}
              _focus={{ bg: "#F5F3FF" }}
            >
              Switch to User View
            </MenuItem>
            <MenuItem
              as={Link}
              href="/admin/settings"
              icon={<Icon as={FiSettings} fontSize="16px" color="#6366f1" />}
              fontSize="13px"
              fontFamily="'General Sans', 'Inter', sans-serif"
              color="#52525B"
              bg="transparent"
              borderRadius="10px"
              h="42px"
              _hover={{ bg: "#F5F3FF", color: "black" }}
              _focus={{ bg: "#F5F3FF" }}
            >
              Admin Settings
            </MenuItem>
            <MenuItem
              as="a"
              href="mailto:supportadmin@help.com?subject=Admin Panel Support Request"
              icon={<Icon as={FiHelpCircle} fontSize="16px" color="#6366f1" />}
              fontSize="13px"
              fontFamily="'General Sans', 'Inter', sans-serif"
              color="#52525B"
              bg="transparent"
              borderRadius="10px"
              h="42px"
              _hover={{ bg: "#F5F3FF", color: "black" }}
              _focus={{ bg: "#F5F3FF" }}
            >
              Help & Support
            </MenuItem>
            <Divider my={2} borderColor="#F0F0F0" />
            <SignOutButton redirectUrl="/">
              <MenuItem
                fontSize="13px"
                fontFamily="'General Sans', 'Inter', sans-serif"
                color="#EF4444"
                bg="transparent"
                borderRadius="10px"
                h="42px"
                _hover={{ bg: "#FEF2F2", color: "#DC2626" }}
                _focus={{ bg: "#FEF2F2" }}
              >
                <HStack spacing={2}>
                  <Icon as={FiLogOut} fontSize="16px" />
                  <Text>Sign Out</Text>
                </HStack>
              </MenuItem>
            </SignOutButton>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  );
};

const AdminShell = ({ activeItem, children }: AdminShellProps) => {
  const { user } = useUser();
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "overview": true,
    "management": true,
    "tools": true,
    "system": true,
  });

  return (
    <Flex minH="100vh" bg="#FAFAFA" w="100%" overflowX="hidden">
      {/* Desktop Sidebar */}
      <Box
        as="aside"
        w="280px"
        bg="white"
        borderRight="1px solid #F0F0F0"
        position="fixed"
        left={0}
        top={0}
        bottom={0}
        display={{ base: "none", lg: "block" }}
        zIndex={100}
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#E5E5E5",
            borderRadius: "2px",
          },
        }}
      >
        <SidebarContent
          user={user}
          currentPath={pathname || ""}
          expandedCategories={expandedCategories}
          setExpandedCategories={setExpandedCategories}
        />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay bg="rgba(0,0,0,0.4)" backdropFilter="blur(8px)" />
        <DrawerContent bg="white" maxW="300px">
          <DrawerCloseButton color="#71717A" top={4} right={4} />
          <DrawerBody p={0}>
            <SidebarContent
              user={user}
              currentPath={pathname || ""}
              onClose={onClose}
              expandedCategories={expandedCategories}
              setExpandedCategories={setExpandedCategories}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content Area */}
      <Box
        ml={{ base: 0, lg: "280px" }}
        flex={1}
        minH="100vh"
      >
        {/* Top Header Bar */}
        <Flex
          h="60px"
          bg="white"
          borderBottom="1px solid #E5E5E5"
          align="center"
          px={{ base: 4, md: 6 }}
          position="sticky"
          top={0}
          zIndex={50}
          justify="space-between"
        >
          {/* Mobile menu button */}
          <HStack spacing={3}>
            <IconButton
              aria-label="Menu"
              icon={<Icon as={FiMenu} fontSize="20px" />}
              variant="ghost"
              onClick={onOpen}
              color="#52525B"
              display={{ base: "flex", lg: "none" }}
              _hover={{ bg: "#F5F5F5" }}
            />
            <Box display={{ base: "block", lg: "none" }}>
              <Image
                src="/assets/landing_page/logo-light.svg"
                alt="MyDzine"
                width={90}
                height={22}
                style={{ height: "22px", width: "auto" }}
              />
            </Box>
          </HStack>

          {/* Right side actions */}
          <HStack spacing={3}>
            {/* Mobile user menu */}
            <Box display={{ base: "block", lg: "none" }}>
              <Menu placement="bottom-end">
                <MenuButton
                  as={Button}
                  variant="ghost"
                  p={1}
                  borderRadius="full"
                  _hover={{ bg: "rgba(99, 102, 241, 0.04)" }}
                >
                  <Box position="relative">
                    <Avatar
                      size="sm"
                      name={user?.firstName || "Admin"}
                      src={user?.imageUrl}
                      bg="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                    />
                    <Box
                      position="absolute"
                      bottom="0"
                      right="0"
                      w="10px"
                      h="10px"
                      bg="#22C55E"
                      borderRadius="full"
                      border="2px solid white"
                    />
                  </Box>
                </MenuButton>
                <MenuList
                  bg="white"
                  border="1px solid #E5E5E5"
                  borderRadius="14px"
                  boxShadow="0 10px 40px rgba(0,0,0,0.08)"
                  py={3}
                  px={2}
                  minW="240px"
                >
                  <Box px={2} py={2} mb={2} borderBottom="1px solid #F0F0F0">
                    <Flex align="center" gap={3}>
                      <Avatar
                        size="md"
                        name={user?.firstName || "Admin"}
                        src={user?.imageUrl}
                        bg="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                      />
                      <Box>
                        <Text fontSize="14px" fontWeight="500" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                          {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "Admin"}
                        </Text>
                        <Text fontSize="11px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
                          Administrator
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                  <MenuItem
                    as={Link}
                    href="/dashboard"
                    icon={<Icon as={FiShield} fontSize="16px" color="#6366f1" />}
                    fontSize="13px"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                    color="#52525B"
                    bg="transparent"
                    borderRadius="10px"
                    h="40px"
                    _hover={{ bg: "#F5F3FF", color: "black" }}
                    _focus={{ bg: "#F5F3FF" }}
                  >
                    Switch to User View
                  </MenuItem>
                  <Divider my={2} borderColor="#F0F0F0" />
                  <SignOutButton redirectUrl="/">
                    <MenuItem
                      fontSize="13px"
                      fontFamily="'General Sans', 'Inter', sans-serif"
                      color="#EF4444"
                      bg="transparent"
                      borderRadius="10px"
                      h="40px"
                      _hover={{ bg: "#FEF2F2", color: "#DC2626" }}
                      _focus={{ bg: "#FEF2F2" }}
                    >
                      <HStack spacing={2}>
                        <Icon as={FiLogOut} fontSize="16px" />
                        <Text>Sign Out</Text>
                      </HStack>
                    </MenuItem>
                  </SignOutButton>
                </MenuList>
              </Menu>
            </Box>
          </HStack>
        </Flex>

        {/* Page Content */}
        <Box
          p={{ base: 4, md: 6, lg: 8 }}
          w="100%"
          maxW="100%"
          overflowX="hidden"
        >
          {children}
        </Box>
      </Box>
    </Flex>
  );
};

export default AdminShell;
