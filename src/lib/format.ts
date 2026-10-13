import { isTodo } from "@/content/helpers";
import type { Todo } from "@/content/types";

const monthYear = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const stampMonth = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const fullDate = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "2025-01" becomes "January 2025"; "2025-01-12" becomes "12 January 2025". */
export function formatDate(value: string | Todo): string {
  if (isTodo(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) {
    return monthYear.format(new Date(`${value}-01T00:00:00Z`));
  }
  return fullDate.format(new Date(`${value}T00:00:00Z`));
}

/** 1500 becomes "1,500". TODO values pass through. */
export function formatCount(value: number | Todo): string {
  return typeof value === "number" ? value.toLocaleString("en-IN") : value;
}

/**
 * A date as a library stamp prints it: "2025-01" becomes "JAN 2025". Only
 * for confirmed dates (TODO values have nothing to stamp).
 */
export function formatStamp(value: string): string {
  const month = value.slice(0, 7);
  return stampMonth
    .formatToParts(new Date(`${month}-01T00:00:00Z`))
    .filter((part) => part.type === "month" || part.type === "year")
    .map((part) => part.value.toUpperCase())
    .join(" ");
}
