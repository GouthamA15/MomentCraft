"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlay, FaBars, FaTimes } from "react-icons/fa";
import Link from "next/link";
import { Dancing_Script } from "next/font/google";
import { useLanguage } from "./LanguageContext";
import { useProjectData } from "./ProjectDataContext";
import TraditionalBackground from "./sections/TraditionalBackground";
import MusicPlayer from "./MusicPlayer";
import Footer from "./sections/Footer";

const dancingScript = Dancing_Script({ subsets: ["latin"], weight: ["400"], display: "swap" });

const ALBUM_LABELS = {
  en: {
    albumTitle: "Wedding Album",
    subtitle: "A collection of moments we'll cherish for a lifetime.",
    nav: {
      home: "Home",
      haldi: "Haldi",
      mehendi: "Mehendi & Sangeet",
      wedding: "Wedding",
    },
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
    nav: {
      home: "హోమ్",
      haldi: "హల్దీ",
      mehendi: "మెహెంది",
      wedding: "పెళ్లి",
    },
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
  const [albumLang, setAlbumLang] = useState<"en" | "te">("en");
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHeroDark, setIsHeroDark] = useState(true);
  const { projectData, isPreview } = useProjectData();
  const slug = projectData?.project?.slug;
  const currentLabels = ALBUM_LABELS[albumLang];
  const heroImageRef = useRef<HTMLImageElement>(null);

  const backHref = isPreview 
    ? (projectData?.project?.id 
        ? `/dashboard/projects/preview/${projectData?.project?.id}` 
        : `/dashboard/templates/preview/wedding_classic`)
    : `/site/${slug}`;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
    setIsOpen(false);
  };

  const toggleLanguage = () => setAlbumLang(prev => (prev === "en" ? "te" : "en"));

  // Navbar Logic mirroring Template-1 Navbar.tsx exactly
  let navBg = "bg-transparent py-5";
  let textStyle = isHeroDark ? "text-gold drop-shadow-md" : "text-primary drop-shadow-sm";
  let btnStyle = isHeroDark 
    ? "border-gold text-gold bg-white/10 hover:bg-gold hover:text-primary backdrop-blur-sm shadow-sm"
    : "border-primary text-primary bg-black/5 hover:bg-primary hover:text-ivory backdrop-blur-sm shadow-sm";

  if (scrolled) {
    navBg = "bg-ivory border-b border-gold/30 shadow-md py-3";
    textStyle = "text-primary";
    btnStyle = "border-primary text-primary hover:bg-primary hover:text-ivory";
  }

  const titleColor = isHeroDark ? "#fef3c7" : "#3b0012";
  const subtitleColor = isHeroDark ? "rgba(255,251,235,0.8)" : "rgba(59,0,18,0.7)";

  const navLinks = [
    { name: currentLabels.nav.home, id: "home", href: backHref },
    { name: currentLabels.nav.haldi, id: "haldi" },
    { name: currentLabels.nav.mehendi, id: "mehendi" },
    { name: currentLabels.nav.wedding, id: "wedding" },
  ];

  return (
    <div className="template-one-root min-h-screen font-sans text-gray-800 relative bg-ivory overflow-x-hidden">
      <TraditionalBackground />
      <MusicPlayer />

      {/* Identical Structural Re-use from Navbar.tsx */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            
            {/* Desktop Center Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href={backHref}
                className={`cursor-pointer font-medium hover:scale-105 transition-all duration-300 ${textStyle}`}
              >
                {currentLabels.nav.home}
              </Link>
              
              {navLinks.slice(1).map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className={`cursor-pointer font-medium hover:scale-105 transition-all duration-300 ${textStyle}`}
                >
                  {link.name}
                </button>
              ))}

              <button
                onClick={toggleLanguage}
                className={`px-4 py-1.5 rounded-full border-2 font-medium transition-colors duration-500 ${btnStyle}`}
              >
                {albumLang === "en" ? "తెలుగు" : "ENGLISH"}
              </button>
            </div>

            {/* Mobile Header: Matches Template-1 mobile pattern */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={toggleLanguage}
                className={`px-3 py-1 rounded-full border-2 text-sm font-medium transition-colors ${btnStyle}`}
              >
                {albumLang === "en" ? "తెలుగు" : "English"}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${textStyle} hover:scale-110 transition-transform focus:outline-none`}
              >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu: Identical Style to Invitation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden bg-primary shadow-xl absolute w-full left-0 top-full border-t border-gold/30 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(59, 0, 18, 0.95) 0%, rgba(75, 0, 21, 0.95) 50%, rgba(59, 0, 18, 0.95) 100%)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="px-4 pt-4 pb-8 space-y-2 flex flex-col items-center">
                <Link
                  href={backHref}
                  className="cursor-pointer block px-3 py-4 text-lg font-serif font-medium text-amber-100 hover:text-gold transition-colors border-b border-gold/10 w-full text-center tracking-wider uppercase drop-shadow-md"
                >
                  {currentLabels.nav.home}
                </Link>
                {navLinks.slice(1).map((link, index) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                    className="w-full"
                  >
                    <button
                      onClick={() => scrollToSection(link.id)}
                      className="cursor-pointer block px-3 py-4 text-lg font-serif font-medium text-amber-100 hover:text-gold transition-colors border-b border-gold/10 w-full text-center tracking-wider uppercase drop-shadow-md"
                    >
                      {link.name}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>
        {/* Full-Screen Hero Section */}
        <section id="hero" className="relative h-screen w-full flex flex-col justify-end pb-20 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
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
                className="font-dancing-script text-6xl md:text-8xl lg:text-8xl mb-4 md:mb-6 drop-shadow-2xl transition-colors duration-1000"
                style={{ color: titleColor }}
              >
                {currentLabels.albumTitle}
              </h1>
              <p 
                // className={`${dancingScript.className} text-6xl md:text-8xl lg:text-9xl mb-4 md:mb-6 drop-shadow-2xl transition-colors duration-1000`}
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
        <div className="space-y-24 md:space-y-40 py-24 md:py-32">
          {ALBUM_SECTIONS.map((section) => (
            <section key={section.id} id={section.id} className="max-w-6xl mx-auto px-4 scroll-mt-24 md:scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12 md:mb-16"
              >
                <h2 className="font-dancing-script text-3xl md:text-5xl lg:text-6xl text-primary mb-3 text-glow">
                  {currentLabels.sections[section.id as keyof typeof currentLabels.sections]}
                </h2>
                <p className="text-gray-500 italic font-light text-sm md:text-base max-w-md mx-auto">
                  {currentLabels.captions[section.id as keyof typeof currentLabels.captions]}
                </p>
                <div className="w-20 h-0.5 bg-gold/40 mx-auto mt-6"></div>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                {section.items.map((item, itemIdx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: itemIdx * 0.1 }}
                    className="aspect-[3/4] bg-white rounded-xl shadow-2xl border border-gold/10 overflow-hidden relative group"
                  >
                    {item.type === "image" ? (
                      <img 
                        src={item.url} 
                        alt={item.alt || ""} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="relative w-full h-full overflow-hidden">
                        <img 
                          src={item.thumbnail} 
                          alt="Video thumbnail" 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-colors duration-500">
                          <div className="w-14 h-14 rounded-full bg-gold/90 text-primary flex items-center justify-center pl-1 shadow-[0_0_20px_rgba(212,175,55,0.4)] group-hover:scale-110 group-hover:bg-gold transition-all duration-300">
                            <FaPlay size={20} />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 pointer-events-none p-4">
                      <div className="absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-gold/30 rounded-tl-xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0"></div>
                      <div className="absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-gold/30 rounded-br-xl opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AlbumPage;
