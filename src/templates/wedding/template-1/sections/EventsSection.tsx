"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FaMapMarkerAlt, FaCalendarAlt, FaClock, FaPaperPlane } from "react-icons/fa";
import { useLanguage } from "../LanguageContext";
import { useProjectData } from "../ProjectDataContext";
import { formatDisplayDate } from "@/lib/utils/date-format";

const NavigationPath = ({ isActive }: { isActive: boolean }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="absolute top-20 left-0 w-full h-40 pointer-events-none z-0 overflow-hidden opacity-70"
    >
      <div className="absolute flex items-center justify-center z-10" style={{ left: "5%", top: "56px" }}>
        <div className="absolute w-4 h-4 rounded-full bg-gold animate-ping opacity-75"></div>
        <div className="relative w-3 h-3 rounded-full bg-primary shadow-md border border-gold"></div>
      </div>

      <div className="absolute flex items-center justify-center z-10" style={{ left: "90%", top: "56px" }}>
        <div className="absolute w-4 h-4 rounded-full bg-gold animate-ping opacity-75"></div>
        <div className="relative w-3 h-3 rounded-full bg-primary shadow-md border border-gold"></div>
      </div>

      <motion.div
        className="absolute text-primary drop-shadow-lg z-20"
        initial={{ left: "5%", top: "45px" }}
        animate={{
          left: isActive ? ["5%", "90%"] : "5%",
          top: isActive ? ["45px", "5px", "45px", "85px", "45px"] : "45px",
          rotate: isActive ? [30, 10, 30, 50, 30] : 30,
        }}
        transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
      >
        <FaPaperPlane size={36} />
      </motion.div>
    </motion.div>
  );
};

const EventsSection = () => {
  const { labels, defaults, getField } = useLanguage();
  const projectData = useProjectData();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.2 });

  const events = (() => {
    const project = projectData?.project;
    if (!projectData) return defaults?.events ?? [];

    const eventTime = getField("event_time");
    const venueName = getField("venue_name");
    const venueAddress = getField("venue_address");
    const dateText = getField("event_date_text");

    const hasAny =
      Boolean(project?.event_date) ||
      Boolean(eventTime?.trim()) ||
      Boolean(venueName?.trim()) ||
      Boolean(venueAddress?.trim());

    if (!hasAny) return defaults?.events ?? [];

    const dateLabel = dateText?.trim()
      ? dateText
      : project?.event_date
        ? formatDisplayDate(project.event_date, "dd MMM yyyy")
        : defaults?.events?.[0]?.date;

    const query = [venueName, venueAddress].filter(Boolean).join(" ").trim();
    const mapLink = query
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
      : defaults?.events?.[0]?.mapLink || "#";

    return [
      {
        id: "event",
        title: defaults?.events?.[0]?.title || labels.events.eventTitle,
        date: dateLabel || "-",
        time: eventTime || defaults?.events?.[0]?.time || "-",
        venue: venueName || defaults?.events?.[0]?.venue || "-",
        address: venueAddress || defaults?.events?.[0]?.address || "-",
        mapLink,
      },
    ];
  })();

  return (
    <section ref={sectionRef} id="events" className="min-h-screen flex flex-col justify-center relative py-20 px-3 sm:px-4 md:px-4 bg-ivory overflow-hidden">
      <NavigationPath isActive={isInView} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-primary mb-4 text-glow">{labels.events.sectionTitle}</h2>
          <div className="w-24 h-1 bg-gold mx-auto"></div>
        </div>

        <div className="flex flex-col gap-12 max-w-5xl mx-auto w-full">
          {events.map((event: any, index: number) => (
            <div key={event.id} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-xl overflow-hidden border border-gold/30 hover:border-gold transition-colors duration-300 backdrop-blur-sm bg-opacity-95 flex flex-col"
              >
                <div className="bg-primary text-center py-4 px-6 border-b border-gold/50">
                  <h3 className="text-2xl font-serif text-gold">{event.title}</h3>
                </div>

                <div className="p-6 md:p-8 flex flex-col gap-4 flex-grow justify-center">
                  <div className="flex items-center gap-4 text-gray-700">
                    <span className="text-primary">
                      <FaCalendarAlt size={20} />
                    </span>
                    <span className="text-lg">{event.date}</span>
                  </div>

                  <div className="flex items-center gap-4 text-gray-700">
                    <span className="text-primary">
                      <FaClock size={20} />
                    </span>
                    <span className="text-lg">{event.time}</span>
                  </div>

                  <div className="flex items-start gap-4 text-gray-700">
                    <span className="text-primary mt-1">
                      <FaMapMarkerAlt size={20} />
                    </span>
                    <div>
                      <h4 className="font-semibold text-lg">{event.venue}</h4>
                      <p className="text-gray-500 text-sm mb-3">{event.address}</p>
                      <a
                        href={event.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-gold text-primary font-medium rounded hover:bg-gold-dark transition-colors text-sm uppercase tracking-wide shadow-sm"
                      >
                        {labels.events.viewOnMap}
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
                className="bg-white rounded-lg shadow-xl overflow-hidden border border-gold/30 p-2 backdrop-blur-sm bg-opacity-95 h-80 lg:h-auto relative cursor-pointer group"
              >
                <a
                  href={event.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-10 flex items-center justify-center bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300"
                  aria-label="Open Map in new tab"
                >
                  <div className="bg-white/90 text-primary px-4 py-2 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md transform translate-y-4 group-hover:translate-y-0">
                    {labels.events.viewOnMap}
                  </div>
                </a>
                <iframe
                  title={`Map for ${event.title}`}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(event.venue)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: "100%", borderRadius: "0.3rem" }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
