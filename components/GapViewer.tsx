import React, { useState } from 'react';
import { SecurityFinding } from '../types';
import { AlertOctagon, ShieldAlert, AlertTriangle, ShieldCheck, X, CheckCircle2, Search, Filter } from 'lucide-react';

interface GapViewerProps {
  findings: SecurityFinding[];
  onClose: () => void;
}

const GapViewer: React.FC<GapViewerProps> = ({ findings, onClose }) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFindings = findings.filter(f => {
    const matchesFilter = filter === 'ALL' || f.severity === filter;
    const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          f.controlId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500 border-red-500 bg-red-950/20';
      case 'HIGH': return 'text-orange-500 border-orange-500 bg-orange-950/20';
      case 'MEDIUM': return 'text-yellow-500 border-yellow-500 bg-yellow-950/20';
      case 'LOW': return 'text-emerald-500 border-emerald-500 bg-emerald-950/20';
      default: return 'text-slate-400 border-slate-700 bg-slate-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <AlertOctagon size={16} />;
      case 'HIGH': return <ShieldAlert size={16} />;
      case 'MEDIUM': return <AlertTriangle size={16} />;
      case 'LOW': return <ShieldCheck size={16} />;
      default: return <CheckCircle2 size={16} />;
    }
  };

  return (
    <div className="bg-slate-900 border-l border-slate-800 shadow-2xl h-full flex flex-col animate-fadeIn w-full lg:w-96">
      <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Filter size={16} className="text-blue-400" />
          Gap Analysis <span className="text-slate-500 font-mono">({findings.length})</span>
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white text-xs uppercase font-mono">
          Close
        </button>
      </div>

      <div className="p-4 border-b border-slate-800 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search controls or findings..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-md py-2 pl-9 pr-3 text-xs text-slate-300 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl as any)}
              className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-all ${
                filter === lvl 
                  ? 'bg-slate-800 text-white border-slate-600' 
                  : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-800'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-slate-900/50">
        {filteredFindings.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 text-slate-500 mb-3">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-slate-400 text-xs">No findings match your filter.</p>
          </div>
        ) : (
          filteredFindings.map((finding, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-3 hover:border-slate-600 transition-all group">
              <div className="flex justify-between items-start mb-2">
                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityColor(finding.severity)}`}>
                  {getSeverityIcon(finding.severity)}
                  {finding.severity}
                </span>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  {finding.controlId}
                </span>
              </div>
              
              <h4 className="text-sm font-semibold text-slate-200 mb-1 leading-snug">
                {finding.title}
              </h4>
              
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                {finding.description}
              </p>

              <div className="bg-slate-950/50 rounded border border-slate-800/50 p-2 mt-2">
                <div className="text-[10px] uppercase text-slate-500 font-bold mb-1">Remediation</div>
                <p className="text-xs text-blue-400/90 font-mono leading-relaxed">
                  {finding.remediation}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GapViewer;