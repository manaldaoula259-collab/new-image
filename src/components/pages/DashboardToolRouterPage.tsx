"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import { dashboardTools } from "@/data/dashboard";
import ToolStudioTemplate from "@/components/pages/tools/ToolStudioTemplate";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
  Badge,
} from "@chakra-ui/react";
import Link from "next/link";
import { FiArrowLeft, FiClock, FiExternalLink, FiTool } from "react-icons/fi";

import StudioGhibliToolPage from "@/components/pages/tools/StudioGhibliToolPage";

type Props = {
  slugPath: string; // e.g. "ai-photo-filter/image-to-prompt" OR "studio-ghibli"
};

const KNOWN_TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  // Premium/custom internal tool pages
  "studio-ghibli": StudioGhibliToolPage,
};

function findToolMetaBySlug(slugPath: string) {
  const normalizedSlug = slugPath.replace(/^\/+/, "");

  return dashboardTools.find((t) => {
    if (t.href.startsWith("/dashboard/tools/")) {
      const s = t.href.replace("/dashboard/tools/", "").replace(/^\/+/, "");
      return s === normalizedSlug;
    }
    const s = t.href.replace(/^\/+/, "");
    return s === normalizedSlug;
  });
}

function ComingSoon({ slugPath }: { slugPath: string }) {
  const meta = findToolMetaBySlug(slugPath);
  const publicHref = meta?.href && !meta.href.startsWith("/dashboard/") ? meta.href : null;

  return (
    <Flex
      minH="calc(100vh - 140px)"
      align="center"
      justify="center"
      px={{ base: 4, md: 8 }}
      py={{ base: 10, md: 14 }}
    >
      <Box
        w="100%"
        maxW="900px"
        bg="white"
        border="1px solid #E5E5E5"
        borderRadius="24px"
        p={{ base: 6, md: 10 }}
        boxShadow="0 8px 40px rgba(0,0,0,0.06)"
      >
        <HStack spacing={3} mb={4}>
          <Box
            w="42px"
            h="42px"
            borderRadius="14px"
            bg="rgba(0,0,0,0.05)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiTool} color="black" />
          </Box>
          <VStack spacing={0} align="start">
            <Text
              fontSize="12px"
              fontFamily="'IBM Plex Mono', monospace"
              color="#71717A"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="0.6px"
            >
              Dashboard Tool
            </Text>
            <Heading
              fontSize={{ base: "24px", md: "32px" }}
              fontFamily="'General Sans', 'Inter', sans-serif"
              fontWeight="600"
              color="black"
              letterSpacing="-0.02em"
            >
              {meta?.title || "Coming soon"}
            </Heading>
          </VStack>
        </HStack>

        {meta?.description && (
          <Text
            fontSize={{ base: "14px", md: "16px" }}
            color="#71717A"
            fontFamily="'General Sans', 'Inter', sans-serif"
            maxW="70ch"
            mb={6}
          >
            {meta.description}
          </Text>
        )}

        <HStack spacing={2} mb={8} flexWrap="wrap">
          <Badge
            bg="rgba(99,102,241,0.14)"
            color="#4F46E5"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="11px"
            fontFamily="'IBM Plex Mono', monospace"
            fontWeight="600"
          >
            <Icon as={FiClock} mr={1} />
            IN PROGRESS
          </Badge>
          {meta?.category && (
            <Badge
              bg="rgba(0,0,0,0.06)"
              color="#52525B"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="11px"
              fontFamily="'IBM Plex Mono', monospace"
              fontWeight="600"
            >
              {meta.category}
            </Badge>
          )}
          <Badge
            bg="rgba(0,0,0,0.06)"
            color="#52525B"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="11px"
            fontFamily="'IBM Plex Mono', monospace"
            fontWeight="600"
          >
            {slugPath ? `/${slugPath}` : "/"}
          </Badge>
        </HStack>

        <HStack spacing={3} flexWrap="wrap">
          <Button
            as={Link}
            href="/dashboard/ai-tools"
            leftIcon={<FiArrowLeft />}
            bg="black"
            color="white"
            borderRadius="14px"
            h="44px"
            px={5}
            fontFamily="'IBM Plex Mono', monospace"
            fontSize="12px"
            fontWeight="600"
            textTransform="uppercase"
            letterSpacing="0.5px"
            _hover={{ bg: "#1a1a1a" }}
          >
            Back to tools
          </Button>
          {publicHref && (
            <Button
              as={Link}
              href={publicHref}
              target="_blank"
              rightIcon={<FiExternalLink />}
              variant="outline"
              borderColor="#E5E5E5"
              borderRadius="14px"
              h="44px"
              px={5}
              fontFamily="'IBM Plex Mono', monospace"
              fontSize="12px"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="0.5px"
              _hover={{ bg: "#F5F5F5" }}
            >
              Open public page
            </Button>
          )}
        </HStack>
      </Box>
    </Flex>
  );
}

export default function DashboardToolRouterPage({ slugPath }: Props) {
  const normalized = (slugPath || "").replace(/^\/+/, "");
  const ToolComponent = normalized ? KNOWN_TOOL_COMPONENTS[normalized] : undefined;
  const meta = normalized ? findToolMetaBySlug(normalized) : undefined;

  return (
    <DashboardShell activeItem="ai-tools">
      {ToolComponent ? (
        <ToolComponent />
      ) : meta ? (
        <ToolStudioTemplate tool={meta} />
      ) : (
        <ComingSoon slugPath={normalized} />
      )}
    </DashboardShell>
  );
}


