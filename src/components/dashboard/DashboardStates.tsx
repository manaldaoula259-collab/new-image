"use client";

import { Center, CenterProps, Spinner, Icon, VStack, Text, Flex } from "@chakra-ui/react";
import { FiInbox, FiImage } from "react-icons/fi";

interface DashboardStateProps extends CenterProps {
  label: string;
}

export const DashboardLoadingState = ({
  label,
  minH = "160px",
  ...centerProps
}: DashboardStateProps) => (
  <Center
    minH={minH}
    borderRadius="16px"
    bg="#F9FAFB"
    border="1px solid #E5E5E5"
    {...centerProps}
  >
    <VStack spacing={3}>
      <Flex
        w="48px"
        h="48px"
        borderRadius="12px"
        bg="white"
        border="1px solid #E5E5E5"
        align="center"
        justify="center"
      >
        <Spinner size="md" color="#6366f1" thickness="2px" />
      </Flex>
      <Text fontSize="13px" color="#52525B" fontWeight="500" fontFamily="'General Sans', 'Inter', sans-serif">
        {label}
      </Text>
    </VStack>
  </Center>
);

export const DashboardEmptyState = ({
  label,
  minH = "160px",
  ...centerProps
}: DashboardStateProps) => (
  <Center
    minH={minH}
    borderRadius="16px"
    bg="#F9FAFB"
    border="1px solid #E5E5E5"
    {...centerProps}
  >
    <VStack spacing={3}>
      <Flex
        w="52px"
        h="52px"
        borderRadius="14px"
        bg="white"
        border="1px solid #E5E5E5"
        align="center"
        justify="center"
      >
        <Icon as={FiImage} fontSize="22px" color="#6366f1" />
      </Flex>
      <Text fontSize="13px" color="#52525B" fontWeight="500" textAlign="center" maxW="280px" lineHeight="1.5" fontFamily="'General Sans', 'Inter', sans-serif">
        {label}
      </Text>
    </VStack>
  </Center>
);
