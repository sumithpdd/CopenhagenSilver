import { clsx, type ClassValue } from 'clsx';

/** Merge class names (tailwind-friendly). */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
