"use client";

import {
  Box,
  Button,
  Flex,
  FlexProps,
  Icon,
  Spinner,
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
  Collapse,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
} from "@chakra-ui/react";
import Link from "next/link";
import { toDashboardToolHref } from "@/core/utils/toDashboardToolHref";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { dashboardNavItemsTop, dashboardNavItemsBottom, toolCategories, DashboardNavKey } from "@/data/dashboard";
import { FiLogOut, FiMenu, FiChevronDown, FiChevronRight, FiSettings, FiHelpCircle, FiCreditCard, FiShield, FiZap, FiStar } from "react-icons/fi";
import { useUserCredits } from "@/hooks/useUserCredits";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import AccountSettingsModal from "./AccountSettingsModal";

interface DashboardShellProps {
  activeItem: DashboardNavKey;
  children: React.ReactNode;
  containerProps?: FlexProps;
}

// Sidebar Category Component
const SidebarCategory = ({
  category,
  isExpanded,
  onToggle,
  currentPath,
}: {
  category: typeof toolCategories[0];
  isExpanded: boolean;
  onToggle: () => void;
  currentPath: string;
}) => {
  const hasActiveChild = category.tools.some(tool => currentPath === tool.href);

  return (
    <Box>
      <Button
        onClick={onToggle}
        variant="ghost"
        w="100%"
        justifyContent="space-between"
        h="34px"
        px={3}
        borderRadius="0"
        color={isExpanded || hasActiveChild ? "black" : "#52525B"}
        bg={isExpanded ? "#F5F5F5" : "transparent"}
        fontWeight="500"
        fontSize="12px"
        fontFamily="'General Sans', 'Inter', sans-serif"
        _hover={{
          bg: "#F5F5F5",
          color: "black",
        }}
      >
        <HStack spacing={2}>
          <Icon as={category.icon} fontSize="14px" color={isExpanded || hasActiveChild ? "#6366f1" : "#71717A"} />
          <Text>{category.label}</Text>
        </HStack>
        <HStack spacing={1.5}>
          <Text fontSize="10px" color="#A1A1AA" fontWeight="500">
            {category.tools.length}
          </Text>
          <Icon
            as={isExpanded ? FiChevronDown : FiChevronRight}
            fontSize="12px"
            color="#A1A1AA"
          />
        </HStack>
      </Button>

      <Collapse in={isExpanded} animateOpacity>
        <VStack spacing={0} align="stretch" pb={1} bg="#FAFAFA">
          {category.tools.map((tool) => {
            const isActive = currentPath === tool.href;
            return (
              <Button
                key={tool.href}
                as={Link}
                href={toDashboardToolHref(tool.href)}
                variant="ghost"
                w="100%"
                justifyContent="flex-start"
                h="30px"
                px={3}
                pl={9}
                borderRadius="0"
                color={isActive ? "black" : "#52525B"}
                bg={isActive ? "#F5F3FF" : "transparent"}
                fontWeight={isActive ? "600" : "400"}
                fontSize="12px"
                fontFamily="'General Sans', 'Inter', sans-serif"
                borderLeft={isActive ? "2px solid #6366f1" : "2px solid transparent"}
                _hover={{
                  bg: "#F5F5F5",
                  color: "black",
                }}
              >
                {tool.title}
              </Button>
            );
          })}
        </VStack>
      </Collapse>
    </Box>
  );
};

// Main Sidebar Content
const SidebarContent = ({
  user,
  totals,
  isLoadingCredits,
  currentPath,
  expandedCategories,
  setExpandedCategories,
  onOpenSettings,
}: {
  user: any;
  totals: any;
  isLoadingCredits: boolean;
  currentPath: string;
  expandedCategories: Record<string, boolean>;
  setExpandedCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onOpenSettings: () => void;
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
        <Link href="/">
          <Image
            src="/assets/landing_page/logo-light.svg"
            alt="MyDzine"
            width={150}
            height={36}
            style={{
              height: "auto",
              width: "150px",
            }}
            priority
          />
        </Link>
      </Flex>

      {/* Top Navigation */}
      <Box py={2} borderBottom="1px solid #E5E5E5">
        <VStack spacing={0} align="stretch" px={2}>
          {dashboardNavItemsTop.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Button
                key={item.key}
                as={Link}
                href={item.href}
                variant="ghost"
                w="100%"
                justifyContent="flex-start"
                h="36px"
                px={3}
                borderRadius="8px"
                color={isActive ? "black" : "#52525B"}
                bg={isActive ? "#F5F3FF" : "transparent"}
                fontWeight={isActive ? "600" : "500"}
                fontSize="13px"
                fontFamily="'General Sans', 'Inter', sans-serif"
                leftIcon={
                  <Icon
                    as={item.icon}
                    fontSize="16px"
                    color={isActive ? "#6366f1" : "#71717A"}
                  />
                }
                _hover={{
                  bg: "#F5F5F5",
                  color: "black",
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </VStack>
      </Box>

      {/* Tool Categories */}
      <Box flex={1} overflowY="auto" py={1}>
        <Text
          px={3}
          py={1.5}
          fontSize="10px"
          fontWeight="600"
          color="#A1A1AA"
          textTransform="uppercase"
          letterSpacing="0.5px"
          fontFamily="'General Sans', 'Inter', sans-serif"
        >
          Categories
        </Text>
        <VStack spacing={0} align="stretch">
          {toolCategories.map((category) => (
            <SidebarCategory
              key={category.id}
              category={category}
              isExpanded={expandedCategories[category.id] ?? false}
              onToggle={() => toggleCategory(category.id)}
              currentPath={currentPath}
            />
          ))}
        </VStack>
      </Box>

      {/* Bottom Navigation */}
      <Box py={2} borderTop="1px solid #E5E5E5">
        <VStack spacing={0} align="stretch" px={2}>
          {dashboardNavItemsBottom.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Button
                key={item.key}
                as={Link}
                href={item.href}
                variant="ghost"
                w="100%"
                justifyContent="flex-start"
                h="36px"
                px={3}
                borderRadius="8px"
                color={isActive ? "black" : "#52525B"}
                bg={isActive ? "#F5F3FF" : "transparent"}
                fontWeight={isActive ? "600" : "500"}
                fontSize="13px"
                fontFamily="'General Sans', 'Inter', sans-serif"
                leftIcon={
                  <Icon
                    as={item.icon}
                    fontSize="16px"
                    color={isActive ? "#6366f1" : "#71717A"}
                  />
                }
                _hover={{
                  bg: "#F5F5F5",
                  color: "black",
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </VStack>
      </Box>

      {/* Credits Section */}
      <Box px={3} py={2}>
        <Box
          bg="#F9FAFB"
          borderRadius="10px"
          p={3}
          border="1px solid #E5E5E5"
        >
          <HStack justify="flex-start" mb={1}>
            <HStack spacing={2}>
              <Icon as={FiCreditCard} color="#6366f1" fontSize="12px" />
              <Text fontSize="10px" fontWeight="600" color="#71717A" textTransform="uppercase" letterSpacing="0.5px" fontFamily="'General Sans', 'Inter', sans-serif">
                Credits
              </Text>
            </HStack>
          </HStack>
          <Button
            as={Link}
            href="/dashboard/pricing"
            bg="#F5F3FF"
            color="black"
            height="40px"
            px={3}
            mt={2}
            w="100%"
            borderRadius="8px"
            fontFamily="'General Sans', 'Inter', sans-serif"
            fontWeight="500"
            fontSize="12px"
            display="flex"
            alignItems="center"
            justifyContent="flex-start"
            gap={2}
            border="1px solid #E9D5FF"
            _hover={{
              bg: "#EDE9FE",
              borderColor: "#DDD6FE",
            }}
            _active={{
              bg: "#E9D5FF",
            }}
          >
            <Box
              w="18px"
              h="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <svg preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 48 48">
                <g>
                  <path fill="#D99306" d="M24 45c11.598 0 21-9.402 21-21S35.598 3 24 3 3 12.402 3 24s9.402 21 21 21Z" clipRule="evenodd" fillRule="evenodd" />
                  <path fill="url(#coin-a)" d="M23 43c11.046 0 20-8.954 20-20S34.046 3 23 3 3 11.954 3 23s8.954 20 20 20Z" clipRule="evenodd" fillRule="evenodd" />
                  <path fill="#fff" d="M23 3C11.954 3 3 11.954 3 23c.306-3.573 6.5-11.875 8-13 2-1.5 6.264-6.225 12-7Z" />
                  <path fill="url(#coin-b)" d="M23 37c7.732 0 14-6.268 14-14S30.732 9 23 9 9 15.268 9 23s6.268 14 14 14Z" clipRule="evenodd" fillRule="evenodd" />
                  <path strokeOpacity=".2" stroke="url(#coin-c)" d="M23 9.5c7.456 0 13.5 6.044 13.5 13.5S30.456 36.5 23 36.5 9.5 30.456 9.5 23 15.544 9.5 23 9.5Z" />
                  <path fill="url(#coin-d)" d="M20.977 31.942s-.68-3.993-1.947-6.186c-1.266-2.193-4.383-4.779-4.383-4.779s3.992-.68 6.185-1.947c2.194-1.266 4.78-4.383 4.78-4.383s.68 3.992 1.946 6.186c1.266 2.193 4.383 4.778 4.383 4.778s-3.992.681-6.185 1.947c-2.193 1.267-4.779 4.384-4.779 4.384Z" />
                  <path fill="#fff" d="M20.833 19.03c-2.193 1.267-6.186 1.947-6.186 1.947C22 22 23.701 20.765 25.612 14.647c0 0-2.586 3.117-4.78 4.383Z" />
                  <defs>
                    <linearGradient gradientUnits="userSpaceOnUse" y2="41.5" x2="28.5" y1="21" x1="13.5" id="coin-a">
                      <stop stopColor="#FCC24D" />
                      <stop stopColor="#FDE8AC" offset="1" />
                    </linearGradient>
                    <linearGradient gradientUnits="userSpaceOnUse" y2="37" x2="23" y1="19" x1="20.5" id="coin-b">
                      <stop stopColor="#EE9D04" />
                      <stop stopColor="#F7AE1D" offset="1" />
                    </linearGradient>
                    <linearGradient gradientUnits="userSpaceOnUse" y2="34" x2="32" y1="14.5" x1="15" id="coin-c">
                      <stop stopColor="#F97316" />
                      <stop stopColor="#FEC72D" offset="1" />
                    </linearGradient>
                    <linearGradient gradientUnits="userSpaceOnUse" y2="28.776" x2="26.459" y1="20.5" x1="21.5" id="coin-d">
                      <stop stopColor="#FDD78A" />
                      <stop stopColor="#FFC107" offset="1" />
                    </linearGradient>
                  </defs>
                </g>
              </svg>
            </Box>
            <Text fontSize="12px" fontWeight="500" color="black">
              {isLoadingCredits ? "..." : `${totals.totalCredits} credits`}
            </Text>
            <Box
              w="1px"
              h="16px"
              bg="#D4D4D8"
              mx={1}
            />
            <Text fontSize="12px" fontWeight="500" color="black">
              Upgrade
            </Text>
          </Button>
        </Box>
      </Box>

      {/* User Section */}
      <Box px={3} py={2} borderTop="1px solid #E5E5E5">
        <Menu placement="top-start">
          <MenuButton
            as={Button}
            variant="ghost"
            w="100%"
            h="auto"
            p={2}
            borderRadius="10px"
            bg="#F9FAFB"
            border="1px solid #E5E5E5"
            _hover={{
              bg: "#F5F3FF",
              borderColor: "#6366f1",
            }}
            transition="all 0.2s"
          >
            <Flex align="center" gap={2}>
              <Box position="relative">
                <Avatar
                  size="xs"
                  name={user?.firstName || "User"}
                  src={user?.imageUrl}
                  bg="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                />
                {/* Online indicator */}
                <Box
                  position="absolute"
                  bottom="-1px"
                  right="-1px"
                  w="8px"
                  h="8px"
                  bg="#22C55E"
                  borderRadius="full"
                  border="1.5px solid white"
                />
              </Box>
              <Box flex={1} textAlign="left" overflow="hidden">
                <Text fontSize="12px" fontWeight="500" color="black" noOfLines={1} fontFamily="'General Sans', 'Inter', sans-serif">
                  {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "Account"}
                </Text>
              </Box>
              <Icon as={FiSettings} fontSize="12px" color="#A1A1AA" />
            </Flex>
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
            {/* User info header in dropdown */}
            <Box px={2} py={2} mb={2} borderBottom="1px solid #F0F0F0">
              <Flex align="center" gap={3}>
                <Avatar
                  size="md"
                  name={user?.firstName || "User"}
                  src={user?.imageUrl}
                  bg="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                />
                <Box>
                  <Text fontSize="14px" fontWeight="500" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                    {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "Account"}
                  </Text>
                  <Text fontSize="11px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </Text>
                </Box>
              </Flex>
            </Box>
            <MenuItem
              icon={<Icon as={FiSettings} fontSize="16px" color="#6366f1" />}
              fontSize="13px"
              fontFamily="'General Sans', 'Inter', sans-serif"
              color="#52525B"
              bg="transparent"
              borderRadius="10px"
              h="40px"
              _hover={{ bg: "#F5F3FF", color: "black" }}
              _focus={{ bg: "#F5F3FF" }}
              onClick={onOpenSettings}
            >
              Account Settings
            </MenuItem>
            <MenuItem
              as={Link}
              href="/faq"
              target="_blank"
              icon={<Icon as={FiHelpCircle} fontSize="16px" color="#6366f1" />}
              fontSize="13px"
              fontFamily="'General Sans', 'Inter', sans-serif"
              color="#52525B"
              bg="transparent"
              borderRadius="10px"
              h="40px"
              _hover={{ bg: "#F5F3FF", color: "black" }}
              _focus={{ bg: "#F5F3FF" }}
            >
              Help & Support
            </MenuItem>
            {(user?.publicMetadata?.role === "admin" || user?.publicMetadata?.admin === true) && (
              <Link href="/admin">
                <MenuItem
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
                  Go to Admin
                </MenuItem>
              </Link>
            )}
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
    </Flex>
  );
};

const DashboardShell = ({ activeItem, children, containerProps }: DashboardShellProps) => {
  const { user } = useUser();
  const { totals, isLoading: isLoadingCredits } = useUserCredits();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onOpenSettings, onClose: onCloseSettings } = useDisclosure();
  const pathname = usePathname();

  // Track which categories are expanded (collapsed by default for cleaner look)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "image-models": false,
    "video-models": false,
    "photo-converter": false,
    "image-effects": false,
    "photo-filters": false,
    "image-editors": false,
    "upscalers": false,
    "controlnet": false,
    "background-tools": false,
    "portrait-tools": false,
    "art-generators": false,
  });

  return (
    <Flex minH="100vh" bg="#fcfcfc">
      {/* Desktop Sidebar */}
      <Box
        as="aside"
        w="260px"
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
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
            border: "2px solid transparent",
            backgroundClip: "padding-box",
            transition: "background 0.2s ease",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(0, 0, 0, 0.2)",
            backgroundClip: "padding-box",
          },
          // Firefox
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 0, 0, 0.1) transparent",
        }}
      >
        <SidebarContent
          user={user}
          totals={totals}
          isLoadingCredits={isLoadingCredits}
          currentPath={pathname || ""}
          expandedCategories={expandedCategories}
          setExpandedCategories={setExpandedCategories}
          onOpenSettings={onOpenSettings}
        />
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay bg="rgba(0,0,0,0.3)" backdropFilter="blur(4px)" />
        <DrawerContent bg="white" maxW="280px">
          <DrawerCloseButton color="#71717A" />
          <DrawerBody p={0}>
            <SidebarContent
              user={user}
              totals={totals}
              isLoadingCredits={isLoadingCredits}
              currentPath={pathname || ""}
              expandedCategories={expandedCategories}
              setExpandedCategories={setExpandedCategories}
              onOpenSettings={onOpenSettings}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content Area */}
      <Box
        ml={{ base: 0, lg: "260px" }}
        flex={1}
        minH="100vh"
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": {
            width: "10px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#FAFAFA",
            borderRadius: "5px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(0, 0, 0, 0.12)",
            borderRadius: "5px",
            border: "2px solid #FAFAFA",
            backgroundClip: "padding-box",
            transition: "background 0.2s ease",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(0, 0, 0, 0.2)",
            backgroundClip: "padding-box",
          },
          // Firefox
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 0, 0, 0.12) #FAFAFA",
        }}
      >
        {/* Mobile Header */}
        <Flex
          display={{ base: "flex", lg: "none" }}
          h="60px"
          bg="white"
          borderBottom="1px solid #E5E5E5"
          align="center"
          px={4}
          position="sticky"
          top={0}
          zIndex={50}
        >
          <IconButton
            aria-label="Menu"
            icon={<Icon as={FiMenu} fontSize="20px" />}
            variant="ghost"
            onClick={onOpen}
            color="#52525B"
          />
          <Box ml={3}>
            <Image
              src="/assets/landing_page/logo-light.svg"
              alt="MyDzine"
              width={130}
              height={32}
              style={{ height: "auto", width: "130px" }}
              priority
            />
          </Box>
          <Box ml="auto">
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
                    name={user?.firstName || "User"}
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
                      name={user?.firstName || "User"}
                      src={user?.imageUrl}
                      bg="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                    />
                    <Box>
                      <Text fontSize="14px" fontWeight="500" color="black" fontFamily="'General Sans', 'Inter', sans-serif">
                        {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "Account"}
                      </Text>
                      <Text fontSize="11px" color="#71717A" fontFamily="'General Sans', 'Inter', sans-serif">
                        {user?.emailAddresses?.[0]?.emailAddress}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
                <MenuItem
                  icon={<Icon as={FiSettings} fontSize="16px" color="#6366f1" />}
                  fontSize="13px"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  color="#52525B"
                  bg="transparent"
                  borderRadius="10px"
                  h="40px"
                  _hover={{ bg: "#F5F3FF", color: "black" }}
                  _focus={{ bg: "#F5F3FF" }}
                  onClick={onOpenSettings}
                >
                  Account Settings
                </MenuItem>
                <MenuItem
                  as={Link}
                  href="/faq"
                  target="_blank"
                  icon={<Icon as={FiHelpCircle} fontSize="16px" color="#6366f1" />}
                  fontSize="13px"
                  fontFamily="'General Sans', 'Inter', sans-serif"
                  color="#52525B"
                  bg="transparent"
                  borderRadius="10px"
                  h="40px"
                  _hover={{ bg: "#F5F3FF", color: "black" }}
                  _focus={{ bg: "#F5F3FF" }}
                >
                  Help & Support
                </MenuItem>
                {(user?.publicMetadata?.role === "admin" || user?.publicMetadata?.admin === true) && (
                  <Link href="/admin">
                    <MenuItem
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
                      Go to Admin
                    </MenuItem>
                  </Link>
                )}
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
        </Flex>

        {/* Page Content */}
        <Box
          p={{ base: 4, md: 6, lg: 8 }}
          w="100%"
          maxW="100%"
          minW="0"
          overflowX="hidden"
          {...containerProps}
        >
          {children}
        </Box>
      </Box>

      {/* Account Settings Modal */}
      <AccountSettingsModal isOpen={isSettingsOpen} onClose={onCloseSettings} />
    </Flex>
  );
};

export default DashboardShell;
