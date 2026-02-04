
import React, { useState, useEffect, useRef } from 'react';
import { ComplianceStandard, Region, REGION_MAPPING, UserPersona, FileAttachment, ValidationResult, MissingField } from '../types';
import { ArrowRight, Code, Shield, Check, Globe, UserCheck, Briefcase, Terminal, FileCheck, Info, Upload, X, FileText, Image as ImageIcon, Sparkles, Lightbulb, Zap, Rocket, SearchCheck, Loader2, Activity, Target, Cpu } from 'lucide-react';
import { validateAssessmentInput } from '../services/geminiService';
import DynamicInputForm from './DynamicInputForm';

interface InputFormProps {
  designInput: string;
  setDesignInput: (value: string) => void;
  complianceTargets: ComplianceStandard[];
  setComplianceTargets: (values: ComplianceStandard[]) => void;
  persona: UserPersona;
  setPersona: (value: UserPersona) => void;
  attachments: FileAttachment[];
  setAttachments: (files: FileAttachment[]) => void;
  onSubmit: (enrichedInput?: string) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
  designInput,
  setDesignInput,
  complianceTargets,
  setComplianceTargets,
  persona,
  setPersona,
  attachments,
  setAttachments,
  onSubmit,
  isLoading
}) => {
  const [selectedRegion, setSelectedRegion] = useState<Region>(Region.ALL);
  const [availableStandards, setAvailableStandards] = useState<ComplianceStandard[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredPersona, setHoveredPersona] = useState<UserPersona | null>(null);
  
  // Validation State
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [dynamicFormData, setDynamicFormData] = useState<Record<string, any>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvailableStandards(REGION_MAPPING[selectedRegion] || []);
  }, [selectedRegion]);

  const toggleStandard = (std: ComplianceStandard) => {
    if (complianceTargets.includes(std)) {
      setComplianceTargets(complianceTargets.filter(t => t !== std));
    } else {
      setComplianceTargets([...complianceTargets, std]);
    }
  };

  const handleValidate = async () => {
    if (!designInput.trim() || complianceTargets.length === 0) return;
    setIsValidating(true);
    try {
      const result = await validateAssessmentInput(designInput, complianceTargets);
      setValidationResult(result);
      if (result.isComplete) {
        handleFinalSubmit();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDynamicChange = (id: string, value: any) => {
    setDynamicFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFinalSubmit = () => {
    let enriched = designInput;
    if (validationResult && validationResult.missingFields.length > 0) {
      enriched += "\n\n### ADDITIONAL SECURITY CONTEXT (DYNAMICALLY COLLECTED):\n";
      validationResult.missingFields.forEach(field => {
        const val = dynamicFormData[field.id];
        if (val !== undefined && val !== '') {
          enriched += `- **${field.label}**: ${val}\n`;
        }
      });
    }
    onSubmit(enriched);
  };

  const processFiles = async (files: File[]) => {
    const newAttachments: FileAttachment[] = [];
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) continue;
      
      const extension = file.name.split('.').pop()?.toLowerCase();
      const isText = ['tf', 'hcl', 'yaml', 'yml', 'json', 'txt'].includes(extension || '');

      if (isText) {
        const reader = new FileReader();
        const text = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsText(file);
        });
        newAttachments.push({ name: file.name, mimeType: file.type || 'text/plain', data: '', size: file.size, textContent: text });
      } else {
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve) => {
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        newAttachments.push({ name: file.name, mimeType: file.type, data: base64Data, size: file.size });
      }
    }
    setAttachments([...attachments, ...newAttachments]);
  };

  const personaOptions = [
    { 
      id: UserPersona.CISO, 
      icon: <Briefcase size={20} />, 
      label: 'CISO', 
      desc: 'RISK & STRATEGY',
      objectives: ['Business Impact', 'Liability Review', 'Risk Scorecard'],
      accent: 'border-rose-500',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      badge: 'RISK_CMDR',
      metrics: [95, 20, 40]
    },
    { 
      id: UserPersona.DEVSECOPS, 
      icon: <Terminal size={20} />, 
      label: 'DevSecOps', 
      desc: 'IAC & AUTOMATION',
      objectives: ['CI/CD Hardening', 'IaC Validation', 'CRI Scans'],
      accent: 'border-cyan-500',
      text: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      badge: 'PIPE_OP',
      metrics: [40, 95, 30]
    },
    { 
      id: UserPersona.AUDITOR, 
      icon: <FileCheck size={20} />, 
      label: 'Auditor', 
      desc: 'REGULATORY COMPLIANCE',
      objectives: ['Gap Reporting', 'Control Mapping', 'Evidence Prep'],
      accent: 'border-emerald-500',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      badge: 'REG_AUDIT',
      metrics: [30, 40, 95]
    },
    { 
      id: UserPersona.DEVELOPER, 
      icon: <UserCheck size={20} />, 
      label: 'Developer', 
      desc: 'IMPLEMENTATION',
      objectives: ['Remediation Code', 'API Security', 'Auth Logic'],
      accent: 'border-violet-500',
      text: 'text-violet-400',
      bg: 'bg-violet-500/10',
      badge: 'TECH_LEAD',
      metrics: [10, 80, 20]
    },
  ];

  const promptChips = [
    { label: 'EKS Cluster Scan', text: 'Analyze this AWS EKS cluster design for SOC2 Type II compliance. Specifically look for unencrypted secrets and unmanaged IAM roles.' },
    { label: 'S3 Privacy Audit', text: 'Review this Terraform block for S3 bucket public access vulnerabilities and provide a remediation snippet that enforces AES-256 encryption.' },
    { label: 'LLM Gateway Review', text: 'Conduct a NIST AI RMF assessment on a generative AI gateway architecture using Azure OpenAI Service and Private Link.' },
    { label: 'RBAC Validator', text: 'Verify the RBAC implementation in this Kubernetes YAML for potential privilege escalation vectors from standard user roles.' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-12 max-w-6xl mx-auto overflow-hidden relative">
      {/* Background HUD Grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Persona Selection HUD */}
      <section className="relative z-10">
        <header className="flex items-center justify-between mb-8">
            <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Target size={14} className="text-indigo-500" />
                Tactical Persona Allocation
            </label>
            <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-slate-800 rounded-full"></div>)}
            </div>
        </header>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {personaOptions.map((opt) => {
            const isSelected = persona === opt.id;
            const isHovered = hoveredPersona === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => setPersona(opt.id)}
                onMouseEnter={() => setHoveredPersona(opt.id)}
                onMouseLeave={() => setHoveredPersona(null)}
                aria-pressed={isSelected}
                className={`group relative flex flex-col items-stretch text-left transition-all duration-500 rounded-xl overflow-hidden border-2 ${
                  isSelected
                    ? `${opt.accent} ${opt.bg} shadow-[0_0_30px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(0,0,0,0.5)] scale-[1.03] z-10 ring-1 ring-white/10`
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* HUD Scanner Animation */}
                {isSelected && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                        <div className={`w-full h-1/2 bg-gradient-to-b from-transparent via-white to-transparent animate-scanline`}></div>
                    </div>
                )}

                {/* Card Header Profile */}
                <div className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className={`p-2.5 rounded-lg transition-all duration-300 ${isSelected ? `${opt.text.replace('text', 'bg').replace('400', '600')} text-white shadow-lg` : 'bg-slate-900 text-slate-500 group-hover:text-slate-300'}`}>
                            {opt.icon}
                        </div>
                        <span className={`text-[8px] font-mono px-2 py-0.5 rounded border ${isSelected ? `bg-white/10 ${opt.accent} ${opt.text}` : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                            {opt.badge}
                        </span>
                    </div>

                    <div>
                        <h3 className={`text-xl font-black tracking-tighter transition-colors ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                            {opt.label}
                        </h3>
                        <p className={`text-[9px] font-mono mt-1 uppercase tracking-widest transition-opacity ${isSelected ? 'opacity-80' : 'opacity-40 group-hover:opacity-60'}`}>
                            {opt.desc}
                        </p>
                    </div>

                    {/* Simple Metric Bars HUD Style */}
                    <div className="flex gap-1.5 h-1 items-end mt-1">
                        {opt.metrics.map((m, i) => (
                            <div key={i} className="flex-1 bg-slate-800/50 rounded-full h-full overflow-hidden">
                                <div className={`h-full transition-all duration-1000 ${isSelected ? opt.text.replace('text', 'bg') : 'bg-slate-700'}`} style={{ width: `${isSelected ? m : 20}%` }}></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dropdown Content Area */}
                <div className={`grid transition-all duration-500 ease-in-out ${isSelected ? 'grid-rows-[1fr] border-t border-white/5 bg-black/20' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className={`text-[8px] font-black uppercase tracking-widest ${opt.text}`}>Mission Loadout</span>
                                <Activity size={10} className={`${opt.text} animate-pulse`} />
                            </div>
                            <div className="space-y-2">
                                {opt.objectives.map((obj, i) => (
                                    <div key={i} className="flex items-center gap-3 animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
                                        <div className={`w-1 h-1 rounded-full ${isSelected ? opt.text.replace('text', 'bg') : 'bg-slate-700'}`}></div>
                                        <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>{obj}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Indicator */}
                <div className={`h-1 w-full transition-all ${isSelected ? opt.text.replace('text', 'bg') : 'bg-transparent'}`}></div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Standards Selection */}
      <section className="bg-slate-950/40 p-8 rounded-2xl border border-slate-800 relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield size={120} />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 relative z-10">
          <div className="space-y-1">
            <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <Shield size={14} className="text-blue-500" />
                Compliance Protocols
            </label>
            <p className="text-[10px] text-slate-600 font-mono ml-7">SELECT ONE OR MORE TARGET ARCHIVES</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer shadow-inner">
            <Globe size={14} className="text-blue-400" />
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value as Region)} className="bg-transparent text-xs text-slate-300 font-bold focus:outline-none appearance-none pr-4 cursor-pointer">
              {Object.values(Region).map((r) => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 relative z-10">
          {availableStandards.map((std) => (
            <button 
              key={std} 
              onClick={() => toggleStandard(std)} 
              className={`px-4 py-3 rounded-xl text-[10px] font-bold text-left transition-all border flex items-center justify-between group/std ${
                complianceTargets.includes(std) 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_10px_30px_rgba(37,99,235,0.2)] scale-[0.98]' 
                  : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span className="truncate">{std}</span>
              <div className={`transition-all duration-300 ${complianceTargets.includes(std) ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                <Check size={12} className="stroke-[4px]" />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Input & Upload */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
              <Code size={14} className="text-indigo-400" />
              Infrastructure Definition
            </label>
            <div className="flex items-center gap-2">
                <span className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter">Secure_Buffer_Ready</span>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
            </div>
          </div>
          <div className="relative">
              <textarea
                value={designInput}
                onChange={(e) => { setDesignInput(e.target.value); setValidationResult(null); }}
                placeholder="INPUT ARCHITECTURE PARAMETERS OR IAC SNIPPETS..."
                className="w-full h-80 bg-slate-950 text-slate-200 font-mono text-xs border border-slate-800 rounded-2xl p-6 focus:ring-1 focus:ring-indigo-500/50 outline-none resize-none transition-all shadow-inner leading-relaxed custom-scrollbar"
                disabled={isLoading || isValidating}
              />
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-800 rounded-tl-2xl pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-slate-800 rounded-tr-2xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-slate-800 rounded-bl-2xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-800 rounded-br-2xl pointer-events-none"></div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
             {promptChips.map((chip, i) => (
               <button key={i} onClick={() => { setDesignInput(chip.text); setValidationResult(null); }} className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[9px] font-bold text-slate-500 hover:bg-slate-800 hover:text-white hover:border-indigo-500/50 transition-all flex items-center gap-2 group/chip">
                 <Cpu size={10} className="text-indigo-600 group-hover:rotate-12 transition-transform" />
                 {chip.label}
               </button>
             ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
            <Upload size={14} className="text-indigo-400" />
            Support Data Uplink
          </label>
          <div onClick={() => fileInputRef.current?.click()} className={`h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <input type="file" multiple className="hidden" ref={fileInputRef} onChange={(e) => { if (e.target.files) processFiles(Array.from(e.target.files)); }} accept="image/*,application/pdf,.tf,.yaml,.yml,.json,.txt" />
            <Upload className={`w-10 h-10 mb-2 transition-transform duration-500 ${isDragging ? 'scale-110 text-indigo-400' : 'text-slate-700 group-hover:text-slate-500 group-hover:-translate-y-1'}`} />
            <p className="text-[10px] text-slate-500 font-mono text-center px-6 uppercase tracking-[0.2em] relative z-10">DROP SCHEMATICS OR SOURCE_CODE</p>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-2">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 animate-fadeIn group/att hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-3 truncate">
                  <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                    {file.textContent ? <Terminal size={12} className="text-emerald-400" /> : <ImageIcon size={12} className="text-pink-500" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-300 truncate max-w-[140px]">{file.name}</span>
                    <span className="text-[8px] font-mono text-slate-600">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
                <button onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} className="text-slate-700 hover:text-rose-500 p-1 rounded transition-colors"><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Validation Component */}
      {validationResult && !validationResult.isComplete && (
        <DynamicInputForm 
          fields={validationResult.missingFields} 
          formData={dynamicFormData} 
          onChange={handleDynamicChange} 
          reasoning={validationResult.reasoning} 
        />
      )}

      {/* Action Buttons */}
      <section className="flex flex-col gap-6 pt-6">
        {!validationResult || !validationResult.isComplete ? (
          <button
            onClick={handleValidate}
            disabled={!designInput.trim() || complianceTargets.length === 0 || isValidating || isLoading}
            className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all border flex items-center justify-center gap-3 overflow-hidden group ${
              !designInput.trim() || complianceTargets.length === 0 || isValidating || isLoading
                ? 'bg-slate-800 text-slate-600 border-slate-700'
                : 'bg-slate-950 border-indigo-500/50 text-indigo-400 hover:bg-indigo-900/10 shadow-[0_10px_30px_rgba(79,70,229,0.1)] hover:border-indigo-400 active:scale-[0.99]'
            }`}
          >
            {isValidating ? <Loader2 size={16} className="animate-spin" /> : <SearchCheck size={16} className="group-hover:rotate-12 transition-transform" />}
            {isValidating ? 'RUNNING_DEEP_VALIDATION...' : 'VALIDATE ARCHITECTURAL STRATEGY'}
          </button>
        ) : null}

        <button
          onClick={handleFinalSubmit}
          disabled={(!designInput.trim() && attachments.length === 0) || complianceTargets.length === 0 || isLoading || isValidating}
          className={`group relative w-full py-8 rounded-2xl font-black text-sm uppercase tracking-[0.4em] overflow-hidden transition-all duration-700 active:scale-[0.98] ${
            (!designInput.trim() && attachments.length === 0) || complianceTargets.length === 0 || isLoading || isValidating
              ? 'bg-slate-800 text-slate-600 border border-transparent'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_20px_50px_rgba(79,70,229,0.3)] border-t border-white/20'
          }`}
        >
          {/* Action background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="flex items-center justify-center gap-4 relative z-10">
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />}
            <span className="drop-shadow-lg">
                {isLoading ? 'GENERATING_SECURITY_POSTURE_V2026' : 'INITIALIZE SYSTEM AUDIT'}
            </span>
          </div>
          
          {/* HUD scan effect on the button */}
          {!isLoading && !isValidating && (
             <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="w-full h-1/2 bg-white/5 animate-scanline"></div>
             </div>
          )}
        </button>
      </section>
    </div>
  );
};

export default InputForm;
