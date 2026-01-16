import { getRefinedStudioName } from "@/core/utils/projects";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { formatRelative } from "date-fns";
import Link from "next/link";
import React from "react";
import { HiArrowRight } from "react-icons/hi";
import { IoIosFlash } from "react-icons/io";
import { useMutation } from "react-query";
import { ProjectWithShots } from "../pages/StudioPage";
import FormPayment from "./FormPayment";
import ProjectDeleteButton from "./ProjectDeleteButton";

const ProjectCard = ({
  project,
  handleRefreshProjects,
}: {
  project: ProjectWithShots;
  handleRefreshProjects: () => void;
}) => {
  const {
    mutate: trainModel,
    isLoading: isModelLoading,
    isSuccess,
  } = useMutation(
    `train-model-${project.id}`,
    (project: any) =>
      axios.post(`/api/projects/${project.id}/train`, {
        prompt,
      }),
    {
      onSuccess: () => {
        handleRefreshProjects();
      },
    }
  );

  const isWaitingPayment = !project.stripePaymentId;
  const isWaitingTraining =
    project.stripePaymentId && !project.replicateModelId;

  const isReady = project.modelStatus === "succeeded";
  const isTraining =
    project.modelStatus === "processing" ||
    project.modelStatus === "pushing" ||
    project.modelStatus === "starting" ||
    project.modelStatus === "queued";

  return (
    <Box
      position="relative"
      backgroundColor="var(--bg-surface)"
      width="100%"
      pt={{ base: 3, md: 4 }}
      pb={{ base: 6, md: 10 }}
      px={{ base: 3, sm: 4, md: 5 }}
      borderRadius="2xl"
      border="1px solid var(--border-subtle)"
      boxShadow="0 30px 60px rgba(8, 14, 26, 0.55)"
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        borderRadius: "inherit",
        background:
          "radial-gradient(circle at top right, rgba(99,102,241,0.12) 0, rgba(99,102,241,0) 55%)",
      }}
    >
      <VStack spacing={{ base: 3, md: 4 }} alignItems="flex-start">
        <Flex width="100%" flexDirection={{ base: "column", sm: "row" }} gap={{ base: 2, sm: 0 }}>
          <Box flex="1" minW={0}>
            <Text 
              fontSize={{ base: "lg", sm: "xl", md: "2xl" }} 
              fontWeight="semibold"
              lineHeight="1.3"
            >
              Studio <Text as="span" fontWeight="bold">{getRefinedStudioName(project as any)}</Text>{" "}
              {isReady && (
                <Badge
                  bg="rgba(52, 211, 153, 0.12)"
                  border="1px solid rgba(52, 211, 153, 0.45)"
                  color="emerald.400"
                  borderRadius="full"
                  px={{ base: 2, md: 3 }}
                  py={0.5}
                  fontSize={{ base: "xs", md: "sm" }}
                  backdropFilter="blur(12px)"
                  ml={{ base: 1, md: 2 }}
                  display="inline-block"
                  mt={{ base: 1, md: 0 }}
                >
                  {project.credits} shots left
                </Badge>
              )}
            </Text>
            <Text
              textTransform="capitalize"
              fontSize={{ base: "xs", md: "sm" }}
              color="var(--text-muted)"
              mt={{ base: 0.5, md: 1 }}
            >
              {formatRelative(new Date(project.createdAt), new Date())}
            </Text>
          </Box>
          <ProjectDeleteButton
            handleRemove={() => {
              handleRefreshProjects();
            }}
            projectId={project.id}
          />
        </Flex>

        {isWaitingPayment && (
          <FormPayment
            handlePaymentSuccess={() => {
              handleRefreshProjects();
            }}
            project={project as any}
          />
        )}

        {isWaitingTraining && (
          <>
            <VStack overflow="hidden" width="100%" spacing={{ base: 3, md: 4 }}>
              <Box fontWeight="bold" fontSize={{ base: "md", md: "xl" }} textAlign={{ base: "center", sm: "left" }}>
                Your Studio is ready to be trained!
              </Box>
              {/* @ts-ignore - Chakra UI AvatarGroup children type inference issue */}
              <AvatarGroup size={{ base: "md", md: "lg" }} max={10} justifyContent={{ base: "center", sm: "flex-start" }}>
                {project.imageUrls.map((url) => (
                  <Avatar key={url} src={url} />
                ))}
              </AvatarGroup>
              <Button
                variant="brand"
                rightIcon={<IoIosFlash />}
                isLoading={isModelLoading || isSuccess}
                onClick={() => {
                  trainModel(project);
                }}
                size={{ base: "md", md: "lg" }}
                width={{ base: "100%", sm: "auto" }}
                fontSize={{ base: "sm", md: "md" }}
              >
                Start Training
              </Button>
            </VStack>
          </>
        )}

        {isReady && (
          <Center overflow="hidden" width="100%" marginX="auto">
            <VStack spacing={{ base: 5, md: 7 }}>
              {!project.shots.length ? (
                <VStack spacing={0}>
                  <Text color="var(--text-muted)" fontSize={{ base: "sm", md: "md" }} textAlign="center">
                    {`You don't have any prompt yet.`}
                  </Text>
                  <Text fontWeight="semibold" fontSize={{ base: "sm", md: "md" }} textAlign="center">
                    Go to your studio to add one!
                  </Text>
                </VStack>
              ) : (
                <>
                  {/* @ts-ignore - Chakra UI AvatarGroup children type inference issue */}
                <AvatarGroup size={{ base: "md", sm: "lg", md: "xl" }} max={10} justifyContent="center">
                  {project.shots
                    .filter((shot) => Boolean(shot.outputUrl))
                    .map((shot) => (
                      <Avatar key={shot.outputUrl} src={shot.outputUrl!} />
                    ))}
                </AvatarGroup>
                </>
              )}
              <Button
                rightIcon={<HiArrowRight />}
                variant="brand"
                href={`/studio/${project.id}`}
                as={Link}
                size={{ base: "md", md: "lg" }}
                width={{ base: "100%", sm: "auto" }}
                fontSize={{ base: "sm", md: "md" }}
                px={{ base: 6, md: 8 }}
              >
                View my Studio
              </Button>
            </VStack>
          </Center>
        )}
      </VStack>

      {isTraining && (
        <Center marginX="auto">
          <VStack spacing={{ base: 5, md: 7 }}>
            <Spinner size={{ base: "lg", md: "xl" }} speed="2s" />
            <Text textAlign="center" maxW={{ base: "100%", md: "20rem" }} color="var(--text-muted)" fontSize={{ base: "sm", md: "md" }} px={{ base: 2, md: 0 }}>
              The studio is creating{" "}
              <Text as="span" fontWeight="bold">the custom model based on your uploaded photos</Text>. This
              operation usually takes ~20min.
            </Text>
          </VStack>
        </Center>
      )}

      {project.modelStatus === "failed" && (
        <Center marginX="auto">
          <Text my={{ base: 6, md: 10 }} color="red.400" textAlign="center" fontSize={{ base: "sm", md: "md" }} px={{ base: 3, md: 0 }}>
            We are sorry but the creation of the model failed. Please contact us
            by email so we can fix it/refund you.
          </Text>
        </Center>
      )}
    </Box>
  );
};

export default ProjectCard;
