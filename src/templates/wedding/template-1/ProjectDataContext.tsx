"use client";

import { createContext, useContext } from "react";
import type { ProjectTemplateData } from "@/lib/template-registry";

type ProjectDataContextValue = {
  projectData: ProjectTemplateData | null;
};

const ProjectDataContext = createContext<ProjectDataContextValue | null>(null);

export function ProjectDataProvider({
  projectData,
  children,
}: {
  projectData: ProjectTemplateData | null;
  children: React.ReactNode;
}) {
  return (
    <ProjectDataContext.Provider value={{ projectData }}>
      {children}
    </ProjectDataContext.Provider>
  );
}

export function useProjectData() {
  return useContext(ProjectDataContext)?.projectData ?? null;
}
