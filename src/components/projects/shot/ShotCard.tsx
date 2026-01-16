import {
  AspectRatio,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Icon,
  IconButton,
  Link,
  Spinner,
  Text,
  Tooltip,
  useClipboard,
  VStack,
} from "@chakra-ui/react";
import type { IShot } from "@/types/models";
import axios from "axios";
import { formatRelative } from "date-fns";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import React, { memo, useState } from "react";
import { BsHeart, BsHeartFill } from "react-icons/bs";
import { HiDownload } from "react-icons/hi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { Ri4KFill } from "react-icons/ri";
import { TbFaceIdError } from "react-icons/tb";
import { useMutation, useQuery } from "react-query";

const ShotImage = dynamic(() => import("./ShotImage"));

const getHdLabel = (shot: IShot, isHd: boolean) => {
  if (shot.hdStatus === "NO") {
    return "Generate in 4K";
  }

  if (shot.hdStatus === "PENDING") {
    return "4K in progress";
  }

  if (shot.hdStatus === "PROCESSED" && isHd) {
    return "Show standard resolution";
  }

  return "Show 4K";
};

const ShotCard = ({
  shot: initialShot,
  handleSeed,
}: {
  shot: IShot;
  handleSeed: (shot: IShot) => void;
}) => {
  const { onCopy, hasCopied } = useClipboard(initialShot.prompt);
  const { id: projectId } = useParams() as { id: string };

  const [shot, setShot] = useState(initialShot);
  const [isHd, setIsHd] = useState(Boolean(shot.hdOutputUrl));

  const { mutate: bookmark, isLoading } = useMutation(
    `update-shot-${initialShot.id}`,
    (bookmarked: boolean) =>
      axios.patch<{ shot: IShot }>(
        `/api/projects/${projectId}/predictions/${initialShot.id}`,
        {
          bookmarked,
        }
      ),
    {
      onSuccess: (response) => {
        setShot(response.data.shot);
      },
    }
  );

  const { mutate: createdHd, isLoading: isCreatingHd } = useMutation(
    `create-hd-${initialShot.id}`,
    () =>
      axios.post<{ shot: IShot }>(
        `/api/projects/${projectId}/predictions/${initialShot.id}/hd`
      ),
    {
      onSuccess: (response) => {
        setShot(response.data.shot);
      },
    }
  );

  useQuery(
    `shot-${initialShot.id}`,
    () =>
      axios
        .get<{ shot: IShot }>(
          `/api/projects/${projectId}/predictions/${initialShot.id}`
        )
        .then((res) => res.data),
    {
      refetchInterval: (data) => (data?.shot.outputUrl ? false : 5000),
      refetchOnWindowFocus: false,
      enabled: !initialShot.outputUrl && initialShot.status !== "failed",
      initialData: { shot: initialShot },
      onSuccess: (response) => {
        setShot(response.shot);
      },
    }
  );

  useQuery(
    `shot-hd-${initialShot.id}`,
    () =>
      axios
        .get<{ shot: IShot }>(
          `/api/projects/${projectId}/predictions/${initialShot.id}/hd`
        )
        .then((res) => res.data),
    {
      refetchInterval: (data) =>
        data?.shot.hdStatus !== "PENDING" ? false : 5000,
      refetchOnWindowFocus: false,
      enabled: shot.hdStatus === "PENDING",
      initialData: { shot: initialShot },
      onSuccess: (response) => {
        setShot(response.shot);
        if (response.shot.hdOutputUrl) {
          setIsHd(true);
        }
      },
    }
  );

  return (
    <Box
      overflow="hidden"
      backgroundColor="var(--bg-surface)"
      borderRadius="xl"
      width="100%"
      position="relative"
      border="1px solid var(--border-subtle)"
      boxShadow="0 25px 55px rgba(8, 14, 26, 0.5)"
    >
      {shot.outputUrl ? (
        <ShotImage isHd={isHd} shot={shot} />
      ) : (
        <Box>
          <AspectRatio ratio={1}>
            {shot.status === "failed" ? (
              <Center
                backgroundColor="rgba(185, 28, 28, 0.08)"
                width="100%"
                color="red.300"
              >
                <VStack>
                  <Icon fontSize={{ base: "2xl", md: "3xl" }} as={TbFaceIdError} />
                  <Box fontSize={{ base: "xs", md: "sm" }} color="var(--text-muted)">
                    Shot generation failed
                  </Box>
                </VStack>
              </Center>
            ) : (
              <Center backgroundColor="rgba(100,116,139,0.08)" width="100%">
                <Spinner size={{ base: "lg", md: "xl" }} speed="2s" color="brand.400" />
              </Center>
            )}
          </AspectRatio>
        </Box>
      )}
      <Flex position="relative" p={{ base: 2.5, md: 3 }} flexDirection="column">
        <Flex alignItems="center" justifyContent="flex-end" gap={{ base: 0.5, md: 1 }}>
          <Box display="flex" gap={{ base: 0.5, md: 1 }}>
            {shot.outputUrl && (
              <>
                <IconButton
                  size={{ base: "sm", md: "md" }}
                  as={Link}
                  href={isHd ? shot.hdOutputUrl : shot.outputUrl}
                  target="_blank"
                  variant="ghostOnDark"
                  aria-label="Download"
                  fontSize={{ base: "sm", md: "md" }}
                  icon={<HiDownload />}
                  minW={{ base: "36px", md: "40px" }}
                  minH={{ base: "36px", md: "40px" }}
                />
                {/* @ts-ignore - Chakra UI Tooltip children type inference issue */}
                <Tooltip hasArrow label={getHdLabel(shot, isHd)}>
                  <Box as="span" display="inline-block">
                  <IconButton
                    icon={<Ri4KFill />}
                    color={isHd ? "brand.400" : "var(--text-muted)"}
                    isLoading={shot.hdStatus === "PENDING" || isCreatingHd}
                    onClick={() => {
                      if (shot.hdStatus === "NO") {
                        createdHd();
                      } else if (
                        shot.hdStatus === "PROCESSED" &&
                        shot.hdOutputUrl
                      ) {
                        setIsHd(!isHd);
                      }
                    }}
                    size={{ base: "sm", md: "md" }}
                    variant="ghostOnDark"
                    aria-label="Make 4K"
                    fontSize={{ base: "md", md: "lg" }}
                    minW={{ base: "36px", md: "40px" }}
                    minH={{ base: "36px", md: "40px" }}
                  />
                  </Box>
                </Tooltip>
              </>
            )}

            {/* @ts-ignore - Chakra UI Tooltip children type inference issue */}
            <Tooltip
              hasArrow
              label={`${shot.bookmarked ? "Remove" : "Add"} to your gallery`}
            >
              <Box as="span" display="inline-block">
              <IconButton
                isLoading={isLoading}
                size={{ base: "sm", md: "md" }}
                variant="ghostOnDark"
                aria-label="Bookmark"
                fontSize={{ base: "sm", md: "md" }}
                icon={shot.bookmarked ? <BsHeartFill /> : <BsHeart />}
                onClick={() => bookmark(!shot.bookmarked)}
                pointerEvents={isLoading ? "none" : "auto"}
                color={shot.bookmarked ? "red.300" : "inherit"}
                minW={{ base: "36px", md: "40px" }}
                minH={{ base: "36px", md: "40px" }}
              />
              </Box>
            </Tooltip>
          </Box>
        </Flex>
        <Text
          mt={{ base: 1.5, md: 2 }}
          cursor="text"
          noOfLines={2}
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight="semibold"
          lineHeight="1.4"
        >
          {shot.prompt}
        </Text>

        <HStack justifyContent="space-between" mt={{ base: 3, md: 4 }} flexWrap="wrap" gap={{ base: 2, md: 0 }}>
          <Text color="var(--text-muted)" fontSize={{ base: "2xs", md: "xs" }}>
            {formatRelative(new Date(shot.createdAt), new Date())}
          </Text>
          <Button
            rightIcon={hasCopied ? <IoMdCheckmarkCircleOutline /> : undefined}
            size={{ base: "xs", md: "sm" }}
            variant="ghostOnDark"
            onClick={onCopy}
            fontSize={{ base: "2xs", md: "xs" }}
            px={{ base: 2, md: 3 }}
            minH={{ base: "28px", md: "32px" }}
          >
            {hasCopied ? "Copied" : "Copy prompt"}
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default memo(ShotCard);
