import React from 'react';
import { ShieldAlert, ShieldCheck, Activity, Award, AlertOctagon, Skull, Zap } from 'lucide-react';

interface SystemIntegrityProps {
  metrics: {
    riskLevel: string;
    gapCount: number;
    criticalCount: number;
  };
  theme: 'green' | 'amber' | 'cyan';
}

const SystemIntegrity: React.FC<SystemIntegrityProps> = ({ metrics, theme }) => {
  // Gamification Logic
  const calculateIntegrity = () => {
    let integrity = 100;
    // Deduct based on findings
    integrity -= metrics.criticalCount * 15;
    integrity -= metrics.gapCount * 2;
    
    // Risk Level Penalties
    if (metrics.riskLevel === 'CRITICAL') integrity -= 20;
    if (metrics.riskLevel === 'HIGH') integrity -= 10;
    
    return Math.max(0, Math.min(100, integrity));
  };

  const integrity = calculateIntegrity();

  const getThemeColors = () => {
    switch(theme) {
      case 'green': return { text: 'text-green-500', bg: 'bg-green-500', border: 'border-green-500', shadow: 'shadow-green-500/20' };
      case 'amber': return { text: 'text-amber-500', bg: 'bg-amber-500', border: 'border-amber-500', shadow: 'shadow-amber-500/20' };
      case 'cyan': return { text: 'text-cyan-400', bg: 'bg-cyan-400', border: 'border-cyan-400', shadow: 'shadow-cyan-400/20' };
      default: return { text: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500', shadow: 'shadow-blue-500/20' };
    }
  };
  
  const tc = getThemeColors();

  const getBadge = () => {
    if (integrity >= 90) return { icon: <Award size={24} />, label: "Ironclad" };
    if (integrity >= 70) return { icon: <ShieldCheck size={24} />, label: "Fortified" };
    if (integrity >= 40) return { icon: <ShieldAlert size={24} />, label: "Compromised" };
    return { icon: <Skull size={24} />, label: "Critical Failure" };
  };

  const badge = getBadge();

  return (
    <div className={`rounded-lg border-2 ${tc.border} bg-slate-950 p-6 relative overflow-hidden mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]`}>
       {/* Background Grid - Retro */}
       <div className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{backgroundImage: `linear-gradient(${tc.text === 'text-green-500' ? '#22c55e' : tc.text === 'text-amber-500' ? '#f59e0b' : '#22d3ee'} 1px, transparent 1px), linear-gradient(90deg, ${tc.text === 'text-green-500' ? '#22c55e' : tc.text === 'text-amber-500' ? '#f59e0b' : '#22d3ee'} 1px, transparent 1px)`, backgroundSize: '20px 20px'}}>
       </div>

       <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
          
          {/* Health Bar Section */}
          <div className="flex-1 w-full">
            <div className="flex justify-between items-end mb-2">
                <h3 className={`text-lg font-bold ${tc.text} flex items-center gap-2 uppercase tracking-widest`}>
                    <Activity className="animate-pulse" />
                    System Integrity
                </h3>
                <span className={`text-4xl font-black ${tc.text}`}>{integrity}%</span>
            </div>
            
            <div className="h-6 w-full bg-slate-900 border border-slate-700 rounded-none relative overflow-hidden">
                <div 
                    className={`h-full ${tc.bg} transition-all duration-1000 ease-out relative`}
                    style={{ width: `${integrity}%` }}
                >
                    {/* Striped animation on the bar */}
                    <div className="absolute inset-0 w-full h-full" 
                         style={{backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem'}}>
                    </div>
                </div>
            </div>
            <div className="flex justify-between mt-1 text-[10px] font-mono text-slate-500 uppercase">
                <span>System Compromise detected</span>
                <span>Max Capacity</span>
            </div>
          </div>

          {/* Stats & Badges */}
          <div className="flex gap-6 items-center border-l-2 border-slate-800 pl-6">
              <div className="text-center">
                  <div className={`text-2xl font-bold ${tc.text}`}>{metrics.gapCount}</div>
                  <div className="text-[10px] uppercase text-slate-400 tracking-wider">Breaches</div>
              </div>
              <div className="text-center">
                  <div className={`text-2xl font-bold ${integrity < 50 ? 'text-red-500 animate-pulse' : tc.text}`}>{metrics.criticalCount}</div>
                  <div className="text-[10px] uppercase text-slate-400 tracking-wider">Critical</div>
              </div>
              
              <div className={`flex flex-col items-center justify-center p-3 border ${tc.border} bg-slate-900/80 rounded min-w-[100px]`}>
                  <div className={`${tc.text} mb-1`}>{badge.icon}</div>
                  <div className={`text-xs font-bold uppercase ${tc.text}`}>{badge.label}</div>
              </div>
          </div>
       </div>
    </div>
  );
};

export default SystemIntegrity;