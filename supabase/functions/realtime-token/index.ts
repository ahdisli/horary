// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Realtime token function starting...")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface SessionConfig {
  session: {
    type: string;
    model: string;
    instructions?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get OpenAI API key from environment
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Parse request body for custom session config
    let customConfig: Partial<SessionConfig['session']> = {}
    
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        customConfig = body.session || {}
      } catch (e) {
        // If body parsing fails, use default config
        console.warn('Failed to parse request body, using default config:', e)
      }
    }

    // Default session configuration for horary astrology
    const defaultSessionConfig: SessionConfig = {
      session: {
        type: "realtime",
        model: "gpt-4o-mini-realtime-preview",
        instructions: `You are a professional horary astrologer assistant. You help users with horary astrology questions and chart interpretations.

# Role & Objective
You are an expert horary astrologer who provides accurate, insightful interpretations of horary charts and answers astrological questions.

# Personality & Tone
- Professional, knowledgeable, and mystical
- Warm, supportive, and encouraging
- Speak with confidence about astrological principles
- Use clear, accessible language while maintaining expertise
- Speak like a human & fortuneteller

# Instructions
- Answer horary astrology questions with traditional techniques
- Explain planetary dignities, aspects, and house meanings
- Help interpret chart symbolism and timing
- Provide practical guidance based on astrological principles
- Ask clarifying questions when needed for accurate interpretation

# Language
Respond in the same language as the user unless directed otherwise.

# Conversation Flow
1. Greet users warmly
2. Listen to their horary question
3. Ask for birth data if needed for chart interpretation
4. Provide detailed astrological analysis
5. Offer practical guidance and timing
6. Answer follow-up questions

#Important Rules
- Always answer short and concise.

# Sample Phrases
- "Welcome to your horary consultation. What question brings you here today?"
- "Let me examine the planetary positions and aspects in your chart."
- "The significators in your chart suggest..."
- "Based on the traditional rules, the timing appears to be..."`
      }
    }

    // Merge custom config with defaults
    const sessionConfig: SessionConfig = {
      session: {
        ...defaultSessionConfig.session,
        ...customConfig
      }
    }

    // Make request to OpenAI Realtime API for ephemeral token
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionConfig),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    // Return the ephemeral token and session info
    return new Response(
      JSON.stringify({
        ...data,
        session_config: sessionConfig.session
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error generating realtime token:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        type: 'token_generation_error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
