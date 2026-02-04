
import React, { useMemo, useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon, Shield, MessageSquare, Code, Loader2, BookOpen, Sparkles, Filter, FileDown, Printer, X, Minimize2, Maximize2, Save, LayoutDashboard, GripVertical, GripHorizontal, History, RotateCcw, FileJson, FileCode, Eye, Terminal } from 'lucide-react';
import RemediationChat from './RemediationChat';
import MermaidDiagram from './MermaidDiagram';
import CitationViewer from './CitationViewer';
import GapViewer from './GapViewer';
import SystemIntegrity from './SystemIntegrity';
import VoiceUplink from './VoiceUplink';
import JsonInspector from './JsonInspector';
import { ComplianceStandard, UserPersona, SecurityFinding, ReportHistoryEntry } from '../types';

interface AnalysisResultProps {
  content: string;
  designInput: string;
  complianceTarget: ComplianceStandard;
  complianceTargets?: ComplianceStandard[];
  persona?: UserPersona;
  isWarRoomMode?: boolean;
  theme?: 'green' | 'amber' | 'cyan';
  onUpdateReport?: (newContent: string, reason: string) => void;
  history?: ReportHistoryEntry[];
  onRestoreVersion?: (version: ReportHistoryEntry) => void;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ 
  content, 
  designInput, 
  complianceTarget, 
  complianceTargets = [], 
  persona,
  isWarRoomMode = false,
  theme = 'green',
  onUpdateReport,
  history = [],
  onRestoreVersion
}) => {
  // Tool States
  const [showChat, setShowChat] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [showGaps, setShowGaps] = useState(false);
  const [showAttackPath, setShowAttackPath] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Floating Dock State
  const [dockPos, setDockPos] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, dockX: 0, dockY: 0 });
  const dockElementRef = useRef<HTMLDivElement>(null);

  // Initialize dock position on mount
  useEffect(() => {
    const initPos = () => {
      if (window.innerWidth >= 768) {
        setDockPos({ x: window.innerWidth - 80, y: window.innerHeight / 2 - 150 });
      } else {
        setDockPos({ x: window.innerWidth / 2 - 60, y: window.innerHeight - 100 });
      }
    };
    if (dockPos.x === null) initPos();
    window.addEventListener('resize', initPos);
    return () => window.removeEventListener('resize', initPos);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const dragHandle = target.closest('.drag-handle');
    if (dragHandle) {
      setIsDragging(true);
      const rect = dockElementRef.current?.getBoundingClientRect();
      dragRef.current = { startX: e.clientX, startY: e.clientY, dockX: dockPos.x ?? rect?.left ?? 0, dockY: dockPos.y ?? rect?.top ?? 0 };
      e.preventDefault();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setDockPos({ x: dragRef.current.dockX + (e.clientX - dragRef.current.startX), y: dragRef.current.dockY + (e.clientY - dragRef.current.startY) });
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [isDragging]);

  const cleanContent = useMemo(() => {
    let text = content.trim();
    const wrapperRegex = /^```(?:markdown)?\s*([\s\S]*?)\s*```$/i;
    const match = text.match(wrapperRegex);
    let rawText = match ? match[1].trim() : text;
    rawText = rawText.replace(/(?:^|\n)#{1,6}\s*Attack Path Visualization:?\s*(?:\n|$)/gi, '\n');
    rawText = rawText.replace(/(?:^|\n)Attack Path Visualization:?\s*(?:\n|$)/gi, '\n');
    const findingsIndex = rawText.indexOf('::FINDING::');
    if (findingsIndex !== -1) return rawText.substring(0, findingsIndex).trim();
    return rawText;
  }, [content]);

  const parsedFindings = useMemo(() => {
    const regex = /::FINDING::\s+(CRITICAL|HIGH|MEDIUM|LOW)\s*::\s*(.*?)\s*::\s*(.*?)\s*::\s*(.*?)\s*::\s*(.*)(?:\n|$)/gi;
    const results: SecurityFinding[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      results.push({ severity: match[1].toUpperCase() as any, controlId: match[2].trim(), title: match[3].trim(), description: match[4].trim(), remediation: match[5].trim() });
    }
    return results;
  }, [content]);

  const metrics = useMemo(() => {
    const text = cleanContent;
    const riskMatch = text.match(/Risk Score\s*[*_]*\s*[:|-]?\s*[*_]*\s*(Critical|High|Medium|Low)/i);
    const riskLevel = riskMatch ? riskMatch[1].toUpperCase() : 'UNKNOWN';
    const criticalCount = parsedFindings.filter(f => f.severity === 'CRITICAL').length || (text.match(/Critical/g) || []).length;
    const gapCount = parsedFindings.length || (text.match(/NON-COMPLIANT/g) || []).length;
    const hasTerraform = /```(?:hcl|terraform)/i.test(text);
    const mermaidMatch = text.match(/```mermaid\s*\n([\s\S]*?)```/);
    const mermaidChart = mermaidMatch ? mermaidMatch[1].trim() : null;
    const tldrSplit = text.split(/## Executive TL;DR/i);
    let tldrContent = tldrSplit.length > 1 ? tldrSplit[1].split(/##/)[0].trim() : '';
    return { riskLevel, gapCount, criticalCount, hasTerraform, mermaidChart, tldrContent };
  }, [cleanContent, parsedFindings]);

  // V2026 SPECIALIZED EXPORT ENGINE
  const handleExportTF = () => {
    const tfRegex = /```(?:hcl|terraform)\s*([\s\S]*?)\s*```/gi;
    let match;
    let tfBlocks = [];
    while ((match = tfRegex.exec(content)) !== null) {
      if (match[1]) tfBlocks.push(match[1].trim());
    }
    if (tfBlocks.length > 0) {
      const tfContent = `# SENTINELAI REMEDIATION EXPORT\n# Generated: ${new Date().toISOString()}\n# Compliance Targets: ${complianceTargets.join(', ')}\n\n` + tfBlocks.join('\n\n');
      const element = document.createElement("a");
      element.href = URL.createObjectURL(new Blob([tfContent], {type: 'text/plain'}));
      element.download = `sentinelai-remediation-${new Date().toISOString().slice(0,10)}.tf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      alert("No Terraform/HCL remediation blocks detected.");
    }
    setShowExportMenu(false);
  };

  const handleExportMarkdown = () => {
    const element = document.createElement("a");
    element.href = URL.createObjectURL(new Blob([cleanContent], {type: 'text/markdown'}));
    element.download = `sentinelai-report-${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(element); element.click(); document.body.removeChild(element);
    setShowExportMenu(false);
  };

  return (
    <div className={`w-full relative ${isWarRoomMode ? 'font-mono' : ''}`}>
      <div className="animate-fadeIn pb-32 md:pb-12 md:pr-24">
        {isWarRoomMode ? <SystemIntegrity metrics={metrics} theme={theme} /> : (
            <div className={`rounded-xl border p-6 shadow-2xl backdrop-blur-md mb-6 flex flex-col md:flex-row items-center justify-between gap-6 print:hidden ${
                metrics.riskLevel === 'CRITICAL' ? "border-red-500 bg-red-950/20" : 
                metrics.riskLevel === 'HIGH' ? "border-orange-500 bg-orange-950/20" : 
                metrics.riskLevel === 'MEDIUM' ? "border-yellow-500 bg-yellow-950/20" : 
                "border-emerald-500 bg-emerald-950/20"
            }`}>
                <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-950/80 rounded-xl border border-white/10 shadow-2xl">
                    {metrics.riskLevel === 'CRITICAL' ? <AlertOctagon className="w-8 h-8 text-red-500" /> : metrics.riskLevel === 'HIGH' ? <ShieldAlert className="w-8 h-8 text-orange-500" /> : metrics.riskLevel === 'MEDIUM' ? <AlertTriangle className="w-8 h-8 text-yellow-500" /> : <ShieldCheck className="w-8 h-8 text-emerald-500" />}
                </div>
                <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Risk Vector</h3>
                    <div className="text-3xl font-black text-white tracking-tighter">{metrics.riskLevel}</div>
                </div>
                </div>
                <div className="flex gap-10 border-l border-white/10 pl-10">
                <div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Framework Gaps</h3><div className="text-2xl font-bold text-white">{metrics.gapCount}</div></div>
                <div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critical Findings</h3><div className="text-2xl font-bold text-white">{metrics.criticalCount}</div></div>
                </div>
            </div>
        )}

        {metrics.tldrContent && (
            <div className={`mb-6 p-6 rounded-r-xl shadow-2xl relative overflow-hidden border-l-4 ${isWarRoomMode ? `bg-black border-${theme}-500` : 'bg-slate-900 border-pink-500'}`}>
                <div className="absolute top-0 right-0 p-2 opacity-5"><Shield size={120} /></div>
                <div className="flex items-center gap-2 mb-4">
                    <span className={`${isWarRoomMode ? 'bg-slate-800 text-white' : 'bg-pink-600 text-white'} text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em]`}>{persona?.split(' ')[0]} EXECUTIVE TL;DR</span>
                </div>
                <div className={`prose prose-invert max-w-none ${isWarRoomMode ? 'font-mono' : ''} text-slate-300`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{metrics.tldrContent}</ReactMarkdown>
                </div>
            </div>
        )}

        {showAttackPath && metrics.mermaidChart && (
            <div className="mb-6 animate-fadeIn mermaid-container">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-1 overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between bg-slate-950 print:hidden">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tactical Attack Simulation Graph</span>
                        <button onClick={() => setShowAttackPath(false)} className="text-slate-500 hover:text-white"><X size={14} /></button>
                    </div>
                    <MermaidDiagram chart={metrics.mermaidChart} />
                </div>
            </div>
        )}

        <div className={`report-main rounded-xl border p-8 md:p-16 shadow-[0_0_100px_rgba(0,0,0,0.5)] mx-auto max-w-5xl ${isWarRoomMode ? `bg-black border-slate-800` : 'border-slate-800 bg-slate-900/40 backdrop-blur-sm'}`}>
            <div className={`prose prose-lg prose-invert max-w-none ${isWarRoomMode ? 'prose-headings:text-current' : 'prose-slate'}`}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        h1: (props) => <h1 className="text-4xl font-black border-b border-slate-800 pb-6 mb-12 uppercase tracking-tighter" {...props} />,
                        h2: (props) => <h2 className="text-2xl font-bold mt-16 mb-8 text-white uppercase tracking-tight" {...props} />,
                        table: (props) => <div className="overflow-x-auto my-10 border border-slate-800 rounded-xl"><table className="w-full text-sm" {...props} /></div>,
                        th: (props) => <th className="bg-slate-800/50 p-4 text-xs font-black uppercase text-slate-400" {...props} />,
                        td: (props) => <td className="p-4 border-b border-slate-800/50 text-slate-400" {...props} />,
                        code: ({ inline, className, children, ...props }: any) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const isJson = match && match[1] === 'json';
                          const contentStr = String(children).replace(/\n$/, '');
                          
                          if (!inline && isJson) {
                            try {
                              const parsed = JSON.parse(contentStr);
                              return (
                                <JsonBlockWrapper content={contentStr} data={parsed} />
                              );
                            } catch (e) {
                              return <code className={className} {...props}>{children}</code>;
                            }
                          }
                          return <code className={className} {...props}>{children}</code>;
                        }
                    }}
                >
                    {cleanContent}
                </ReactMarkdown>
            </div>
        </div>
      </div> 

      {/* DOCK */}
      <div 
        ref={dockElementRef} onMouseDown={handleMouseDown}
        style={{ position: 'fixed', left: dockPos.x !== null ? `${dockPos.x}px` : 'auto', top: dockPos.y !== null ? `${dockPos.y}px` : 'auto', right: dockPos.x === null ? '1.5rem' : 'auto', zIndex: 150 }}
        className="print:hidden group/dock top-1/2 -translate-y-1/2"
      >
         <div className="pointer-events-auto">
             <div className={`flex flex-col items-center gap-3 px-2 py-3 rounded-2xl shadow-2xl border backdrop-blur-2xl transition-all ${isWarRoomMode ? 'bg-black border-slate-700' : 'bg-slate-900/95 border-slate-700/50'} ${isDragging ? 'opacity-80 scale-105' : ''}`}>
                 <div className="drag-handle cursor-grab active:cursor-grabbing p-2 hover:bg-slate-800 rounded-lg text-slate-600 transition-colors"><GripVertical size={16} /></div>
                 <DockItem icon={<LayoutDashboard size={20} />} label="Visuals" isActive={showAttackPath} onClick={() => setShowAttackPath(!showAttackPath)} color="text-pink-400" />
                 <DockItem icon={<Filter size={20} />} label="Gaps" isActive={showGaps} onClick={() => setShowGaps(!showGaps)} color="text-orange-400" />
                 <DockItem icon={<History size={20} />} label="History" isActive={showHistory} onClick={() => setShowHistory(!showHistory)} color="text-yellow-400" />
                 <div className="w-6 h-[1px] bg-slate-800"></div>
                 <button onClick={() => { setShowChat(!showChat); setIsChatMinimized(false); }} className={`w-14 h-14 rounded-xl shadow-2xl border transition-all flex items-center justify-center ${showChat ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500'}`}><MessageSquare size={24} /></button>
                 <div className="w-6 h-[1px] bg-slate-800"></div>
                 <DockItem icon={<BookOpen size={20} />} label="Refs" isActive={showCitations} onClick={() => setShowCitations(!showCitations)} color="text-blue-400" />
                 <div className="relative">
                    <DockItem icon={<Save size={20} />} label="Save" isActive={showExportMenu} onClick={() => setShowExportMenu(!showExportMenu)} color="text-emerald-400" />
                    {showExportMenu && (
                        <div className="absolute right-full mr-4 top-0 w-56 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-fadeIn p-1">
                             <MenuItem onClick={handleExportTF} icon={<FileCode size={14} />} label="Remediation (.tf)" />
                             <MenuItem onClick={handleExportMarkdown} icon={<FileDown size={14} />} label="Audit Report (.md)" />
                        </div>
                    )}
                 </div>
             </div>
         </div>
      </div>

      {/* MODALS / OVERLAYS */}
      {showGaps && <div className="fixed inset-0 z-[110] flex justify-end print:hidden"><div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowGaps(false)}></div><div className="relative z-10 w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl animate-fadeIn"><GapViewer findings={parsedFindings} onClose={() => setShowGaps(false)} /></div></div>}
      {showCitations && <div className="fixed inset-0 z-[110] flex justify-end print:hidden"><div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowCitations(false)}></div><div className="relative z-10 w-full max-w-md h-full shadow-2xl animate-fadeIn"><CitationViewer content={cleanContent} onClose={() => setShowCitations(false)} isWarRoomMode={isWarRoomMode} theme={theme} /></div></div>}
      {showHistory && <div className="fixed inset-0 z-[110] flex justify-end print:hidden"><div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div><div className="relative z-10 w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl animate-fadeIn flex flex-col"><div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between"><h3 className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-2"><History size={16} className="text-yellow-400" /> Archive</h3><button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white text-[10px] uppercase font-mono px-3 py-1 rounded bg-slate-900 transition-colors">Close</button></div><div className="flex-1 overflow-y-auto p-4 space-y-4">{history.map((entry) => (<div key={entry.id} className={`p-4 rounded-xl border transition-all ${entry.content === content ? 'border-yellow-500/50 bg-yellow-900/10' : 'border-slate-800 bg-slate-950/50'}`}><div className="flex items-center justify-between mb-2"><span className="text-[10px] font-mono text-slate-500">{entry.timestamp.toLocaleString()}</span>{entry.content !== content && <button onClick={() => onRestoreVersion?.(entry)} className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Restore</button>}</div><div className="text-xs text-slate-300 font-bold mb-1 line-clamp-2">{entry.reason}</div></div>))}</div></div></div>}

      {showChat && (
        <div className={`fixed z-[160] transition-all duration-300 print:hidden flex flex-col shadow-2xl border border-slate-700 bg-slate-900 overflow-hidden ${isChatMinimized ? 'bottom-6 right-32 w-72 h-12 rounded-lg' : 'bottom-6 right-32 w-[450px] h-[650px] rounded-xl'}`}>
             <div className="bg-slate-950 border-b border-slate-800 p-3 flex items-center justify-between cursor-pointer" onClick={() => setIsChatMinimized(!isChatMinimized)}><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${isChatMinimized ? 'bg-slate-500' : 'bg-green-500 animate-pulse'}`}></div><span className="text-xs font-black text-white tracking-widest uppercase">SentinelAI Command</span></div><div className="flex items-center gap-2"><button className="text-slate-500 hover:text-white" onClick={(e) => { e.stopPropagation(); setIsChatMinimized(!isChatMinimized); }}>{isChatMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}</button><button className="text-slate-500 hover:text-red-400" onClick={(e) => { e.stopPropagation(); setShowChat(false); }}><X size={14} /></button></div></div>
             {!isChatMinimized && <div className="flex-1 flex flex-col h-full overflow-hidden">{isWarRoomMode && <VoiceUplink metrics={metrics} analysisSummary={metrics.tldrContent || cleanContent.substring(0, 1000)} persona={persona || UserPersona.CISO} theme={theme} />}<div className="flex-1 overflow-hidden relative"><RemediationChat designInput={designInput} complianceTargets={complianceTargets} persona={persona || UserPersona.CISO} analysisResult={content} onUpdateReport={onUpdateReport} /></div></div>}
        </div>
      )}
    </div>
  );
};

// Specialized Wrapper for JSON Blocks
const JsonBlockWrapper = ({ content, data }: { content: string, data: any }) => {
  const [viewMode, setViewMode] = useState<'raw' | 'tactical'>('raw');

  return (
    <div className="my-6 border border-slate-800 rounded-xl overflow-hidden bg-slate-950 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileJson size={14} className="text-purple-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Policy Context</span>
        </div>
        <div className="flex bg-black/50 p-1 rounded-md border border-slate-800">
          <button 
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-2 ${viewMode === 'raw' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Terminal size={10} /> Raw
          </button>
          <button 
            onClick={() => setViewMode('tactical')}
            className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-2 ${viewMode === 'tactical' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Eye size={10} /> Tactical
          </button>
        </div>
      </div>
      <div className="p-4 max-h-[400px] overflow-auto custom-scrollbar">
        {viewMode === 'raw' ? (
          <pre className="m-0 bg-transparent p-0 text-xs text-slate-300 leading-relaxed">
            {content}
          </pre>
        ) : (
          <JsonInspector data={data} />
        )}
      </div>
    </div>
  );
};

const DockItem = ({ icon, label, isActive, onClick, color }: any) => (
    <button onClick={onClick} className={`relative group p-3 rounded-xl transition-all ${isActive ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}><div className={`${isActive ? color : ''}`}>{icon}</div><span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{label}</span></button>
);

const MenuItem = ({ icon, label, onClick }: any) => (
    <button onClick={onClick} className="flex items-center gap-3 w-full p-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-all">{icon} {label}</button>
);

export default AnalysisResult;