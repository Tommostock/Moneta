"use client";

import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";

const DISMISSED_KEY = "moneta:install-dismissed";

export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    // Don't show if already dismissed, already installed as PWA, or not on mobile
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Check if running in a browser (not PWA)
    const isStandalone =
      ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone) ||
      window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    // Listen for the beforeinstallprompt event (Chrome/Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // For iOS Safari, show after a short delay (no beforeinstallprompt event)
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS && isSafari) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, "1");
  };

  const handleInstall = async () => {
    if (deferredPrompt && "prompt" in deferredPrompt) {
      (deferredPrompt as { prompt: () => void }).prompt();
      handleDismiss();
    } else {
      // iOS — just dismiss, user needs to use Share > Add to Home Screen
      handleDismiss();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 animate-fade-in" style={{ paddingTop: "env(safe-area-inset-top, 8px)" }}>
      <div className="mt-2 bg-bg-raised border border-border-subtle rounded-[4px] p-3 flex items-center gap-3">
        <Download size={18} className="text-accent shrink-0" />
        <p className="text-text-secondary text-xs font-sans flex-1">
          Add to Home Screen for the full app experience
        </p>
        <button
          onClick={handleInstall}
          className="text-accent text-xs font-sans font-medium px-3 py-1.5 bg-accent/10 rounded-[4px] active:bg-accent/20 transition-colors whitespace-nowrap"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="min-w-[32px] min-h-[32px] flex items-center justify-center text-text-muted active:text-text-secondary"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
