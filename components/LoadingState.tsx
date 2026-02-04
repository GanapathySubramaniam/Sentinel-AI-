import React, { useEffect, useState } from 'react';
import { Scan, Shield, Server, Lock, FileSearch, AlertTriangle } from 'lucide-react';
import { STAGES } from '../types';

const LoadingState: React.FC = () => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 2500); // Switch stage every 2.5 seconds to simulate work

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-blue-400">
          <Scan size={48} className="animate-pulse" />
        </div>
      </div>

      <div className="w-full max-w-md bg-slate-900 rounded-lg border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        {/* Scan line effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>

        <h3 className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">
          Assessment Engine v2026.1
        </h3>

        <div className="space-y-4">
          {STAGES.map((stage, index) => {
            const isActive = index === currentStageIndex;
            const isCompleted = index < currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <div 
                key={index} 
                className={`flex items-center gap-3 transition-all duration-500 ${
                  isActive ? 'opacity-100 translate-x-2' : 
                  isCompleted ? 'opacity-50' : 'opacity-30'
                }`}
              >
                {isCompleted ? (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  </div>
                ) : isActive ? (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center animate-spin">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-700"></div>
                )}
                
                <span className={`font-mono text-sm ${isActive ? 'text-blue-400 font-bold' : isCompleted ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {stage}
                </span>
                
                {isActive && (
                  <span className="text-xs text-blue-500 animate-pulse ml-auto">PROCESSING_</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-slate-500 text-sm font-mono">
        Generating cryptographic proof of analysis...
      </p>
    </div>
  );
};

export default LoadingState;
