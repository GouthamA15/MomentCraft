"use client";

import { FaWhatsapp, FaMusic, FaPause } from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import { useProjectData } from "./ProjectDataContext";
import { formatDisplayDate } from "@/lib/utils/date-format";

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { defaults, getField } = useLanguage();
  const projectData = useProjectData();

  const groomName = getField("groom_name") || defaults?.couple?.groom || "";
  const brideName = getField("bride_name") || defaults?.couple?.bride || "";
  const venue = getField("venue_name") || defaults?.events?.[0]?.venue || "";
  const dateLabel = projectData?.project.event_date
    ? formatDisplayDate(projectData.project.event_date, "dd MMM yyyy")
    : defaults?.events?.[0]?.date || "";

  const musicUrl =
    projectData?.project.background_music ||
    projectData?.assets.find((a) => a.asset_type === "background_music")?.file_url ||
    "/Dheeni Premantara - Hesham Abdul Wahab (192k).mp3.mpeg";

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = musicUrl;

      const playAudio = async () => {
        try {
          await audioRef.current?.play();
          setIsPlaying(true);
        } catch {
          const handleFirstInteraction = async () => {
            if (audioRef.current && !isPlaying) {
              try {
                await audioRef.current.play();
                setIsPlaying(true);
                document.removeEventListener("click", handleFirstInteraction);
                document.removeEventListener("touchstart", handleFirstInteraction);
              } catch {}
            }
          };

          document.addEventListener("click", handleFirstInteraction);
          document.addEventListener("touchstart", handleFirstInteraction);
        }
      };

      void playAudio();
    }
  }, [musicUrl]);

  const toggleAudio = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const shareText = encodeURIComponent(`With hearts full of love and joy,
we invite you to witness the union of
${groomName} & ${brideName}

As they promise a lifetime together,
please join us in celebrating their special day.

${dateLabel}${venue ? ` • ${venue}` : ""}

We look forward to sharing this beautiful moment with you.: ${currentUrl}`);
  const whatsappUrl = `https://wa.me/?text=${shareText}`;

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-40 flex flex-col gap-4 scale-90 md:scale-100 origin-bottom-right">
      <button
        onClick={toggleAudio}
        className="bg-gold text-primary p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        aria-label="Toggle traditional music"
      >
        {isPlaying ? <FaPause size={20} /> : <FaMusic size={20} />}
      </button>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
        aria-label="Share via WhatsApp"
      >
        <FaWhatsapp size={24} />
      </a>

      <audio ref={audioRef} autoPlay loop />
    </div>
  );
};

export default MusicPlayer;
