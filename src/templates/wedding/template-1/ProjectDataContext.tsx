"use client";

import { createContext, useContext } from "react";
import type { ProjectTemplateData } from "@/lib/template-registry";

type ProjectDataContextValue = {
  projectData: ProjectTemplateData | null;
  isPreview: boolean;
};

const ProjectDataContext = createContext<ProjectDataContextValue | null>(null);

export function ProjectDataProvider({
  projectData,
  isPreview = false,
  children,
}: {
  projectData: ProjectTemplateData | null;
  isPreview?: boolean;
  children: React.ReactNode;
}) {
  return (
    <ProjectDataContext.Provider value={{ projectData, isPreview }}>
      {children}
    </ProjectDataContext.Provider>
  );
}

export function useProjectData() {
  const context = useContext(ProjectDataContext);
  return {
    projectData: context?.projectData ?? null,
    isPreview: context?.isPreview ?? false,
  };
}
