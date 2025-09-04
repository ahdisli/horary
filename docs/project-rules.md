# Project Rules & Constraints

## 🚨 CRITICAL RULES - NON-NEGOTIABLE

### TypeScript Requirements
- **ZERO tolerance for `any` types** - Use proper typing or `unknown` with type guards
- **ALL files must be TypeScript** (.ts, .tsx) - No JavaScript files allowed
- **Strict mode enabled** - No loose TypeScript configuration
- **Interface definitions required** for all data structures, props, and API responses

### Code Quality Standards
- **100% type coverage** - Every variable, function, and component must be properly typed
- **ESLint errors = build failure** - No warnings or errors allowed in production
- **Prettier formatting enforced** - Code must pass formatting checks
- **No console.logs in production** - Use proper logging solutions

### Architecture Constraints

#### Frontend (Next.js)
- **App Router only** - No Pages Router
- **Server Components by default** - Client components only when absolutely necessary
- **TypeScript configuration must be strict**
- **Tailwind CSS + Shadcn/UI only** - No other CSS frameworks
- **Zustand for state management** - No Redux, Context API for complex state

#### Backend Integration
- **Supabase for all backend operations** - No direct database access from frontend
- **Supabase Edge Functions for calculations** - @nrweb/astro-calc runs server-side only
- **Environment variables for all secrets** - No hardcoded API keys or URLs
- **Type-safe API calls** - All API responses must be typed
- **Lightweight frontend** - No heavy computations on client-side

#### Performance Rules
- **Core Web Vitals compliance mandatory**
- **Bundle size limits enforced**
- **Image optimization required** (next/image only)
- **Lazy loading implemented** for non-critical components

## 📋 DEVELOPMENT WORKFLOW RULES

### Git Workflow
```bash
# Branch naming (mandatory format)
feature/HORARY-001-voice-input
fix/HORARY-002-chart-calculation
docs/HORARY-003-api-documentation
refactor/HORARY-004-component-optimization
```

### Commit Standards
- **Conventional Commits required**
- **Signed commits mandatory**
- **No direct pushes to main branch**
- **All commits must pass pre-commit hooks**

### Code Review Process
- **Minimum 1 reviewer approval required**
- **All tests must pass**
- **No merge conflicts allowed**
- **Documentation updates required for new features**

## 🏗️ PROJECT STRUCTURE RULES

### Folder Structure (Enforced)
```
├── frontend/
├── src/
│   ├── app/                 # Next.js App Router ONLY
│   ├── components/
│   │   ├── ui/             # Shadcn/UI components
│   │   ├── charts/         # Astrology-specific components
│   │   ├── voice/          # Voice interaction components
│   │   └── layout/         # Layout components
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client configuration
│   │   ├── openai.ts       # OpenAI Realtime API client
│   │   └── utils.ts        # Utility functions (NO astro calculations)
│   ├── types/              # TypeScript definitions
│   │   ├── astrology.ts    # Astrology-related types
│   │   ├── api.ts          # API response types
│   │   └── database.ts     # Supabase database types
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand stores
│   └── constants/          # Application constants
├── public/                 # Static assets only
└── supabase/              # Edge Functions and migrations
    ├── functions/         # Edge Functions (astro calculations here)
    └── migrations/        # Database migrations
```

### File Naming Rules
- **Components**: `PascalCase.tsx` (e.g., `HoraryChart.tsx`)
- **Utilities**: `camelCase.ts` (e.g., `astroCalculations.ts`)
- **Types**: `camelCase.ts` (e.g., `astrology.types.ts`)
- **Constants**: `UPPER_SNAKE_CASE.ts` (e.g., `ASTRO_CONSTANTS.ts`)
- **Tests**: `ComponentName.test.tsx` or `utilityName.test.ts`

## 🔒 SECURITY CONSTRAINTS

### Environment Variables
```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
OPENAI_REALTIME_API_KEY=
```

### Data Handling Rules
- **No sensitive data in localStorage**
- **All user inputs must be sanitized**
- **API keys never exposed to client**
- **GDPR compliance mandatory**
- **Legal disclaimers required** (astrology for entertainment)

## 🧪 TESTING REQUIREMENTS (FUTURE IMPLEMENTATION)

### Current Development Phase
- **Focus on core functionality** - Testing will be added later
- **TypeScript as primary quality gate** - Strict typing prevents many errors
- **Manual testing during development** - Verify functionality as we build
- **Code reviews for quality assurance** - Team validation of changes

### Future Testing Implementation
- **Minimum 80% code coverage** when testing is implemented
- **Edge Function testing** for astrology calculations
- **API integration testing** for all backend communications
- **Component testing** for UI interactions

### Quality Assurance (Current)
- **TypeScript strict mode** - Compile-time error prevention
- **ESLint compliance** - Code quality enforcement
- **Manual verification** - User experience testing

## 📱 MOBILE READINESS

### Responsive Design Rules
- **Mobile-first development**
- **Touch-friendly interfaces**
- **Optimized for React Native future migration**
- **Progressive Web App capabilities**

## 🎨 UI/UX CONSTRAINTS

### Design System
- **Shadcn/UI components only**
- **Tailwind CSS for styling**
- **Framer Motion for animations**
- **Consistent spacing using Tailwind scale**
- **Accessibility compliance (WCAG 2.1 AA)**

### Theme Requirements
- **Futuristic design aesthetic**
- **Dark mode support**
- **Zodiac-based theming system**
- **Responsive across all devices**

## 🚀 DEPLOYMENT RULES

### Production Requirements
- **Zero TypeScript errors**
- **Performance budgets met**
- **Security audit passed**
- **Environment variables configured**
- **Edge Functions deployed and tested**

### Hosting Constraints
- **Frontend**: Render (free tier) initially, scalable to Amazon Lightsail
- **Backend**: Supabase hosted
- **CDN**: Next.js optimized delivery
- **SSL/HTTPS**: Mandatory for all environments

## 🔧 TOOL CONFIGURATIONS

### Required Dev Tools
```json
{
  "required": [
    "typescript",
    "eslint",
    "prettier",
    "husky",
    "lint-staged",
    "@types/node",
    "tailwindcss",
    "framer-motion",
    "zustand",
    "@supabase/supabase-js",
    "@supabase/ssr",
    "openai"
  ],
  "backend_only": [
    "@nrweb/astro-calc"
  ]
}
```

### IDE Configuration
- **VS Code settings synchronized**
- **TypeScript strict mode**
- **Auto-formatting on save**
- **ESLint integration enabled**

## 📊 MONITORING & ANALYTICS

### Performance Monitoring
- **Core Web Vitals tracking**
- **Error tracking and reporting**
- **API response time monitoring**
- **User interaction analytics**

### Logging Requirements
- **Structured logging for all API calls**
- **Error tracking with stack traces**
- **User action logging (privacy-compliant)**
- **Performance metrics collection**

---

## ⚠️ VIOLATION CONSEQUENCES

Breaking these rules will result in:
1. **Automatic build failures**
2. **Blocked pull requests**
3. **Required code refactoring**
4. **Potential rollback of changes**

These rules ensure code quality, maintainability, security, and team collaboration standards.
