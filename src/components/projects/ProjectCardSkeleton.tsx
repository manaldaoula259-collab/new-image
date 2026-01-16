import { Box, Flex, Skeleton, SkeletonText, VStack } from "@chakra-ui/react";

const ProjectCardSkeleton = () => (
  <Box
    backgroundColor="var(--bg-surface)"
    width="100%"
    pt={4}
    pb={10}
    px={5}
    borderRadius="2xl"
    border="1px solid var(--border-subtle)"
    boxShadow="0 30px 60px rgba(8, 14, 26, 0.45)"
  >
    <VStack spacing={4} alignItems="flex-start">
      <Flex width="100%">
        <Box flex="1">
          <Skeleton
            mb={2}
            height="25px"
            maxWidth="10rem"
            startColor="rgba(148,163,184,0.25)"
            endColor="rgba(148,163,184,0.08)"
          />
          <Skeleton
            height="15px"
            maxWidth="6rem"
            startColor="rgba(148,163,184,0.25)"
            endColor="rgba(148,163,184,0.08)"
          />
        </Box>
      </Flex>
      <Box width="100%" maxWidth="20rem">
        <SkeletonText
          mt="4"
          noOfLines={3}
          spacing="4"
          skeletonHeight="3"
          startColor="rgba(148,163,184,0.25)"
          endColor="rgba(148,163,184,0.08)"
        />
      </Box>
    </VStack>
  </Box>
);

export default ProjectCardSkeleton;
