# OpenAI Realtime API with WebRTC Implementation

This implementation provides a complete voice interface for horary astrology consultations using OpenAI's Realtime API with WebRTC.

## Architecture Overview

```
Frontend (Next.js)
    ↓ Request ephemeral token
API Route (/api/supabase/functions/realtime-token)
    ↓ Calls Supabase Edge Function
Supabase Edge Function (realtime-token)
    ↓ Requests ephemeral token
OpenAI Realtime API
    ↓ Returns ephemeral token
Frontend
    ↓ Establishes WebRTC connection
OpenAI Realtime API (WebRTC peer connection)
```

## Components Created

### 1. Supabase Edge Function
- **Location**: `/supabase/functions/realtime-token/index.ts`
- **Purpose**: Generate ephemeral API tokens for client-side WebRTC connections
- **Features**:
  - Session configuration for horary astrology
  - Custom voice and audio settings
  - Tool definitions for chart generation and interpretation
  - Error handling and logging

### 2. Next.js API Route
- **Location**: `/frontend/src/app/api/supabase/functions/realtime-token/route.ts`
- **Purpose**: Proxy requests to Supabase Edge Function
- **Features**:
  - GET and POST endpoints
  - Custom session configuration support
  - Error handling

### 3. TypeScript Types
- **Location**: `/frontend/src/types/realtime.ts`
- **Purpose**: Complete type definitions for OpenAI Realtime API
- **Features**:
  - Client and server event types
  - Session configuration types
  - WebRTC connection state types
  - Horary astrology specific types

### 4. React Hook
- **Location**: `/frontend/src/hooks/useRealtimeVoice.ts`
- **Purpose**: Manage WebRTC connections and realtime voice interactions
- **Features**:
  - WebRTC peer connection management
  - Audio input/output handling
  - Server event processing
  - Voice activity detection
  - Error handling and reconnection

### 5. Voice Interface Component
- **Location**: `/frontend/src/components/voice/VoiceInterface.tsx`
- **Purpose**: User interface for voice consultations
- **Features**:
  - Connection status indicators
  - Audio controls (mute/unmute)
  - Real-time conversation display
  - Instructions and sample questions
  - Error display

### 6. Demo Page
- **Location**: `/frontend/src/app/voice/page.tsx`
- **Purpose**: Demonstration page for voice interface
- **Features**:
  - Complete voice consultation experience
  - Setup instructions
  - Technology stack information

### 7. Database Schema (Optional)
- **Location**: `/supabase/migrations/20250905000001_voice_sessions.sql`
- **Purpose**: Track voice sessions and conversations
- **Features**:
  - Session management
  - Conversation history
  - Horary question tracking
  - Row-level security

## Environment Variables Required

### Supabase
Add to your Supabase Edge Function environment or local `.env`:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Next.js Frontend
Add to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Setup Instructions

### 1. Deploy Supabase Edge Function
```bash
cd supabase
supabase functions deploy realtime-token
```

### 2. Set Environment Variables
```bash
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run Database Migrations (Optional)
```bash
supabase db push
```

### 4. Start Next.js Development Server
```bash
cd frontend
npm run dev
```

### 5. Access Voice Interface
Navigate to: `http://localhost:3000/voice`

## Usage

1. **Grant Microphone Permission**: Allow browser access to microphone
2. **Start Voice Session**: Click "Start Voice Session" button
3. **Ask Questions**: Speak your horary astrology questions naturally
4. **Receive Interpretations**: Listen to AI-generated astrological guidance
5. **Continue Conversation**: Ask follow-up questions as needed

## Features

### Voice Capabilities
- **Real-time Speech-to-Speech**: Direct voice interaction without text intermediary
- **Voice Activity Detection**: Automatic detection of speech start/stop
- **Natural Conversation**: Contextual responses and follow-up questions
- **Low Latency**: WebRTC provides sub-second response times

### Horary Astrology Features
- **Question Analysis**: Interprets horary questions using traditional techniques
- **Chart Generation**: Can generate horary charts for specific moments
- **Astrological Interpretation**: Provides insights based on planetary positions
- **Timing Guidance**: Offers timing predictions and advice

### Technical Features
- **Caching Support**: OpenAI Realtime API supports conversation caching
- **Error Recovery**: Automatic reconnection and error handling
- **Session Management**: Track and manage voice consultation sessions
- **Scalable Architecture**: Supabase Edge Functions handle token generation

## Security Considerations

1. **Ephemeral Tokens**: Client-side tokens expire automatically
2. **No API Key Exposure**: OpenAI API key stays on server-side
3. **Row-Level Security**: Database access restricted to authenticated users
4. **HTTPS Required**: WebRTC requires secure contexts
5. **Microphone Permission**: Explicit user consent required

## Customization

### Voice Settings
Modify voice characteristics in the Edge Function:
```typescript
voice: "alloy", // Options: alloy, ash, ballad, coral, echo, sage, shimmer, verse
speed: 1.0,     // Speed multiplier
```

### Instructions
Customize the AI's behavior in the Edge Function:
```typescript
instructions: "Your custom horary astrology instructions..."
```

### Tools
Add custom functions for chart generation and interpretation:
```typescript
tools: [
  {
    type: "function",
    name: "your_custom_function",
    description: "Description of what it does",
    parameters: { /* function parameters */ }
  }
]
```

## Troubleshooting

### Common Issues

1. **Microphone Permission Denied**
   - Check browser settings
   - Ensure HTTPS connection
   - Try refreshing the page

2. **Connection Failures**
   - Verify OpenAI API key is set
   - Check Supabase function deployment
   - Review browser console for errors

3. **Audio Not Working**
   - Check audio output device
   - Verify WebRTC peer connection
   - Test with different browsers

4. **API Rate Limits**
   - Monitor OpenAI usage dashboard
   - Implement usage tracking
   - Consider upgrading OpenAI plan

### Debugging

Enable detailed logging in the browser console:
```javascript
// Add to your component for debugging
console.log('WebRTC connection state:', connectionState);
console.log('Server events:', serverEvent);
```

## Next Steps

1. **Production Deployment**
   - Deploy to Vercel/Netlify
   - Configure production environment variables
   - Set up monitoring and analytics

2. **Enhanced Features**
   - Add user authentication
   - Implement conversation history
   - Add chart visualization
   - Create mobile-responsive UI

3. **Integration**
   - Connect with existing horary chart generation
   - Add database persistence
   - Implement user profiles
   - Add payment processing

## References

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
- [WebRTC API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
