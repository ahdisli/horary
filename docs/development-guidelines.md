# Development Guidelines & Architecture

## 🏗️ Architecture Overview

This document provides detailed guidelines for developing the Horary Astrology App with a focus on clean architecture, type safety, and scalable patterns.

## 📐 Component Architecture

### Component Hierarchy
```
App Layout
├── Navigation
├── Main Content Area
│   ├── Voice Interface
│   ├── Question Input
│   ├── Horary Chart Display
│   │   ├── Planetary Positions
│   │   ├── House System
│   │   └── Aspect Grid
│   ├── AI Interpretation
│   └── Query History
└── Footer
```

### Component Design Patterns

#### 1. Container/Presentation Pattern
```typescript
// Container Component (handles logic and state)
export function HoraryChartContainer({ questionId }: { questionId: string }) {
  const { chart, isLoading, error } = useHoraryChart(questionId);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!chart) return <EmptyState />;
  
  return <HoraryChartPresentation chart={chart} />;
}

// Presentation Component (pure display logic)
interface HoraryChartPresentationProps {
  chart: ChartData;
}

export function HoraryChartPresentation({ chart }: HoraryChartPresentationProps) {
  return (
    <div className="chart-container">
      <PlanetaryWheel planets={chart.planets} />
      <AspectGrid aspects={chart.aspects} />
      <HouseOverlay houses={chart.houses} />
    </div>
  );
}
```

#### 2. Custom Hooks Pattern
```typescript
// Custom hook for astrology calculations
export function useHoraryChart(questionId: string) {
  const [chart, setChart] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!questionId) return;
    
    const calculateChart = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const chartData = await astroCalculations.generateHoraryChart(questionId);
        setChart(chartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chart calculation failed');
      } finally {
        setIsLoading(false);
      }
    };

    calculateChart();
  }, [questionId]);

  return { chart, isLoading, error };
}
```

## 🗃️ State Management Architecture

### Zustand Store Structure
```typescript
// Main application store
interface AppStore {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  
  // Current session
  currentQuestion: string;
  currentChart: ChartData | null;
  
  // UI state
  theme: 'light' | 'dark' | 'auto';
  isVoiceActive: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setCurrentQuestion: (question: string) => void;
  setCurrentChart: (chart: ChartData | null) => void;
  toggleVoice: () => void;
}

// Astrology-specific store
interface AstrologyStore {
  // Chart data
  charts: Record<string, ChartData>;
  calculations: PlanetaryCalculations | null;
  
  // Settings
  houseSystem: HouseSystem;
  aspectOrbs: AspectOrbs;
  
  // Actions
  addChart: (id: string, chart: ChartData) => void;
  updateCalculations: (calculations: PlanetaryCalculations) => void;
  setHouseSystem: (system: HouseSystem) => void;
}

// Voice interaction store
interface VoiceStore {
  isConnected: boolean;
  isListening: boolean;
  isProcessing: boolean;
  currentTranscript: string;
  conversationHistory: ConversationEntry[];
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  startListening: () => void;
  stopListening: () => void;
  addToHistory: (entry: ConversationEntry) => void;
}
```

## 🔗 API Integration Patterns

### Supabase Integration
```typescript
// Type-safe database client
export class SupabaseClient {
  private client: SupabaseClientType;

  constructor() {
    this.client = createClientComponentClient<Database>();
  }

  async createHoraryQuery(query: HoraryQueryInsert): Promise<HoraryQuery> {
    const { data, error } = await this.client
      .from('horary_queries')
      .insert(query)
      .select()
      .single();

    if (error) throw new SupabaseError(error.message);
    return data;
  }

  async getUserQueries(userId: string): Promise<HoraryQuery[]> {
    const { data, error } = await this.client
      .from('horary_queries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new SupabaseError(error.message);
    return data;
  }
}
```

### OpenAI Realtime API Integration
```typescript
// WebSocket connection manager
export class OpenAIRealtimeClient {
  private ws: WebSocket | null = null;
  private eventHandlers: Map<string, (data: any) => void> = new Map();

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(process.env.NEXT_PUBLIC_OPENAI_REALTIME_URL!);
      
      this.ws.onopen = () => {
        this.authenticate();
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };
      
      this.ws.onerror = (error) => reject(error);
    });
  }

  sendToolCall(toolName: string, parameters: Record<string, any>): void {
    if (!this.ws) throw new Error('WebSocket not connected');
    
    this.ws.send(JSON.stringify({
      type: 'function_call',
      function: {
        name: toolName,
        arguments: JSON.stringify(parameters)
      }
    }));
  }

  onToolResponse(handler: (response: ToolResponse) => void): void {
    this.eventHandlers.set('tool_response', handler);
  }
}
```

## 🎯 Performance Optimization Patterns

### Memoization Strategies
```typescript
// Expensive calculation memoization
const calculateAspects = useMemo(() => {
  if (!planets || planets.length === 0) return [];
  
  return planets.reduce((aspects, planet, index) => {
    for (let i = index + 1; i < planets.length; i++) {
      const aspect = calculateAspectBetween(planet, planets[i]);
      if (aspect) aspects.push(aspect);
    }
    return aspects;
  }, [] as Aspect[]);
}, [planets]);

// Component memoization
const PlanetaryWheel = memo<PlanetaryWheelProps>(({ planets, houses }) => {
  return (
    <svg viewBox="0 0 400 400" className="planetary-wheel">
      {planets.map(planet => (
        <PlanetSymbol key={planet.name} planet={planet} />
      ))}
      {houses.map((house, index) => (
        <HouseDivision key={index} house={house} />
      ))}
    </svg>
  );
});
```

### Data Fetching Optimization
```typescript
// Optimistic updates pattern
export function useOptimisticQuery() {
  const queryClient = useQueryClient();
  
  const submitQuestion = useMutation({
    mutationFn: async (question: string) => {
      // Optimistic update
      const tempId = generateTempId();
      queryClient.setQueryData(['queries'], (old: HoraryQuery[] = []) => [
        { id: tempId, question, status: 'processing', created_at: new Date().toISOString() },
        ...old
      ]);
      
      // Actual API call
      const result = await api.submitHoraryQuestion(question);
      
      // Replace optimistic update with real data
      queryClient.setQueryData(['queries'], (old: HoraryQuery[] = []) =>
        old.map(q => q.id === tempId ? result : q)
      );
      
      return result;
    },
    onError: (error, question, context) => {
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: ['queries'] });
    }
  });
  
  return { submitQuestion };
}
```

## 🎨 Animation & UI Patterns

### Framer Motion Patterns
```typescript
// Smooth chart transitions
const chartVariants = {
  hidden: { opacity: 0, scale: 0.8, rotateY: -180 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    rotateY: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

const planetVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export function AnimatedChart({ chart }: { chart: ChartData }) {
  return (
    <motion.div
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      className="chart-container"
    >
      {chart.planets.map(planet => (
        <motion.div
          key={planet.name}
          variants={planetVariants}
          className="planet-symbol"
        >
          <PlanetSymbol planet={planet} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Responsive Design Patterns
```typescript
// Responsive hook
export function useResponsive() {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  return screenSize;
}

// Responsive component
export function ResponsiveChart({ chart }: { chart: ChartData }) {
  const screenSize = useResponsive();
  
  const chartSize = {
    mobile: { width: '100%', height: '300px' },
    tablet: { width: '500px', height: '500px' },
    desktop: { width: '700px', height: '700px' }
  }[screenSize];
  
  return (
    <div style={chartSize} className="chart-wrapper">
      <ChartDisplay chart={chart} size={screenSize} />
    </div>
  );
}
```

## 🔐 Error Handling Patterns

### Error Boundary Implementation
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ChartErrorBoundary extends Component<
  PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Chart calculation error:', error, errorInfo);
    // Log to monitoring service
    this.logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Chart calculation failed</h2>
          <p>Please try submitting your question again.</p>
          <Button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// Centralized error handling
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

export async function apiCall<T>(
  request: () => Promise<T>,
  options: { retries?: number; timeout?: number } = {}
): Promise<T> {
  const { retries = 3, timeout = 10000 } = options;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      );
      
      return await Promise.race([request(), timeoutPromise]);
    } catch (error) {
      if (attempt === retries) {
        throw error instanceof Error 
          ? new ApiError(error.message, 500, 'REQUEST_FAILED')
          : new ApiError('Unknown error', 500, 'UNKNOWN_ERROR');
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
  
  throw new ApiError('Max retries exceeded', 500, 'MAX_RETRIES_EXCEEDED');
}
```

## 📱 Mobile-First Patterns

### Touch Gesture Support
```typescript
// Touch gesture hook
export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  threshold = 50
) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  const onTouchStart = useCallback((e: TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  }, []);
  
  const onTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart) return;
    
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };
    
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = Math.abs(touchEnd.y - touchStart.y);
    
    // Only trigger if horizontal swipe is dominant
    if (Math.abs(deltaX) > threshold && deltaY < threshold) {
      if (deltaX > 0 && onSwipeRight) onSwipeRight();
      if (deltaX < 0 && onSwipeLeft) onSwipeLeft();
    }
    
    setTouchStart(null);
  }, [touchStart, onSwipeLeft, onSwipeRight, threshold]);
  
  return { onTouchStart, onTouchEnd };
}
```

These patterns ensure consistency, maintainability, and scalability across the entire application while maintaining the high standards set in our project rules.
