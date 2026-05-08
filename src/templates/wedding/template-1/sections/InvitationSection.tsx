"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "../LanguageContext";

const FlowerConfetti = ({ isActive }: { isActive: boolean }) => {
  const symbols = ["🌸", "🌺", "💮", "🌹", "✨"];

  const [mounted, setMounted] = useState(false);
  const [particleCount, setParticleCount] = useState(6);

  useEffect(() => {
    setMounted(true);

    const reduceMotionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileMql = window.matchMedia("(max-width: 640px)");

    const update = () => {
      if (reduceMotionMql.matches) {
        setParticleCount(0);
        return;
      }
      setParticleCount(mobileMql.matches ? 6 : 12);
    };

    update();
    reduceMotionMql.addEventListener("change", update);
    mobileMql.addEventListener("change", update);

    return () => {
      reduceMotionMql.removeEventListener("change", update);
      mobileMql.removeEventListener("change", update);
    };
  }, []);

  const flowers = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      symbol: symbols[i % symbols.length],
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 4 + Math.random() * 4,
      xOffset1: Math.random() * 10 - 5,
      xOffset2: Math.random() * 20 - 10,
      rotation1: Math.random() * 180 - 90,
      rotation2: Math.random() * 360,
    }));
  }, [particleCount]);

  if (!mounted || !isActive || particleCount === 0) return null;

  return (
    <div className="mc-invite-confetti" aria-hidden="true">
      {flowers.map((flower) => (
        <span
          key={flower.id}
          className="mc-invite-confetti-item"
          style={{
            left: `${flower.left}%`,
            ["--mc-confetti-dur" as any]: `${flower.duration}s`,
            ["--mc-confetti-delay" as any]: `${flower.delay}s`,
            ["--mc-confetti-dx1" as any]: `${flower.xOffset1}vw`,
            ["--mc-confetti-dx2" as any]: `${flower.xOffset2}vw`,
            ["--mc-confetti-rot1" as any]: `${flower.rotation1}deg`,
            ["--mc-confetti-rot2" as any]: `${flower.rotation2}deg`,
          }}
        >
          <span className="mc-invite-confetti-symbol">{flower.symbol}</span>
        </span>
      ))}
    </div>
  );
};

const InvitationSection = () => {
  const { labels, getField } = useLanguage();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

  const message = getField("welcome_message");

  return (
    <section
      ref={sectionRef}
      id="invitation"
      className="min-h-screen flex flex-col justify-center py-20 px-4 bg-white relative overflow-hidden z-10"
    >
      <FlowerConfetti isActive={isInView} />

      <div className="max-w-3xl mx-auto text-center border-8 md:border-[14px] border-double border-gold/60 bg-ivory rounded-tl-3xl rounded-br-3xl p-6 sm:p-8 md:p-16 relative shadow-2xl z-10 bg-opacity-95">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gold-gradient rounded-b-full opacity-80 z-20"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gold-gradient rounded-t-full opacity-80 z-20"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold font-serif text-primary mb-6 drop-shadow-sm px-4 py-2 border-b-2 border-gold inline-block">
            {labels.invitation.greeting}
          </h2>
          <div className="w-24 h-1 bg-gold mx-auto mb-10 mt-6 invisible"></div>

          <p className="text-lg md:text-xl leading-relaxed text-gray-700 mb-8 font-light">
            {message}
          </p>

          <p className="font-serif text-xl text-primary font-semibold">
            {labels.invitation.signOff}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default InvitationSection;
