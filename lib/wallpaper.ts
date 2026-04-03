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

export async function renderWallpaper(config: WallpaperConfig): Promise<Blob> {
  const { width, height, baseCurrency, quoteCurrency, rate, multiplier, backgroundColor } = config;

  // Wait for fonts
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const scale = width / 375; // Scale relative to mobile width
  const baseSymbol = CURRENCY_SYMBOLS[baseCurrency] || baseCurrency;
  const quoteSymbol = CURRENCY_SYMBOLS[quoteCurrency] || quoteCurrency;

  // Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Card dimensions
  const cardMargin = 40 * scale;
  const cardW = width - cardMargin * 2;
  const headerH = 52 * scale;
  const rowH = 50 * scale;
  const cardH = headerH + rowH * 10 + 2 * scale; // header + 10 rows + bottom pad
  const cardX = cardMargin;
  const cardY = (height - cardH) / 2;
  const cardR = 12 * scale;

  // Card background
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.fillStyle = "rgba(22, 22, 22, 0.92)";
  ctx.fill();
  ctx.strokeStyle = "#2A2A2A";
  ctx.lineWidth = 1 * scale;
  ctx.stroke();
  ctx.restore();

  // Clip to card for inner drawing
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
  ctx.clip();

  const colW = cardW / 2;
  const leftX = cardX;
  const rightX = cardX + colW;

  // Header
  const headerY = cardY;
  // Left header bg
  ctx.fillStyle = "#161616";
  ctx.fillRect(leftX, headerY, colW, headerH);
  // Right header bg
  ctx.fillStyle = "#1C1C1C";
  ctx.fillRect(rightX, headerY, colW, headerH);
  // Divider
  ctx.fillStyle = "#2A2A2A";
  ctx.fillRect(leftX + colW - 0.5 * scale, headerY, 1 * scale, headerH);

  // Header text
  const headerFontSize = Math.round(16 * scale);
  ctx.font = `500 ${headerFontSize}px "Roboto Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "#D45B5B"; // base currency in red
  ctx.fillText(baseCurrency, leftX + colW / 2, headerY + headerH / 2);

  ctx.fillStyle = "#D4A843"; // quote currency in amber
  ctx.fillText(quoteCurrency, rightX + colW / 2, headerY + headerH / 2);

  // Arrow in center
  ctx.fillStyle = "#4A4540";
  const arrowSize = 8 * scale;
  const arrowCX = leftX + colW;
  const arrowCY = headerY + headerH / 2;
  ctx.beginPath();
  ctx.moveTo(arrowCX - arrowSize / 2, arrowCY - arrowSize / 2);
  ctx.lineTo(arrowCX + arrowSize / 2, arrowCY);
  ctx.lineTo(arrowCX - arrowSize / 2, arrowCY + arrowSize / 2);
  ctx.fill();

  // Header bottom divider
  ctx.fillStyle = "#2A2A2A";
  ctx.fillRect(leftX, headerY + headerH, cardW, 1 * scale);

  // Data rows
  const rowFontSize = Math.round(18 * scale);
  ctx.font = `400 ${rowFontSize}px "Roboto Mono", monospace`;

  for (let i = 0; i < 10; i++) {
    const baseAmount = (i + 1) * multiplier;
    const convertedAmount = baseAmount * rate;
    const rowY = headerY + headerH + 1 * scale + i * rowH;

    // Left bg
    ctx.fillStyle = "#161616";
    ctx.fillRect(leftX, rowY, colW, rowH);
    // Right bg
    ctx.fillStyle = "#1C1C1C";
    ctx.fillRect(rightX, rowY, colW, rowH);

    // Vertical divider
    ctx.fillStyle = "#2A2A2A";
    ctx.fillRect(leftX + colW - 0.5 * scale, rowY, 1 * scale, rowH);

    // Row divider (except last)
    if (i < 9) {
      ctx.fillStyle = "#2A2A2A";
      ctx.fillRect(leftX, rowY + rowH - 0.5 * scale, cardW, 0.5 * scale);
    }

    // Left text (base amount)
    ctx.fillStyle = "#F0E6D3";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const baseText = `${baseSymbol}${formatWallpaperAmount(baseAmount)}`;
    ctx.fillText(baseText, leftX + colW / 2, rowY + rowH / 2);

    // Right text (converted amount)
    ctx.fillStyle = "#F0E6D3";
    const quoteText = `${quoteSymbol}${formatWallpaperAmount(convertedAmount)}`;
    ctx.fillText(quoteText, rightX + colW / 2, rowY + rowH / 2);
  }

  ctx.restore(); // Unclip

  // Watermark
  const wmFontSize = Math.round(10 * scale);
  ctx.font = `400 ${wmFontSize}px "DM Sans", sans-serif`;
  ctx.fillStyle = "#4A4540";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("MONETA", width / 2, cardY + cardH + 16 * scale);

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

function formatWallpaperAmount(value: number): string {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
