'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type WebRTCConnectionState,
  type RealtimeClientEvent,
  type RealtimeServerEvent,
  type VoiceInterfaceState,
  type ConversationItem,
  type EphemeralTokenResponse
} from '@/types/realtime';

interface UseRealtimeVoiceOptions {
  onError?: (error: string) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onResponseReceived?: (response: string) => void;
  onSpeechStarted?: () => void;
  onSpeechStopped?: () => void;
  autoConnect?: boolean;
}

interface UseRealtimeVoiceReturn {
  state: VoiceInterfaceState;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: string) => void;
  toggleMute: () => void;
  clearConversation: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  error: string | null;
}

export function useRealtimeVoice(options: UseRealtimeVoiceOptions = {}): UseRealtimeVoiceReturn {
  const {
    onError,
    onConnected,
    onDisconnected,
    onResponseReceived,
    onSpeechStarted,
    onSpeechStopped,
    autoConnect = false
  } = options;

  // State
  const [state, setState] = useState<VoiceInterfaceState>({
    isListening: false,
    isConnected: false,
    isConnecting: false,
    isSpeaking: false,
    hasPermission: false,
    conversationHistory: []
  });

  // Refs for WebRTC connection
  const connectionRef = useRef<WebRTCConnectionState>({
    connected: false,
    connecting: false
  });
  const audioContextRef = useRef<AudioContext | null>(null);
  const isMutedRef = useRef(false);
  const autoConnectAttemptedRef = useRef(false);
  // Stable refs for external callbacks to avoid effect thrashing
  const onConnectedRef = useRef<(() => void) | undefined>(onConnected);
  const onDisconnectedRef = useRef<(() => void) | undefined>(onDisconnected);
  const onErrorRef = useRef<((error: string) => void) | undefined>(onError);
  const onResponseReceivedRef = useRef<((text: string) => void) | undefined>(onResponseReceived);
  const onSpeechStartedRef = useRef<(() => void) | undefined>(onSpeechStarted);
  const onSpeechStoppedRef = useRef<(() => void) | undefined>(onSpeechStopped);

  useEffect(() => {
    onConnectedRef.current = onConnected;
    onDisconnectedRef.current = onDisconnected;
    onErrorRef.current = onError;
    onResponseReceivedRef.current = onResponseReceived;
    onSpeechStartedRef.current = onSpeechStarted;
    onSpeechStoppedRef.current = onSpeechStopped;
  }, [onConnected, onDisconnected, onError, onResponseReceived, onSpeechStarted, onSpeechStopped]);

  // Helper to send client events
  const sendClientEvent = useCallback((event: RealtimeClientEvent) => {
    const { dataChannel } = connectionRef.current;
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify(event));
    }
  }, []);

  // Handle server events
  const handleServerEvent = useCallback((event: RealtimeServerEvent) => {
    // eslint-disable-next-line no-console
    console.log('Received server event:', event.type, event);

    switch (event.type) {
      case 'session.created':
        // eslint-disable-next-line no-console
        console.log('Session created:', event.session);
        break;

      case 'session.updated':
        // eslint-disable-next-line no-console
        console.log('Session updated:', event.session);
        break;

      case 'conversation.item.created':
        setState(prev => ({
          ...prev,
          conversationHistory: [...prev.conversationHistory, event.item]
        }));
        break;

      case 'response.created':
        setState(prev => ({ ...prev, isSpeaking: true }));
        break;

      case 'response.done':
        setState(prev => ({ ...prev, isSpeaking: false }));
        
        // Extract text from response if available
        const textContent = event.response.output
          .find(item => item.role === 'assistant')
          ?.content?.find(content => content.type === 'text')?.text;
        
        if (textContent && onResponseReceivedRef.current) {
          onResponseReceivedRef.current(textContent);
        }
        break;

      case 'response.text.delta':
        setState(prev => ({
          ...prev,
          currentResponse: (prev.currentResponse || '') + event.delta
        }));
        break;

      case 'input_audio_buffer.speech_started':
        setState(prev => ({ ...prev, isListening: true }));
        onSpeechStartedRef.current?.();
        break;

      case 'input_audio_buffer.speech_stopped':
        setState(prev => ({ ...prev, isListening: false }));
        onSpeechStoppedRef.current?.();
        break;

      case 'error':
        const errorMessage = `${event.error.type}: ${event.error.message}`;
        setState(prev => ({ ...prev, error: errorMessage }));
        onErrorRef.current?.(errorMessage);
        break;
    }
  }, []);

  // Get ephemeral token from Supabase function
  const getEphemeralToken = async (): Promise<EphemeralTokenResponse> => {
    const response = await fetch('/api/supabase/functions/realtime-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get ephemeral token');
    }

    return response.json();
  };

  // Initialize WebRTC connection
  const connect = useCallback(async () => {
    if (connectionRef.current.connecting || connectionRef.current.connected) {
      return;
    }

    try {
      setState(prev => ({ ...prev, isConnecting: true, error: undefined }));
      connectionRef.current.connecting = true;

      // Get ephemeral token
      const tokenData = await getEphemeralToken();
      const ephemeralKey = tokenData.value; // Fix: use tokenData.value instead of tokenData.client_secret.value

      // Create peer connection
      const pc = new RTCPeerConnection();
      connectionRef.current.peerConnection = pc;

      // Set up audio element for remote audio
      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      connectionRef.current.audioElement = audioEl;

      // Handle remote audio stream
      pc.ontrack = (e) => {
        // eslint-disable-next-line no-console
        console.log('Received remote track:', e.track.kind);
        if (e.track.kind === 'audio' && e.streams[0]) {
          audioEl.srcObject = e.streams[0];
        }
      };

      // Ensure we have an audio transceiver for bidirectional audio
      pc.addTransceiver('audio', { direction: 'sendrecv' });

      // Get user media for microphone input
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 24000
          }
        });

        connectionRef.current.localStream = stream;
        
        // Add local audio track
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack && pc.signalingState !== 'closed') {
          pc.addTrack(audioTrack, stream);
        }

        setState(prev => ({ ...prev, hasPermission: true }));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to get user media:', err);
        setState(prev => ({ 
          ...prev,
          error: 'Microphone permission denied or not available',
          hasPermission: false 
        }));
        return;
      }

      // Set up data channel for events
      const dc = pc.createDataChannel('oai-events');
      connectionRef.current.dataChannel = dc;

      dc.onopen = () => {
        // eslint-disable-next-line no-console
        console.log('Data channel opened');
        connectionRef.current.connected = true;
        connectionRef.current.connecting = false;
        
        setState(prev => ({ 
          ...prev,
          isConnected: true, 
          isConnecting: false,
          error: undefined 
        }));
        
        onConnectedRef.current?.();

        // Send initial session update for horary astrology
        sendClientEvent({
          type: 'session.update',
          session: {
            type: 'realtime',
            model: tokenData.session_config?.model || 'gpt-realtime',
            instructions: tokenData.session_config?.instructions,
            audio: {
              input: {
                format: {
                  type: 'audio/pcm',
                  rate: 24000,
                 },
                // turn_detection: {
                //   type: 'semantic_vad',
                //   threshold: 0.6,
                //   prefix_padding_ms: 300,
                //   silence_duration_ms: 500,
                //   create_response: true
                // }
              },
              output: {
                format: {
                  type: 'audio/pcm',
                  rate: 24000,
                 },
                voice: 'alloy',
                speed: 1
              }
            }
          }
        });
      };

      dc.onmessage = (e) => {
        try {
          const serverEvent: RealtimeServerEvent = JSON.parse(e.data);
          handleServerEvent(serverEvent);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to parse server event:', err);
        }
      };

      dc.onerror = (err) => {
        // eslint-disable-next-line no-console
        console.error('Data channel error:', err);
        setState(prev => ({ ...prev, error: 'Data channel error' }));
      };

      dc.onclose = () => {
        // eslint-disable-next-line no-console
        console.log('Data channel closed');
        connectionRef.current.connected = false;
        setState(prev => ({ ...prev, isConnected: false }));
        onDisconnectedRef.current?.();
      };

      // Create offer and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Wait for ICE gathering to complete so SDP contains candidates
      if (pc.iceGatheringState !== 'complete') {
        await new Promise<void>((resolve) => {
          const checkState = () => {
            if (pc.iceGatheringState === 'complete') {
              pc.removeEventListener('icegatheringstatechange', checkState);
              resolve();
            }
          };
          pc.addEventListener('icegatheringstatechange', checkState);
        });
      }

      // Send offer to OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime/calls";
      const model = tokenData.session_config?.model;

      console.log('model', model);
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: pc.localDescription?.sdp || offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!sdpResponse.ok) {
        const errText = await sdpResponse.text().catch(() => '');
        throw new Error(`Failed to connect to OpenAI: ${sdpResponse.status}${errText ? ` - ${errText}` : ''}`);
      }

      const answerSdp = await sdpResponse.text();
      const answer: RTCSessionDescriptionInit = {
        type: "answer",
        sdp: answerSdp,
      };

      await pc.setRemoteDescription(answer);

    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Connection error:', error);
      connectionRef.current.connecting = false;
      connectionRef.current.connected = false;
      
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setState(prev => ({ 
        ...prev,
        isConnecting: false, 
        isConnected: false,
        error: errorMessage 
      }));
      onErrorRef.current?.(errorMessage);
    }
  }, [sendClientEvent, handleServerEvent]);

  // Disconnect from WebRTC
  const disconnect = useCallback(() => {
    const { peerConnection, dataChannel, localStream, audioElement } = connectionRef.current;

    // Close data channel
    if (dataChannel) {
      dataChannel.close();
    }

    // Close peer connection
    if (peerConnection) {
      peerConnection.close();
    }

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    // Clean up audio element
    if (audioElement) {
      audioElement.srcObject = null;
    }

    // Reset connection state
    connectionRef.current = {
      connected: false,
      connecting: false
    };

    // Reset auto-connect attempt flag so it can try again if needed
    autoConnectAttemptedRef.current = false;

    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      isListening: false,
      isSpeaking: false,
      error: undefined
    }));

    onDisconnectedRef.current?.();
  }, []);

  // Send text message
  const sendMessage = useCallback((message: string) => {
    if (!connectionRef.current.connected) {
      // eslint-disable-next-line no-console
      console.warn('Not connected, cannot send message');
      return;
    }

    const conversationItem: ConversationItem = {
      type: 'message',
      role: 'user',
      content: [{
        type: 'input_text',
        text: message
      }]
    };

    sendClientEvent({
      type: 'conversation.item.create',
      item: conversationItem
    });

    sendClientEvent({
      type: 'response.create'
    });

    // Update conversation history using functional setState
    setState(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, conversationItem]
    }));
  }, [sendClientEvent]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const { localStream } = connectionRef.current;
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        isMutedRef.current = !isMutedRef.current;
        audioTrack.enabled = !isMutedRef.current;
      }
    }
  }, []);

  // Clear conversation
  const clearConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      conversationHistory: [],
      currentResponse: undefined
    }));
  }, []);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && !autoConnectAttemptedRef.current && !state.isConnected && !state.isConnecting) {
      autoConnectAttemptedRef.current = true;
      connect();
    }
  }, [autoConnect, connect, state.isConnected, state.isConnecting]);

  // Keep a stable reference to disconnect for unmount cleanup
  const disconnectRef = useRef<() => void>(() => {});
  useEffect(() => {
    disconnectRef.current = disconnect;
  }, [disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    const audioContext = audioContextRef.current;
    
    return () => {
      disconnectRef.current();
      
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  return {
    state,
    connect,
    disconnect,
    sendMessage,
    toggleMute,
    clearConversation,
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    isListening: state.isListening,
    isSpeaking: state.isSpeaking,
    error: state.error || null
  };
}
