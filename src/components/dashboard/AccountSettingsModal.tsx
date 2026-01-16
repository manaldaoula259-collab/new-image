"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Box,
  Text,
  VStack,
  HStack,
  Avatar,
  Divider,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { useUser } from "@clerk/nextjs";
import { FiUser, FiMail, FiCalendar, FiShield, FiExternalLink } from "react-icons/fi";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const { user } = useUser();
  const toast = useToast();



  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="rgba(0, 0, 0, 0.4)" backdropFilter="blur(4px)" />
      <ModalContent
        borderRadius="20px"
        bg="white"
        mx={4}
        overflow="hidden"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.15)"
      >
        {/* Header with gradient */}
        <Box
          bg="linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)"
          pt={8}
          pb={12}
          px={6}
          position="relative"
        >
          <ModalCloseButton
            color="white"
            top={4}
            right={4}
            _hover={{ bg: "rgba(255,255,255,0.2)" }}
          />
          <Text
            fontSize="11px"
            fontWeight="600"
            color="rgba(255,255,255,0.8)"
            textTransform="uppercase"
            letterSpacing="1px"
            fontFamily="'IBM Plex Mono', monospace"
          >
            Account Settings
          </Text>
          <Text
            fontSize="24px"
            fontWeight="600"
            color="white"
            mt={1}
            fontFamily="'General Sans', 'Inter', sans-serif"
          >
            Your Profile
          </Text>
        </Box>

        {/* Avatar overlapping header */}
        <Flex justify="center" mt="-50px" position="relative" zIndex={1}>
          <Box
            p={1}
            borderRadius="full"
            bg="white"
            boxShadow="0 4px 20px rgba(0,0,0,0.1)"
          >
            <Avatar
              size="xl"
              name={user?.firstName || "User"}
              src={user?.imageUrl}
              bg="linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
            />
          </Box>
        </Flex>

        <ModalBody px={6} pt={4} pb={6}>
          {/* User Name */}
          <Text
            textAlign="center"
            fontSize="20px"
            fontWeight="600"
            color="black"
            fontFamily="'General Sans', 'Inter', sans-serif"
          >
            {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "User"}
          </Text>
          <Text
            textAlign="center"
            fontSize="13px"
            color="#71717A"
            fontFamily="'General Sans', 'Inter', sans-serif"
            mb={6}
          >
            {user?.emailAddresses?.[0]?.emailAddress}
          </Text>

          {/* Account Details */}
          <VStack spacing={3} align="stretch">
            {/* Full Name */}
            <Box
              bg="#F9FAFB"
              borderRadius="12px"
              p={4}
              border="1px solid #E5E5E5"
            >
              <HStack spacing={3}>
                <Flex
                  w="40px"
                  h="40px"
                  bg="white"
                  borderRadius="10px"
                  align="center"
                  justify="center"
                  border="1px solid #E5E5E5"
                >
                  <Icon as={FiUser} fontSize="18px" color="#6366f1" />
                </Flex>
                <Box flex={1}>
                  <Text
                    fontSize="11px"
                    color="#71717A"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    fontFamily="'IBM Plex Mono', monospace"
                  >
                    Full Name
                  </Text>
                  <Text
                    fontSize="14px"
                    fontWeight="500"
                    color="black"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                  >
                    {user?.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "Not set"}
                  </Text>
                </Box>
              </HStack>
            </Box>

            {/* Email */}
            <Box
              bg="#F9FAFB"
              borderRadius="12px"
              p={4}
              border="1px solid #E5E5E5"
            >
              <HStack spacing={3}>
                <Flex
                  w="40px"
                  h="40px"
                  bg="white"
                  borderRadius="10px"
                  align="center"
                  justify="center"
                  border="1px solid #E5E5E5"
                >
                  <Icon as={FiMail} fontSize="18px" color="#6366f1" />
                </Flex>
                <Box flex={1}>
                  <Text
                    fontSize="11px"
                    color="#71717A"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    fontFamily="'IBM Plex Mono', monospace"
                  >
                    Email Address
                  </Text>
                  <Text
                    fontSize="14px"
                    fontWeight="500"
                    color="black"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                  >
                    {user?.emailAddresses?.[0]?.emailAddress || "Not set"}
                  </Text>
                </Box>
                {user?.emailAddresses?.[0]?.verification?.status === "verified" && (
                  <Box
                    bg="#DCFCE7"
                    color="#16A34A"
                    fontSize="10px"
                    fontWeight="600"
                    px={2}
                    py={1}
                    borderRadius="full"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                  >
                    Verified
                  </Box>
                )}
              </HStack>
            </Box>

            {/* Member Since */}
            <Box
              bg="#F9FAFB"
              borderRadius="12px"
              p={4}
              border="1px solid #E5E5E5"
            >
              <HStack spacing={3}>
                <Flex
                  w="40px"
                  h="40px"
                  bg="white"
                  borderRadius="10px"
                  align="center"
                  justify="center"
                  border="1px solid #E5E5E5"
                >
                  <Icon as={FiCalendar} fontSize="18px" color="#6366f1" />
                </Flex>
                <Box flex={1}>
                  <Text
                    fontSize="11px"
                    color="#71717A"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    fontFamily="'IBM Plex Mono', monospace"
                  >
                    Member Since
                  </Text>
                  <Text
                    fontSize="14px"
                    fontWeight="500"
                    color="black"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                  >
                    {formatDate(user?.createdAt)}
                  </Text>
                </Box>
              </HStack>
            </Box>

            {/* Security Status */}
            <Box
              bg="#F9FAFB"
              borderRadius="12px"
              p={4}
              border="1px solid #E5E5E5"
            >
              <HStack spacing={3}>
                <Flex
                  w="40px"
                  h="40px"
                  bg="white"
                  borderRadius="10px"
                  align="center"
                  justify="center"
                  border="1px solid #E5E5E5"
                >
                  <Icon as={FiShield} fontSize="18px" color="#6366f1" />
                </Flex>
                <Box flex={1}>
                  <Text
                    fontSize="11px"
                    color="#71717A"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    fontFamily="'IBM Plex Mono', monospace"
                  >
                    Account Security
                  </Text>
                  <Text
                    fontSize="14px"
                    fontWeight="500"
                    color="black"
                    fontFamily="'General Sans', 'Inter', sans-serif"
                  >
                    {user?.twoFactorEnabled ? "2FA Enabled" : "Standard Protection"}
                  </Text>
                </Box>
              </HStack>
            </Box>
          </VStack>


        </ModalBody>
      </ModalContent>
    </Modal>
  );
}



