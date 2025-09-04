// Utility functions for the app
// NO astrology calculations - those are in Edge Functions

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind CSS class merger utility
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Date utilities
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Location utilities
export function formatLocation(location: {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}): string {
  if (location.city && location.country) {
    return `${location.city}, ${location.country}`;
  }
  if (location.city) {
    return location.city;
  }
  return `${location.lat.toFixed(2)}°, ${location.lon.toFixed(2)}°`;
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidCoordinate(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

// String utilities
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Error handling utilities
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}

// Local storage utilities with type safety
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // localStorage is not available or quota exceeded
    if (isDevelopment()) {
      throw new Error(`Failed to save to localStorage: ${getErrorMessage(error)}`);
    }
  }
}

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    if (isDevelopment()) {
      throw new Error(`Failed to read from localStorage: ${getErrorMessage(error)}`);
    }
    return defaultValue;
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    if (isDevelopment()) {
      throw new Error(`Failed to remove from localStorage: ${getErrorMessage(error)}`);
    }
  }
}

// API utilities
export function createQueryString(params: Record<string, string | number | boolean>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, value.toString());
  });
  
  return searchParams.toString();
}

// Debounce utility for input handling
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Environment variable helpers
export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value || defaultValue || '';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}
