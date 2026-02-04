
import React, { useState } from 'react';
import { ComplianceStandard, AssessmentState, UserPersona, FileAttachment, ReportHistoryEntry } from './types';
import InputForm from './components/InputForm';
import LoadingState from './components/LoadingState';
import AnalysisResult from './components/AnalysisResult';
import AttackSimulation from './components/AttackSimulation';
import { analyzeSecurityPosture, simulateAttack } from './services/geminiService';
import { Shield, Zap, Lock, Terminal, Sparkles, Monitor, Skull } from 'lucide-react';

const App: React.FC = () => {
  const [designInput, setDesignInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [complianceTargets, setComplianceTargets] = useState<ComplianceStandard[]>([ComplianceStandard.SOC2]);
  const [persona, setPersona] = useState<UserPersona>(UserPersona.CISO);
  const [activeTab, setActiveTab] = useState<'report' | 'strike'>('report');
  const [reportHistory, setReportHistory] = useState<ReportHistoryEntry[]>([]);
  
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({
    isLoading: false,
    result: null,
    error: null,
  });
  
  // War Room States
  const [isWarRoomMode, setIsWarRoomMode] = useState(false);
  const [activeTheme, setActiveTheme] = useState<'green' | 'amber' | 'cyan'>('green');

  const handleAssessment = async (enrichedInput?: string) => {
    const inputToAudit = enrichedInput || designInput;
    if ((!inputToAudit.trim() && attachments.length === 0) || complianceTargets.length === 0) return;

    setAssessmentState({ isLoading: true, result: null, error: null });
    setReportHistory([]);
    setActiveTab('report');

    try {
      const result = await analyzeSecurityPosture(inputToAudit, complianceTargets, persona, attachments);
      setAssessmentState({
        isLoading: false,
        result: result,
        error: null,
        originalDesign: inputToAudit,
        complianceTargets: complianceTargets,
        persona: persona,
        attachments: attachments
      });
      
      setReportHistory([{
        id: crypto.randomUUID(),
        timestamp: new Date(),
        content: result,
        reason: "Initial Generation"
      }]);
    } catch (err: any) {
      setAssessmentState({
        isLoading: false,
        result: null,
        error: err.message || "An unexpected error occurred.",
      });
    }
  };

  const handleUpdateReport = (newContent: string, reason: string) => {
    setAssessmentState(prev => ({
      ...prev,
      result: newContent
    }));
    
    setReportHistory(prev => [
      {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        content: newContent,
        reason: reason
      },
      ...prev,
    ]);
  };

  const handleRestoreVersion = (version: ReportHistoryEntry) => {
    setAssessmentState(prev => ({
      ...prev,
      result: version.content
    }));
    
    setReportHistory(prev => [
      {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        content: version.content,
        reason: `Restored to version from ${version.timestamp.toLocaleTimeString()}`
      },
      ...prev
    ]);
  };

  const handleReset = () => {
    setAssessmentState({ isLoading: false, result: null, error: null });
    setReportHistory([]);
    setAttachments([]);
    setDesignInput('');
    setActiveTab('report');
  };

  const themeColors = {
    green: 'text-green-500 hover:text-green-400 border-green-500 bg-green-950/30',
    amber: 'text-amber-500 hover:text-amber-400 border-amber-500 bg-amber-950/30',
    cyan: 'text-cyan-400 hover:text-cyan-300 border-cyan-400 bg-cyan-950/30'
  };

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500/30 print:bg-white print:text-black transition-colors duration-500 overflow-x-hidden ${isWarRoomMode ? 'bg-black mode-war-room' : 'bg-slate-950 text-slate-200'}`}>
      
      {isWarRoomMode && (
        <>
          <div className="crt fixed inset-0 pointer-events-none z-[9999]"></div>
          <div className="crt-flicker pointer-events-none"></div>
          <div className={`fixed inset-0 pointer-events-none z-[9998] mix-blend-overlay opacity-30 ${activeTheme === 'green' ? 'bg-green-500' : activeTheme === 'amber' ? 'bg-amber-500' : 'bg-cyan-500'}`}></div>
        </>
      )}

      {!isWarRoomMode && (
        <div className="fixed inset-0 z-0 pointer-events-none print:hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
          <div className="absolute inset-0 bg-radial-gradient from-blue-500/5 to-transparent opacity-50"></div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className={`flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-12 border-b pb-6 gap-4 print:hidden ${isWarRoomMode ? 'border-slate-800' : 'border-slate-800'}`}>
          <div className="flex items-center gap-4">
            <div className={`${isWarRoomMode ? 'bg-transparent border border-current p-3 rounded-none ' + themeColors[activeTheme] : 'bg-blue-600 p-3 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]'}`}>
              <Shield className={`w-8 h-8 ${isWarRoomMode ? '' : 'text-white'}`} />
            </div>
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 ${isWarRoomMode ? (activeTheme === 'green' ? 'text-green-500' : activeTheme === 'amber' ? 'text-amber-500' : 'text-cyan-400') : 'text-white'}`}>
                SentinelAI
                <span className={`text-xs align-top px-2 py-0.5 rounded border ${isWarRoomMode ? 'bg-transparent border-current' : 'bg-slate-800 text-blue-400 border-slate-700'}`}>v2026.1</span>
              </h1>
              <p className={`text-sm font-mono mt-1 ${isWarRoomMode ? 'opacity-70' : 'text-slate-400'}`}>Built to see threats first</p>
            </div>
          </div>
          
          <div className="mt-2 md:mt-0 flex flex-col items-end gap-2 self-end md:self-auto">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-mono uppercase tracking-widest ${isWarRoomMode ? 'text-slate-500' : 'text-slate-500'}`}>
                 MODE: {isWarRoomMode ? 'WAR ROOM' : 'STANDARD'}
              </span>
              <button 
                onClick={() => setIsWarRoomMode(!isWarRoomMode)}
                className={`relative w-12 h-6 rounded-full transition-colors border ${isWarRoomMode ? 'bg-red-900/30 border-red-500' : 'bg-slate-800 border-slate-600'}`}
              >
                 <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-300 ${isWarRoomMode ? 'translate-x-6 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'translate-x-0 bg-slate-400'}`}></div>
              </button>
            </div>

            {isWarRoomMode && (
               <div className="flex gap-1 animate-fadeIn">
                 {(['green', 'amber', 'cyan'] as const).map(t => (
                   <button
                     key={t}
                     onClick={() => setActiveTheme(t)}
                     className={`w-4 h-4 rounded-full border border-slate-600 transition-all ${activeTheme === t ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'opacity-50 hover:opacity-100'}`}
                     style={{backgroundColor: t === 'green' ? '#22c55e' : t === 'amber' ? '#f59e0b' : '#06b6d4'}}
                   />
                 ))}
               </div>
            )}
          </div>
        </header>

        <main>
          {assessmentState.error && (
            <div className="bg-red-950/30 border border-red-800 text-red-200 p-4 rounded-lg mb-8 flex items-center gap-3 print:hidden">
              <Shield className="w-5 h-5 text-red-500" />
              <p>{assessmentState.error}</p>
            </div>
          )}

          {!assessmentState.result && !assessmentState.isLoading && (
            <div className="animate-fadeIn print:hidden">
              <div className="text-center mb-10 max-w-2xl mx-auto">
                <h2 className={`text-2xl font-bold mb-4 ${isWarRoomMode ? 'text-white' : 'text-slate-100'}`}>Unified Compliance Audit for Modern Teams</h2>
                <p className={`${isWarRoomMode ? 'text-slate-400' : 'text-slate-400'}`}>
                  SentinelAI audits your infrastructure against multiple frameworks simultaneously. Now supporting multimodal analysis and Red Team strike simulations.
                </p>
              </div>
              <InputForm
                designInput={designInput}
                setDesignInput={setDesignInput}
                complianceTargets={complianceTargets}
                setComplianceTargets={setComplianceTargets}
                persona={persona}
                setPersona={setPersona}
                attachments={attachments}
                setAttachments={setAttachments}
                onSubmit={handleAssessment}
                isLoading={assessmentState.isLoading}
              />
            </div>
          )}

          {assessmentState.isLoading && (
            <div className="print:hidden">
              <LoadingState />
            </div>
          )}

          {assessmentState.result && (
            <div className="flex flex-col gap-6">
               <div className={`flex flex-col md:flex-row justify-between items-stretch md:items-center p-2 rounded-lg gap-4 print:hidden ${isWarRoomMode ? 'bg-black border ' + themeColors[activeTheme] : 'bg-slate-900 border border-slate-800'}`}>
                  <div className="flex p-1 bg-black/40 rounded-md border border-slate-800">
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center gap-2 ${activeTab === 'report' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Shield size={14} /> Security Report
                    </button>
                    <button
                        onClick={() => setActiveTab('strike')}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center gap-2 ${activeTab === 'strike' ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Skull size={14} /> Attack Simulation
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 px-2">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Persona:</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold border uppercase ${isWarRoomMode ? 'bg-transparent border-current' : 'bg-pink-900/30 text-pink-400 border-pink-900'}`}>
                          {persona.split(' ')[0]}
                        </span>
                    </div>
                    <button 
                      onClick={handleReset}
                      className="text-sm text-slate-400 hover:text-white underline font-mono decoration-slate-600 hover:decoration-white"
                    >
                      New Assessment
                    </button>
                  </div>
               </div>

               <div className="relative">
                 {activeTab === 'report' ? (
                    <AnalysisResult 
                        content={assessmentState.result} 
                        designInput={assessmentState.originalDesign || designInput}
                        complianceTarget={complianceTargets[0]} 
                        complianceTargets={complianceTargets}
                        persona={persona}
                        isWarRoomMode={isWarRoomMode}
                        theme={activeTheme}
                        onUpdateReport={handleUpdateReport}
                        history={reportHistory}
                        onRestoreVersion={handleRestoreVersion}
                    />
                 ) : (
                    <div className="max-w-6xl mx-auto w-full">
                        <AttackSimulation 
                            vulnerabilityDescription={assessmentState.result.substring(0, 500)}
                            infrastructure={assessmentState.originalDesign || designInput}
                            complianceTarget={complianceTargets[0]}
                            persona={persona}
                            onSimulate={simulateAttack}
                        />
                    </div>
                 )}
               </div>
            </div>
          )}
        </main>

        <footer className={`mt-20 border-t pt-8 text-center text-sm font-mono print:hidden ${isWarRoomMode ? 'border-slate-800 text-slate-500' : 'border-slate-800 text-slate-600'}`}>
          <p>© 2026 SentinelAI Security Systems. Automated Multimodal Compliance Auditor & Strike Engine.</p>
          <p>Developed By: <a href="https://www.linkedin.com/in/archersharma/">Archer Sharma</a> | 
          <a href="https://www.linkedin.com/in/ganapathy-subramaniam-sundar-b08aa222b/"> Ganapathy Subramaniam</a> | 
          <a href="https://www.linkedin.com/in/priyanka-sharma-202a1320/"> Priyanka Sharma</a></p>
        </footer>
      </div>
    </div>
  );
};

export default App;