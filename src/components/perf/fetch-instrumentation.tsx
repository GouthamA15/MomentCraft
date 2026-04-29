"use client";

import { useEffect } from "react";

export default function FetchInstrumentation() {
  useEffect(() => {
    try {
      // Only instrument in development to avoid noise in production
      if (process.env.NODE_ENV !== "development") return;
      // Avoid double-patching
      if ((window as any).__fetchInstrumented) return;
      (window as any).__fetchInstrumented = true;

      const original = window.fetch.bind(window) as unknown as (
        ...args: Parameters<typeof window.fetch>
      ) => ReturnType<typeof window.fetch>;
      const counts = new Map<string, number>();

      window.fetch = async (...args: Parameters<typeof window.fetch>) => {
        const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url;
        const opts = args[1] || {};
        const method = (opts as RequestInit).method || "GET";
        const key = `${method.toUpperCase()} ${url}`;
        const start = performance.now();
        try {
          const res = await original(...args);
          const dur = Math.round(performance.now() - start);
          const prev = counts.get(key) || 0;
          counts.set(key, prev + 1);

          // Log only slow requests or repeated requests to reduce noise
          if (dur > 200 || prev + 1 > 1) {
            // eslint-disable-next-line no-console
            console.groupCollapsed(`[perf] ${method} ${url} — ${dur}ms — call#${prev + 1}`);
            // eslint-disable-next-line no-console
            console.trace();
            // eslint-disable-next-line no-console
            console.log({ url, method, durationMs: dur, callCount: prev + 1, options: opts });
            // eslint-disable-next-line no-console
            console.groupEnd();
          }

          return res;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error("[perf] fetch error", err, { url, method });
          throw err;
        }
      };

      // Clear counts regularly so we can spot repeated bursts
      const t = setInterval(() => counts.clear(), 5000);
      return () => {
        clearInterval(t);
        // restore original fetch on unmount
        try {
          (window as any).fetch = original;
          (window as any).__fetchInstrumented = false;
        } catch (e) {
          // ignore
        }
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("fetch instrumentation failed", e);
    }
  }, []);

  return null;
}
