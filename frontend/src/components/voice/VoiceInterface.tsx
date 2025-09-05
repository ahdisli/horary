'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRealtimeVoice } from '@/hooks/useRealtimeVoice';
import { Mic, MicOff, Phone, PhoneCall, Volume2 } from 'lucide-react';
import { useState } from 'react';

interface VoiceInterfaceProps {
  className?: string;
}

export function VoiceInterface({ className }: VoiceInterfaceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [responses, setResponses] = useState<string[]>([]);

  const {
    connect,
    disconnect,
    toggleMute,
    clearConversation,
    isConnected,
    isConnecting,
    isListening,
    isSpeaking,
    error
  } = useRealtimeVoice({
    onConnected: () => {
      setResponses(prev => [...prev, 'Connected to horary astrology assistant']);
    },
    onDisconnected: () => {
      setResponses(prev => [...prev, 'Disconnected from assistant']);
    },
    onResponseReceived: (response) => {
      setResponses(prev => [...prev, `Assistant: ${response}`]);
    },
    onSpeechStarted: () => {
      setResponses(prev => [...prev, 'Listening...']);
    },
    onSpeechStopped: () => {
      setResponses(prev => [...prev, 'Speech detected']);
    },
    onError: (errorMessage) => {
      setResponses(prev => [...prev, `Error: ${errorMessage}`]);
    }
  });

  const handleToggleMute = () => {
    toggleMute();
    setIsMuted(!isMuted);
  };

  const handleClearConversation = () => {
    clearConversation();
    setResponses([]);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Voice Horary Consultation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-full ${
                isConnected 
                  ? 'bg-green-500 animate-pulse' 
                  : isConnecting 
                  ? 'bg-yellow-500 animate-pulse' 
                  : 'bg-gray-400'
              }`} 
            />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center gap-3">
            {isListening && (
              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <Mic className="h-4 w-4 animate-pulse" />
                <span className="text-xs">Listening</span>
              </div>
            )}
            
            {isSpeaking && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <Volume2 className="h-4 w-4 animate-pulse" />
                <span className="text-xs">Speaking</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2">
          {!isConnected ? (
            <Button 
              onClick={connect} 
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              <PhoneCall className="h-4 w-4" />
              {isConnecting ? 'Connecting...' : 'Start Voice Session'}
            </Button>
          ) : (
            <Button 
              onClick={disconnect} 
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Phone className="h-4 w-4" />
              End Session
            </Button>
          )}

          {isConnected && (
            <>
              <Button 
                onClick={handleToggleMute} 
                variant="outline"
                className="flex items-center gap-2"
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>

              <Button 
                onClick={handleClearConversation} 
                variant="outline"
                size="sm"
              >
                Clear History
              </Button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            How to use:
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Click &quot;Start Voice Session&quot; to connect</li>
            <li>• Ask your horary astrology question naturally</li>
            <li>• The AI will interpret charts and provide guidance</li>
            <li>• Use voice interaction for a natural consultation experience</li>
          </ul>
        </div>

        {/* Conversation History */}
        {responses.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Session Log:</h4>
            <div className="max-h-40 overflow-y-auto space-y-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              {responses.map((response, index) => (
                <div 
                  key={index} 
                  className="text-xs p-2 rounded bg-white dark:bg-gray-700 border"
                >
                  {response}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sample Questions */}
        <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
          <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
            Sample Questions:
          </h4>
          <div className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
            <p>• &quot;Will I get the job I interviewed for?&quot;</p>
            <p>• &quot;Should I move to a new city?&quot;</p>
            <p>• &quot;Will my relationship work out?&quot;</p>
            <p>• &quot;Is this the right time to start a business?&quot;</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
