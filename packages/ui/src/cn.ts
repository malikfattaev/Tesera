import { clsx, type ClassValue } from "clsx";

/** Conditional className helper used across the Tesera design system. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
