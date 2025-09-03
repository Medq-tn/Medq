import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get the canonical base URL for building absolute links in emails and redirects
export function getBaseUrl(): string {
  // Prefer explicit server-side URL if provided
  const serverUrl = process.env.APP_URL || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (serverUrl) {
    // If VERCEL_URL is just the host, add protocol
    if (/^[^:\/]+\.[^:]+$/.test(serverUrl)) {
      return `https://${serverUrl}`;
    }
    return serverUrl.replace(/\/$/, '');
  }
  // Fallback to production-safe default rather than localhost
  return 'https://medq.tn';
}
