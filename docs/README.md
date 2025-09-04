# Documentation Index

Welcome to the Horary Astrology App documentation. This directory contains comprehensive guides and references for developing, maintaining, and extending the application.

## 📚 Documentation Overview

### Core Documentation

1. **[Best Practices](./best-practices.md)**
   - TypeScript guidelines and mandatory rules
   - Code organization and structure
   - Performance and testing guidelines
   - UI/UX standards and accessibility requirements

2. **[Project Rules](./project-rules.md)**
   - Non-negotiable development constraints
   - Architecture requirements and limitations
   - Security guidelines and compliance rules
   - Quality standards and violation consequences

3. **[Development Guidelines](./development-guidelines.md)**
   - Component architecture patterns
   - State management with Zustand
   - API integration strategies
   - Performance optimization techniques
   - Animation and responsive design patterns

4. **[API Documentation](./api-documentation.md)**
   - Supabase database schema and integration
   - OpenAI Realtime API tool definitions
   - Type-safe API client implementations
   - Error handling and retry strategies

## 🎯 Quick Start Guide

### For New Developers

1. **Read First**: [Project Rules](./project-rules.md) - Understand the non-negotiable constraints
2. **Development Setup**: [Best Practices](./best-practices.md) - Set up your development environment
3. **Architecture Understanding**: [Development Guidelines](./development-guidelines.md) - Learn the patterns and conventions
4. **API Integration**: [API Documentation](./api-documentation.md) - Understand backend communication

### For Existing Team Members

- Refer to [Best Practices](./best-practices.md) for coding standards
- Check [API Documentation](./api-documentation.md) for new tool implementations
- Review [Development Guidelines](./development-guidelines.md) for architecture updates

## 🏗️ Project Structure Reference

```
horary/
├── docs/                          # This documentation directory
│   ├── README.md                  # This file
│   ├── best-practices.md          # Comprehensive development guidelines
│   ├── project-rules.md           # Mandatory rules and constraints
│   ├── development-guidelines.md  # Architecture and patterns
│   └── api-documentation.md       # API specs and integration
├── frontend/                      # Next.js TypeScript application
│   └── (to be created)
└── Horary-Astrology-App-Plan.md  # Original project specification
```

## 🔧 Key Technologies

### Frontend Stack
- **Framework**: Next.js 15+ (App Router, TypeScript)
- **Styling**: Tailwind CSS + Shadcn/UI
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Type Safety**: Strict TypeScript configuration

### Backend & APIs
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time Features**: Supabase Realtime
- **Edge Functions**: Supabase Edge Functions (Deno runtime)
- **AI Integration**: OpenAI Realtime API
- **Calculations**: @nrweb/astro-calc (Backend only)

### Development Tools
- **Code Quality**: ESLint + Prettier + Husky
- **Type Checking**: TypeScript Strict Mode
- **Performance**: Next.js built-in optimizations
- **Testing**: Will be implemented later in development cycle

## 📋 Development Workflow

### 1. Before You Start
- [ ] Read [Project Rules](./project-rules.md) completely
- [ ] Review [Best Practices](./best-practices.md) for your area of work
- [ ] Understand the [API Documentation](./api-documentation.md) if working with backend integration

### 2. During Development
- [ ] Follow TypeScript strict mode requirements
- [ ] Implement proper error handling
- [ ] Ensure responsive design compliance
- [ ] Maintain accessibility standards
- [ ] Keep astrology calculations in Supabase Edge Functions

### 3. Before Submitting
- [ ] Verify TypeScript compilation with zero errors
- [ ] Check ESLint and Prettier compliance
- [ ] Test across different screen sizes
- [ ] Verify API integrations work correctly

## 🚨 Critical Reminders

### Non-Negotiable Rules
1. **NO `any` types allowed** - Use proper TypeScript typing
2. **ALL files must be TypeScript** - No JavaScript files in the project
3. **Strict ESLint compliance** - No warnings or errors allowed
4. **Mobile-first responsive design** - Every component must work on mobile
5. **Accessibility compliance** - WCAG 2.1 AA standards required

### Security Requirements
- Never expose API keys to the frontend
- All user inputs must be validated and sanitized
- GDPR compliance for user data handling
- Legal disclaimers required for astrology content

### Performance Standards
- Core Web Vitals compliance mandatory
- Bundle size optimization required
- Image optimization with next/image only
- Proper loading states for all async operations

## 🔄 Documentation Updates

### When to Update Documentation
- Adding new API endpoints or tools
- Changing architecture patterns or conventions
- Modifying development workflow
- Adding new dependencies or technologies
- Updating security or compliance requirements

### How to Update
1. Create a new branch for documentation changes
2. Update the relevant documentation files
3. Update this README.md if the structure changes
4. Submit a pull request with clear description of changes
5. Ensure all team members review documentation updates

## 📞 Getting Help

### Common Issues
1. **TypeScript Errors**: Refer to [Best Practices](./best-practices.md) TypeScript section
2. **API Integration**: Check [API Documentation](./api-documentation.md)
3. **Component Patterns**: Review [Development Guidelines](./development-guidelines.md)
4. **Project Constraints**: Verify against [Project Rules](./project-rules.md)

### Escalation Path
1. Check relevant documentation first
2. Review existing code for similar patterns
3. Consult with team members
4. Update documentation if solution isn't covered

---

**Remember**: This documentation is the source of truth for the project. When in doubt, refer to these guidelines and ensure compliance with all stated rules and practices.
