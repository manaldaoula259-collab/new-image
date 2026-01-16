"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Text,
  Tooltip,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { FiArrowUpRight, FiChevronDown, FiMenu } from "react-icons/fi";
import { useAuthModal } from "@/contexts/auth-modal-context";

function Header() {
  const { isSignedIn, isLoaded } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { openSignUp } = useAuthModal();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    {
      label: "AI Photo Filter",
      href: "/ai-photo-filter",
      children: [
        { label: "2D to 3D Converter", href: "/ai-photo-filter/2d-to-3d-converter" },
        { label: "AI Design Sketch", href: "/ai-photo-filter/ai-design-sketch" },
        { label: "Image to Prompt", href: "/ai-photo-filter/image-to-prompt" },
        { label: "AI Style Transfer", href: "/ai-photo-filter/ai-style-transfer" },
        { label: "Turn Sketch to Art", href: "/ai-photo-filter/turn-sketch-to-art" },
        { label: "AI Anime Filter", href: "/ai-photo-filter/ai-anime-filter" },
      ],
    },
    {
      label: "AI Image Editor",
      href: "/ai-image-editor",
      children: [
        { label: "Add Object into Image", href: "/ai-image-editor/add-object-into-image" },
        { label: "Remove Object from Image", href: "/ai-image-editor/remove-object-from-image" },
        { label: "Remove Background", href: "/ai-image-editor/remove-background" },
        { label: "AI Photo Enhancer", href: "/ai-image-editor/ai-photo-enhancer" },
        { label: "AI Photo Expand", href: "/ai-image-editor/ai-photo-expand" },
        { label: "Vectorize Image", href: "/ai-image-editor/vectorize-image" },
      ],
    },
    {
      label: "AI Art Generator",
      href: "/ai-art-generator",
      children: [
        { label: "AI Character Generator", href: "/ai-art-generator/ai-character-generator" },
        { label: "AI Anime Generator", href: "/ai-art-generator/ai-anime-generator" },
        { label: "AI Comic Generator", href: "/ai-art-generator/ai-comic-generator" },
        { label: "AI Coloring Book Generator", href: "/ai-art-generator/ai-coloring-book-generator" },
      ],
    },
    { label: "Prompts", href: "/prompts" },
    { label: "Pricing", href: "/#pricing" },
  ];

  return (
    <Flex
      as="header"
      width="100%"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={isOpen ? 1200 : 1500}
      bg={isScrolled ? "rgba(15, 23, 42, 0.95)" : "transparent"}
      backdropFilter={isScrolled ? "blur(20px)" : "none"}
      px={{ base: 2, sm: 3, md: 6 }}
      py={{ base: 2, sm: 3, md: 4 }}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      boxShadow={isScrolled ? "0 4px 24px rgba(0, 0, 0, 0.15)" : "none"}
    >
      <Container maxW="1400px" px={{ base: 0, md: 6 }} display="flex" alignItems="center" justifyContent="space-between" width="100%" position="relative">
        {/* Logo - Left side */}
        <Flex
          as={Link}
          href="/"
          alignItems="center"
          gap={2}
          flexShrink={0}
          display={{ base: "flex", md: "flex" }}
        >
          <Image
            src="/assets/landing_page/logo-dark.svg"
            alt="MyDzine"
            width={100}
            height={24}
            style={{
              height: "42px",
              width: "auto",
            }}
            priority
          />
        </Flex>

        {/* Navigation Container - Center */}
        <Flex
          as="nav"
          alignItems="center"
          justifyContent={{ base: "flex-end", md: "center" }}
          gap={10}
          height={{ base: "auto", md: "72px" }}
          px={{ base: 2, md: 6 }}
          py={{ base: 2, md: 0 }}
          borderRadius="21px"
          bg={{ base: "transparent", md: "rgba(255, 255, 255, 0.16)" }}
          backdropFilter={{ base: "none", md: "blur(5px)" }}
          boxShadow={{ base: "none", md: "0px 114px 57px 0px rgba(0,0,0,0.02), 0px 81px 48px 0px rgba(0,0,0,0.06), 0px 36px 36px 0px rgba(0,0,0,0.09), 0px 9px 20px 0px rgba(0,0,0,0.11)" }}
          width={{ base: "auto", md: "771px", lg: "771px", xl: "771px", "2xl": "771px" }}
          position={{ base: "relative", md: "absolute" }}
          left={{ base: "auto", md: "50%" }}
          transform={{ base: "none", md: "translateX(-50%)" }}
          display="flex"
        >

          {/* Navigation Links */}
          <HStack
            spacing={10}
            justifyContent="center"
            flex="1"
            display={{ base: "none", md: "flex" }}
          >
            {navLinks.map((link) => {
              if (link.children) {
                const menuColumns =
                  link.children.length > 6 ? { base: 1, md: 2 } : { base: 1 };

                return (
                  <Menu key={link.href} isLazy placement="bottom">
                    <MenuButton
                      as={Button}
                      rightIcon={<Icon as={FiChevronDown} fontSize="10px" />}
                      variant="ghost"
                      size="sm"
                      px={0}
                      fontSize="16px"
                      fontFamily="'General Sans', sans-serif"
                      fontWeight="500"
                      color="white"
                      display="flex"
                      alignItems="center"
                      gap={1}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      _hover={{ bg: "transparent", opacity: 0.8 }}
                      _active={{ bg: "transparent", opacity: 0.6 }}
                      minH="auto"
                      h="auto"
                    >
                      {link.label}
                    </MenuButton>
                    <MenuList
                      px={0}
                      py={0}
                      borderRadius="xl"
                      bg="white"
                      border="1px solid rgba(0, 0, 0, 0.1)"
                      boxShadow="0 22px 54px rgba(0, 0, 0, 0.15)"
                      minW={{ base: "16rem", md: "18rem" }}
                      maxW={{ base: "calc(100vw - 2rem)", md: "none" }}
                      overflow="hidden"
                      zIndex={1600}
                      position="relative"
                    >
                      <Box
                        px={4}
                        py={3}
                        borderBottom="1px solid rgba(0, 0, 0, 0.08)"
                        bg="rgba(0, 0, 0, 0.02)"
                      >
                        <Text
                          fontSize="xs"
                          textTransform="uppercase"
                          letterSpacing="0.18em"
                          color="rgba(0, 0, 0, 0.6)"
                          fontWeight="600"
                        >
                          {link.label}
                        </Text>
                        <Text fontSize="sm" color="rgba(0, 0, 0, 0.7)" mt={1}>
                          Explore premium AI workflows
                        </Text>
                      </Box>
                      <SimpleGrid
                        columns={menuColumns}
                        spacing={1}
                        px={2}
                        py={2}
                      >
                        {link.children.map((child) => (
                          <MenuItem
                            key={child.href}
                            as={Link}
                            href={child.href}
                            role="group"
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            py={2.5}
                            px={3}
                            borderRadius="lg"
                            fontSize="sm"
                            fontWeight="medium"
                            color="rgba(0, 0, 0, 0.85)"
                            bg="transparent"
                            _hover={{
                              bg: "rgba(0, 0, 0, 0.05)",
                              color: "rgba(0, 0, 0, 0.95)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
                            }}
                            _focus={{ bg: "rgba(0, 0, 0, 0.08)" }}
                            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                            gap={3}
                          >
                            <Text as="span" flex="1" textAlign="left">
                              {child.label}
                            </Text>
                            <Icon
                              as={FiArrowUpRight}
                              fontSize="sm"
                              opacity={0.5}
                              color="rgba(0, 0, 0, 0.7)"
                              transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                              _groupHover={{ opacity: 1, transform: "translateX(2px)", color: "rgba(0, 0, 0, 0.9)" }}
                            />
                          </MenuItem>
                        ))}
                      </SimpleGrid>
                    </MenuList>
                  </Menu>
                );
              }

              return (
                <Button
                  key={link.href}
                  as={Link}
                  href={link.href}
                  variant="ghost"
                  size="sm"
                  px={0}
                  fontSize="16px"
                  fontFamily="'General Sans', sans-serif"
                  fontWeight="500"
                  color="white"
                  minH="auto"
                  h="auto"
                  _hover={{ bg: "transparent", opacity: 0.8 }}
                  _active={{ bg: "transparent", opacity: 0.6 }}
                >
                  {link.label}
                </Button>
              );
            })}
          </HStack>
        </Flex>

        {/* Mobile: Hamburger Menu Button (inside nav container) */}
        <HStack
          spacing={{ base: 2, md: 0 }}
          flexShrink={0}
          display={{ base: isOpen ? "none" : "flex", md: "none" }}
          ml="auto"
        >
          {isLoaded && isSignedIn && (
            <Box
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              border="1px solid rgba(148, 163, 184, 0.28)"
              bg="rgba(15, 23, 42, 0.6)"
              backdropFilter="blur(18px)"
              px={{ base: 1, sm: 1.5 }}
              py={{ base: 1, sm: 1.5 }}
            >
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: {
                      width: "1.5rem",
                      height: "1.5rem",
                    },
                  },
                }}
              />
            </Box>
          )}
          <IconButton
            aria-label="Open menu"
            icon={<FiMenu />}
            variant="ghostOnDark"
            size="md"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpen();
            }}
            fontSize="xl"
            minW="40px"
            minH="40px"
            type="button"
            cursor="pointer"
            bg="rgba(15, 23, 42, 0.6)"
            border="1px solid rgba(148, 163, 184, 0.2)"
            _hover={{ bg: "rgba(30, 41, 59, 0.8)" }}
          />
        </HStack>

        {/* Desktop: Right side buttons */}
        <HStack
          spacing={3}
          flexShrink={0}
          display={{ base: "none", md: "flex" }}
        >
          {isLoaded && isSignedIn ? (
            <>
              <Button
                href="/dashboard"
                as={Link}
                bg="black"
                color="white"
                size="md"
                px={6}
                fontSize="15px"
                fontFamily="'General Sans', 'Inter', sans-serif"
                fontWeight="500"
                borderRadius="12px"
                height="48px"
                _hover={{
                  bg: "#1a1a1a",
                }}
                _active={{
                  bg: "#1a1a1a",
                }}
              >
                Dashboard
              </Button>
              <Tooltip hasArrow label="Account">
                <Box
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="full"
                  border="2px solid white"
                  bg="white"
                  p="2px"
                  position="relative"
                  _hover={{
                    transform: "scale(1.05)",
                  }}
                  transition="transform 0.2s"
                >
                  <Box
                    borderRadius="full"
                    bg="#FFD700"
                    width="40px"
                    height="40px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    overflow="hidden"
                  >
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: {
                            width: "40px",
                            height: "40px",
                            borderRadius: "full",
                            border: "none",
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Tooltip>
            </>
          ) : (
            <Box
              display="inline-flex"
              role="group"
            >
              <Button
                onClick={openSignUp}
                bg="black"
                color="white"
                height="72px"
                px={0}
                fontSize="15px"
                fontFamily="'IBM Plex Mono', monospace"
                fontWeight="500"
                letterSpacing="0.6px"
                textTransform="uppercase"
                borderRadius="8px"
                display="flex"
                alignItems="center"
                gap={0}
                overflow="hidden"
                position="relative"
                _hover={{
                  bg: "#1a1a1a",
                }}
                _active={{
                  bg: "#1a1a1a",
                }}
              >
                <Box
                  as="span"
                  position="absolute"
                  left="4px"
                  top="4px"
                  bottom="4px"
                  bg="#573cff"
                  borderRadius="4px"
                  w="64px"
                  transition="width 0.3s ease, border-radius 0.3s ease"
                  _groupHover={{
                    w: "calc(100% - 8px)",
                    borderRadius: "4px",
                  }}
                />
                <Box
                  as="span"
                  position="absolute"
                  left="36px"
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
                  as="span"
                  pl="80px"
                  pr={6}
                  py={4}
                  position="relative"
                  zIndex={1}
                  transition="color 0.3s ease"
                  _groupHover={{
                    color: "white",
                  }}
                >
                  GET STARTED
                </Text>
              </Button>
            </Box>
          )}
        </HStack>
      </Container>

      {/* Mobile Drawer Menu */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size={{ base: "xs", sm: "sm" }}
        closeOnOverlayClick={true}
        closeOnEsc={true}
      >
        <DrawerOverlay
          backdropFilter="blur(10px)"
          bg="rgba(0, 0, 0, 0.4)"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
        />
        <DrawerContent
          bg="rgba(255, 255, 255, 0.95)"
          borderLeft="1px solid rgba(0, 0, 0, 0.05)"
          maxW={{ base: "85vw", sm: "320px" }}
          boxShadow="-12px 0 40px rgba(0, 0, 0, 0.1)"
          onClick={(e) => e.stopPropagation()}
        >
          <DrawerCloseButton
            color="black"
            bg="transparent"
            borderRadius="full"
            top={4}
            right={4}
            size="md"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            _hover={{ bg: "rgba(0, 0, 0, 0.05)" }}
            zIndex={10001}
            cursor="pointer"
            type="button"
          />
          <DrawerHeader
            px={6}
            py={6}
            bg="transparent"
          >
            <Text
              fontSize="2xl"
              fontWeight="600"
              color="black"
              fontFamily="'General Sans', sans-serif"
              letterSpacing="-0.5px"
            >
              Menu
            </Text>
          </DrawerHeader>
          <DrawerBody
            px={0}
            pt={0}
            pb={8}
            overflowY="auto"
            flex="1"
            bg="transparent"
            minH={0}
            sx={{
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                bg: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                bg: "rgba(0, 0, 0, 0.1)",
                borderRadius: "3px",
                "&:hover": {
                  bg: "rgba(0, 0, 0, 0.2)",
                },
              },
            }}
          >
            <VStack spacing={1} align="stretch" width="100%" px={4}>
              {isSignedIn && (
                <Button
                  as={Link}
                  href="/dashboard"
                  variant="ghost"
                  justifyContent="flex-start"
                  size="lg"
                  borderRadius="12px"
                  onClick={onClose}
                  fontSize="16px"
                  fontFamily="'General Sans', sans-serif"
                  px={4}
                  h="56px"
                  color="black"
                  _hover={{ bg: "rgba(0, 0, 0, 0.04)" }}
                  fontWeight="500"
                >
                  Dashboard
                </Button>
              )}
              {navLinks.map((link) => {
                if (link.children) {
                  return (
                    <Box key={link.href} py={2}>
                      <Text
                        px={4}
                        py={2}
                        fontSize="xs"
                        fontWeight="600"
                        color="rgba(0, 0, 0, 0.5)"
                        textTransform="uppercase"
                        letterSpacing="0.1em"
                        fontFamily="'General Sans', sans-serif"
                      >
                        {link.label}
                      </Text>
                      <VStack spacing={1} align="stretch">
                        {link.children.map((child) => (
                          <Button
                            key={child.href}
                            as={Link}
                            href={child.href}
                            variant="ghost"
                            justifyContent="flex-start"
                            size="md"
                            borderRadius="12px"
                            onClick={onClose}
                            fontSize="15px"
                            fontFamily="'General Sans', sans-serif"
                            px={4}
                            h="48px"
                            leftIcon={<Icon as={FiArrowUpRight} fontSize="sm" color="rgba(0,0,0,0.4)" />}
                            color="rgba(0, 0, 0, 0.8)"
                            _hover={{
                              bg: "rgba(0, 0, 0, 0.04)",
                              color: "black",
                              "& svg": { color: "black" }
                            }}
                            fontWeight="500"
                          >
                            {child.label}
                          </Button>
                        ))}
                      </VStack>
                    </Box>
                  );
                }
                return (
                  <Button
                    key={link.href}
                    as={Link}
                    href={link.href}
                    variant="ghost"
                    justifyContent="flex-start"
                    size="lg"
                    borderRadius="12px"
                    onClick={onClose}
                    fontSize="16px"
                    fontFamily="'General Sans', sans-serif"
                    px={4}
                    h="56px"
                    color="black"
                    _hover={{ bg: "rgba(0, 0, 0, 0.04)" }}
                    fontWeight="500"
                  >
                    {link.label}
                  </Button>
                );
              })}
              {!isSignedIn && (
                <Box px={0} py={6} mt={2}>
                  <Button
                    onClick={() => {
                      onClose();
                      openSignUp();
                    }}
                    bg="black"
                    color="white"
                    height="64px"
                    width="100%"
                    px={0}
                    fontSize="15px"
                    fontFamily="'IBM Plex Mono', monospace"
                    fontWeight="500"
                    letterSpacing="0.6px"
                    textTransform="uppercase"
                    borderRadius="12px"
                    display="flex"
                    alignItems="center"
                    gap={0}
                    overflow="hidden"
                    position="relative"
                    role="group"
                    _hover={{
                      bg: "#1a1a1a",
                    }}
                    _active={{
                      bg: "#1a1a1a",
                    }}
                  >
                    <Box
                      as="span"
                      position="absolute"
                      left="4px"
                      top="4px"
                      bottom="4px"
                      bg="#573cff"
                      borderRadius="8px"
                      w="56px"
                      transition="width 0.3s ease, border-radius 0.3s ease"
                      _groupHover={{
                        w: "calc(100% - 8px)",
                        borderRadius: "8px",
                      }}
                    />
                    <Box
                      as="span"
                      position="absolute"
                      left="32px"
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
                      as="span"
                      pl="72px"
                      pr={6}
                      py={4}
                      position="relative"
                      zIndex={1}
                      transition="color 0.3s ease"
                      _groupHover={{
                        color: "white",
                      }}
                    >
                      GET STARTED
                    </Text>
                  </Button>
                </Box>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default Header;
