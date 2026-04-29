"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    // show subtle progress when path changes to improve perceived speed
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      aria-hidden
      className={`fixed left-0 top-0 z-50 h-0.5 w-full transform-gpu transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-0.5 w-3/4 animate-progress bg-cyan-300" />
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(-10%); }
          100% { transform: translateX(0%); }
        }
        .animate-progress { animation: progress 800ms linear; }
      `}</style>
    </div>
  );
}
