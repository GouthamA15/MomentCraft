"use client";

import "./styles/template-1.css";
import { LanguageProvider } from "./LanguageContext";
import { ProjectDataProvider } from "./ProjectDataContext";
import Navbar from "./sections/Navbar";
import HeroSection from "./sections/HeroSection";
import InvitationSection from "./sections/InvitationSection";
import OurStorySection from "./sections/OurStorySection";
import EventsSection from "./sections/EventsSection";
import Footer from "./sections/Footer";
import TraditionalBackground from "./sections/TraditionalBackground";
import MusicPlayer from "./MusicPlayer";
import type { TemplateRenderProps } from "@/lib/template-registry";

export default function TemplateOne({ projectData }: TemplateRenderProps) {
  return (
    <LanguageProvider projectData={projectData ?? null}>
      <ProjectDataProvider projectData={projectData ?? null}>
        <div className="template-one-root min-h-screen font-sans text-gray-800 relative">
          <TraditionalBackground />
          <Navbar />
          <MusicPlayer />
          <main>
            <HeroSection />
            <InvitationSection />
            <OurStorySection />
            <EventsSection />
          </main>
          <Footer />
        </div>
      </ProjectDataProvider>
    </LanguageProvider>
  );
}
