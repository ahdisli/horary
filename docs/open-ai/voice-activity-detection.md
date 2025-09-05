# Voice Activity Detection (VAD) Guide

## Overview
Voice Activity Detection (VAD) is a crucial feature of the OpenAI Realtime API that automatically detects when a user starts and stops speaking. This enables natural conversation flow without requiring manual controls like push-to-talk buttons.

## Types of Voice Activity Detection

### Server VAD (Recommended)
Server-side voice activity detection runs on OpenAI's servers and provides the most reliable speech detection.

```javascript
// Configure Server VAD
const vadConfig = {
    type: "session.update",
    session: {
        turn_detection: {
            type: "server_vad",
            threshold: 0.5,              // Sensitivity (0.0-1.0)
            prefix_padding_ms: 300,      // Audio before speech detection
            silence_duration_ms: 200,    // Silence to detect speech end
            create_response: true        // Auto-generate responses
        }
    }
};

// Send via WebRTC data channel
dataChannel.send(JSON.stringify(vadConfig));
```

#### Server VAD Parameters
- **threshold** (0.0-1.0): Speech detection sensitivity
  - Lower values = more sensitive (picks up quiet speech)
  - Higher values = less sensitive (ignores background noise)
  - Default: 0.5
  
- **prefix_padding_ms**: Milliseconds of audio to include before detected speech
  - Helps capture complete words/phrases
  - Default: 300ms
  
- **silence_duration_ms**: Silence duration to trigger speech end
  - Shorter = more responsive, may cut off speech
  - Longer = less responsive, but captures full thoughts
  - Default: 200ms
  
- **create_response**: Whether to automatically create responses
  - true: Model responds immediately when speech ends
  - false: Manual response creation required

### Client VAD (Advanced)
Client-side voice activity detection runs in the browser using Web Audio API.

```javascript
class ClientVAD {
    constructor(audioContext, sourceNode) {
        this.audioContext = audioContext;
        this.sourceNode = sourceNode;
        this.analyser = audioContext.createAnalyser();
        this.processor = audioContext.createScriptProcessor(4096, 1, 1);
        
        this.threshold = 0.01;
        this.isDetectingSpeech = false;
        this.silenceCounter = 0;
        this.silenceThreshold = 20; // frames of silence
        
        this.setupAudioProcessing();
    }
    
    setupAudioProcessing() {
        this.analyser.fftSize = 2048;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
        
        this.sourceNode.connect(this.analyser);
        this.analyser.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
        
        this.processor.onaudioprocess = (event) => {
            this.processAudio(event.inputBuffer);
        };
    }
    
    processAudio(inputBuffer) {
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Calculate audio level
        const audioLevel = this.dataArray.reduce((sum, value) => sum + value, 0) / this.dataArray.length;
        const normalizedLevel = audioLevel / 255;
        
        if (normalizedLevel > this.threshold) {
            if (!this.isDetectingSpeech) {
                this.isDetectingSpeech = true;
                this.onSpeechStart();
            }
            this.silenceCounter = 0;
        } else {
            if (this.isDetectingSpeech) {
                this.silenceCounter++;
                if (this.silenceCounter > this.silenceThreshold) {
                    this.isDetectingSpeech = false;
                    this.onSpeechEnd();
                }
            }
        }
    }
    
    onSpeechStart() {
        console.log('Speech detected');
        // Implement speech start logic
    }
    
    onSpeechEnd() {
        console.log('Speech ended');
        // Implement speech end logic
    }
}
```

### Disable VAD (Manual Control)
Disable automatic speech detection for full manual control.

```javascript
// Disable VAD for manual control
const manualConfig = {
    type: "session.update",
    session: {
        turn_detection: null
    }
};

dataChannel.send(JSON.stringify(manualConfig));

// Manual audio buffer management
function handleManualAudio() {
    // Add audio chunks
    dataChannel.send(JSON.stringify({
        type: "input_audio_buffer.append",
        audio: base64AudioData
    }));
    
    // Commit when user stops speaking
    dataChannel.send(JSON.stringify({
        type: "input_audio_buffer.commit"
    }));
    
    // Generate response
    dataChannel.send(JSON.stringify({
        type: "response.create"
    }));
    
    // Clear buffer for next input
    dataChannel.send(JSON.stringify({
        type: "input_audio_buffer.clear"
    }));
}
```

## VAD Events and Lifecycle

### Server Events During VAD
```javascript
function handleVADEvents(event) {
    switch (event.type) {
        case 'input_audio_buffer.speech_started':
            console.log('User started speaking');
            // Update UI to show listening state
            break;
            
        case 'input_audio_buffer.speech_stopped':
            console.log('User stopped speaking');
            // Update UI to show processing state
            break;
            
        case 'input_audio_buffer.committed':
            console.log('Audio buffer committed');
            // Audio is ready for processing
            break;
            
        case 'response.created':
            console.log('AI response started');
            // Model is generating response
            break;
            
        case 'response.done':
            console.log('AI response completed');
            // Ready for next user input
            break;
    }
}
```

## Advanced VAD Configuration

### Dynamic Threshold Adjustment
```javascript
class AdaptiveVAD {
    constructor(initialThreshold = 0.5) {
        this.threshold = initialThreshold;
        this.recentLevels = [];
        this.adaptationRate = 0.1;
    }
    
    adaptThreshold(audioLevel, hasBackgroundNoise) {
        this.recentLevels.push(audioLevel);
        if (this.recentLevels.length > 100) {
            this.recentLevels.shift();
        }
        
        // Calculate background noise level
        const avgLevel = this.recentLevels.reduce((a, b) => a + b, 0) / this.recentLevels.length;
        
        if (hasBackgroundNoise) {
            // Increase threshold in noisy environments
            this.threshold = Math.min(0.8, avgLevel + 0.2);
        } else {
            // Lower threshold in quiet environments
            this.threshold = Math.max(0.2, avgLevel + 0.1);
        }
        
        return this.threshold;
    }
    
    updateSessionVAD(dataChannel) {
        const config = {
            type: "session.update",
            session: {
                turn_detection: {
                    type: "server_vad",
                    threshold: this.threshold,
                    prefix_padding_ms: 300,
                    silence_duration_ms: 200
                }
            }
        };
        
        dataChannel.send(JSON.stringify(config));
    }
}
```

### Environment-Specific VAD Settings
```javascript
const vadPresets = {
    quiet: {
        threshold: 0.3,
        prefix_padding_ms: 200,
        silence_duration_ms: 150
    },
    normal: {
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 200
    },
    noisy: {
        threshold: 0.7,
        prefix_padding_ms: 400,
        silence_duration_ms: 300
    },
    meeting: {
        threshold: 0.6,
        prefix_padding_ms: 500,
        silence_duration_ms: 400
    }
};

function applyVADPreset(environment, dataChannel) {
    const preset = vadPresets[environment] || vadPresets.normal;
    
    const config = {
        type: "session.update",
        session: {
            turn_detection: {
                type: "server_vad",
                ...preset
            }
        }
    };
    
    dataChannel.send(JSON.stringify(config));
}
```

## Best Practices

### 1. Start with Server VAD
Always begin with server VAD unless you have specific requirements for client-side processing.

```javascript
// Recommended starting configuration
const defaultVAD = {
    type: "server_vad",
    threshold: 0.5,
    prefix_padding_ms: 300,
    silence_duration_ms: 200,
    create_response: true
};
```

### 2. Handle Network Latency
Account for network latency in VAD timing:

```javascript
function adjustVADForLatency(baseConfig, estimatedLatencyMs) {
    return {
        ...baseConfig,
        prefix_padding_ms: baseConfig.prefix_padding_ms + Math.min(estimatedLatencyMs, 200),
        silence_duration_ms: baseConfig.silence_duration_ms + Math.min(estimatedLatencyMs / 2, 100)
    };
}
```

### 3. Provide Visual Feedback
Keep users informed about VAD state:

```javascript
class VADVisualizer {
    constructor(container) {
        this.container = container;
        this.indicator = this.createIndicator();
    }
    
    createIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'vad-indicator';
        indicator.innerHTML = `
            <div class="vad-status">🎤 Ready</div>
            <div class="vad-level"></div>
        `;
        this.container.appendChild(indicator);
        return indicator;
    }
    
    updateStatus(isListening, audioLevel = 0) {
        const status = this.indicator.querySelector('.vad-status');
        const level = this.indicator.querySelector('.vad-level');
        
        if (isListening) {
            status.textContent = '🔴 Listening';
            status.className = 'vad-status listening';
        } else {
            status.textContent = '🎤 Ready';
            status.className = 'vad-status ready';
        }
        
        level.style.width = `${audioLevel * 100}%`;
    }
}
```

### 4. Handle Interruptions
Allow users to interrupt AI responses:

```javascript
class InterruptibleVAD {
    constructor(dataChannel) {
        this.dataChannel = dataChannel;
        this.isAIResponding = false;
        this.allowInterruption = true;
    }
    
    handleSpeechStart() {
        if (this.isAIResponding && this.allowInterruption) {
            // Cancel current response
            this.dataChannel.send(JSON.stringify({
                type: "response.cancel"
            }));
            
            // Clear any queued audio
            this.dataChannel.send(JSON.stringify({
                type: "input_audio_buffer.clear"
            }));
        }
    }
    
    handleResponseStart() {
        this.isAIResponding = true;
    }
    
    handleResponseEnd() {
        this.isAIResponding = false;
    }
}
```

### 5. Optimize for Mobile
Adjust VAD settings for mobile environments:

```javascript
function getMobileVADConfig() {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        return {
            type: "server_vad",
            threshold: 0.6,           // Higher threshold for mobile mics
            prefix_padding_ms: 400,   // More padding for processing delays
            silence_duration_ms: 300  // Longer silence detection
        };
    }
    
    return {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 200
    };
}
```

## Troubleshooting VAD Issues

### Common Problems and Solutions

#### VAD Too Sensitive
```javascript
// Increase threshold and silence duration
const lesssensitive = {
    threshold: 0.7,
    silence_duration_ms: 400
};
```

#### VAD Not Sensitive Enough
```javascript
// Decrease threshold and silence duration
const moreSensitive = {
    threshold: 0.3,
    silence_duration_ms: 150
};
```

#### Missing Beginning of Speech
```javascript
// Increase prefix padding
const morePadding = {
    prefix_padding_ms: 500
};
```

#### False Positives from Background Noise
```javascript
// Use noise gate effect
const noiseGateConfig = {
    threshold: 0.6,
    prefix_padding_ms: 200,
    silence_duration_ms: 300
};
```

### Debug VAD Performance
```javascript
class VADDebugger {
    constructor() {
        this.events = [];
        this.startTime = Date.now();
    }
    
    logEvent(eventType, timestamp = Date.now()) {
        this.events.push({
            type: eventType,
            timestamp: timestamp,
            relativeTime: timestamp - this.startTime
        });
    }
    
    analyzePerformance() {
        const speechEvents = this.events.filter(e => 
            e.type === 'speech_started' || e.type === 'speech_stopped'
        );
        
        console.log('VAD Performance Analysis:');
        console.log('Total events:', this.events.length);
        console.log('Speech segments:', speechEvents.length / 2);
        
        // Calculate average response time
        const responseTimes = [];
        for (let i = 0; i < speechEvents.length - 1; i += 2) {
            const start = speechEvents[i];
            const end = speechEvents[i + 1];
            if (start && end) {
                responseTimes.push(end.timestamp - start.timestamp);
            }
        }
        
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        console.log('Average speech duration:', avgResponseTime, 'ms');
    }
}
```

Voice Activity Detection is essential for creating natural, conversational AI experiences. Start with server VAD using default settings, then fine-tune based on your specific use case and environment.
