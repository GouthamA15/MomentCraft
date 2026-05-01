"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { FaPlay } from "react-icons/fa";
import { Dancing_Script } from "next/font/google";
import { useLanguage } from "./LanguageContext";
import { useProjectData } from "./ProjectDataContext";

const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: "400",
});

const ALBUM_LABELS = {
  en: {
    albumTitle: "Wedding Album",
    subtitle: "A collection of moments we'll cherish for a lifetime.",
    sections: {
      haldi: "Haldi Ceremony",
      mehendi: "Mehendi & Sangeet",
      wedding: "The Wedding",
    },
    captions: {
      haldi: "A splash of sunshine and laughter.",
      mehendi: "Intricate designs and dancing shoes.",
      wedding: "The beginning of our forever.",
    }
  },
  te: {
    albumTitle: "వెడ్డింగ్ ఆల్బమ్",
    subtitle: "మన జీవితంలో చిరస్మరణీయ క్షణాల సమాహారం.",
    sections: {
      haldi: "హల్దీ వేడుక",
      mehendi: "మెహెంది & సంగీత్",
      wedding: "పెళ్లి వేడుక",
    },
    captions: {
      haldi: "సంతోషం మరియు నవ్వుల వెల్లువ.",
      mehendi: "అందమైన డిజైన్లు మరియు నృత్యాలు.",
      wedding: "మా కొత్త జీవితం ప్రారంభం.",
    }
  }
};

const ALBUM_SECTIONS = [
  {
    id: "haldi",
    items: [
      { id: 1, type: "image", url: "https://images.unsplash.com/photo-1595190485102-231908404a3f?q=80&w=800", alt: "Haldi 1" },
      { id: 2, type: "image", url: "https://images.unsplash.com/photo-1595190484518-87425103f6f1?q=80&w=800", alt: "Haldi 2" },
      { id: 3, type: "video", url: "https://assets.mixkit.co/videos/preview/mixkit-indian-wedding-celebration-4122-large.mp4", thumbnail: "https://images.unsplash.com/photo-1595190484518-87425103f6f1?q=80&w=800" },
    ]
  },
  {
    id: "mehendi",
    items: [
      { id: 4, type: "image", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=800", alt: "Mehendi 1" },
      { id: 5, type: "image", url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800", alt: "Sangeet 1" },
    ]
  },
  {
    id: "wedding",
    items: [
      { id: 6, type: "image", url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800", alt: "Wedding 1" },
      { id: 7, type: "video", url: "https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-at-a-traditional-indian-wedding-4123-large.mp4", thumbnail: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800" },
      { id: 8, type: "image", url: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?q=80&w=800", alt: "Wedding 2" },
      { id: 9, type: "image", url: "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800", alt: "Wedding 3" },
    ]
  }
];

const AlbumPage = () => {
  const [isHeroDark, setIsHeroDark] = useState(true);
  const { language } = useLanguage();
  const { projectData, isPreview } = useProjectData();
  const currentLabels = (ALBUM_LABELS as any)[language] ?? ALBUM_LABELS.en;
  const heroImageRef = useRef<HTMLImageElement>(null);

  // Group media by section_key with robust handling
  const mediaBySection = useMemo(() => {
    const grouped: Record<string, ProjectTemplateData["media"]> = {};
    if (!projectData?.media) return grouped;

    projectData.media.forEach((item) => {
      const key = item.section_key;
      if (!key) return;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  }, [projectData?.media]);

  useEffect(() => {
// ... (analyzeImage effect remains same)
    const img = heroImageRef.current;
    if (!img) return;

    const analyzeImage = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(img, 0, 0, 10, 10);
        const imageData = ctx.getImageData(0, 0, 10, 10);
        const data = imageData.data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]; g += data[i + 1]; b += data[i + 2];
        }
        const avgBrightness = (r + g + b) / (data.length / 4 * 3);
        setIsHeroDark(avgBrightness < 128);
      } catch (e) {
        setIsHeroDark(true);
      }
    };

    if (img.complete) analyzeImage(); else img.onload = analyzeImage;
  }, []);

  const titleColor = isHeroDark ? "#fef3c7" : "#3b0012";
  const subtitleColor = isHeroDark ? "rgba(255,251,235,0.8)" : "rgba(59,0,18,0.7)";

  const SECTIONS = [
    { id: "haldi", key: "haldi" },
    { id: "mehendi", key: "mehendi" },
    { id: "wedding", key: "wedding" },
  ];

  return (
    <div className="bg-ivory overflow-x-hidden min-h-screen">
      <main className="relative z-10">
        {/* Full-Screen Hero Section */}
        <section id="hero" className="relative h-screen w-full flex flex-col justify-end pb-20 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <img 
              ref={heroImageRef}
              src="/Album-bg.png" 
              alt="Wedding Album Hero" 
              className="w-full h-full object-cover object-right md:object-center"
              style = {{
                objectPosition: "84% center"
              }}
              crossOrigin="anonymous"
            />
            <div className={`absolute inset-0 transition-colors duration-1000 ${isHeroDark ? 'bg-black/40' : 'bg-white/10'}`}></div>
          </div>

          <div className="relative z-10 px-6 md:px-16 lg:px-20 w-full max-w-7xl mx-auto flex justify-center md:justify-start items-end md:items-start h-full pt-20 md:pt-32 lg:pt-40">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-center md:text-left"
            >
              <h1 
                className={`${dancing.className} text-6xl md:text-8xl lg:text-8xl mb-4 md:mb-6 drop-shadow-2xl transition-colors duration-1000`}
                style={{ color: titleColor }}
              >
                {currentLabels.albumTitle}
              </h1>
              <p 
                className="italic font-light text-sm md:text-xl lg:text-2xl max-w-md md:max-w-xl drop-shadow-lg tracking-wide transition-colors duration-1000"
                style={{ color: subtitleColor }}
              >
                {currentLabels.subtitle}
              </p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6, y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-16 md:translate-x-0 flex flex-col items-center md:items-start gap-2"
            style={{ color: titleColor }}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-serif">Scroll</span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-current to-transparent opacity-50"></div>
          </motion.div>
        </section>

        {/* Album Sections */}
        <div className="relative z-20 space-y-24 md:space-y-40 py-24 md:py-32 bg-ivory">
          {SECTIONS.map((section) => {
            const uploadedItems = mediaBySection[section.key] || [];
            const demoItems = ALBUM_SECTIONS.find(s => s.id === section.key)?.items || [];
            
            // Priority: Uploaded items (if any exist), fallback to Demo items (only if in preview)
            const items = uploadedItems.length > 0 ? uploadedItems : (isPreview ? demoItems : []);
            const hasNoMedia = items.length === 0;

            return (
              <section key={section.id} id={section.id} className="max-w-6xl mx-auto px-4 scroll-mt-24 md:scroll-mt-32">
                <div className="text-center mb-12 md:mb-16">
                  <h2 className={`${dancing.className} text-3xl md:text-5xl lg:text-6xl text-primary mb-3 text-glow`}>
                    {currentLabels.sections[section.id as keyof typeof currentLabels.sections]}
                  </h2>
                  <p className="text-gray-500 italic font-light text-sm md:text-base max-w-md mx-auto">
                    {currentLabels.captions[section.id as keyof typeof currentLabels.captions]}
                  </p>
                  <div className="w-20 h-0.5 bg-gold/40 mx-auto mt-6"></div>
                </div>

                {hasNoMedia ? (
                  <div className="py-20 text-center border-2 border-dashed border-gold/10 rounded-2xl bg-white/50 backdrop-blur-sm shadow-inner">
                    <p className={`${dancing.className} text-2xl md:text-3xl text-gold/60 italic`}>Coming soon...</p>
                    <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">More moments to be captured</p>
                  </div>
                ) : (
                  <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
                    {items.map((item: any) => {
                      const type = item.media_type || item.type;
                      const url = item.media_url || item.url;
                      const thumbnail = item.media_url || item.thumbnail || item.url;
                      const alt = item.alt || "Gallery item";

                      if (!url && !thumbnail) return null;

                      return (
                        <div
                          key={item.id}
                          className="break-inside-avoid mb-6 relative overflow-hidden rounded-xl bg-gray-100 border border-gold/10 shadow-xl transition-transform duration-300 hover:scale-[1.02]"
                        >
                          {type === "video" ? (
                            <div className="relative w-full overflow-hidden">
                              <img 
                                src={thumbnail} 
                                alt="Video thumbnail" 
                                className="w-full h-auto object-cover block"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="w-14 h-14 rounded-full bg-gold/90 text-primary flex items-center justify-center pl-1">
                                  <FaPlay size={20} />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <img 
                              src={url} 
                              alt={alt} 
                              className="w-full h-auto object-cover block"
                              loading="lazy"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AlbumPage;
