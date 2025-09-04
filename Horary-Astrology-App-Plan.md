Horary Astrology App Plan
This document outlines the technical plan for a horary astrology application with a futuristic UI, powered by OpenAI's Realtime API for voice interaction, Supabase for the backend, and @nrweb/astro-calc for planetary calculations. The frontend will be lightweight, fetching data from the backend, with potential for mobile expansion later.
Project Overview

Objective: Build a horary astrology app where users ask questions (via voice or text), the app calculates the astrological chart for the moment of the question, and an AI provides interpretations using OpenAI's Realtime API.
Core Features:
Real-time planetary position calculations for horary charts.
Voice-based interaction with OpenAI Realtime API.
Dynamic, futuristic UI with potential for 3D visualizations or animations.
User authentication and query history storage.
Scalable for future mobile app integration (e.g., React Native).



Tech Stack
Frontend

Framework: Next.js (React-based)
Reasons: Server-side rendering, API routes, WebSocket support for OpenAI Realtime API, and easy scaling to mobile with React Native.
UI Libraries: Tailwind CSS + Shadcn/UI for rapid, customizable styling.
State Management: Zustand or Jotai for lightweight, real-time updates.
Animations: Framer Motion for futuristic effects (e.g., animated star maps).


Role: Fetch and display data from the backend, handle user input (voice/text), and integrate with OpenAI Realtime API for live interactions.
Hosting: Render (free tier, auto-deploy) or Amazon Lightsail (cost-effective for scaling). Vercel as a future option for optimization.

Backend

Platform: Supabase
Database: PostgreSQL for storing user profiles, query history, and chart data.
Authentication: Built-in Supabase Auth for user management (social login support).
Realtime: Supabase Realtime for live updates (e.g., query responses).
Functions: Edge Functions to handle API calls securely (e.g., proxying OpenAI or external APIs).


Astrology Calculations: @nrweb/astro-calc (NPM package)
Why: Free, open-source, precise planetary position calculations (based on Swiss Ephemeris). Runs on the backend to keep frontend lightweight.
Implementation: Installed via npm install @nrweb/astro-calc. Calculates planets, houses, and aspects for horary charts.


Flexibility: If Supabase limitations arise, consider Firebase or AWS Amplify (with Lightsail for hosting).

External APIs

OpenAI Realtime API: Handles voice-based user interactions and generates astrological interpretations.
Tool calling enabled for dynamic data fetching (see Tools section).


Optional: External astrology APIs (e.g., AstrologyAPI.com free tier) for backup or additional data. Tavily AI for web searches (e.g., current astrological events) if needed.

Tool List for OpenAI Realtime API
The app uses custom tools (function calling) to enrich AI responses. Each tool is a backend endpoint (Supabase Functions or Next.js API routes) that returns JSON data to the Realtime API.

getUserDetails

Description: Retrieves user profile data (e.g., birth date, location, zodiac sign) from Supabase.
Parameters: { user_id: string }
Returns: { birth_date: string, location: { lat: number, lon: number }, zodiac_sign: string, ... }
Purpose: Personalizes horary interpretations with user context.


getCurrentPlanetaryPositions

Description: Calculates real-time planetary positions using @nrweb/astro-calc.
Parameters: { timestamp: string (ISO, default: now), location: { lat: number, lon: number } (optional) }
Returns: { planets: [{ name: string, longitude: number, sign: string, ... }], houses: array, ... }
Purpose: Core for generating horary charts based on question time.


getZodiacInsights

Description: Provides insights for a specific zodiac sign (e.g., daily horoscope, compatibility).
Parameters: { sign: string (e.g., "Aries"), type: string (e.g., "daily", "compatibility") }
Returns: { description: string, strengths: array, weaknesses: array, compatible_signs: array }
Purpose: Quick responses for zodiac-related queries.


generateHoraryChart

Description: Generates a full horary chart (planets, houses, aspects) for the question moment.
Parameters: { question_time: string, location: object, question: string }
Returns: { chart_data: object, interpretation_prompt: string }
Purpose: Combines calculations for AI interpretation.


getCurrentAstroData

Description: Fetches current astrological events (e.g., moon phase, retrogrades) via external APIs or Tavily search.
Parameters: { data_type: string (e.g., "moon_phase", "retrogrades") }
Returns: { moon_phase: string, retro_planets: array, ... }
Purpose: Enriches horary context (e.g., "Is the moon void of course?").


getLocationData

Description: Retrieves user location and timezone (via IP or input) for accurate chart calculations.
Parameters: { ip_address: string (optional) }
Returns: { lat: number, lon: number, timezone: string }
Purpose: Ensures precise timing/location for horary charts.


saveQueryHistory

Description: Saves user questions and responses to Supabase for history tracking.
Parameters: { user_id: string, question: string, response: string }
Returns: { success: boolean, query_id: string }
Purpose: Enables query history and potential premium features.


fetchExternalAstroAPI

Description: Calls external astrology APIs for additional data if needed.
Parameters: { endpoint: string, params: object }
Returns: Raw API response.
Purpose: Backup or supplementary data source.



Next Steps

MVP Development:
Implement core tools: getUserDetails, getCurrentPlanetaryPositions, getZodiacInsights.
Set up Next.js frontend with Tailwind CSS and Supabase client.
Integrate OpenAI Realtime API with WebSocket for voice input.
Deploy frontend on Render, backend on Supabase.


Future Enhancements:
Add 3D star map visualizations (Three.js).
Implement user theming (e.g., zodiac-based UI themes).
Add premium features via Stripe (Supabase integration).
Explore mobile app transition with React Native.


Considerations:
Ensure GDPR compliance for user data.
Add legal disclaimer (astrology for entertainment purposes).
Monitor OpenAI API rate limits and costs.



Notes

@nrweb/astro-calc runs on the backend (Supabase Functions) to keep frontend lightweight.
Mobile expansion planned for future (React Native compatibility via Next.js).
Tavily AI considered for supplementary searches but not primary for planetary calculations due to cost and precision.
