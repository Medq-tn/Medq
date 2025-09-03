import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get the canonical base URL for building absolute links in emails and redirects
export function getBaseUrl(): string {
  // Use only NEXT_PUBLIC_APP_URL; fallback to https://medq.tn
  const raw = (process.env.NEXT_PUBLIC_APP_URL || '').trim();
  if (raw) {
    // Ensure protocol and remove trailing slash(es)
    const withProtocol = /^(https?:)?\/\//i.test(raw) ? raw : `https://${raw}`;
    return withProtocol.replace(/\/+$/, '');
  }
  return 'https://medq.tn';
}
