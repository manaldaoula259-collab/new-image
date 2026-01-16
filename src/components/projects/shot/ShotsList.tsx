import React from "react";
import ShotCard from "@/components/projects/shot/ShotCard";
import useProjectContext from "@/hooks/use-project-context";
import { Box, Button, SimpleGrid } from "@chakra-ui/react";
import type { IShot } from "@/types/models";

const ShotsList = () => {
  const {
    shots,
    hasMoreResult,
    isLoadingMore,
    updateShotTemplate,
    fetchShots,
  } = useProjectContext();

  return (
    <>
      {shots.length === 0 ? (
        <Box textAlign="center" fontSize={{ base: "md", md: "lg" }} px={{ base: 2, md: 0 }}>
          {`You don't have any prompt yet. It's time to be creative!`}
        </Box>
      ) : (
        <>
          <SimpleGrid
            columns={{ base: 1, sm: 2, md: 3 }}
            spacing={{ base: 4, sm: 6, md: 10 }}
            alignItems="flex-start"
          >
            {shots.map((shot: IShot) => (
              <ShotCard
                // @ts-ignore - key is a special React prop, not part of component props
                key={shot.id}
                shot={shot}
                handleSeed={(updatedShot) => {
                  updateShotTemplate(updatedShot);
                }}
              />
            ))}
          </SimpleGrid>

          {hasMoreResult && (
            <Box mt={{ base: 6, md: 8 }} textAlign="center" width="100%">
              <Button
                isLoading={isLoadingMore}
                variant="brand"
                onClick={() => {
                  fetchShots();
                }}
                size={{ base: "md", md: "lg" }}
                width={{ base: "100%", sm: "auto" }}
                fontSize={{ base: "sm", md: "md" }}
                px={{ base: 6, md: 8 }}
              >
                Load more
              </Button>
            </Box>
          )}
        </>
      )}
    </>
  );
};

export default ShotsList;
