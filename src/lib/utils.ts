/**
 * Utility functions for the application
 * @module lib/utils
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names using clsx and tailwind-merge
 * Handles conditional classes and resolves Tailwind conflicts
 * @param {...ClassValue} inputs - Class names or conditional class objects
 * @returns {string} Merged class string
 * @example
 * cn("px-2", "px-4") // Returns "px-4" (last one wins)
 * cn("foo", true && "bar", false && "baz") // Returns "foo bar"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
