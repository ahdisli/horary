# Realtime API with WebRTC

## Overview
Connect to the Realtime API using WebRTC for browser and client-side applications. WebRTC provides superior performance for real-time media streaming over uncertain network conditions and is the recommended approach for building voice agents in web browsers.

WebRTC is a powerful set of standard interfaces for building real-time applications. The OpenAI Realtime API supports connecting to realtime models through a WebRTC peer connection, providing built-in media handling and optimized performance for client-side applications.

## When to Use WebRTC
- **Browser-based applications**: Web applications requiring voice interaction
- **Client-side voice agents**: Direct user interaction with AI models
- **Mobile applications**: Real-time voice features in mobile apps
- **Better network handling**: Automatic adaptation to network conditions
- **Built-in media handling**: Less complex audio pipeline management

## Architecture Overview
WebRTC connections require a backend server to generate ephemeral API keys for secure client-side use:

1. Browser requests ephemeral key from your server
2. Your server uses standard API key to request ephemeral key from OpenAI
3. Browser uses ephemeral key to establish WebRTC connection with OpenAI

![WebRTC Architecture](https://openaidevs.retool.com/api/file/55b47800-9aaf-48b9-90d5-793ab227ddd3)

## Server-Side: Ephemeral Token Generation

### Node.js Express Server
```javascript
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const sessionConfig = {
    session: {
        type: "realtime",
        model: "gpt-realtime",
        voice: "alloy",
        instructions: "You are a helpful assistant. Speak clearly and concisely.",
        modalities: ["audio", "text"],
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: {
            model: "whisper-1"
        },
        turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 200
        },
        tools: [],
        tool_choice: "auto",
        temperature: 0.8
    }
};

// Generate ephemeral token endpoint
app.post("/api/realtime/token", async (req, res) => {
    try {
        const response = await fetch(
            "https://api.openai.com/v1/realtime/client_secrets",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sessionConfig),
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Token generation error:", error);
        res.status(500).json({ 
            error: "Failed to generate token",
            details: error.message 
        });
    }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### Python Flask Server
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json

app = Flask(__name__)
CORS(app)

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

session_config = {
    "session": {
        "type": "realtime",
        "model": "gpt-realtime",
        "voice": "alloy",
        "instructions": "You are a helpful assistant. Speak clearly and concisely.",
        "modalities": ["audio", "text"],
        "input_audio_format": "pcm16",
        "output_audio_format": "pcm16",
        "turn_detection": {
            "type": "server_vad",
            "threshold": 0.5,
            "prefix_padding_ms": 300,
            "silence_duration_ms": 200
        }
    }
}

@app.route('/api/realtime/token', methods=['POST'])
def generate_token():
    try:
        response = requests.post(
            'https://api.openai.com/v1/realtime/client_secrets',
            headers={
                'Authorization': f'Bearer {OPENAI_API_KEY}',
                'Content-Type': 'application/json'
            },
            json=session_config
        )
        
        response.raise_for_status()
        return jsonify(response.json())
        
    except requests.RequestException as e:
        return jsonify({
            'error': 'Failed to generate token',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=3001)
```

## Client-Side: WebRTC Implementation

### Basic WebRTC Setup
```javascript
class RealtimeWebRTCClient {
    constructor() {
        this.pc = null;
        this.dc = null;
        this.audioElement = null;
        this.localStream = null;
        this.isConnected = false;
    }
    
    async connect() {
        try {
            // Get ephemeral token from your server
            const tokenResponse = await fetch("/api/realtime/token", {
                method: "POST"
            });
            
            if (!tokenResponse.ok) {
                throw new Error('Failed to get token');
            }
            
            const tokenData = await tokenResponse.json();
            const ephemeralKey = tokenData.client_secret.value;
            
            await this.initializePeerConnection(ephemeralKey);
            
        } catch (error) {
            console.error('Connection failed:', error);
            throw error;
        }
    }
    
    async initializePeerConnection(ephemeralKey) {
        // Create peer connection
        this.pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });
        
        // Set up audio output
        this.audioElement = document.createElement("audio");
        this.audioElement.autoplay = true;
        this.audioElement.controls = false;
        
        this.pc.ontrack = (event) => {
            this.audioElement.srcObject = event.streams[0];
        };
        
        // Set up audio input
        this.localStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 16000
            }
        });
        
        // Add local audio track
        this.localStream.getTracks().forEach(track => {
            this.pc.addTrack(track, this.localStream);
        });
        
        // Set up data channel for events
        this.dc = this.pc.createDataChannel("oai-events", {
            ordered: true
        });
        
        this.dc.onopen = () => {
            console.log('Data channel opened');
            this.isConnected = true;
            this.onConnected();
        };
        
        this.dc.onmessage = (event) => {
            const serverEvent = JSON.parse(event.data);
            this.handleServerEvent(serverEvent);
        };
        
        this.dc.onerror = (error) => {
            console.error('Data channel error:', error);
        };
        
        this.dc.onclose = () => {
            console.log('Data channel closed');
            this.isConnected = false;
        };
        
        // Create offer and set local description
        const offer = await this.pc.createOffer();
        await this.pc.setLocalDescription(offer);
        
        // Send offer to OpenAI
        const baseUrl = "https://api.openai.com/v1/realtime/calls";
        const model = "gpt-realtime";
        
        const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
            method: "POST",
            body: offer.sdp,
            headers: {
                "Authorization": `Bearer ${ephemeralKey}`,
                "Content-Type": "application/sdp",
            },
        });
        
        if (!sdpResponse.ok) {
            throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
        }
        
        const answerSdp = await sdpResponse.text();
        const answer = {
            type: "answer",
            sdp: answerSdp,
        };
        
        await this.pc.setRemoteDescription(answer);
        
        // Handle connection state
        this.pc.onconnectionstatechange = () => {
            console.log('Connection state:', this.pc.connectionState);
        };
        
        this.pc.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', this.pc.iceConnectionState);
        };
    }
    
    onConnected() {
        console.log('Successfully connected to Realtime API');
        // Initial session update can be sent here if needed
    }
    
    handleServerEvent(event) {
        switch (event.type) {
            case 'session.created':
                console.log('Session created:', event.session.id);
                break;
            case 'session.updated':
                console.log('Session updated');
                break;
            case 'input_audio_buffer.speech_started':
                console.log('Speech started');
                break;
            case 'input_audio_buffer.speech_stopped':
                console.log('Speech stopped');
                break;
            case 'response.created':
                console.log('Response created');
                break;
            case 'response.audio_transcript.delta':
                console.log('Transcript:', event.delta);
                break;
            case 'response.done':
                console.log('Response completed');
                break;
            case 'error':
                console.error('Server error:', event);
                break;
            default:
                console.log('Unhandled event:', event.type);
        }
    }
    
    sendEvent(event) {
        if (this.dc && this.dc.readyState === 'open') {
            this.dc.send(JSON.stringify(event));
        } else {
            console.warn('Data channel not ready');
        }
    }
    
    updateSession(sessionUpdate) {
        this.sendEvent({
            type: "session.update",
            session: sessionUpdate
        });
    }
    
    sendTextMessage(text) {
        // Create conversation item
        this.sendEvent({
            type: "conversation.item.create",
            item: {
                type: "message",
                role: "user",
                content: [{
                    type: "input_text",
                    text: text
                }]
            }
        });
        
        // Create response
        this.sendEvent({
            type: "response.create"
        });
    }
    
    async disconnect() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        
        if (this.dc) {
            this.dc.close();
        }
        
        if (this.pc) {
            this.pc.close();
        }
        
        this.isConnected = false;
    }
}
```

### Advanced WebRTC Features

#### Audio Device Selection
```javascript
async function getAudioDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'audioinput');
}

async function selectAudioDevice(deviceId) {
    const constraints = {
        audio: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
        }
    };
    
    return await navigator.mediaDevices.getUserMedia(constraints);
}
```

#### Mute/Unmute Controls
```javascript
class AudioControls {
    constructor(localStream) {
        this.localStream = localStream;
        this.isMuted = false;
    }
    
    toggleMute() {
        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
            this.isMuted = !this.isMuted;
            audioTrack.enabled = !this.isMuted;
        }
        return this.isMuted;
    }
    
    setVolume(volume) {
        // Volume control for output audio
        if (this.audioElement) {
            this.audioElement.volume = Math.max(0, Math.min(1, volume));
        }
    }
}
```

#### Connection Quality Monitoring
```javascript
class ConnectionMonitor {
    constructor(peerConnection) {
        this.pc = peerConnection;
        this.stats = {};
    }
    
    async getStats() {
        const stats = await this.pc.getStats();
        const report = {};
        
        stats.forEach((stat) => {
            if (stat.type === 'inbound-rtp' && stat.kind === 'audio') {
                report.inbound = {
                    packetsReceived: stat.packetsReceived,
                    packetsLost: stat.packetsLost,
                    jitter: stat.jitter,
                    audioLevel: stat.audioLevel
                };
            }
            
            if (stat.type === 'outbound-rtp' && stat.kind === 'audio') {
                report.outbound = {
                    packetsSent: stat.packetsSent,
                    bytesSent: stat.bytesSent
                };
            }
            
            if (stat.type === 'candidate-pair' && stat.selected) {
                report.connection = {
                    currentRoundTripTime: stat.currentRoundTripTime,
                    availableOutgoingBitrate: stat.availableOutgoingBitrate
                };
            }
        });
        
        return report;
    }
    
    startMonitoring(interval = 5000) {
        setInterval(async () => {
            const stats = await this.getStats();
            console.log('Connection stats:', stats);
            
            // Check for connection issues
            if (stats.connection?.currentRoundTripTime > 0.5) {
                console.warn('High latency detected');
            }
        }, interval);
    }
}
```

## Complete React Component Example

```jsx
import React, { useState, useEffect, useRef } from 'react';

const RealtimeVoiceChat = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    
    const clientRef = useRef(null);
    const audioControlsRef = useRef(null);
    
    useEffect(() => {
        return () => {
            if (clientRef.current) {
                clientRef.current.disconnect();
            }
        };
    }, []);
    
    const connect = async () => {
        setIsConnecting(true);
        setError(null);
        
        try {
            const client = new RealtimeWebRTCClient();
            
            // Override handleServerEvent to update UI
            const originalHandler = client.handleServerEvent;
            client.handleServerEvent = (event) => {
                originalHandler.call(client, event);
                
                if (event.type === 'response.audio_transcript.delta') {
                    setTranscript(prev => prev + event.delta);
                } else if (event.type === 'response.done') {
                    setTranscript(''); // Clear for next response
                }
            };
            
            client.onConnected = () => {
                setIsConnected(true);
                setIsConnecting(false);
                
                // Set up audio controls
                audioControlsRef.current = new AudioControls(client.localStream);
            };
            
            await client.connect();
            clientRef.current = client;
            
        } catch (err) {
            setError(err.message);
            setIsConnecting(false);
        }
    };
    
    const disconnect = async () => {
        if (clientRef.current) {
            await clientRef.current.disconnect();
            clientRef.current = null;
        }
        setIsConnected(false);
        setTranscript('');
    };
    
    const toggleMute = () => {
        if (audioControlsRef.current) {
            const muted = audioControlsRef.current.toggleMute();
            setIsMuted(muted);
        }
    };
    
    const sendMessage = () => {
        const text = prompt('Enter text message:');
        if (text && clientRef.current) {
            clientRef.current.sendTextMessage(text);
        }
    };
    
    return (
        <div className="realtime-chat">
            <h2>Realtime Voice Chat</h2>
            
            {error && (
                <div className="error">
                    Error: {error}
                </div>
            )}
            
            <div className="controls">
                {!isConnected ? (
                    <button 
                        onClick={connect} 
                        disabled={isConnecting}
                    >
                        {isConnecting ? 'Connecting...' : 'Connect'}
                    </button>
                ) : (
                    <>
                        <button onClick={disconnect}>
                            Disconnect
                        </button>
                        <button onClick={toggleMute}>
                            {isMuted ? 'Unmute' : 'Mute'}
                        </button>
                        <button onClick={sendMessage}>
                            Send Text
                        </button>
                    </>
                )}
            </div>
            
            {isConnected && (
                <div className="status">
                    <div className="connection-indicator">
                        🟢 Connected
                    </div>
                    <div className="mic-status">
                        🎤 {isMuted ? 'Muted' : 'Active'}
                    </div>
                </div>
            )}
            
            {transcript && (
                <div className="transcript">
                    <h3>AI Response:</h3>
                    <p>{transcript}</p>
                </div>
            )}
        </div>
    );
};

export default RealtimeVoiceChat;
```

## Best Practices

### Security
- **Never expose standard API keys**: Always use ephemeral keys for client-side
- **Validate tokens server-side**: Implement proper authentication on your token endpoint
- **Set appropriate CORS policies**: Restrict origins that can request tokens
- **Monitor usage**: Track ephemeral key generation and usage

### Performance
- **Use appropriate audio constraints**: Balance quality with bandwidth
- **Implement connection pooling**: Reuse connections when possible
- **Handle network changes**: Implement reconnection logic for mobile
- **Monitor WebRTC stats**: Track connection quality and adjust accordingly

### User Experience
- **Permission handling**: Request microphone access gracefully
- **Connection states**: Provide clear feedback on connection status
- **Error recovery**: Implement retry logic with exponential backoff
- **Accessibility**: Support keyboard navigation and screen readers

### Audio Quality
- **Echo cancellation**: Enable browser echo cancellation
- **Noise suppression**: Use browser noise suppression features
- **Sample rate**: Use 16kHz for optimal performance
- **Buffer management**: Monitor audio buffer levels

This WebRTC implementation provides a robust foundation for building high-quality voice applications with the OpenAI Realtime API.