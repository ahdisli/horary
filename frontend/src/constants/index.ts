// Application constants
// NO astrology calculations - those are in Edge Functions

export const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio', 
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

export const PLANETS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
] as const;

export const ASPECTS = [
  'conjunction', 'opposition', 'trine', 'square',
  'sextile', 'quincunx', 'semisextile', 'semisquare', 'sesquiquadrate'
] as const;

export const HOUSES = [
  '1st House', '2nd House', '3rd House', '4th House',
  '5th House', '6th House', '7th House', '8th House',
  '9th House', '10th House', '11th House', '12th House'
] as const;

// UI Constants
export const THEME_OPTIONS = ['light', 'dark', 'auto'] as const;

export const QUERY_STATUS_OPTIONS = ['processing', 'completed', 'failed'] as const;

// API Constants
export const API_ENDPOINTS = {
  TEST_FUNCTION: 'test-function',
  PLANETARY_POSITIONS: 'planetary-positions', // planned
  HORARY_CHART: 'horary-chart', // planned
  ZODIAC_INSIGHTS: 'zodiac-insights', // planned
  ASTRO_DATA: 'astro-data', // planned
} as const;

// Default values
export const DEFAULT_LOCATION = {
  lat: 51.5074, // London
  lon: -0.1278,
  city: 'London',
  country: 'United Kingdom'
} as const;

export const DEFAULT_ASPECT_ORBS = {
  conjunction: 8,
  opposition: 8,
  trine: 6,
  square: 6,
  sextile: 4,
  quincunx: 3,
  semisextile: 2,
  semisquare: 2,
  sesquiquadrate: 2
} as const;

// Validation constants
export const VALIDATION_RULES = {
  MIN_QUESTION_LENGTH: 10,
  MAX_QUESTION_LENGTH: 500,
  MAX_QUERIES_PER_DAY: 50,
  MAX_QUERIES_CACHE: 50
} as const;

// Animation durations (for Framer Motion)
export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
  CHART: 0.8
} as const;

// Breakpoints (Tailwind-based)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  AUTH_REQUIRED: 'Authentication required. Please sign in to continue.',
  INVALID_QUESTION: 'Please provide a valid horary question.',
  LOCATION_REQUIRED: 'Location is required for accurate chart calculation.',
  CALCULATION_FAILED: 'Chart calculation failed. Please try again.',
  RATE_LIMIT: 'Too many requests. Please wait before submitting another question.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  CHART_GENERATED: 'Horary chart generated successfully!',
  QUERY_SAVED: 'Your question has been saved.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  SETTINGS_SAVED: 'Settings saved successfully.'
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'horary-theme',
  USER_PREFERENCES: 'horary-user-preferences',
  RECENT_LOCATIONS: 'horary-recent-locations',
  DRAFT_QUESTION: 'horary-draft-question'
} as const;

// OpenAI Realtime API constants
export const OPENAI_CONFIG = {
  MODEL: 'gpt-4o-realtime-preview-2024-10-01',
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.7,
  VOICE: 'alloy'
} as const;

// Chart display constants
export const CHART_CONFIG = {
  WHEEL_SIZE: 400,
  PLANET_SYMBOL_SIZE: 20,
  ASPECT_LINE_WIDTH: 1,
  HOUSE_LINE_WIDTH: 2,
  DEFAULT_STROKE_COLOR: '#4B5563',
  HIGHLIGHT_COLOR: '#3B82F6'
} as const;
