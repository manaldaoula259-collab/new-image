"use client";

import PageContainer from "@/components/layout/PageContainer";
import { Box, SimpleGrid } from "@chakra-ui/react";
import Image from "next/image";

const GalleryPage = ({
  shots,
}: {
  shots: { blurhash: string | null; outputUrl: string | null }[];
}) => {
  return (
    <PageContainer>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
        {shots.map((shot) => (
          <Box
            key={shot.outputUrl}
            overflow="hidden"
            backgroundColor="var(--bg-surface)"
            borderRadius="2xl"
            width="100%"
            position="relative"
            border="1px solid var(--border-subtle)"
            boxShadow="0 24px 60px rgba(8, 14, 26, 0.55)"
          >
            <Image
              placeholder="blur"
              blurDataURL={shot.blurhash || "placeholder"}
              quality={100}
              alt={shot.outputUrl!}
              src={shot.outputUrl!}
              width={512}
              height={512}
              unoptimized
            />
          </Box>
        ))}
      </SimpleGrid>
      {shots.length === 0 && (
        <Box
          borderRadius="2xl"
          p={10}
          backgroundColor="var(--bg-surface)"
          textAlign="center"
          border="1px solid var(--border-subtle)"
          color="var(--text-muted)"
          boxShadow="0 24px 60px rgba(8, 14, 26, 0.45)"
        >
          No shots in this gallery
        </Box>
      )}
    </PageContainer>
  );
};

export default GalleryPage;
