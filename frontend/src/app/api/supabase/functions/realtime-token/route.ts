import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Parse request body for custom session configuration
    const body = await request.json().catch(() => ({}));
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('realtime-token', {
      body: body
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Supabase function error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to generate token' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Default GET request - use default configuration
    const { data, error } = await supabase.functions.invoke('realtime-token', {
      body: {}
    });

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Supabase function error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to generate token' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
