import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with conflict resolution.
 * @example cn("px-4 py-2", isActive && "bg-blue-500", className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
