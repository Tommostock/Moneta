"use client";

import { useEffect, useRef, useState } from "react";

interface SplitFlapProps {
  char: string;
  delay?: number;
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: { width: 18, height: 28, fontSize: 15 },
  md: { width: 22, height: 36, fontSize: 19 },
  lg: { width: 30, height: 48, fontSize: 26 },
};

// Renders the character clipped to show only the top or bottom half.
// The character is centered in the full cell height; the container's
// overflow:hidden clips the unwanted half.
function HalfChar({
  char,
  half,
  height,
  fontSize,
}: {
  char: string;
  half: "top" | "bottom";
  height: number;
  fontSize: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        height: height / 2,
        top: half === "top" ? 0 : height / 2,
        overflow: "hidden",
        background: "#1C1C1C",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: height,
          // Anchor top chars from the top, bottom chars from the bottom
          // so the character's visual centre always falls on the split line.
          ...(half === "top" ? { top: 0 } : { bottom: 0 }),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-roboto-mono), monospace",
          fontSize,
          fontWeight: 500,
          color: "#F0E6D3",
          userSelect: "none",
        }}
      >
        {char}
      </div>
    </div>
  );
}

export default function SplitFlap({
  char,
  delay = 0,
  size = "md",
}: SplitFlapProps) {
  // `resting` = the char fully visible when not animating
  // `from`    = the char we are animating away from
  const [resting, setResting] = useState(char);
  const [from, setFrom] = useState(char);
  const [animating, setAnimating] = useState(false);
  const prevRef = useRef(char);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { width, height, fontSize } = sizeConfig[size];

  useEffect(() => {
    if (char === prevRef.current) return;

    const oldChar = prevRef.current;
    prevRef.current = char;

    setFrom(oldChar);
    setResting(char);
    setAnimating(true);

    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    // Total animation: delay + 180ms (top flap) + 90ms gap + 180ms (bottom flap)
    endTimerRef.current = setTimeout(
      () => setAnimating(false),
      delay + 180 + 90 + 180
    );
  }, [char, delay]);

  useEffect(() => {
    return () => {
      if (endTimerRef.current) clearTimeout(endTimerRef.current);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        flexShrink: 0,
        perspective: "300px",
      }}
    >
      {!animating ? (
        // ── Resting state: two static halves ──────────────────────────────
        <>
          <HalfChar char={resting} half="top" height={height} fontSize={fontSize} />
          <HalfChar char={resting} half="bottom" height={height} fontSize={fontSize} />
        </>
      ) : (
        // ── Animating state: four layers ──────────────────────────────────
        <>
          {/* Layer 1 – new char top (static, sits behind the flap) */}
          <HalfChar char={resting} half="top" height={height} fontSize={fontSize} />

          {/* Layer 2 – old char top FLAP (rotates 0 → -90deg, reveals layer 1) */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: height / 2,
              overflow: "hidden",
              background: "#1C1C1C",
              zIndex: 3,
              transformOrigin: "center bottom",
              animation: `flipDown 180ms ease-out ${delay}ms both`,
              backfaceVisibility: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-roboto-mono), monospace",
                fontSize,
                fontWeight: 500,
                color: "#F0E6D3",
                userSelect: "none",
              }}
            >
              {from}
            </div>
          </div>

          {/* Layer 3 – old char bottom (static, visible until layer 4 covers it) */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: height / 2,
              height: height / 2,
              overflow: "hidden",
              background: "#1C1C1C",
              zIndex: 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-roboto-mono), monospace",
                fontSize,
                fontWeight: 500,
                color: "#F0E6D3",
                userSelect: "none",
              }}
            >
              {from}
            </div>
          </div>

          {/* Layer 4 – new char bottom FLAP (rotates 90 → 0deg, covers layer 3) */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: height / 2,
              height: height / 2,
              overflow: "hidden",
              background: "#1C1C1C",
              zIndex: 3,
              transformOrigin: "center top",
              // `both` fill-mode: starts at rotateX(90deg) during the delay
              // period so it stays hidden until it's time to flip in
              animation: `flipUp 180ms ease-out ${delay + 90}ms both`,
              backfaceVisibility: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: height,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-roboto-mono), monospace",
                fontSize,
                fontWeight: 500,
                color: "#F0E6D3",
                userSelect: "none",
              }}
            >
              {resting}
            </div>
          </div>
        </>
      )}

      {/* Split line — always on top, the detail that sells the illusion */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height / 2 - 1,
          height: 2,
          background: "#0A0A0A",
          zIndex: 20,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
