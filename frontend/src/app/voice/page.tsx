'use client';

import { VoiceInterface } from '@/components/voice/VoiceInterface';
import { MicTestComponent } from '@/components/voice/MicTestComponent';

export default function VoicePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Voice Horary Astrology Consultation
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Experience the future of astrological consultation with our AI-powered voice interface. 
            Ask your horary questions naturally and receive insightful interpretations through 
            real-time conversation.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Voice Interface */}
          <VoiceInterface className="w-full" />

          {/* Microphone Test */}
          <MicTestComponent />

          {/* Information Panel */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">About Voice Consultations</h2>
              <div className="space-y-4 text-sm">
                <p>
                  This voice interface uses OpenAI&apos;s Realtime API with WebRTC for 
                  low-latency, natural conversation with our horary astrology AI assistant.
                </p>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Features:</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Real-time speech-to-speech interaction</li>
                    <li>Natural conversation flow</li>
                    <li>Horary chart generation and interpretation</li>
                    <li>Traditional astrological techniques</li>
                    <li>Instant responses with voice synthesis</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Technology Stack:</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>OpenAI Realtime API (gpt-realtime model)</li>
                    <li>WebRTC for peer-to-peer connection</li>
                    <li>Supabase Edge Functions for token management</li>
                    <li>Next.js frontend with React hooks</li>
                    <li>Real-time voice activity detection</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-4">How to Get Started</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Grant Microphone Permission</p>
                    <p className="text-muted-foreground">
                      Allow access to your microphone when prompted by the browser.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Start Voice Session</p>
                    <p className="text-muted-foreground">
                      Click the &quot;Start Voice Session&quot; button to connect to the AI assistant.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Ask Your Question</p>
                    <p className="text-muted-foreground">
                      Speak your horary question naturally. The AI will detect when you start and stop speaking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                    4
                  </div>
                  <div>
                    <p className="font-medium">Receive Interpretation</p>
                    <p className="text-muted-foreground">
                      Listen to the AI&apos;s astrological analysis and guidance based on traditional horary techniques.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 p-6">
              <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                ⚠️ Demo Mode
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                This is a demonstration of the OpenAI Realtime API integration. 
                Make sure you have configured your OpenAI API key in the Supabase environment 
                variables for the voice interface to work properly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
