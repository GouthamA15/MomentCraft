"use client";

import { FaHeart } from "react-icons/fa";
import { useLanguage } from "../LanguageContext";

const Footer = () => {
  const year = new Date().getFullYear();
  const { labels, defaults, getField } = useLanguage();

  const groomName = getField("groom_name") || defaults?.couple?.groom || "";
  const brideName = getField("bride_name") || defaults?.couple?.bride || "";
  const footerMessage = getField("footer_message").trim();
  const familyMessage = getField("family_message").trim();
  const customNote = getField("custom_note").trim();

  return (
    <footer className="relative bg-primary-dark text-ivory py-10 md:py-16 px-4 text-center">
      <div className="absolute top-0 left-0 w-full h-3 bg-gold-gradient"></div>
      <div className="absolute inset-0 bg-mandala-pattern opacity-10 pointer-events-none mix-blend-overlay"></div>

      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 relative z-10">
        <h2 className="text-3xl md:text-4xl font-serif bg-gold-gradient text-transparent bg-clip-text">
          {groomName} & {brideName}
        </h2>

        {footerMessage ? <p className="text-sm text-gray-200 max-w-2xl">{footerMessage}</p> : null}
        {familyMessage ? <p className="text-sm text-gray-200 max-w-2xl">{familyMessage}</p> : null}
        {customNote ? <p className="text-xs text-gray-300 max-w-2xl">{customNote}</p> : null}

        <p className="flex items-center justify-center gap-2 text-sm text-gray-300 mt-2">
          {labels.footer.madeWith} <FaHeart className="text-red-500" /> {labels.footer.forSpecialDay}
        </p>

        <p className="text-xs text-gray-400 mt-4 font-light">
          &copy; {year} {groomName} & {brideName}. {labels.footer.allRights}
        </p>

        <p className="text-xs text-gray-500 mt-2">
          {labels.footer.contact}: {defaults?.contact?.whatsappNumber} | {defaults?.contact?.email}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
