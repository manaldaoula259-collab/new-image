import type { IProject } from "@/types/models";

export const getRefinedStudioName = (project: IProject) => {
  if (
    project.instanceName === process.env.NEXT_PUBLIC_REPLICATE_INSTANCE_TOKEN
  ) {
    return project.name;
  }

  return project.instanceName;
};
