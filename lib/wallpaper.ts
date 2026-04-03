import { CURRENCY_SYMBOLS } from "@/lib/constants/currencies";

export interface WallpaperConfig {
  width: number;
  height: number;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  multiplier: number;
  backgroundColor: string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function formatWallpaperAmount(value: number): string {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export async function renderWallpaper(config: WallpaperConfig): Promise<Blob> {
  const { width, height, baseCurrency, quoteCurrency, rate, multiplier, backgroundColor } = config;

  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const scale = width / 375;
  const baseSymbol = CURRENCY_SYMBOLS[baseCurrency] || baseCurrency;
  const quoteSymbol = CURRENCY_SYMBOLS[quoteCurrency] || quoteCurrency;

  // Determine if bg is light to use dark text
  const isLightBg = isLightColor(backgroundColor);
  const cardBg = isLightBg ? "rgba(255, 255, 255, 0.85)" : "rgba(22, 22, 22, 0.92)";
  const leftColBg = isLightBg ? "rgba(245, 242, 237, 0.95)" : "#161616";
  const rightColBg = isLightBg ? "rgba(237, 234, 228, 0.95)" : "#1C1C1C";
  const borderColor = isLightBg ? "#D0CCC5" : "#2A2A2A";
  const textColor = isLightBg ? "#1A1814" : "#F0E6D3";
  const mutedColor = isLightBg ? "#9B958C" : "#4A4540";

  // Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Card dimensions — positioned below clock area, above bottom buttons
  // iPhone lock screen: clock ~top 15%, bottom buttons ~bottom 12%
  // Card sits from ~18% to ~78% of screen height
  const cardMargin = 32 * scale;
  const cardW = width - cardMargin * 2;
  const headerH = 40 * scale;
  const rowH = 42 * scale;
  const cardH = headerH + rowH * 10 + 2 * scale;
  const cardX = cardMargin;
  // Position: start at ~18% from top (below clock), centered in the safe zone
  const topZone = height * 0.18;
  const bottomZone = height * 0.85;
  const safeHeight = bottomZone - topZone;
  const cardY = topZone + (safeHeight - cardH) / 2;
  const cardR = 12 * scale;

  // Card background
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fillStyle = cardBg;
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1 * scale;
  ctx.stroke();
  ctx.restore();

  // Clip to card
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.clip();

  const colW = cardW / 2;
  const leftX = cardX;
  const rightX = cardX + colW;

  // Header
  const headerY = cardY;
  ctx.fillStyle = leftColBg;
  ctx.fillRect(leftX, headerY, colW, headerH);
  ctx.fillStyle = rightColBg;
  ctx.fillRect(rightX, headerY, colW, headerH);
  ctx.fillStyle = borderColor;
  ctx.fillRect(leftX + colW - 0.5 * scale, headerY, 1 * scale, headerH);

  // Header text
  const headerFontSize = Math.round(14 * scale);
  ctx.font = `500 ${headerFontSize}px "Roboto Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#D45B5B";
  ctx.fillText(baseCurrency, leftX + colW / 2, headerY + headerH / 2);
  ctx.fillStyle = "#D4A843";
  ctx.fillText(quoteCurrency, rightX + colW / 2, headerY + headerH / 2);

  // Arrow
  ctx.fillStyle = mutedColor;
  const arrowSize = 7 * scale;
  const arrowCX = leftX + colW;
  const arrowCY = headerY + headerH / 2;
  ctx.beginPath();
  ctx.moveTo(arrowCX - arrowSize / 2, arrowCY - arrowSize / 2);
  ctx.lineTo(arrowCX + arrowSize / 2, arrowCY);
  ctx.lineTo(arrowCX - arrowSize / 2, arrowCY + arrowSize / 2);
  ctx.fill();

  // Header bottom divider
  ctx.fillStyle = borderColor;
  ctx.fillRect(leftX, headerY + headerH, cardW, 1 * scale);

  // Data rows
  // Scale font down for large multipliers
  const baseFontSize = multiplier >= 10000 ? 13 : multiplier >= 100 ? 15 : 16;
  const rowFontSize = Math.round(baseFontSize * scale);
  ctx.font = `400 ${rowFontSize}px "Roboto Mono", monospace`;

  for (let i = 0; i < 10; i++) {
    const baseAmount = (i + 1) * multiplier;
    const convertedAmount = baseAmount * rate;
    const rowY = headerY + headerH + 1 * scale + i * rowH;

    ctx.fillStyle = leftColBg;
    ctx.fillRect(leftX, rowY, colW, rowH);
    ctx.fillStyle = rightColBg;
    ctx.fillRect(rightX, rowY, colW, rowH);

    ctx.fillStyle = borderColor;
    ctx.fillRect(leftX + colW - 0.5 * scale, rowY, 1 * scale, rowH);

    if (i < 9) {
      ctx.fillStyle = borderColor;
      ctx.fillRect(leftX, rowY + rowH - 0.5 * scale, cardW, 0.5 * scale);
    }

    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      `${baseSymbol}${formatWallpaperAmount(baseAmount)}`,
      leftX + colW / 2,
      rowY + rowH / 2
    );
    ctx.fillText(
      `${quoteSymbol}${formatWallpaperAmount(convertedAmount)}`,
      rightX + colW / 2,
      rowY + rowH / 2
    );
  }

  ctx.restore();

  // Watermark
  const wmFontSize = Math.round(9 * scale);
  ctx.font = `400 ${wmFontSize}px "DM Sans", sans-serif`;
  ctx.fillStyle = mutedColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("MONETA", width / 2, cardY + cardH + 10 * scale);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create wallpaper blob"));
      },
      "image/png"
    );
  });
}

function isLightColor(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
