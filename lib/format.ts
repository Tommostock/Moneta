// Format amount with 2 decimal places and thousand separators
export function formatAmount(value: number): string {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Format rate with 4 decimal places
export function formatRate(value: number): string {
  return value.toFixed(4);
}

// Pad a string to a fixed length for the split-flap display
export function padDisplay(value: string, length: number): string {
  return value.padStart(length, " ");
}

// Strip non-numeric characters except decimal point
export function sanitizeNumericInput(value: string): string {
  // Strip commas and other non-numeric chars first
  const stripped = value.replace(/,/g, "");
  let hasDecimal = false;
  return stripped
    .split("")
    .filter((ch) => {
      if (ch >= "0" && ch <= "9") return true;
      if (ch === "." && !hasDecimal) {
        hasDecimal = true;
        return true;
      }
      return false;
    })
    .join("");
}

// Format a numeric string with thousand separators for display
export function formatInputDisplay(raw: string): string {
  if (!raw) return "";
  const parts = raw.split(".");
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
}
