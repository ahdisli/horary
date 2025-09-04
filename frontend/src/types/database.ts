// Database types - these will be generated from Supabase CLI later
// For now, we define the basic structure

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
          birth_location: {
            lat: number;
            lon: number;
            city?: string;
            country?: string;
          } | null;
          timezone: string | null;
          zodiac_sign: string | null;
          preferences: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          birth_location?: {
            lat: number;
            lon: number;
            city?: string;
            country?: string;
          } | null;
          timezone?: string | null;
          zodiac_sign?: string | null;
          preferences?: Record<string, unknown>;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          birth_date?: string | null;
          birth_time?: string | null;
          birth_location?: {
            lat: number;
            lon: number;
            city?: string;
            country?: string;
          } | null;
          timezone?: string | null;
          zodiac_sign?: string | null;
          preferences?: Record<string, unknown>;
          updated_at?: string;
        };
      };
      horary_queries: {
        Row: {
          id: string;
          user_id: string;
          question: string;
          question_time: string;
          location: {
            lat: number;
            lon: number;
            city?: string;
            country?: string;
          };
          chart_data: Record<string, unknown> | null;
          ai_interpretation: string | null;
          status: 'processing' | 'completed' | 'failed';
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          question: string;
          question_time: string;
          location: {
            lat: number;
            lon: number;
            city?: string;
            country?: string;
          };
          chart_data?: Record<string, unknown> | null;
          ai_interpretation?: string | null;
          status?: 'processing' | 'completed' | 'failed';
          metadata?: Record<string, unknown>;
        };
        Update: {
          question?: string;
          question_time?: string;
          location?: {
            lat: number;
            lon: number;
            city?: string;
            country?: string;
          };
          chart_data?: Record<string, unknown> | null;
          ai_interpretation?: string | null;
          status?: 'processing' | 'completed' | 'failed';
          metadata?: Record<string, unknown>;
          updated_at?: string;
        };
      };
    };
  };
}
