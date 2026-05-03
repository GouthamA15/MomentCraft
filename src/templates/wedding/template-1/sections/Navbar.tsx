"use client";

import { useEffect, useState } from "react";
import { Link as ScrollLink } from "react-scroll";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../LanguageContext";
import { useProjectData } from "../ProjectDataContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { language, setLanguage, availableLanguages, labels } = useLanguage();
  const { projectData, isPreview } = useProjectData();
  const pathname = usePathname();

  const isAlbumPage = pathname?.includes("/album");
  const slug = projectData?.project?.slug;
  const backHref = isPreview 
    ? (projectData?.project?.id 
        ? `/dashboard/projects/preview/${projectData?.project?.id}` 
        : `/dashboard/templates/preview/wedding_classic`)
    : `/site/${slug}`;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      const sections = isAlbumPage 
        ? ["hero", "haldi", "mehendi", "wedding"]
        : ["home", "invitation", "our-story", "events"];
      let current = sections[0];

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= 100) {
            current = section;
          }
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAlbumPage]);

  const teluguAvailable = availableLanguages.includes("te");
  const toggleLanguage = () => {
    if (!teluguAvailable) return;
    setLanguage(language === "en" ? "te" : "en");
  };

  const invitationLinks = [
    { name: labels.nav.home, to: "home", type: "scroll" },
    { name: labels.nav.invitation, to: "invitation", type: "scroll" },
    { name: labels.nav.ourStory, to: "our-story", type: "scroll" },
    { name: labels.nav.events, to: "events", type: "scroll" },
  ];

  // For now, Album labels are partially hardcoded in AlbumPage.tsx, 
  // but we can start moving them to labels or just use some defaults here.
  const albumLinks = [
    { name: language === "en" ? "Home" : "హోమ్", href: backHref, type: "link" },
    { name: language === "en" ? "Haldi" : "హల్దీ", to: "haldi", type: "scroll" },
    { name: language === "en" ? "Mehendi" : "మెహెంది", to: "mehendi", type: "scroll" },
    { name: language === "en" ? "Wedding" : "పెళ్లి", to: "wedding", type: "scroll" },
  ];

  const navLinks = isAlbumPage ? albumLinks : invitationLinks;

  let navBg = "bg-transparent py-5";
  let textStyle = "text-gold drop-shadow-md";
  let btnStyle =
    "border-gold text-gold bg-white/10 hover:bg-gold hover:text-primary backdrop-blur-sm shadow-sm";

  if (scrolled) {
    if (!isAlbumPage && activeSection === "invitation") {
      navBg = "bg-primary shadow-md py-3";
      textStyle = "text-gold";
      btnStyle = "border-gold text-gold hover:bg-gold hover:text-primary";
    } else if (isAlbumPage || (!isAlbumPage && activeSection === "events")) {
      navBg = "bg-ivory border-b border-gold/30 shadow-md py-3";
      textStyle = "text-primary";
      btnStyle = "border-primary text-primary hover:bg-primary hover:text-ivory";
    } else {
      navBg = "bg-white shadow-md py-3";
      textStyle = "text-gray-800 md:text-gray-900";
      btnStyle = "border-primary text-primary hover:bg-primary hover:text-white";
    }
  }

  return (
    <nav className={`fixed w-full z-40 transition-all duration-500 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center">
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.type === "scroll" ? (
                <ScrollLink
                  key={link.to ?? link.name}
                  to={link.to ?? ""}
                  smooth={true}
                  duration={500}
                  spy={true}
                  activeClass={activeSection === (link.to ?? "") ? "opacity-100 scale-105 font-bold" : ""}
                  offset={0}
                  className={`cursor-pointer font-medium hover:scale-105 transition-all duration-300 ${textStyle}`}
                >
                  {link.name}
                </ScrollLink>
              ) : (
                <Link
                  key={"href" in link ? link.href : link.name}
                  href={"href" in link ? (link.href ?? "#") : "#"}
                  className={`cursor-pointer font-medium hover:scale-105 transition-all duration-300 ${textStyle}`}
                >
                  {link.name}
                </Link>
              )
            ))}

            {teluguAvailable ? (
              <button
                onClick={toggleLanguage}
                className={`px-4 py-1.5 rounded-full border-2 font-medium transition-colors duration-500 ${btnStyle}`}
              >
                {language === "en" ? "తెలుగు" : "ENGLISH"}
              </button>
            ) : null}
          </div>

          <div className="md:hidden flex items-center gap-4">
            {teluguAvailable ? (
              <button
                onClick={toggleLanguage}
                className={`px-3 py-1 rounded-full border-2 text-sm font-medium transition-colors ${btnStyle}`}
              >
                {language === "en" ? "తెలుగు" : "English"}
              </button>
            ) : null}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`${textStyle} hover:scale-110 transition-transform focus:outline-none`}
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-primary shadow-xl absolute w-full left-0 top-full border-t border-gold/30 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(59, 0, 18, 0.95) 0%, rgba(75, 0, 21, 0.95) 50%, rgba(59, 0, 18, 0.95) 100%)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className="px-4 pt-4 pb-8 space-y-2 flex flex-col items-center">
              {navLinks.map((link, index) => (
                <motion.div
                  key={`${index}-${link.name}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                  className="w-full"
                >
                  {link.type === "scroll" ? (
                    <ScrollLink
                      to={link.to ?? ""}
                      smooth={true}
                      duration={500}
                      offset={0}
                      className="cursor-pointer block px-3 py-4 text-lg font-serif font-medium text-amber-100 hover:text-gold transition-colors border-b border-gold/10 w-full text-center tracking-wider uppercase drop-shadow-md"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </ScrollLink>
                  ) : (
                    <Link
                      href={"href" in link ? (link.href ?? "#") : "#"}
                      className="cursor-pointer block px-3 py-4 text-lg font-serif font-medium text-amber-100 hover:text-gold transition-colors border-b border-gold/10 w-full text-center tracking-wider uppercase drop-shadow-md"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
