import TemplateOne from "@/templates/wedding/template-1";
import InvitationPage from "@/templates/wedding/template-1/InvitationPage";
import { LanguageProvider } from "@/templates/wedding/template-1/LanguageContext";
import { ProjectDataProvider } from "@/templates/wedding/template-1/ProjectDataContext";

export default function TemplateOnePreviewPage() {
  return (
    <LanguageProvider projectData={null}>
      <ProjectDataProvider projectData={null} isPreview>
        <TemplateOne>
          <InvitationPage />
        </TemplateOne>
      </ProjectDataProvider>
    </LanguageProvider>
  );
}
