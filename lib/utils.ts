import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalize(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function relativeDateString(date: Date | string | number): string {
  const WEEK = 7;
  const now = new Date();
  const givenDate = new Date(date);

  const diffTime = Math.floor((givenDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffTime === 0) return "Today";
  if (diffTime === -1) return "Yesterday";
  if (diffTime === 1) return "Tomorrow";
  if (Math.abs(diffTime) < WEEK)
      return diffTime > 0 ? `In ${diffTime} days` : `${-diffTime} days ago`;

  return givenDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); 
}

