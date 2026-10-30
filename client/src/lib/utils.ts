import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Convert media URL dari API ke URL yang bisa diakses browser.
 * - Kalau sudah http(s)://... → return as is
 * - Kalau /uploads/... → prepend API base URL
 */
export function mediaUrl(path?: string | null): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
}
