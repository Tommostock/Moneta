"use client";

import { useEffect } from "react";
import { getSettings } from "@/lib/settings";

export default function ThemeProvider() {
  useEffect(() => {
    const settings = getSettings();
    if (settings.theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);

  // Listen for storage changes (from settings page)
  useEffect(() => {
    function onStorage() {
      const settings = getSettings();
      if (settings.theme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    }
    window.addEventListener("moneta:theme-change", onStorage);
    return () => window.removeEventListener("moneta:theme-change", onStorage);
  }, []);

  return null;
}
