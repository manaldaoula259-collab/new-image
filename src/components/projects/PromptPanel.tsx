import BuyShotButton from "@/components/projects/shot/BuyShotButton";
import { getRefinedStudioName } from "@/core/utils/projects";
import useProjectContext from "@/hooks/use-project-context";
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { IShot } from "@/types/models";
import axios from "axios";
import Image from "next/image";
import React from "react";
import { BsLightbulb } from "react-icons/bs";
import { FaCameraRetro } from "react-icons/fa";
import { useMutation } from "react-query";
import PromptsDrawer from "./PromptsDrawer";

const PromptPanel = () => {
  const {
    project,
    shotCredits,
    addShot,
    updateCredits,
    shotTemplate,
    updateShotTemplate,
    promptInputRef,
    updatePromptWizardCredits,
    promptImageUrl,
    setPromptImageUrl,
  } = useProjectContext();

  const { mutate: createPrediction, isLoading: isCreatingPrediction } =
    useMutation(
      "create-prediction",
      (project: any) =>
        axios.post<{ shot: IShot }>(`/api/projects/${project.id}/predictions`, {
          prompt: promptInputRef.current!.value,
          seed: shotTemplate?.seed,
          ...(promptImageUrl && { image: promptImageUrl }),
        }),
      {
        onSuccess: (response) => {
          addShot(response.data.shot);
          promptInputRef.current!.value = "";
          setPromptImageUrl(undefined);
        },
      }
    );

  return (
    <Flex
      as="form"
      flexDirection="column"
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        if (promptInputRef.current!.value) {
          createPrediction(project);
          updateShotTemplate(undefined);
        }
      }}
      borderRadius="2xl"
      p={{ base: 4, sm: 5, md: 7 }}
      mb={{ base: 6, md: 10 }}
      backgroundColor="var(--bg-surface)"
      border="1px solid var(--border-subtle)"
      boxShadow="0 30px 60px rgba(8, 14, 26, 0.55)"
    >
      <Flex alignItems={{ base: "flex-start", sm: "center" }} justifyContent="space-between" flexDirection={{ base: "column", sm: "row" }} gap={{ base: 2, sm: 0 }}>
        <Text fontSize={{ base: "lg", sm: "xl", md: "2xl" }} fontWeight="semibold" lineHeight="1.3">
          Studio <Text as="span" fontWeight="bold">{getRefinedStudioName(project as any)}</Text>{" "}
          <BuyShotButton
            credits={shotCredits}
            onPaymentSuccess={(credits, promptWizardCredits) => {
              updateCredits(credits);
              updatePromptWizardCredits(promptWizardCredits);
            }}
          />
        </Text>
      </Flex>
      <HStack mt={{ base: 3, md: 2 }}>
        <PromptsDrawer />
      </HStack>
      <Flex
        flexDirection={{ base: "column", md: "row" }}
        gap={{ base: 3, md: 2 }}
        my={{ base: 3, md: 4 }}
        width="100%"
      >
        <Box flex="1" width="100%">
          <Input
            size={{ base: "md", md: "lg" }}
            placeholder="Who do you want to be?"
            disabled={shotCredits === 0}
            ref={promptInputRef}
            backgroundColor="var(--bg-surfaceMuted)"
            border="1px solid transparent"
            isRequired
            shadow="0 18px 45px rgba(8, 14, 26, 0.4)"
            focusBorderColor="brand.400"
            color="var(--text-primary)"
            fontSize={{ base: "sm", md: "md" }}
            _placeholder={{ color: "var(--text-muted)", fontSize: { base: "sm", md: "md" } }}
            _focus={{
              shadow: "0 24px 60px rgba(99, 102, 241, 0.25)",
              borderColor: "var(--border-emphasis)",
            }}
            mr={{ base: 0, md: 2 }}
          />
        </Box>
      </Flex>

      <Flex gap={{ base: 3, sm: 2 }} flexDirection={{ base: "column", sm: "row" }}>
        {promptImageUrl && (
          <HStack
            flex="1"
            mx={{ base: 0, md: 3 }}
            my={{ base: 0, md: 3 }}
            alignItems="flex-start"
            position="relative"
            overflow="hidden"
            p={{ base: 2, md: 3 }}
            borderRadius="lg"
            bg="var(--bg-surfaceMuted)"
          >
            <Box borderRadius={5} overflow="hidden" flexShrink={0}>
            <Image
              unoptimized
              alt="prompt"
              src={promptImageUrl}
              width={48}
              height={48}
            />
            </Box>
            <VStack alignItems="flex-start" spacing={2} flex="1" minW={0}>
            <Text fontSize={{ base: "xs", md: "md" }} lineHeight="1.4">
                The new shot will use <Text as="span" fontWeight="bold">this image</Text> as a guide (image to image
              mode)
              </Text>
              <Button
                onClick={() => {
                  setPromptImageUrl(undefined);
                }}
                size={{ base: "xs", md: "sm" }}
                variant="ghostOnDark"
                color="red.300"
              >
                Remove
              </Button>
            </VStack>
          </HStack>
        )}
        {shotTemplate && (
          <HStack
            flex="1"
            mx={{ base: 0, md: 3 }}
            my={{ base: 0, md: 3 }}
            alignItems="flex-start"
            position="relative"
            overflow="hidden"
            p={{ base: 2, md: 3 }}
            borderRadius="lg"
            bg="var(--bg-surfaceMuted)"
          >
            <Box borderRadius={5} overflow="hidden" flexShrink={0}>
            <Image
              placeholder="blur"
              blurDataURL={shotTemplate.blurhash || "placeholder"}
              unoptimized
              alt={shotTemplate.prompt}
              src={shotTemplate.outputUrl!}
              width={48}
              height={48}
            />
            </Box>
            <VStack alignItems="flex-start" spacing={2} flex="1" minW={0}>
            <Text fontSize={{ base: "xs", md: "md" }} lineHeight="1.4">
                The new shot will use <Text as="span" fontWeight="bold">the same style</Text> as this image (same
              seed)
              </Text>
              <Button
                onClick={() => {
                  updateShotTemplate(undefined);
                }}
                size={{ base: "xs", md: "sm" }}
                variant="ghostOnDark"
                color="red.300"
              >
                Remove
              </Button>
            </VStack>
          </HStack>
        )}

        {!shotTemplate && !promptImageUrl && (
          <Box flex="1">
            <VStack alignItems="flex-start">
              <Text color="var(--text-muted)" fontSize={{ base: "xs", md: "sm" }} lineHeight="1.5">
                <Icon as={BsLightbulb} /> Add simple keywords like{" "}
                <Text as="span" fontWeight="bold">a viking, a astronaut, a ski monitor</Text>... And we will do
                the rest!
              </Text>
            </VStack>
          </Box>
        )}
        <Button
          disabled={shotCredits === 0}
          type="submit"
          size={{ base: "md", md: "lg" }}
          variant="brand"
          rightIcon={<FaCameraRetro />}
          isLoading={isCreatingPrediction}
          width={{ base: "100%", sm: "auto" }}
          fontSize={{ base: "sm", md: "md" }}
          minH={{ base: "44px", md: "48px" }}
        >
          {shotCredits === 0 ? "No more shot" : "Shoot"}
        </Button>
      </Flex>
    </Flex>
  );
};

export default PromptPanel;
