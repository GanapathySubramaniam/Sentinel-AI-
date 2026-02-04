
import React, { useState, useEffect, useRef, useMemo } from 'react';
// Added Loader2 to the list of icons imported from lucide-react
import { Terminal, Play, AlertTriangle, Shield, Clock, Skull, Zap, Target, Activity, ChevronRight, Lock, Database, Search, Crosshair, Globe, Cpu, AlertOctagon, Braces, Binary, Network, Command, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UserPersona } from '../types';

interface AttackSimulationProps {
    vulnerabilityDescription: string;
    infrastructure: string;
    complianceTarget: string;
    persona: UserPersona;
    onSimulate: (vuln: string, infra: string, compliance: string) => Promise<string>;
}

const KILL_CHAIN_STAGES = [
    { name: 'Reconnaissance', icon: <Search size={14} /> },
    { name: 'Weaponization', icon: <Zap size={14} /> },
    { name: 'Delivery', icon: <Globe size={14} /> },
    { name: 'Exploitation', icon: <Target size={14} /> },
    { name: 'Installation', icon: <Cpu size={14} /> },
    { name: 'Command & Control', icon: <Lock size={14} /> },
    { name: 'Actions on Objectives', icon: <Skull size={14} /> }
];

const AttackSimulation: React.FC<AttackSimulationProps> = ({
    vulnerabilityDescription,
    infrastructure,
    complianceTarget,
    persona,
    onSimulate
}) => {
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationResult, setSimulationResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [statusLogs, setStatusLogs] = useState<string[]>([]);
    const [activeStage, setActiveStage] = useState(-1);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const addLog = (msg: string) => {
        setStatusLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [statusLogs]);

    const handleSimulate = async () => {
        setIsSimulating(true);
        setError(null);
        setSimulationResult(null);
        setStatusLogs([]);
        setActiveStage(0);
        
        const sequences = [
            { log: "INITIALIZING SENTINELAI STRIKE ENGINE v2026.1...", delay: 0, stage: 0 },
            { log: "HANDSHAKE WITH RED-TEAM CLUSTER [STRIKE_7] ESTABLISHED.", delay: 500 },
            { log: "MAPPING TARGET INFRASTRUCTURE TOPOLOGY...", delay: 1200, stage: 1 },
            { log: "CROSS-REFERENCING CVE DATABASE & COMPLIANCE WEAKNESSES...", delay: 2000 },
            { log: "GENERATING PAYLOAD FOR VECTOR: " + vulnerabilityDescription.substring(0, 30).toUpperCase() + "...", delay: 3000, stage: 2 },
            { log: "BYPASSING PERIMETER DEFENSES (WAF_EVASION_ACTIVE)...", delay: 4500, stage: 3 },
            { log: "ESTABLISHING PERSISTENCE IN CONTAINER_RUNTIME...", delay: 6000, stage: 4 },
            { log: "DECRYPTING NODE COMM-LINK (C2_ENCRYPTED_TUNNEL)...", delay: 8000, stage: 5 },
            { log: "FINALIZING STRIKE REPORT [MITRE_MAPPED]...", delay: 10000, stage: 6 }
        ];

        sequences.forEach(seq => {
            setTimeout(() => {
                addLog(seq.log);
                if (seq.stage !== undefined) setActiveStage(seq.stage);
            }, seq.delay);
        });

        try {
            const result = await onSimulate(vulnerabilityDescription, infrastructure, complianceTarget);
            setSimulationResult(result);
            addLog("SIMULATION COMPLETE. DATA EXFILTRATED. IMPACT VERIFIED.");
        } catch (err: any) {
            setError(err.message || 'Strike simulation failed.');
            addLog("STRIKE TERMINATED: DETECTION EVENT OR CONNECTION TIMEOUT.");
        } finally {
            setIsSimulating(false);
        }
    };

    // Digital Matrix Rain Background Generator
    const MatrixRain = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => {
            const left = Math.floor(Math.random() * 100);
            const delay = Math.random() * 5;
            const duration = 2 + Math.random() * 5;
            const content = Array.from({ length: 20 }).map(() => 
                Math.random() > 0.5 ? Math.floor(Math.random() * 10).toString() : String.fromCharCode(33 + Math.floor(Math.random() * 94))
            ).join('\n');
            
            return (
                <div 
                    key={i} 
                    className="matrix-stream" 
                    style={{ left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
                >
                    {content}
                </div>
            );
        });
    }, [isSimulating]);

    return (
        <div className="bg-black border border-red-900/40 rounded-xl overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.2)] animate-fadeIn">
            {/* Tactical Header */}
            <div className="bg-gradient-to-r from-red-950/80 via-zinc-950 to-black p-6 border-b border-red-900/30 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-50"></div>
                
                <div className="flex items-center gap-5 relative z-10">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-red-600/10 rounded-full blur-2xl animate-pulse"></div>
                        <div className="w-14 h-14 rounded-full border border-red-600/30 flex items-center justify-center bg-black shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                            <Skull className={`w-8 h-8 ${isSimulating ? 'text-red-500 animate-glitch' : 'text-red-600'}`} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
                            SENTINELAI <span className="text-red-600 bg-red-950/50 px-2 py-0.5 rounded border border-red-600/20">STRIKE_ENGINE</span>
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                           <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-red-500 animate-ping' : 'bg-red-900'}`}></div>
                               <span className="text-[10px] font-mono text-red-500/80 uppercase font-black tracking-[0.3em]">Threat Vector Ready</span>
                           </div>
                           <div className="h-3 w-px bg-slate-800"></div>
                           <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                               <Braces size={10} /> v2026_STABLE
                           </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSimulate}
                    disabled={isSimulating}
                    className={`group relative overflow-hidden flex items-center gap-3 px-10 py-4 transition-all duration-700 transform ${isSimulating
                            ? 'bg-zinc-900 border border-zinc-800 text-slate-600 cursor-not-allowed scale-95'
                            : 'bg-red-600 text-white hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(220,38,38,0.4)] border border-red-400'
                        }`}
                >
                    <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {isSimulating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="font-mono text-xs font-black uppercase tracking-[0.4em]">Executing_Vector...</span>
                        </>
                    ) : (
                        <>
                            <Command className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                            <span className="font-mono text-xs font-black uppercase tracking-[0.4em]">Authorize Strike</span>
                        </>
                    )}
                </button>
            </div>

            {/* Kill Chain Progress HUD */}
            <div className="bg-zinc-950 border-b border-red-900/10 p-3 overflow-x-auto custom-scrollbar relative">
                <div className="flex items-center justify-between min-w-[850px] px-8">
                    {KILL_CHAIN_STAGES.map((stage, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2 group cursor-help relative">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-none border transition-all duration-700 ${activeStage === idx ? 'bg-red-600 border-red-400 text-white shadow-[0_0_30px_rgba(220,38,38,0.6)] rotate-45' : activeStage > idx ? 'bg-zinc-900 border-emerald-500/30 text-emerald-500' : 'bg-zinc-950 border-zinc-800 text-slate-700'}`}>
                                <div className={`${activeStage === idx ? '-rotate-45' : ''} transition-transform`}>{stage.icon}</div>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${activeStage === idx ? 'text-red-500' : activeStage > idx ? 'text-emerald-600' : 'text-slate-800'}`}>{stage.name}</span>
                            {activeStage === idx && <div className="absolute -bottom-1 w-8 h-0.5 bg-red-600 animate-pulse"></div>}
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 min-h-[650px]">
                {/* Left Panel: Terminal & Telemetry */}
                <div className="bg-black/95 border-r border-red-900/20 p-5 font-mono flex flex-col lg:col-span-1 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,38,38,0.05),transparent)] pointer-events-none"></div>
                    
                    <div className="flex items-center justify-between mb-5 border-b border-red-900/20 pb-3">
                        <span className="text-[10px] font-black text-red-600 flex items-center gap-2 tracking-widest">
                            <Terminal size={12} className="animate-pulse" /> SYSTEM_ORCHESTRATOR
                        </span>
                        <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-950"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-red-800"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 mb-6 custom-scrollbar text-[10px] leading-relaxed">
                        {statusLogs.length === 0 && (
                            <div className="text-slate-800 italic animate-pulse">Awaiting handshake...</div>
                        )}
                        {statusLogs.map((log, i) => (
                            <div key={i} className={`animate-fadeIn flex gap-2 font-bold ${log.includes('COMPLETE') ? 'text-emerald-500' : 'text-red-500/70'}`}>
                                <span className="text-slate-800 select-none">#</span> {log}
                            </div>
                        ))}
                        {isSimulating && (
                           <div className="text-red-600 animate-pulse font-black mt-4 flex items-center gap-2">
                               <Zap size={10} /> REASONING_ENGINE_HOT
                           </div>
                        )}
                        <div ref={logsEndRef} />
                    </div>

                    {/* Threat Visualizer HUD Card */}
                    <div className="p-5 border border-red-600/20 bg-red-950/10 rounded-none relative group overflow-hidden shadow-inner">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-3xl group-hover:bg-red-600/10 transition-colors"></div>
                         <div className="flex flex-col items-center gap-4 relative z-10">
                            <div className="relative">
                                <Target className={`w-14 h-14 transition-all duration-[2000ms] ${isSimulating ? 'text-red-500 rotate-180 scale-110' : 'text-zinc-800'}`} />
                                {isSimulating && (
                                    <>
                                        <div className="absolute inset-0 bg-red-500/20 blur-xl animate-pulse"></div>
                                        <div className="absolute inset-0 border-2 border-dashed border-red-500/50 rounded-full animate-spin-slow"></div>
                                    </>
                                )}
                            </div>
                            <div className="text-center space-y-1">
                                <div className="text-[10px] uppercase font-black text-red-500 tracking-[0.3em]">{isSimulating ? 'LOCK_ENGAGED' : 'AWAITING_TARGET'}</div>
                                <div className="text-[8px] uppercase font-mono text-slate-600 tracking-tighter">Coord: 37.42N // 122.08W</div>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 bg-zinc-950 p-10 relative overflow-y-auto max-h-[750px] custom-scrollbar">
                    {/* Retro Tactical Grid */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px]"></div>

                    {!simulationResult && !isSimulating && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-10 animate-fadeIn relative z-10">
                            <div className="relative">
                                <div className="w-48 h-48 rounded-none border border-red-900/30 flex items-center justify-center transform rotate-45 bg-red-950/5">
                                    <div className="w-32 h-32 rounded-none border border-red-600/40 flex items-center justify-center animate-spin-slow">
                                        <div className="w-20 h-20 rounded-none border-t-2 border-red-500"></div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Shield size={40} className="text-red-900/30" />
                                </div>
                            </div>
                            
                            <div className="max-w-md space-y-5">
                                <h4 className="text-3xl font-black text-white uppercase tracking-[0.2em] italic">Strike Parameters Ready</h4>
                                <p className="text-xs text-slate-500 font-mono italic leading-relaxed opacity-60">
                                    "Defense is a delusion. Every architecture has a heartbeat, and every heartbeat can be halted. Initializing simulation logic..."
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-2xl">
                                {[
                                    { label: 'Kill Chain', desc: 'Attack logic flow mapping.', icon: <Network size={20} /> },
                                    { label: 'Exploit Labs', desc: 'Non-executable PoC code.', icon: <Binary size={20} /> },
                                    { label: 'Impact Vectors', desc: 'Data exfil & risk mapping.', icon: <AlertOctagon size={20} /> }
                                ].map((item, i) => (
                                    <div key={i} className="p-6 bg-zinc-900/40 border border-zinc-800 rounded-none group hover:border-red-600/40 transition-all hover:bg-red-950/5 cursor-default">
                                        <div className="text-red-600 mb-3 group-hover:scale-110 transition-transform group-hover:text-red-500">{item.icon}</div>
                                        <div className="text-xs font-black text-white uppercase tracking-widest mb-2">{item.label}</div>
                                        <div className="text-[9px] text-slate-600 font-mono leading-relaxed">{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isSimulating && (
                        <div className="flex flex-col items-center justify-center h-full gap-12 animate-fadeIn relative z-10">
                             {/* Digital Rain Background for Reasoning */}
                             <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                                {MatrixRain}
                             </div>

                             <div className="relative">
                                <div className="w-56 h-56 border border-red-600/10 rounded-full flex items-center justify-center">
                                    <div className="w-48 h-48 border-2 border-red-600/20 border-t-red-500 rounded-full animate-spin-slow"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-32 h-32 border border-red-500/20 rounded-full animate-ping"></div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Binary className="w-20 h-20 text-red-600/80 animate-glitch" />
                                </div>
                             </div>

                             <div className="text-center space-y-6 relative z-10">
                                <div className="text-red-500 font-black text-5xl tracking-[0.4em] uppercase italic animate-pulse">REASONING...</div>
                                <div className="max-w-sm mx-auto space-y-2">
                                    <div className="h-2 w-full bg-zinc-900 border border-zinc-800 rounded-none overflow-hidden p-0.5">
                                        <div className="h-full bg-red-600 animate-loading-bar shadow-[0_0_15px_rgba(220,38,38,0.8)]"></div>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-mono text-red-900 font-black uppercase tracking-widest">
                                        <span>Injecting_Payload</span>
                                        <span>88% Load</span>
                                    </div>
                                </div>
                                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.5em] opacity-60">Crunching 4.8M Breach Permutations</p>
                             </div>
                        </div>
                    )}

                    {simulationResult && !isSimulating && (
                        <div className="prose prose-invert prose-sm max-w-none animate-fadeIn relative z-10 pb-20">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    h1: ({ node, ...props }) => <h1 className="text-5xl font-black text-white mb-10 uppercase italic tracking-tighter border-b-[8px] border-red-600 pb-6 flex items-center gap-5 shadow-2xl" {...props} />,
                                    h2: ({ node, ...props }) => <h2 className="text-2xl font-black text-red-500 mt-16 mb-8 flex items-center gap-4 uppercase tracking-[0.2em] border-l-8 border-red-600 pl-6 bg-red-600/5 py-4 shadow-inner" {...props} />,
                                    h3: ({ node, ...props }) => <h3 className="text-xl font-black text-orange-500 mt-10 mb-5 uppercase tracking-widest border-b border-orange-500/20 pb-2 inline-block" {...props} />,
                                    p: ({node, ...props}) => <p className="text-slate-300 leading-relaxed font-mono text-sm mb-6 opacity-90" {...props} />,
                                    code: ({ node, inline, ...props }: any) =>
                                        inline ? (
                                            <code className="bg-red-950/40 px-2 py-0.5 rounded text-red-400 font-mono text-xs border border-red-600/20" {...props} />
                                        ) : (
                                            <div className="relative group my-10">
                                                <div className="absolute -inset-2 bg-red-600/5 rounded blur-lg opacity-25 group-hover:opacity-60 transition duration-1000"></div>
                                                <div className="bg-slate-900/80 border-l-4 border-emerald-500 p-8 rounded-none shadow-2xl overflow-hidden relative">
                                                    <div className="absolute top-0 right-0 p-3 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                                                        <Braces size={10} /> TECHNICAL_PoC_PAYLOAD
                                                    </div>
                                                    <code className="block bg-transparent font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto selection:bg-emerald-500/30" {...props} />
                                                </div>
                                            </div>
                                        ),
                                    pre: ({ node, ...props }) => <pre className="bg-transparent m-0 p-0" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="space-y-5 my-8 list-none border-l-2 border-zinc-800 pl-8" {...props} />,
                                    li: ({ node, ...props }) => (
                                        <li className="flex items-start gap-4 text-slate-400 text-sm font-mono group">
                                            <div className="mt-2 w-2.5 h-2.5 bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.8)] group-hover:scale-125 transition-transform"></div>
                                            <div className="flex-1" {...props}></div>
                                        </li>
                                    ),
                                    strong: ({ node, ...props }) => <strong className="text-red-500 font-black uppercase tracking-widest" {...props} />,
                                    table: ({node, ...props}) => <div className="my-12 overflow-x-auto border-2 border-red-900/30 bg-black/50 shadow-2xl rounded-none"><table className="w-full text-xs font-mono" {...props} /></div>,
                                    th: ({node, ...props}) => <th className="bg-red-950/40 p-5 text-red-500 font-black uppercase border-b-2 border-red-900/20 text-left tracking-widest" {...props} />,
                                    td: ({node, ...props}) => <td className="p-5 border-b border-red-900/10 text-slate-400 opacity-80" {...props} />
                                }}
                            >
                                {simulationResult}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
            </div>

            {/* Final Footer HUD - No Latency */}
            <div className="bg-zinc-950 border-t border-red-900/20 px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-6 relative">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent"></div>
                
                <div className="flex items-center gap-8 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-none rotate-45 ${isSimulating ? 'bg-red-500 animate-ping' : 'bg-red-900 shadow-[0_0_10px_rgba(153,27,27,0.5)]'}`}></div>
                        <span className="text-[10px] font-black text-red-700 uppercase tracking-[0.4em]">Signal: Secure_Comm_Established</span>
                    </div>
                    <div className="h-4 w-px bg-zinc-800"></div>
                    <div className="flex items-center gap-3">
                        <Activity className="w-3.5 h-3.5 text-zinc-700" />
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Load_Factor: {isSimulating ? 'CRITICAL' : 'IDLE'}</span>
                    </div>
                </div>
                
                <div className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em] text-center sm:text-right flex items-center gap-3">
                    <span className="opacity-40">CLASSIFIED_ACCESS_LEVEL_7</span>
                    <span className="text-red-900 opacity-20">|</span>
                    <span>SENTINELAI_STRIKE_CORE</span>
                </div>
            </div>

            <style>{`
                @keyframes loading-bar {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0%); }
                    100% { transform: translateX(100%); }
                }
                .animate-loading-bar {
                    animation: loading-bar 2.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
                }
                .animate-spin-slow {
                    animation: spin 12s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AttackSimulation;
