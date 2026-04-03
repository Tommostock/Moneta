export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Get date string N days ago in YYYY-MM-DD format
export function daysAgoDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

export function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}
