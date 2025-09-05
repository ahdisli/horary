# API Documentation & Integration Guide

## 🔗 API Architecture Overview

This document outlines the API structure, integration patterns, and tool definitions for the Horary Astrology App's backend communication.

**Architecture Principle**: All astrology calculations happen in Supabase Edge Functions using @nrweb/astro-calc. The frontend remains lightweight and only handles UI and API communication.

## 🚀 Supabase Edge Functions

### Edge Function Structure
```
supabase/functions/
├── test-function/          # Simple test function for development
└── shared/                 # Shared utilities (planned)
    ├── astro-calc.ts       # @nrweb/astro-calc wrapper
    └── types.ts            # Shared TypeScript types
```

### Planned Edge Functions
- `planetary-positions/` - Calculate current planetary positions
- `horary-chart/` - Generate complete horary chart
- `zodiac-insights/` - Get zodiac sign insights
- `astro-data/` - Current astrological events

### Edge Function Dependencies
```typescript
// In each Edge Function's import_map.json
{
  "imports": {
    "@nrweb/astro-calc": "https://esm.sh/@nrweb/astro-calc@latest",
    "openai": "https://esm.sh/openai@latest"
  }
}
```

## 📡 Supabase Database Schema

### Core Tables

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_location JSONB, -- { lat: number, lon: number, city: string, country: string }
  timezone TEXT,
  zodiac_sign TEXT,
  preferences JSONB DEFAULT '{}', -- User preferences and settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `horary_queries`
```sql
CREATE TABLE horary_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location JSONB NOT NULL, -- { lat: number, lon: number, city: string }
  chart_data JSONB, -- Full chart calculation results
  ai_interpretation TEXT,
  status TEXT CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
  metadata JSONB DEFAULT '{}', -- Additional query metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `planetary_positions`
```sql
CREATE TABLE planetary_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID REFERENCES horary_queries(id) ON DELETE CASCADE,
  planet_name TEXT NOT NULL,
  longitude NUMERIC(10, 6) NOT NULL,
  latitude NUMERIC(10, 6),
  sign TEXT NOT NULL,
  degree INTEGER NOT NULL,
  minute INTEGER NOT NULL,
  house INTEGER NOT NULL,
  retrograde BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `aspects`
```sql
CREATE TABLE aspects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID REFERENCES horary_queries(id) ON DELETE CASCADE,
  planet1 TEXT NOT NULL,
  planet2 TEXT NOT NULL,
  aspect_type TEXT NOT NULL, -- conjunction, opposition, trine, square, sextile, etc.
  orb NUMERIC(5, 2) NOT NULL,
  exact_degree NUMERIC(10, 6) NOT NULL,
  applying BOOLEAN NOT NULL,
  separating BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### TypeScript Database Types
```typescript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          birth_date: string | null;
          birth_time: string | null;
          birth_location: BirthLocation | null;
          timezone: string | null;
          zodiac_sign: string | null;
          preferences: UserPreferences;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          birth_location?: BirthLocation | null;
          timezone?: string | null;
          zodiac_sign?: string | null;
          preferences?: UserPreferences;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          birth_location?: BirthLocation | null;
          timezone?: string | null;
          zodiac_sign?: string | null;
          preferences?: UserPreferences;
          updated_at?: string;
        };
      };
      horary_queries: {
        Row: {
          id: string;
          user_id: string;
          question: string;
          question_time: string;
          location: QueryLocation;
          chart_data: ChartData | null;
          ai_interpretation: string | null;
          status: QueryStatus;
          metadata: QueryMetadata;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question: string;
          question_time: string;
          location: QueryLocation;
          chart_data?: ChartData | null;
          ai_interpretation?: string | null;
          status?: QueryStatus;
          metadata?: QueryMetadata;
        };
        Update: {
          question?: string;
          question_time?: string;
          location?: QueryLocation;
          chart_data?: ChartData | null;
          ai_interpretation?: string | null;
          status?: QueryStatus;
          metadata?: QueryMetadata;
          updated_at?: string;
        };
      };
      // ... other table types
    };
  };
}
```

## 🛠️ OpenAI Realtime API Tools

### Tool Definitions

#### 1. `getUserDetails`
```typescript
interface GetUserDetailsParams {
  user_id: string;
}

interface GetUserDetailsResponse {
  birth_date: string | null;
  birth_time: string | null;
  location: BirthLocation | null;
  zodiac_sign: string | null;
  preferences: UserPreferences;
  timezone: string | null;
}

// Tool implementation
export async function getUserDetails(params: GetUserDetailsParams): Promise<GetUserDetailsResponse> {
  const { data, error } = await supabase
    .from('users')
    .select('birth_date, birth_time, birth_location, zodiac_sign, preferences, timezone')
    .eq('id', params.user_id)
    .single();

  if (error) throw new Error(`Failed to fetch user details: ${error.message}`);
  
  return {
    birth_date: data.birth_date,
    birth_time: data.birth_time,
    location: data.birth_location,
    zodiac_sign: data.zodiac_sign,
    preferences: data.preferences,
    timezone: data.timezone
  };
}
```

#### 2. `getCurrentPlanetaryPositions`
```typescript
interface GetCurrentPlanetaryPositionsParams {
  timestamp?: string; // ISO string, defaults to now
  location?: {
    lat: number;
    lon: number;
  };
}

interface PlanetaryPosition {
  name: string;
  longitude: number;
  latitude: number;
  sign: string;
  degree: number;
  minute: number;
  house: number;
  retrograde: boolean;
}

interface GetCurrentPlanetaryPositionsResponse {
  timestamp: string;
  location: {
    lat: number;
    lon: number;
  };
  planets: PlanetaryPosition[];
  houses: HousePosition[];
  ascendant: number;
  midheaven: number;
}

// Tool implementation using @nrweb/astro-calc in Supabase Edge Function
export async function getCurrentPlanetaryPositions(
  params: GetCurrentPlanetaryPositionsParams
): Promise<GetCurrentPlanetaryPositionsResponse> {
  // This function runs in Supabase Edge Function (Deno runtime)
  const timestamp = params.timestamp || new Date().toISOString();
  const location = params.location || { lat: 0, lon: 0 }; // Default to Greenwich
  
  const date = new Date(timestamp);
  const julianDay = astroCalc.getJulianDay(date);
  
  const planets = await Promise.all([
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 
    'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'
  ].map(async (planetName) => {
    const position = await astroCalc.getPlanetPosition(planetName, julianDay);
    const sign = astroCalc.getZodiacSign(position.longitude);
    const { degree, minute } = astroCalc.getDegreeMinute(position.longitude);
    
    return {
      name: planetName,
      longitude: position.longitude,
      latitude: position.latitude,
      sign: sign.name,
      degree,
      minute,
      house: astroCalc.getHouse(position.longitude, location.lat, location.lon, julianDay),
      retrograde: position.speed < 0
    };
  }));
  
  const houses = await astroCalc.getHouses(location.lat, location.lon, julianDay);
  const ascendant = houses[0].cusp;
  const midheaven = houses[9].cusp;
  
  return {
    timestamp,
    location,
    planets,
    houses,
    ascendant,
    midheaven
  };
}
```

#### 3. `generateHoraryChart`
```typescript
interface GenerateHoraryChartParams {
  question: string;
  question_time: string;
  location: {
    lat: number;
    lon: number;
    city?: string;
    country?: string;
  };
  user_id?: string;
}

interface HoraryChartResponse {
  query_id: string;
  chart_data: ChartData;
  interpretation_prompt: string;
  significance_factors: string[];
}

export async function generateHoraryChart(
  params: GenerateHoraryChartParams
): Promise<HoraryChartResponse> {
  // This function runs in Supabase Edge Function
  
  // 1. Calculate planetary positions using Edge Function
  const planetaryData = await getCurrentPlanetaryPositions({
    timestamp: params.question_time,
    location: params.location
  });
  
  // 2. Calculate aspects (Edge Function logic)
  const aspects = calculateAspects(planetaryData.planets);
  
  // 3. Generate chart data
  const chartData: ChartData = {
    timestamp: params.question_time,
    location: params.location,
    planets: planetaryData.planets,
    houses: planetaryData.houses,
    aspects,
    ascendant: planetaryData.ascendant,
    midheaven: planetaryData.midheaven
  };
  
  // 4. Save to database (from Edge Function)
  const { data: queryData, error } = await supabase
    .from('horary_queries')
    .insert({
      user_id: params.user_id,
      question: params.question,
      question_time: params.question_time,
      location: params.location,
      chart_data: chartData,
      status: 'processing'
    })
    .select()
    .single();
  
  if (error) throw new Error(`Failed to save query: ${error.message}`);
  
  // 5. Generate interpretation prompt
  const interpretationPrompt = generateInterpretationPrompt(chartData, params.question);
  
  // 6. Identify significance factors
  const significanceFactors = identifySignificanceFactors(chartData);
  
  return {
    query_id: queryData.id,
    chart_data: chartData,
    interpretation_prompt: interpretationPrompt,
    significance_factors: significanceFactors
  };
}
```

#### 4. `getZodiacInsights`
```typescript
interface GetZodiacInsightsParams {
  sign: ZodiacSign;
  type: 'daily' | 'compatibility' | 'general' | 'current_transits';
  target_sign?: ZodiacSign; // For compatibility readings
}

interface ZodiacInsightsResponse {
  sign: ZodiacSign;
  type: string;
  description: string;
  strengths: string[];
  challenges: string[];
  compatible_signs?: ZodiacSign[];
  current_influences?: string[];
  advice: string;
}

export async function getZodiacInsights(
  params: GetZodiacInsightsParams
): Promise<ZodiacInsightsResponse> {
  const { sign, type, target_sign } = params;
  
  // Get current planetary positions for transit analysis
  const currentPositions = await getCurrentPlanetaryPositions({});
  
  switch (type) {
    case 'daily':
      return generateDailyInsights(sign, currentPositions);
    case 'compatibility':
      if (!target_sign) throw new Error('Target sign required for compatibility reading');
      return generateCompatibilityInsights(sign, target_sign);
    case 'current_transits':
      return generateTransitInsights(sign, currentPositions);
    default:
      return generateGeneralInsights(sign);
  }
}
```

#### 5. `getCurrentAstroData`
```typescript
interface GetCurrentAstroDataParams {
  data_type: 'moon_phase' | 'retrogrades' | 'void_of_course' | 'daily_aspects' | 'all';
}

interface CurrentAstroDataResponse {
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

export async function getCurrentAstroData(
  params: GetCurrentAstroDataParams
): Promise<CurrentAstroDataResponse> {
  const now = new Date();
  const currentPositions = await getCurrentPlanetaryPositions({});
  
  const response: CurrentAstroDataResponse = {
    timestamp: now.toISOString()
  };
  
  if (params.data_type === 'moon_phase' || params.data_type === 'all') {
    response.moon_phase = await calculateMoonPhase(now);
  }
  
  if (params.data_type === 'retrogrades' || params.data_type === 'all') {
    response.retrograde_planets = currentPositions.planets
      .filter(planet => planet.retrograde)
      .map(planet => planet.name);
  }
  
  if (params.data_type === 'void_of_course' || params.data_type === 'all') {
    response.void_of_course = await calculateVoidOfCourse(currentPositions);
  }
  
  if (params.data_type === 'daily_aspects' || params.data_type === 'all') {
    response.daily_aspects = await calculateDailyAspects(now);
  }
  
  return response;
}
```

#### 6. `saveQueryHistory`
```typescript
interface SaveQueryHistoryParams {
  user_id: string;
  question: string;
  response: string;
  query_id?: string;
  metadata?: Record<string, any>;
}

interface SaveQueryHistoryResponse {
  success: boolean;
  query_id: string;
  message: string;
}

export async function saveQueryHistory(
  params: SaveQueryHistoryParams
): Promise<SaveQueryHistoryResponse> {
  const { user_id, question, response, query_id, metadata } = params;
  
  try {
    if (query_id) {
      // Update existing query
      const { error } = await supabase
        .from('horary_queries')
        .update({
          ai_interpretation: response,
          status: 'completed',
          metadata: metadata || {},
          updated_at: new Date().toISOString()
        })
        .eq('id', query_id);
      
      if (error) throw error;
      
      return {
        success: true,
        query_id,
        message: 'Query updated successfully'
      };
    } else {
      // Create new query (for non-horary questions)
      const { data, error } = await supabase
        .from('horary_queries')
        .insert({
          user_id,
          question,
          question_time: new Date().toISOString(),
          location: { lat: 0, lon: 0, city: 'Unknown' }, // Default location
          ai_interpretation: response,
          status: 'completed',
          metadata: metadata || {}
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        query_id: data.id,
        message: 'Query saved successfully'
      };
    }
  } catch (error) {
    console.error('Failed to save query history:', error);
    return {
      success: false,
      query_id: query_id || '',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

## 🔧 API Client Implementation

### Supabase Client Configuration
```typescript
// lib/supabase.ts - Frontend client configuration
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Client-side Supabase client (updated for @supabase/ssr)
export const supabaseClient = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// API client with error handling - NO astro calculations here
export class SupabaseApiClient {
  private client = supabaseClient;

  // Call Edge Function for planetary calculations
  async getPlanetaryPositions(timestamp?: string, location?: { lat: number; lon: number }) {
    const { data, error } = await this.client.functions.invoke('planetary-positions', {
      body: { timestamp, location }
    });

    if (error) throw new ApiError(error.message, 400, 'EDGE_FUNCTION_ERROR');
    return data;
  }

  // Call Edge Function for chart generation
  async generateChart(question: string, questionTime: string, location: any, userId?: string) {
    const { data, error } = await this.client.functions.invoke('generate-chart', {
      body: { question, question_time: questionTime, location, user_id: userId }
    });

    if (error) throw new ApiError(error.message, 400, 'EDGE_FUNCTION_ERROR');
    return data;
  }

  async createQuery(query: Database['public']['Tables']['horary_queries']['Insert']) {
    const { data, error } = await this.client
      .from('horary_queries')
      .insert(query)
      .select()
      .single();

    if (error) throw new ApiError(error.message, 400, 'SUPABASE_ERROR');
    return data;
  }

  async getUserQueries(userId: string, limit = 50) {
    const { data, error } = await this.client
      .from('horary_queries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new ApiError(error.message, 400, 'SUPABASE_ERROR');
    return data;
  }

  async updateQueryInterpretation(queryId: string, interpretation: string) {
    const { error } = await this.client
      .from('horary_queries')
      .update({ 
        ai_interpretation: interpretation,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', queryId);

    if (error) throw new ApiError(error.message, 400, 'SUPABASE_ERROR');
  }
}
```

This API documentation provides a comprehensive foundation for implementing all backend integrations while maintaining type safety and proper error handling throughout the application.
