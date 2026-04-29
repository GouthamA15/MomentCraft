"use client";

import { motion } from "framer-motion";

const LotusWatermark = () => (
  <motion.svg
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] md:w-[50vw] opacity-[0.03] pointer-events-none mix-blend-multiply"
    viewBox="0 0 200 200"
    fill="none"
    initial={{ scale: 0.95, opacity: 0.02 }}
    animate={{ scale: 1.05, opacity: 0.05 }}
    transition={{
      repeat: Infinity,
      repeatType: "reverse",
      duration: 8,
      ease: "easeInOut",
    }}
  >
    <path d="M100 180 C 100 180, 50 150, 20 100 C 50 100, 80 120, 100 180 Z" fill="#8B0000" />
    <path d="M100 180 C 100 180, 150 150, 180 100 C 150 100, 120 120, 100 180 Z" fill="#8B0000" />
    <path d="M100 180 C 100 180, 20 100, 40 50 C 70 60, 90 100, 100 180 Z" fill="#8B0000" />
    <path d="M100 180 C 100 180, 180 100, 160 50 C 130 60, 110 100, 100 180 Z" fill="#8B0000" />
    <path d="M100 180 C 100 180, 60 50, 100 20 C 140 50, 100 180, 100 180 Z" fill="#8B0000" />
  </motion.svg>
);

const TraditionalBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-ivory">
      <div className="absolute inset-0 bg-mandala-pattern opacity-5 mix-blend-multiply"></div>
      <LotusWatermark />
      <div className="absolute inset-0 border-[16px] md:border-[24px] border-transparent border-t-gold/30 border-b-gold/30 rounded-[40px] md:rounded-[60px] m-4 md:m-8 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 border-[4px] border-gold/10 m-8 md:m-12 pointer-events-none"></div>
    </div>
  );
};

export default TraditionalBackground;
