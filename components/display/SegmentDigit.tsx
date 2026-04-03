"use client";

// 7-segment display digit — classic calculator/forex ticker style
// Each segment is identified: a(top), b(top-right), c(bottom-right),
// d(bottom), e(bottom-left), f(top-left), g(middle)

const SEGMENT_MAP: Record<string, boolean[]> = {
  //       a     b     c     d     e     f     g
  "0": [true, true, true, true, true, true, false],
  "1": [false, true, true, false, false, false, false],
  "2": [true, true, false, true, true, false, true],
  "3": [true, true, true, true, false, false, true],
  "4": [false, true, true, false, false, true, true],
  "5": [true, false, true, true, false, true, true],
  "6": [true, false, true, true, true, true, true],
  "7": [true, true, true, false, false, false, false],
  "8": [true, true, true, true, true, true, true],
  "9": [true, true, true, true, false, true, true],
  "-": [false, false, false, false, false, false, true],
};

interface SegmentDigitProps {
  char: string;
  size?: number; // height in pixels
}

export default function SegmentDigit({ char, size = 32 }: SegmentDigitProps) {
  // Special characters: dot, comma, space
  if (char === ".") {
    return (
      <svg
        width={size * 0.25}
        height={size}
        viewBox="0 0 10 40"
        className="segment-digit"
      >
        <circle cx="5" cy="37" r="2.5" fill="var(--theme-text-primary)" />
      </svg>
    );
  }

  if (char === ",") {
    return (
      <svg
        width={size * 0.2}
        height={size}
        viewBox="0 0 8 40"
        className="segment-digit"
      >
        <circle cx="4" cy="35" r="2" fill="var(--theme-text-primary)" />
        <line x1="4" y1="37" x2="2" y2="40" stroke="var(--theme-text-primary)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (char === " ") {
    return <div style={{ width: size * 0.3 }} />;
  }

  const segments = SEGMENT_MAP[char];
  if (!segments) {
    // Unknown char — render as blank space
    return <div style={{ width: size * 0.55 }} />;
  }

  const [a, b, c, d, e, f, g] = segments;
  const onColor = "var(--theme-text-primary)";
  const offColor = "var(--theme-text-muted)";
  const offOpacity = 0.08;

  // Viewbox: 20 wide, 40 tall. Segments are drawn as polygons.
  const w = size * 0.55;

  return (
    <svg
      width={w}
      height={size}
      viewBox="0 0 20 40"
      className="segment-digit"
    >
      {/* a - top horizontal */}
      <polygon
        points="3,1 17,1 15,4 5,4"
        fill={a ? onColor : offColor}
        opacity={a ? 1 : offOpacity}
      />
      {/* b - top right vertical */}
      <polygon
        points="17,2 18,3 18,18 17,19 15,17 15,5"
        fill={b ? onColor : offColor}
        opacity={b ? 1 : offOpacity}
      />
      {/* c - bottom right vertical */}
      <polygon
        points="17,21 18,22 18,37 17,38 15,36 15,23"
        fill={c ? onColor : offColor}
        opacity={c ? 1 : offOpacity}
      />
      {/* d - bottom horizontal */}
      <polygon
        points="5,36 15,36 17,39 3,39"
        fill={d ? onColor : offColor}
        opacity={d ? 1 : offOpacity}
      />
      {/* e - bottom left vertical */}
      <polygon
        points="3,21 5,23 5,36 3,38 2,37 2,22"
        fill={e ? onColor : offColor}
        opacity={e ? 1 : offOpacity}
      />
      {/* f - top left vertical */}
      <polygon
        points="3,2 5,5 5,17 3,19 2,18 2,3"
        fill={f ? onColor : offColor}
        opacity={f ? 1 : offOpacity}
      />
      {/* g - middle horizontal */}
      <polygon
        points="5,19 15,19 16,20 15,21 5,21 4,20"
        fill={g ? onColor : offColor}
        opacity={g ? 1 : offOpacity}
      />
    </svg>
  );
}
