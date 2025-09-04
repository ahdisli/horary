// Supabase client configuration for frontend
// NO astrology calculations here - all done in Edge Functions

import { createBrowserClient } from '@supabase/ssr';
import { ApiError, EdgeFunctionError } from '@/types/api';
import type {
  GetPlanetaryPositionsResponse,
  GenerateHoraryChartResponse,
  GetZodiacInsightsResponse,
  GetCurrentAstroDataResponse,
} from '@/types/api';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client-side Supabase client (simplified types for now)
export const supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);

// API client with error handling - NO astro calculations here
export class SupabaseApiClient {
  private client = supabaseClient;

  // Call Edge Function for planetary calculations
  async getPlanetaryPositions(
    timestamp?: string,
    location?: { lat: number; lon: number }
  ): Promise<GetPlanetaryPositionsResponse> {
    try {
      const { data, error } = await this.client.functions.invoke('planetary-positions', {
        body: { timestamp, location },
      });

      if (error) throw new EdgeFunctionError(error.message, 'planetary-positions');
      return data as GetPlanetaryPositionsResponse;
    } catch (error) {
      if (error instanceof EdgeFunctionError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'EDGE_FUNCTION_CALL_FAILED'
      );
    }
  }

  // Call test function (currently available)
  async testFunction(): Promise<{
    message: string;
    timestamp: string;
    method: string;
    openai_configured: boolean;
    url: string;
  }> {
    try {
      const { data, error } = await this.client.functions.invoke('test-function', {
        body: { test: 'data' },
      });

      if (error) throw new EdgeFunctionError(error.message, 'test-function');
      return data;
    } catch (error) {
      if (error instanceof EdgeFunctionError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'EDGE_FUNCTION_CALL_FAILED'
      );
    }
  }

  // Call Edge Function for horary chart generation (planned)
  async generateHoraryChart(
    question: string,
    questionTime: string,
    location: { lat: number; lon: number; city?: string; country?: string },
    userId?: string
  ): Promise<GenerateHoraryChartResponse> {
    try {
      const { data, error } = await this.client.functions.invoke('horary-chart', {
        body: {
          question,
          question_time: questionTime,
          location,
          user_id: userId,
        },
      });

      if (error) throw new EdgeFunctionError(error.message, 'horary-chart');
      return data as GenerateHoraryChartResponse;
    } catch (error) {
      if (error instanceof EdgeFunctionError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'EDGE_FUNCTION_CALL_FAILED'
      );
    }
  }

  // Call Edge Function for zodiac insights
  async getZodiacInsights(
    sign: string,
    type: string,
    targetSign?: string
  ): Promise<GetZodiacInsightsResponse> {
    try {
      const { data, error } = await this.client.functions.invoke('zodiac-insights', {
        body: {
          sign,
          type,
          target_sign: targetSign,
        },
      });

      if (error) throw new EdgeFunctionError(error.message, 'zodiac-insights');
      return data as GetZodiacInsightsResponse;
    } catch (error) {
      if (error instanceof EdgeFunctionError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'EDGE_FUNCTION_CALL_FAILED'
      );
    }
  }

  // Call Edge Function for current astro data
  async getCurrentAstroData(dataType: string): Promise<GetCurrentAstroDataResponse> {
    try {
      const { data, error } = await this.client.functions.invoke('astro-data', {
        body: {
          data_type: dataType,
        },
      });

      if (error) throw new EdgeFunctionError(error.message, 'astro-data');
      return data as GetCurrentAstroDataResponse;
    } catch (error) {
      if (error instanceof EdgeFunctionError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'EDGE_FUNCTION_CALL_FAILED'
      );
    }
  }

  // Database operations (simplified for now)
  async createQuery(queryData: {
    user_id: string;
    question: string;
    question_time: string;
    location: { lat: number; lon: number; city?: string; country?: string };
    chart_data?: Record<string, unknown> | null;
    ai_interpretation?: string | null;
    status?: 'processing' | 'completed' | 'failed';
    metadata?: Record<string, unknown>;
  }) {
    try {
      const { data, error } = await this.client
        .from('horary_queries')
        .insert(queryData)
        .select()
        .single();

      if (error) throw new ApiError(error.message, 400, 'SUPABASE_ERROR');
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'DATABASE_ERROR'
      );
    }
  }

  async getUserQueries(userId: string, limit = 50) {
    try {
      const { data, error } = await this.client
        .from('horary_queries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw new ApiError(error.message, 400, 'SUPABASE_ERROR');
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'DATABASE_ERROR'
      );
    }
  }

  async updateQueryInterpretation(queryId: string, interpretation: string) {
    try {
      const { error } = await this.client
        .from('horary_queries')
        .update({
          ai_interpretation: interpretation,
          status: 'completed' as const,
          updated_at: new Date().toISOString(),
        })
        .eq('id', queryId);

      if (error) throw new ApiError(error.message, 400, 'SUPABASE_ERROR');
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'DATABASE_ERROR'
      );
    }
  }
}

// Export singleton instance
export const supabaseApi = new SupabaseApiClient();
