# Best Practices & Development Guidelines

## Table of Contents
1. [TypeScript Guidelines](#typescript-guidelines)
2. [Next.js Best Practices](#nextjs-best-practices)
3. [Code Organization](#code-organization)
4. [State Management](#state-management)
5. [API & Backend Integration](#api--backend-integration)
6. [UI/UX Guidelines](#uiux-guidelines)
7. [Performance Guidelines](#performance-guidelines)
8. [Security Guidelines](#security-guidelines)
9. [Git Workflow](#git-workflow)
10. [Testing Strategy](#testing-strategy)

## TypeScript Guidelines

### Mandatory TypeScript Rules
- **ALL** files must use TypeScript (.tsx, .ts)
- No `any` types allowed - use proper typing or `unknown` with type guards
- Use strict TypeScript configuration
- Define interfaces for all data structures
- Use enums for constants and predefined values

### Type Definitions
```typescript
// Always define interfaces for props
interface ComponentProps {
  title: string;
  onClick: () => void;
  isVisible?: boolean;
}

// Use union types for controlled values
type ThemeMode = 'light' | 'dark' | 'auto';

// Define API response types
interface PlanetaryPosition {
  name: string;
  longitude: number;
  sign: string;
  house: number;
}
```

### File Naming Convention
- Components: `PascalCase.tsx` (e.g., `HoraryChart.tsx`)
- Utilities: `camelCase.ts` (e.g., `astroCalculations.ts`)
- Types: `types.ts` or `ComponentName.types.ts`
- Constants: `UPPER_SNAKE_CASE.ts` (e.g., `ASTRO_CONSTANTS.ts`)

## Next.js Best Practices

### App Router Structure (Next.js 13+)
```
app/
├── layout.tsx          # Root layout
├── page.tsx           # Home page
├── horary/
│   ├── layout.tsx     # Horary section layout
│   ├── page.tsx       # Horary dashboard
│   └── chart/
│       └── page.tsx   # Chart view
├── api/
│   ├── auth/
│   └── charts/
└── globals.css
```

### Component Guidelines
- Use Server Components by default
- Add "use client" only when necessary (interactivity, browser APIs)
- Prefer async/await for data fetching in Server Components
- Use dynamic imports for heavy client components

### Performance Rules
- Implement proper loading states
- Use `next/image` for all images
- Implement proper caching strategies
- Use `revalidatePath` and `revalidateTag` for data updates

## Code Organization

### Folder Structure
```
frontend/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # Reusable components
│   │   ├── ui/          # Basic UI components (buttons, inputs)
│   │   ├── charts/      # Astrology chart components
│   │   └── layout/      # Layout components
│   ├── lib/             # Utilities and configurations
│   │   ├── supabase.ts  # Supabase client
│   │   ├── openai.ts    # OpenAI client
│   │   └── utils.ts     # General utilities
│   ├── types/           # TypeScript type definitions
│   ├── hooks/           # Custom React hooks
│   ├── store/           # State management (Zustand)
│   └── constants/       # Application constants
├── public/              # Static assets
└── docs/               # Component documentation
```

### Import Organization
```typescript
// 1. External libraries
import React from 'react';
import { NextPage } from 'next';

// 2. Internal utilities and types
import { supabase } from '@/lib/supabase';
import { PlanetaryPosition } from '@/types/astrology';

// 3. Components (UI first, then feature components)
import { Button } from '@/components/ui/button';
import { HoraryChart } from '@/components/charts/HoraryChart';
```

## State Management

### Zustand Guidelines
- Create typed stores
- Use immer for complex state updates
- Separate concerns into different stores
- Use selectors to prevent unnecessary re-renders

```typescript
interface AstrologyStore {
  currentChart: ChartData | null;
  isLoading: boolean;
  setChart: (chart: ChartData) => void;
  calculateChart: (question: string) => Promise<void>;
}

export const useAstrologyStore = create<AstrologyStore>((set, get) => ({
  currentChart: null,
  isLoading: false,
  setChart: (chart) => set({ currentChart: chart }),
  calculateChart: async (question) => {
    set({ isLoading: true });
    // Implementation
    set({ isLoading: false });
  },
}));
```

## API & Backend Integration

### Supabase Edge Functions
- Use Deno runtime for server-side calculations
- Install @nrweb/astro-calc in Edge Functions, not frontend
- Keep frontend lightweight with API calls only
- Implement proper error handling in Edge Functions

### Supabase Integration
- Use environment variables for configuration
- Implement proper error handling
- Use TypeScript types for database schemas
- Implement proper RLS (Row Level Security) policies

### OpenAI Realtime API
- Handle WebRTC properly
- Implement reconnection logic
- Type all tool calls and responses
- Handle rate limiting gracefully

### Architecture Principle
**Frontend**: Lightweight UI layer, API calls only
**Backend**: All heavy computations in Supabase Edge Functions
**Calculations**: @nrweb/astro-calc runs server-side only

### Error Handling
```typescript
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// Always handle errors consistently
const handleApiCall = async <T>(
  apiCall: () => Promise<T>
): Promise<ApiResponse<T>> => {
  try {
    const data = await apiCall();
    return { data, error: null, success: true };
  } catch (error) {
    console.error('API call failed:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    };
  }
};
```

## UI/UX Guidelines

### Accessibility
- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers
- Maintain color contrast ratios

### Responsive Design
- Mobile-first approach
- Use Tailwind CSS breakpoints consistently
- Test on multiple device sizes
- Implement touch-friendly interactions

### Futuristic UI Theme
- Use consistent spacing (Tailwind spacing scale)
- Implement smooth animations with Framer Motion
- Use a cohesive color palette
- Maintain visual hierarchy

## Performance Guidelines

### Bundle Optimization
- Use dynamic imports for heavy components
- Implement code splitting
- Optimize images with `next/image`
- Use proper caching strategies

### Runtime Performance
- Avoid unnecessary re-renders
- Use React.memo for expensive components
- Implement virtualization for large lists
- Profile and monitor performance metrics

## Testing Strategy

### Current Focus
- Testing will be implemented later in the development cycle
- Priority is on core functionality and architecture
- Focus on TypeScript type safety as primary quality assurance

### Future Testing Implementation
- Unit tests for utilities and pure functions
- Component tests for UI components
- Integration tests for API interactions
- E2E tests for critical user flows

### Quality Assurance (Current)
- **TypeScript strict mode** - Primary quality gate
- **ESLint compliance** - Code quality enforcement
- **Manual testing** - User experience validation
- **Code reviews** - Team quality assurance

## Security Guidelines

### Data Protection
- Never store sensitive data in localStorage
- Use HTTPS for all communications
- Implement proper input validation
- Follow GDPR compliance requirements

### API Security
- Use environment variables for API keys
- Implement rate limiting
- Validate all inputs on the backend
- Use Supabase RLS for data access control

## Git Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages
Follow conventional commits:
- `feat: add voice input component`
- `fix: resolve chart calculation error`
- `docs: update API documentation`
- `refactor: optimize chart rendering`

### Pull Request Guidelines
- Include clear description of changes
- Add screenshots for UI changes
- Ensure all tests pass
- Request code review before merging
- Keep PRs focused and reasonably sized

---

**Remember**: These are not suggestions but mandatory guidelines for the project. Consistency and type safety are critical for maintainability and team collaboration.
