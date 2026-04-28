import { type ClassValue, clsx } from "clsx";
import type * as React from "react";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["xxs"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stopPropagation(e: Event | React.SyntheticEvent) {
  e.stopPropagation();
}

export function getInitials(source: string, defaultValue: string = "?") {
  source = source.trim();

  if (!source) {
    return defaultValue;
  }

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function hashedIndex(value: string, itemsLength: number) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % itemsLength;
}

export function range(length: number) {
  return Array.from({ length }).map((_, idx) => idx);
}
