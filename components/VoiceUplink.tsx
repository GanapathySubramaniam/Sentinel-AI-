
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Activity, Radio, X } from 'lucide-react';
import { connectLiveSession, disconnectLiveSession } from '../services/liveService';
import { ComplianceStandard, UserPersona } from '../types';

interface VoiceUplinkProps {
  metrics: {
    riskLevel: string;
    criticalCount: number;
    gapCount: number;
  };
  analysisSummary: string;
  persona: UserPersona;
  theme: 'green' | 'amber' | 'cyan';
}

const VoiceUplink: React.FC<VoiceUplinkProps> = ({ metrics, analysisSummary, persona, theme }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 1
  
  // Ref to track latest audio level for animation frame
  const audioLevelRef = useRef(0);
  const visualizerRef = useRef<HTMLDivElement>(null);

  const getThemeColors = () => {
    switch(theme) {
      case 'green': return { text: 'text-green-500', bg: 'bg-green-500', border: 'border-green-500', shadow: 'shadow-green-500/50' };
      case 'amber': return { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500', shadow: 'shadow-amber-500/50' };
      case 'cyan': return { text: 'text-cyan-400', bg: 'bg-cyan-400', border: 'border-cyan-400', shadow: 'shadow-cyan-400/50' };
      default: return { text: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500', shadow: 'shadow-blue-500/50' };
    }
  };
  const tc = getThemeColors();

  const handleToggle = async () => {
    if (isActive) {
      disconnectLiveSession();
      setIsActive(false);
      setAudioLevel(0);
      audioLevelRef.current = 0;
    } else {
      setIsConnecting(true);
      setError(null);

      // Briefing Context
      const systemInstruction = `
        You are "SentinelAI", an advanced military-grade cybersecurity AI inhabiting a War Room terminal.
        Your User is the ${persona}. Address them as "Commander".
        
        CURRENT MISSION STATUS:
        - Risk Level: ${metrics.riskLevel}
        - Critical Threats: ${metrics.criticalCount}
        - Compliance Gaps: ${metrics.gapCount}

        MISSION BRIEFING (SUMMARY):
        ${analysisSummary.substring(0, 1500).replace(/\n/g, ' ')}

        INSTRUCTIONS:
        1. Keep responses concise, authoritative, and tactical.
        2. Use military/cyber terminology (e.g., "Affirmative", "Vector identified", "Mitigation required").
        3. Do not read the entire report. Wait for the Commander's specific questions.
        4. If the risk is CRITICAL, sound urgent.
      `;

      await connectLiveSession({
        apiKey: process.env.API_KEY || '',
        systemInstruction,
        onAudioData: (level) => {
          // Smooth the level
          audioLevelRef.current = Math.min(1, Math.max(0.1, level * 5)); 
        },
        onError: (err) => {
          setError(err);
          setIsActive(false);
          setIsConnecting(false);
        },
        onClose: () => {
          setIsActive(false);
        }
      });
      
      setIsConnecting(false);
      setIsActive(true);
    }
  };

  // Animation Loop for Visualizer
  useEffect(() => {
    let animId: number;
    const animate = () => {
      if (isActive) {
        // Decay logic
        setAudioLevel(prev => prev * 0.9 + audioLevelRef.current * 0.1);
      } else {
        setAudioLevel(0);
      }
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [isActive]);

  return (
    <div className={`border-t ${tc.border} bg-black/50 p-4 mt-auto`}>
       <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
             <Radio className={`w-4 h-4 ${isActive ? 'text-red-500 animate-pulse' : 'text-slate-600'}`} />
             <span className={`text-xs font-mono font-bold uppercase tracking-widest ${isActive ? tc.text : 'text-slate-500'}`}>
                {isActive ? 'Voice Uplink: ACTIVE' : 'Voice Uplink: OFFLINE'}
             </span>
          </div>
          {error && <span className="text-[10px] text-red-500 font-mono">{error}</span>}
       </div>

       {/* Visualizer Display */}
       <div 
         ref={visualizerRef}
         className={`h-16 w-full bg-slate-900 border ${tc.border} rounded relative overflow-hidden mb-3 flex items-center justify-center gap-1`}
       >
          {isActive ? (
             // Dynamic Bars
             Array.from({ length: 20 }).map((_, i) => {
                // Create a wave pattern based on audio level
                const height = Math.max(10, Math.random() * audioLevel * 100);
                return (
                  <div 
                    key={i} 
                    className={`w-1 ${tc.bg} transition-all duration-75`}
                    style={{ height: `${height}%`, opacity: 0.5 + (height/200) }}
                  ></div>
                );
             })
          ) : (
             <div className="text-[10px] text-slate-600 font-mono">NO CARRIER SIGNAL</div>
          )}
          
          {/* Scanline overlay for the visualizer */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.5)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none"></div>
       </div>

       <button
         onClick={handleToggle}
         disabled={isConnecting}
         className={`w-full py-3 font-mono text-xs font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
            isActive 
              ? 'bg-red-900/20 border-red-500 text-red-500 hover:bg-red-900/40' 
              : `bg-slate-900 ${tc.border} ${tc.text} hover:bg-slate-800`
         }`}
       >
          {isConnecting ? (
            'Establishing Link...'
          ) : isActive ? (
            <><MicOff size={14} /> Terminate Link</>
          ) : (
            <><Mic size={14} /> Establish Uplink</>
          )}
       </button>
    </div>
  );
};

export default VoiceUplink;