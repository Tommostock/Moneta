export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  // Reset time components for accurate day diff
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function tripStatus(
  departDate: string,
  returnDate: string
): { text: string; status: "upcoming" | "active" | "past" } {
  const daysToDepart = daysUntil(departDate);
  const daysToReturn = daysUntil(returnDate);

  if (daysToDepart > 0) {
    return { text: `${daysToDepart} days`, status: "upcoming" };
  }
  if (daysToReturn >= 0) {
    return { text: "You're there", status: "active" };
  }
  const daysSince = Math.abs(daysToReturn);
  return {
    text: `Ended ${daysSince} day${daysSince === 1 ? "" : "s"} ago`,
    status: "past",
  };
}

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
