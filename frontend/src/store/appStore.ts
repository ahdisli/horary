// Main application store using Zustand
// Lightweight state management for the app

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ChartData, HoraryQuery } from '@/types/astrology';

// User interface
interface User {
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
  zodiac_sign: string | null;
}

// Theme type
type Theme = 'light' | 'dark' | 'auto';

// App state interface
interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Current session
  currentQuestion: string;
  currentChart: ChartData | null;
  currentQueryId: string | null;
  
  // UI state
  theme: Theme;
  isVoiceActive: boolean;
  isLoading: boolean;
  
  // Recent queries cache
  recentQueries: HoraryQuery[];
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setCurrentQuestion: (question: string) => void;
  setCurrentChart: (chart: ChartData | null) => void;
  setCurrentQueryId: (queryId: string | null) => void;
  setTheme: (theme: Theme) => void;
  toggleVoice: () => void;
  setLoading: (loading: boolean) => void;
  setRecentQueries: (queries: HoraryQuery[]) => void;
  addQuery: (query: HoraryQuery) => void;
  updateQuery: (queryId: string, updates: Partial<HoraryQuery>) => void;
  clearSession: () => void;
}

// Create the store
export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      currentQuestion: '',
      currentChart: null,
      currentQueryId: null,
      theme: 'dark',
      isVoiceActive: false,
      isLoading: false,
      recentQueries: [],

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      
      setCurrentQuestion: (question) => set({ currentQuestion: question }),
      
      setCurrentChart: (chart) => set({ currentChart: chart }),
      
      setCurrentQueryId: (queryId) => set({ currentQueryId: queryId }),
      
      setTheme: (theme) => set({ theme }),
      
      toggleVoice: () => set((state) => ({ isVoiceActive: !state.isVoiceActive })),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setRecentQueries: (queries) => set({ recentQueries: queries }),
      
      addQuery: (query) => 
        set((state) => ({
          recentQueries: [query, ...state.recentQueries].slice(0, 50) // Keep last 50
        })),
      
      updateQuery: (queryId, updates) =>
        set((state) => ({
          recentQueries: state.recentQueries.map((query) =>
            query.id === queryId ? { ...query, ...updates } : query
          ),
          currentChart: 
            state.currentQueryId === queryId && updates.chart_data
              ? updates.chart_data
              : state.currentChart,
        })),
      
      clearSession: () =>
        set({
          currentQuestion: '',
          currentChart: null,
          currentQueryId: null,
          isVoiceActive: false,
          isLoading: false,
        }),
    }),
    {
      name: 'horary-app-store',
    }
  )
);

// Selectors for performance optimization
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useCurrentChart = () => useAppStore((state) => state.currentChart);
export const useCurrentQuestion = () => useAppStore((state) => state.currentQuestion);
export const useTheme = () => useAppStore((state) => state.theme);
export const useIsVoiceActive = () => useAppStore((state) => state.isVoiceActive);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useRecentQueries = () => useAppStore((state) => state.recentQueries);
