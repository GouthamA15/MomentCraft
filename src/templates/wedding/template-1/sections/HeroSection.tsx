"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaHeart } from "react-icons/fa";
import { useLanguage } from "../LanguageContext";
import { useProjectData } from "../ProjectDataContext";
import Link from "next/link";
import { Dancing_Script } from "next/font/google";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

type FloatingHeart = {
// ... (rest of types and component start)
  id: number;
  left: string;
  top: string;
  delay: number;
  duration: number;
  scale: number;
  yOffset: number;
};

const HeroSection = () => {
  const { labels, defaults, getField } = useLanguage();
  const { projectData, isPreview } = useProjectData();

  const groomName = getField("groom_name") || defaults?.couple?.groom || "";
  const brideName = getField("bride_name") || defaults?.couple?.bride || "";
  const weddingDateSource = projectData?.project?.event_date
    ? `${projectData?.project?.event_date}T00:00:00`
    : defaults?.weddingDate;
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  useEffect(() => {
    // Generate after mount to avoid SSR/client hydration mismatch.
    setHearts(
      [...Array(20)].map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
        scale: Math.random() * 0.5 + 0.5,
        yOffset: Math.random() * 100 + 50,
      })),
    );
  }, []);

  useEffect(() => {
    const targetDate = new Date(weddingDateSource).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [weddingDateSource]);

  const albumHref = isPreview 
    ? (projectData?.project?.id 
        ? `/dashboard/projects/preview/${projectData?.project?.id}/album` 
        : `/dashboard/templates/preview/wedding_classic/album`)
    : `/site/${projectData?.project?.slug}/album`;

  return (
    <section
      id="home"
      className="relative h-screen flex flex-col justify-center items-center text-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #3b0012 0%, #4b0015 50%, #3b0012 100%)",
      }}
    >
      <div className="absolute top-0 left-0 w-40 md:w-80 h-34 md:h-80 pointer-events-none z-5 opacity-85">
        <img src="/frame1-top.PNG" alt="Left Floral Frame" className="w-full h-full object-contain" />
      </div>

      <div className="absolute top-0 right-0 w-40 md:w-80 h-34 md:h-80 pointer-events-none z-5 opacity-85">
        <img src="/frame2-top.PNG" alt="Right Floral Frame" className="w-full h-full object-contain" />
      </div>

      <div className="absolute bottom-0 left-0 w-40 md:w-80 h-34 md:h-80 pointer-events-none z-5 opacity-85">
        <img src="/frame1.PNG" alt="Bottom Left Floral Frame" className="w-full h-full object-contain" />
      </div>

      <div className="absolute bottom-0 right-0 w-40 md:w-80 h-34 md:h-80 pointer-events-none z-5 opacity-85">
        <img src="/frame2.PNG" alt="Bottom Right Floral Frame" className="w-full h-full object-contain" />
      </div>

      <div className="absolute inset-0 bg-mandala-pattern opacity-5 pointer-events-none"></div>

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {hearts.map((heart) => (
          <motion.div
            key={`heart-${heart.id}`}
            className="absolute text-amber-600/30"
            style={{
              left: heart.left,
              top: heart.top,
            }}
            initial={{ scale: 0, opacity: 0, y: 0 }}
            animate={{
              scale: [0, heart.scale, 0],
              opacity: [0, 0.6, 0],
              y: [0, -heart.yOffset],
            }}
            transition={{
              duration: heart.duration,
              repeat: Infinity,
              delay: heart.delay,
              ease: "easeInOut",
            }}
          >
            <FaHeart className="w-6 h-6 md:w-10 md:h-10" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="z-10 px-4 flex flex-col items-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-1"
        >
          <img src="/Ganesha-ICON.png" alt="Ganesha Icon" className="w-28 md:w-48 h-28 md:h-48 drop-shadow-lg" />
        </motion.div>

        <p className="text-amber-300 font-medium tracking-widest uppercase mb-2 md:mb-3 text-xs md:text-sm drop-shadow-md">
          {getField("title")}
        </p>

        <motion.h1
          className={`${dancingScript.className} text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-4 md:mb-6 drop-shadow-lg leading-tight py-2`}
          style={{ color: "#f5e6b3" }}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 1 },
            visible: {
              opacity: 1,
              transition: {
                delay: 0.4,
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {groomName.split("").map((char: string, index: number) => (
            <motion.span key={`groom-${index}`} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              {char}
            </motion.span>
          ))}
          <motion.span
            variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1 } }}
            className="text-gold mx-1 md:mx-2 lg:mx-3 inline-block origin-bottom"
          >
            &
          </motion.span>
          {brideName.split("").map((char: string, index: number) => (
            <motion.span key={`bride-${index}`} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              {char}
            </motion.span>
          ))}
        </motion.h1>

        <p className="text-amber-100 italic max-w-md md:max-w-lg mx-auto mb-8 md:mb-10 text-sm md:text-base drop-shadow-md" style={{ color: "#e8d9b5" }}>
          {getField("subtitle")}
        </p>

        <div className="flex justify-center gap-1.5 sm:gap-3 md:gap-4">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div
              key={unit}
              className="flex flex-col items-center p-1.5 md:p-3 border-2 rounded-xl md:rounded-2xl shadow-2xl min-w-[42px] sm:min-w-[55px] md:min-w-[75px]"
              style={{
                borderColor: "#d4af37",
                backgroundColor: "rgba(139, 69, 19, 0.3)",
                backdropFilter: "blur(10px)",
              }}
            >
              <span className="text-lg sm:text-xl md:text-4xl font-serif" style={{ color: "#f5e6b3" }}>
                {String(value).padStart(2, "0")}
              </span>
              <span className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider mt-0.5 md:mt-1 font-medium" style={{ color: "#d4af37" }}>
                {labels.countdown[unit as keyof typeof labels.countdown]}
              </span>
            </div>
          ))}
        </div>

        {projectData?.project?.album_enabled !== false && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-6 md:mt-8"
          >
            <Link
              href={albumHref}
              className="px-6 py-2 md:px-8 md:py-2.5 rounded-full border-2 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2 group overflow-hidden relative"
              style={{
                borderColor: "#d4af37",
                backgroundColor: "rgba(139, 69, 19, 0.4)",
                color: "#f5e6b3",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="absolute inset-0 bg-gold/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="tracking-[0.2em] uppercase text-[10px] md:text-xs font-semibold relative z-10 font-serif">
                {labels.invitation.viewAlbum}
              </span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative z-10 text-gold text-sm group-hover:text-white"
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
};

export default HeroSection;
