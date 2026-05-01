"use client";

import "./styles/template-1.css";
import TraditionalBackground from "./sections/TraditionalBackground";
import Navbar from "./sections/Navbar";
import MusicPlayer from "./MusicPlayer";
import Footer from "./sections/Footer";

export default function TemplateOneLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="template-one-root min-h-screen font-sans text-gray-800 relative">
      <TraditionalBackground />
      <Navbar />
      <MusicPlayer />
      {children}
      <Footer />
    </div>
  );
}
