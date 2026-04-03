"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { renderWallpaper, type WallpaperConfig } from "@/lib/wallpaper";

interface WallpaperCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  multiplier: number;
}

const SIZE_PRESETS = [
  { label: "iPhone", width: 1170, height: 2532 },
  { label: "Android", width: 1080, height: 2400 },
] as const;

const BG_COLORS = [
  { label: "Dark", value: "#0C0C0C" },
  { label: "Charcoal", value: "#1A1A2E" },
  { label: "Navy", value: "#0D1B2A" },
  { label: "Forest", value: "#0D1F0D" },
  { label: "Burgundy", value: "#1F0D0D" },
] as const;

export default function WallpaperCreator({
  isOpen,
  onClose,
  baseCurrency,
  quoteCurrency,
  rate,
  multiplier,
}: WallpaperCreatorProps) {
  const [sizeIndex, setSizeIndex] = useState(0);
  const [bgColor, setBgColor] = useState("#0C0C0C");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const blobRef = useRef<Blob | null>(null);

  const generatePreview = useCallback(async () => {
    const preset = SIZE_PRESETS[sizeIndex];
    const config: WallpaperConfig = {
      width: preset.width,
      height: preset.height,
      baseCurrency,
      quoteCurrency,
      rate,
      multiplier,
      backgroundColor: bgColor,
    };

    try {
      const blob = await renderWallpaper(config);
      blobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch {
      // silently fail
    }
  }, [sizeIndex, bgColor, baseCurrency, quoteCurrency, rate, multiplier]);

  useEffect(() => {
    if (isOpen) generatePreview();
  }, [isOpen, generatePreview]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!blobRef.current) return;
    setSaving(true);

    try {
      const file = new File([blobRef.current], "moneta-wallpaper.png", {
        type: "image/png",
      });

      // Try Web Share API (works on iOS PWA)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "MONETA Wallpaper",
        });
        setSaving(false);
        return;
      }

      // Fallback: download link
      const url = URL.createObjectURL(blobRef.current);
      const a = document.createElement("a");
      a.href = url;
      a.download = "moneta-wallpaper.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // User cancelled share or download failed
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary animate-fade-in flex flex-col">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ paddingTop: "env(safe-area-inset-top, 8px)" }}
      >
        <h2 className="text-text-primary font-sans text-sm font-medium">
          Create Wallpaper
        </h2>
        <button
          onClick={onClose}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 active:opacity-70"
          aria-label="Close"
        >
          <X size={20} className="text-text-secondary" />
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center px-8 py-4 overflow-hidden">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Wallpaper preview"
            className="max-h-full max-w-[260px] rounded-[4px] border border-border-subtle object-contain"
          />
        ) : (
          <div className="w-[260px] h-[400px] bg-bg-surface rounded-[4px] border border-border-subtle flex items-center justify-center">
            <span className="text-text-muted text-sm font-sans">
              Generating...
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 pb-4 space-y-4" style={{ paddingBottom: "env(safe-area-inset-bottom, 16px)" }}>
        {/* Size presets */}
        <div>
          <p className="text-text-muted text-xs font-sans mb-2">Size</p>
          <div className="flex gap-2">
            {SIZE_PRESETS.map((preset, i) => (
              <button
                key={preset.label}
                onClick={() => setSizeIndex(i)}
                className={`flex-1 h-11 rounded-[4px] font-sans text-sm transition-colors duration-100 ${
                  i === sizeIndex
                    ? "bg-accent text-bg-primary"
                    : "bg-bg-raised text-text-secondary border border-border-subtle active:bg-bg-surface"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Background colors */}
        <div>
          <p className="text-text-muted text-xs font-sans mb-2">Background</p>
          <div className="flex gap-3 justify-center">
            {BG_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setBgColor(color.value)}
                className={`w-11 h-11 rounded-[4px] border-2 transition-colors ${
                  bgColor === color.value
                    ? "border-accent"
                    : "border-border-subtle"
                }`}
                style={{ backgroundColor: color.value }}
                aria-label={color.label}
              />
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving || !previewUrl}
          className="w-full h-12 rounded-[4px] bg-accent text-bg-primary font-sans text-sm font-medium active:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {saving ? "Saving..." : "Save Wallpaper"}
        </button>
      </div>
    </div>
  );
}
