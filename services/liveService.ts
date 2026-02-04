
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";

// Audio configuration
const AUDIO_SAMPLE_RATE_INPUT = 16000;
const AUDIO_SAMPLE_RATE_OUTPUT = 24000;

let audioContext: AudioContext | null = null;
let inputAudioContext: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let currentSession: any = null;

// Helpers for audio data conversion
function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const output = new DataView(new ArrayBuffer(input.length * 2));
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return output.buffer;
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export interface LiveSessionConfig {
  apiKey: string;
  systemInstruction: string;
  onAudioData: (visualizerData: number) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export const connectLiveSession = async (config: LiveSessionConfig) => {
  if (!config.apiKey) {
    config.onError("API Key missing");
    return;
  }

  // Ensure clean state before starting
  disconnectLiveSession();

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    
    // 1. Initialize Audio Context (Output)
    audioContext = new AudioContextClass({
      sampleRate: AUDIO_SAMPLE_RATE_OUTPUT,
    });
    
    // Resume immediately if suspended (browser policy)
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    
    // 2. Initialize Gemini Client
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    
    // 3. Setup Audio Output Queue
    let nextStartTime = 0;
    const outputNode = audioContext.createGain();
    outputNode.connect(audioContext.destination);

    // 4. Connect to Gemini Live
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // Kore sounds authoritative
        },
        systemInstruction: config.systemInstruction,
      },
      callbacks: {
        onopen: async () => {
          console.log("SentinelAI Live Link Established");
          
          // Start Input Stream
          try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
               throw new Error("Media Devices API not supported (check HTTPS)");
            }

            mediaStream = await navigator.mediaDevices.getUserMedia({ audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: AUDIO_SAMPLE_RATE_INPUT
            } });

            // Create separate context for input to ensure correct sample rate capture
            inputAudioContext = new AudioContextClass({ sampleRate: AUDIO_SAMPLE_RATE_INPUT });
            
            source = inputAudioContext.createMediaStreamSource(mediaStream);
            scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Simple visualizer data from input volume
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              const volume = Math.sqrt(sum / inputData.length);
              config.onAudioData(volume); // Send input volume for visualization

              // Convert to PCM and Send
              const pcm16 = floatTo16BitPCM(inputData);
              const base64Audio = arrayBufferToBase64(pcm16);
              
              sessionPromise.then(session => {
                  session.sendRealtimeInput({
                      media: {
                          mimeType: 'audio/pcm;rate=16000',
                          data: base64Audio
                      }
                  });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          } catch (err: any) {
            console.error("Mic Error:", err);
            config.onError(`Mic Error: ${err.message || "Access Denied"}`);
            disconnectLiveSession();
          }
        },
        onmessage: async (msg: LiveServerMessage) => {
          // Handle Audio Output
          const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData) {
            const rawBytes = base64ToUint8Array(audioData);
            
            // Visualizer feedback for output
            config.onAudioData(0.8); // Fake high volume for AI speaking

            if (audioContext) {
                // Decode and Play
                const float32Data = new Float32Array(rawBytes.length / 2);
                const dataView = new DataView(rawBytes.buffer);
                
                for (let i = 0; i < float32Data.length; i++) {
                // Convert Int16 to Float32
                float32Data[i] = dataView.getInt16(i * 2, true) / 32768.0;
                }

                const audioBuffer = audioContext.createBuffer(1, float32Data.length, AUDIO_SAMPLE_RATE_OUTPUT);
                audioBuffer.getChannelData(0).set(float32Data);

                const sourceNode = audioContext.createBufferSource();
                sourceNode.buffer = audioBuffer;
                sourceNode.connect(outputNode);

                const currentTime = audioContext.currentTime;
                // Schedule smooth playback
                const startTime = Math.max(currentTime, nextStartTime);
                sourceNode.start(startTime);
                nextStartTime = startTime + audioBuffer.duration;
            }
          }

          if (msg.serverContent?.interrupted) {
            nextStartTime = 0; // Reset queue on interrupt
          }
        },
        onclose: () => {
          config.onClose();
        },
        onerror: (err) => {
          console.error("Live API Error", err);
          config.onError("Connection disrupted");
        }
      }
    });

    currentSession = sessionPromise;

  } catch (err: any) {
    config.onError(err.message);
  }
};

export const disconnectLiveSession = () => {
  if (currentSession) {
      currentSession.then((s: any) => {
          // Attempt to send a close signal if supported, or just close local resources
          try { s.close(); } catch(e){}
      });
  }
  
  if (scriptProcessor) {
    scriptProcessor.disconnect();
    scriptProcessor.onaudioprocess = null;
  }
  if (source) source.disconnect();
  if (mediaStream) {
      mediaStream.getTracks().forEach(t => t.stop());
  }
  
  if (audioContext) {
      try { audioContext.close(); } catch(e){}
  }
  if (inputAudioContext) {
      try { inputAudioContext.close(); } catch(e){}
  }

  currentSession = null;
  audioContext = null;
  inputAudioContext = null;
  mediaStream = null;
  scriptProcessor = null;
  source = null;
};