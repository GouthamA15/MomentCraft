"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaHeart } from "react-icons/fa";
import { useLanguage } from "../LanguageContext";

const StoryParagraph = ({ text, index }: { text: string; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.8 });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      className={`flex w-full mb-12 md:mb-16 ${isEven ? "justify-start" : "justify-end"}`}
      initial={{ opacity: 0, y: 50, x: isEven ? -30 : 30 }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: 50, x: isEven ? -30 : 30 }}
      transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
    >
      <div className={`w-[90%] md:w-[70%] relative ${isEven ? "text-left" : "text-right"}`}>
        <div className={`h-px w-16 bg-gold mb-4 ${isEven ? "ml-0" : "ml-auto"}`}></div>
        <p className="text-gray-700 font-serif leading-relaxed text-lg md:text-xl lg:text-2xl">{text}</p>
      </div>
    </motion.div>
  );
};

const OurStorySection = () => {
  const { labels, defaults, getField } = useLanguage();
  const closingRef = useRef(null);
  const isClosingInView = useInView(closingRef, { once: true, amount: 0.5 });

  const storyParagraphs = (() => {
    const story = getField("story_text")?.trim();
    if (!story) return defaults?.ourStory?.paragraphs ?? [];
    const parts = story
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts : (defaults?.ourStory?.paragraphs ?? []);
  })();

  return (
    <section id="our-story" className="relative py-24 px-4 bg-transparent overflow-hidden">
      <div className="flex items-center justify-center gap-4 mb-16">
        <div className="h-px flex-1 max-w-xs bg-gradient-to-l from-gold/60 to-transparent" />
        <h2 className="text-4xl md:text-5xl font-serif text-primary text-center">
          {getField("story_title") || labels.ourStory.defaultTitle}
        </h2>
        <div className="h-px flex-1 max-w-xs bg-gradient-to-r from-gold/60 to-transparent" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gold/30 -translate-x-1/2"></div>
        <div className="py-8">
          {storyParagraphs.map((text: string, idx: number) => (
            <StoryParagraph key={idx} text={text} index={idx} />
          ))}
        </div>

        <motion.div
          ref={closingRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isClosingInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mt-16 text-center border-4 border-double border-gold/40 p-8 rounded-full w-48 h-48 mx-auto flex flex-col justify-center items-center bg-ivory shadow-lg"
        >
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <FaHeart className="text-red-600 text-3xl mb-2" />
          </motion.div>
          <p className="font-serif text-primary font-bold text-lg">{labels.ourStory.closing}</p>
        </motion.div>
      </div>
    </section>
  );
};

export default OurStorySection;
