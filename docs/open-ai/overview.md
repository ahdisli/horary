# OpenAI Realtime API Overview

## Introduction
The OpenAI Realtime API enables low-latency communication with models that natively support speech-to-speech interactions as well as multimodal inputs (audio, images, and text) and outputs (audio and text). These APIs can also be used for realtime audio transcription.

## Key Features
- **Low-latency speech-to-speech**: Direct voice interaction without intermediate text conversion
- **Multimodal support**: Handle audio, text, and images
- **Function calling**: Execute custom code during conversations
- **Real-time transcription**: Convert speech to text in real-time
- **Voice activity detection**: Automatic detection of speech start/stop
- **Multiple connection methods**: WebRTC and SIP support

## Voice Agents
One of the most common use cases for the Realtime API is building voice agents for speech-to-speech model interactions in the browser. The recommended starting point for these applications is the Agents SDK for TypeScript, which uses a WebRTC connection to the Realtime model in the browser.

### Quick Start with Agents SDK
```typescript
import { RealtimeAgent, RealtimeSession } from "@openai/agents/realtime";

const agent = new RealtimeAgent({
    name: "Assistant",
    instructions: "You are a helpful assistant.",
});

const session = new RealtimeSession(agent);

// Automatically connects your microphone and audio output
await session.connect({
    apiKey: "<client-api-key>",
});
```

### Voice Agent Quickstart
Follow the voice agent quickstart to build Realtime agents in the browser. The Agents SDK provides higher-level abstractions for common voice agent patterns.

## Models
The most advanced speech-to-speech model is **gpt-realtime**, which shows improvements in:
- Following complex instructions
- Calling tools and functions
- Producing natural and expressive speech
- Understanding context and tone

## Connection Methods
The Realtime API provides two primary supported interfaces:

### 1. WebRTC Connection
- **Best for**: Browser and client-side interactions
- **Advantages**: Better performance over uncertain network conditions, built-in media handling
- **Use case**: Real-time voice applications in web browsers

### 2. SIP Connection
- **Best for**: VoIP telephony connections
- **Use case**: Phone system integrations, call centers

## Authentication & Security
- **Standard API Keys**: Use only on secure server environments
- **Ephemeral Keys**: Generated server-side for client-side WebRTC connections
- **Session Duration**: Maximum 30 minutes per session

## Key Concepts

### Sessions
A Realtime Session is a stateful interaction containing:
- **Session object**: Controls interaction parameters (model, voice, configuration)
- **Conversation**: Represents user input and model output items
- **Responses**: Model-generated audio or text items

### Voice Options
Available voices for audio output:
- `alloy`, `ash`, `ballad`, `coral`, `echo`, `sage`, `shimmer`, `verse`
- Voice can only be set once per session (cannot be changed after first audio output)

### Modalities
- **Input**: `audio`, `text`
- **Output**: `audio`, `text`
- Can be configured per session or per response

## API Usage Patterns

### Basic Session Flow
1. Initialize connection (WebRTC/SIP)
2. Receive `session.created` event
3. Update session configuration with `session.update`
4. Send conversation items and create responses
5. Handle real-time events and audio streams

### Conversation Management
- Add items with `conversation.item.create`
- Generate responses with `response.create`
- Handle streaming events for real-time feedback
- Support for function calling and tool usage

### Advanced Features
- **Out-of-band responses**: Generate responses outside main conversation
- **Custom context**: Control which conversation items influence responses
- **Voice Activity Detection (VAD)**: Automatic speech detection
- **Function calling**: Execute custom code during conversations

## Error Handling
- Listen for `error` events from server
- Use `event_id` on client events to trace errors
- Implement retry logic for network issues
- Handle rate limits and usage quotas

## Further Reading
- **Connection Guides**: WebRTC, SIP implementation details
- **Conversation Management**: Advanced conversation handling patterns
- **Function Calling**: Tool integration and custom code execution
- **Voice Activity Detection**: Speech detection configuration
- **Prompting Guide**: Best practices for realtime model prompting

