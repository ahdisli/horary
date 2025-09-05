// OpenAI Realtime API Types
export interface RealtimeSession {
  type: 'realtime';
  model: string;
  instructions?: string;
  voice?: RealtimeVoice;
  input_audio_format?: AudioFormat;
  output_audio_format?: AudioFormat;
  input_audio_transcription?: {
    model: string;
  };
  turn_detection?: TurnDetection;
  tools?: RealtimeTool[];
  tool_choice?: string | 'auto' | 'none';
  temperature?: number;
  max_response_output_tokens?: number;
  audio?: {
    input?: {
      format: AudioFormat;
      // turn_detection?: TurnDetection;
    };
    output?: {
      format: AudioFormat;
      voice: RealtimeVoice;
      speed?: number;
    };
  };
}

export type RealtimeVoice = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'sage' | 'shimmer' | 'verse';

export interface AudioFormat {
    type: string,
    rate: number,
}

export interface TurnDetection {
  type: 'semantic_vad' | 'none';
  threshold?: number;
  prefix_padding_ms?: number;
  silence_duration_ms?: number;
  create_response?: boolean;
}

export interface RealtimeTool {
  type: 'function';
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// Client Events
export interface SessionUpdateEvent {
  type: 'session.update';
  session: Partial<RealtimeSession>;
}

export interface ConversationItemCreateEvent {
  type: 'conversation.item.create';
  item: ConversationItem;
}

export interface ResponseCreateEvent {
  type: 'response.create';
  response?: {
    modalities?: ('text' | 'audio')[];
    instructions?: string;
    voice?: RealtimeVoice;
    output_audio_format?: AudioFormat;
    tools?: RealtimeTool[];
    tool_choice?: string;
    temperature?: number;
    max_output_tokens?: number;
    conversation?: string;
    input?: ConversationItem[];
    metadata?: Record<string, unknown>;
  };
}

export interface InputAudioBufferAppendEvent {
  type: 'input_audio_buffer.append';
  audio: string; // Base64-encoded audio
}

export interface InputAudioBufferCommitEvent {
  type: 'input_audio_buffer.commit';
}

export interface InputAudioBufferClearEvent {
  type: 'input_audio_buffer.clear';
}

export type RealtimeClientEvent = 
  | SessionUpdateEvent
  | ConversationItemCreateEvent
  | ResponseCreateEvent
  | InputAudioBufferAppendEvent
  | InputAudioBufferCommitEvent
  | InputAudioBufferClearEvent;

// Server Events
export interface SessionCreatedEvent {
  type: 'session.created';
  event_id: string;
  session: RealtimeSession;
}

export interface SessionUpdatedEvent {
  type: 'session.updated';
  event_id: string;
  session: RealtimeSession;
}

export interface ConversationItemCreatedEvent {
  type: 'conversation.item.created';
  event_id: string;
  previous_item_id?: string;
  item: ConversationItem;
}

export interface ResponseCreatedEvent {
  type: 'response.created';
  event_id: string;
  response: RealtimeResponse;
}

export interface ResponseDoneEvent {
  type: 'response.done';
  event_id: string;
  response: RealtimeResponse;
}

export interface ResponseAudioDeltaEvent {
  type: 'response.audio.delta';
  event_id: string;
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string; // Base64-encoded audio chunk
}

export interface ResponseTextDeltaEvent {
  type: 'response.text.delta';
  event_id: string;
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
}

export interface InputAudioBufferSpeechStartedEvent {
  type: 'input_audio_buffer.speech_started';
  event_id: string;
  audio_start_ms: number;
  item_id: string;
}

export interface InputAudioBufferSpeechStoppedEvent {
  type: 'input_audio_buffer.speech_stopped';
  event_id: string;
  audio_end_ms: number;
  item_id: string;
}

export interface ErrorEvent {
  type: 'error';
  event_id?: string;
  error: {
    type: string;
    code: string;
    message: string;
    param?: string;
  };
}

export type RealtimeServerEvent = 
  | SessionCreatedEvent
  | SessionUpdatedEvent
  | ConversationItemCreatedEvent
  | ResponseCreatedEvent
  | ResponseDoneEvent
  | ResponseAudioDeltaEvent
  | ResponseTextDeltaEvent
  | InputAudioBufferSpeechStartedEvent
  | InputAudioBufferSpeechStoppedEvent
  | ErrorEvent;

// Conversation Items
export interface ConversationItem {
  id?: string;
  type: 'message' | 'function_call' | 'function_call_output';
  status?: 'completed' | 'incomplete' | 'failed';
  role?: 'user' | 'assistant' | 'system';
  content?: ContentPart[];
  name?: string; // for function_call
  call_id?: string; // for function_call and function_call_output
  arguments?: string; // for function_call (JSON string)
  output?: string; // for function_call_output (JSON string)
}

export interface ContentPart {
  type: 'input_text' | 'input_audio' | 'text' | 'audio';
  text?: string;
  audio?: string; // Base64-encoded audio
  transcript?: string;
}

export interface RealtimeResponse {
  id: string;
  object: 'realtime.response';
  status: 'in_progress' | 'completed' | 'cancelled' | 'failed' | 'incomplete';
  status_details?: Record<string, unknown> | null;
  output: ConversationItem[];
  usage?: {
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    input_token_details?: {
      text_tokens: number;
      audio_tokens: number;
      cached_tokens: number;
      cached_tokens_details?: {
        text_tokens: number;
        audio_tokens: number;
      };
    };
    output_token_details?: {
      text_tokens: number;
      audio_tokens: number;
    };
  };
  metadata?: Record<string, unknown>;
}

// Ephemeral Token Response
export interface EphemeralTokenResponse {
  value: string;
  expires_at: number;
  session: RealtimeSession;
  session_config?: RealtimeSession;
}

// WebRTC Connection State
export interface WebRTCConnectionState {
  connected: boolean;
  connecting: boolean;
  error?: string;
  peerConnection?: RTCPeerConnection;
  dataChannel?: RTCDataChannel;
  audioElement?: HTMLAudioElement;
  localStream?: MediaStream;
}

// Horary Astrology Specific Types
export interface HoraryQuestion {
  id?: string;
  question: string;
  datetime: string; // ISO string
  location: {
    latitude: number;
    longitude: number;
    timezone?: string;
  };
  querent_name?: string;
  background?: string;
}

export interface HoraryChart {
  id?: string;
  question_id?: string;
  chart_data: Record<string, unknown>; // Will contain astrological chart data
  interpretation?: string;
  significators?: {
    querent?: string;
    quesited?: string;
  };
  aspects?: Record<string, unknown>[];
  timing?: string;
  created_at?: string;
}

// Voice Interface State
export interface VoiceInterfaceState {
  isListening: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  hasPermission: boolean;
  error?: string;
  currentResponse?: string;
  conversationHistory: ConversationItem[];
}
