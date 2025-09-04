// Core astrology types - these match the Edge Function responses

export type ZodiacSign = 
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' 
  | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' 
  | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export type Planet = 
  | 'Sun' | 'Moon' | 'Mercury' | 'Venus' | 'Mars' 
  | 'Jupiter' | 'Saturn' | 'Uranus' | 'Neptune' | 'Pluto';

export type AspectType = 
  | 'conjunction' | 'opposition' | 'trine' | 'square' 
  | 'sextile' | 'quincunx' | 'semisextile' | 'semisquare' | 'sesquiquadrate';

export interface PlanetaryPosition {
  name: Planet;
  longitude: number;
  latitude: number;
  sign: ZodiacSign;
  degree: number;
  minute: number;
  house: number;
  retrograde: boolean;
}

export interface HousePosition {
  number: number;
  cusp: number;
  sign: ZodiacSign;
}

export interface Aspect {
  planet1: Planet;
  planet2: Planet;
  type: AspectType;
  orb: number;
  exact_degree: number;
  applying: boolean;
  separating: boolean;
}

export interface Location {
  lat: number;
  lon: number;
  city?: string;
  country?: string;
}

export interface ChartData {
  timestamp: string;
  location: Location;
  planets: PlanetaryPosition[];
  houses: HousePosition[];
  aspects: Aspect[];
  ascendant: number;
  midheaven: number;
}

export interface HoraryQuery {
  id: string;
  user_id: string;
  question: string;
  question_time: string;
  location: Location;
  chart_data: ChartData | null;
  ai_interpretation: string | null;
  status: 'processing' | 'completed' | 'failed';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MoonPhase {
  phase: string;
  illumination: number;
  next_new_moon: string;
  next_full_moon: string;
}

export interface VoidOfCourse {
  is_void: boolean;
  void_until?: string;
}

export interface DailyAspect {
  time: string;
  planet1: Planet;
  planet2: Planet;
  aspect: AspectType;
  orb: number;
}
