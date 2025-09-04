# Horary Astrology App - Frontend

A modern, TypeScript-first Next.js application for horary astrology with voice interaction powered by OpenAI's Realtime API.

## 🏗️ Architecture

- **Frontend**: Lightweight UI layer - NO astrology calculations
- **Backend**: All calculations in Supabase Edge Functions using @nrweb/astro-calc
- **AI**: OpenAI Realtime API for voice interaction and interpretations

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router, TypeScript strict mode)
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI**: OpenAI Realtime API

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── ui/                # Shadcn/UI components
│   ├── charts/            # Astrology chart components
│   ├── voice/             # Voice interaction components
│   └── layout/            # Layout components
├── lib/
│   ├── supabase.ts        # Supabase client (NO astro calculations)
│   └── utils.ts           # Utility functions
├── types/                 # TypeScript definitions
│   ├── astrology.ts       # Astrology-related types
│   ├── api.ts             # API response types
│   └── database.ts        # Supabase database types
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
└── constants/             # Application constants
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase project with Edge Functions
- OpenAI API key with Realtime access

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration  
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_OPENAI_REALTIME_URL=wss://api.openai.com/v1/realtime

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📋 Development Guidelines

### TypeScript Rules (MANDATORY)
- ❌ **NO `any` types allowed** - Use proper typing
- ✅ **Strict TypeScript mode enabled**
- ✅ **All files must be TypeScript** (.ts, .tsx)
- ✅ **ESLint compliance required**

### Architecture Principles
- 🪶 **Frontend stays lightweight** - No heavy calculations
- 🔧 **All astrology calculations in Edge Functions**
- 🎯 **Type-safe API communication**
- 📱 **Mobile-first responsive design**

### Code Quality
- **ESLint**: Strict rules with TypeScript integration
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality gates

## 🔗 Backend Integration

### Edge Functions
All astrology calculations happen in Supabase Edge Functions:

- `test-function` - Simple test function for development
- `planetary-positions` - Calculate current planetary positions (planned)
- `horary-chart` - Generate complete horary chart (planned)
- `zodiac-insights` - Get zodiac sign insights (planned)
- `astro-data` - Current astrological events (planned)

### API Client Usage

```typescript
import { supabaseApi } from '@/lib/supabase';

// Test function (currently available)
const testData = await supabaseApi.testFunction();

// Planned functions:
// Generate horary chart
const chartData = await supabaseApi.generateHoraryChart(
  question,
  new Date().toISOString(),
  { lat: 51.5074, lon: -0.1278, city: 'London' },
  userId
);

// Get planetary positions
const positions = await supabaseApi.getPlanetaryPositions();
```

## 🎨 UI Components

Built with Shadcn/UI for consistency and accessibility:

- Responsive design across all devices
- Dark/light mode support
- Accessibility compliance (WCAG 2.1 AA)
- Smooth animations with Framer Motion

## 🔊 Voice Features

- Real-time voice input via OpenAI Realtime API
- WebSocket connection for low-latency interaction
- Tool calling for dynamic astrology data
- Natural language processing for horary questions

## 📊 State Management

Using Zustand for lightweight state management:

```typescript
import { useAppStore } from '@/store/appStore';

const { currentChart, setCurrentChart } = useAppStore();
```

## 🚀 Deployment

- **Development**: `npm run dev` (http://localhost:3000)
- **Production**: Deploy to Render, Vercel, or Amazon Lightsail
- **Edge Functions**: Deploy to Supabase

## 📚 Documentation

See `/docs` folder for comprehensive development guidelines:

- **Best Practices**: TypeScript, architecture, and code standards
- **Project Rules**: Non-negotiable development constraints
- **API Documentation**: Backend integration and tool definitions

## 🔒 Security

- Environment variables for all secrets
- No API keys exposed to frontend
- Supabase RLS (Row Level Security) policies
- Input validation and sanitization

---

**Note**: This frontend is designed to be lightweight. All astrology calculations are performed in Supabase Edge Functions to ensure accuracy and keep the client-side bundle small.
