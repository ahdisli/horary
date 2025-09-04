// API response types for all backend communications

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface EdgeFunctionResponse<T> {
  data: T;
  error?: string;
}

// Tool response types for OpenAI Realtime API
export interface GetUserDetailsResponse {
  birth_date: string | null;
  birth_time: string | null;
  location: {
    lat: number;
    lon: number;
    city?: string;
    country?: string;
  } | null;
  zodiac_sign: string | null;
  preferences: Record<string, unknown>;
  timezone: string | null;
}

export interface GetPlanetaryPositionsResponse {
  timestamp: string;
  location: {
    lat: number;
    lon: number;
  };
  planets: Array<{
    name: string;
    longitude: number;
    latitude: number;
    sign: string;
    degree: number;
    minute: number;
    house: number;
    retrograde: boolean;
  }>;
  houses: Array<{
    number: number;
    cusp: number;
    sign: string;
  }>;
  ascendant: number;
  midheaven: number;
}

export interface GenerateHoraryChartResponse {
  query_id: string;
  chart_data: {
    timestamp: string;
    location: {
      lat: number;
      lon: number;
      city?: string;
      country?: string;
    };
    planets: Array<{
      name: string;
      longitude: number;
      latitude: number;
      sign: string;
      degree: number;
      minute: number;
      house: number;
      retrograde: boolean;
    }>;
    houses: Array<{
      number: number;
      cusp: number;
      sign: string;
    }>;
    aspects: Array<{
      planet1: string;
      planet2: string;
      type: string;
      orb: number;
      exact_degree: number;
      applying: boolean;
      separating: boolean;
    }>;
    ascendant: number;
    midheaven: number;
  };
  interpretation_prompt: string;
  significance_factors: string[];
}

export interface GetZodiacInsightsResponse {
  sign: string;
  type: string;
  description: string;
  strengths: string[];
  challenges: string[];
  compatible_signs?: string[];
  current_influences?: string[];
  advice: string;
}

export interface GetCurrentAstroDataResponse {
  timestamp: string;
  moon_phase?: {
    phase: string;
    illumination: number;
    next_new_moon: string;
    next_full_moon: string;
  };
  retrograde_planets?: string[];
  void_of_course?: {
    is_void: boolean;
    void_until?: string;
  };
  daily_aspects?: Array<{
    time: string;
    planet1: string;
    planet2: string;
    aspect: string;
    orb: number;
  }>;
}

export interface SaveQueryHistoryResponse {
  success: boolean;
  query_id: string;
  message: string;
}

// Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class EdgeFunctionError extends Error {
  constructor(message: string, public functionName: string) {
    super(message);
    this.name = 'EdgeFunctionError';
  }
}
