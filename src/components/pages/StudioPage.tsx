"use client";

import PageContainer from "@/components/layout/PageContainer";
import PromptPanel from "@/components/projects/PromptPanel";
import ShotsList from "@/components/projects/shot/ShotsList";
import ProjectProvider from "@/contexts/project-context";
import { Box, Button } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { HiArrowLeft } from "react-icons/hi";
import type { IProject } from "@/types/models";
import type { IShot } from "@/types/models";

export type ProjectWithShots = IProject & {
  shots: IShot[];
};

export interface IStudioPageProps {
  project: ProjectWithShots & { _count: { shots: number } };
}

const StudioPage = ({ project }: IStudioPageProps) => {
  return (
    // @ts-ignore - TypeScript can't infer children from JSX syntax, but ESLint requires it
  <ProjectProvider project={project}>
    <PageContainer>
      <Box mb={{ base: 3, md: 4 }}>
        <Button
          leftIcon={<HiArrowLeft />}
          variant="ghostOnDark"
          border="1px solid var(--border-subtle)"
          href="/dashboard"
          as={Link}
          size={{ base: "sm", md: "md" }}
          fontSize={{ base: "sm", md: "md" }}
          px={{ base: 3, md: 4 }}
        >
          Back to Dashboard
        </Button>
      </Box>
      <PromptPanel />
      <ShotsList />
    </PageContainer>
  </ProjectProvider>
);
};

export default StudioPage;
