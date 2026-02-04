
import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Copy, ShieldAlert, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface JsonInspectorProps {
  data: any;
  label?: string;
  depth?: number;
}

const JsonInspector: React.FC<JsonInspectorProps> = ({ data, label, depth = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  const [copied, setCopied] = useState(false);

  const isObject = data !== null && typeof data === 'object';
  const isArray = Array.isArray(data);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSecurityClass = (val: any) => {
    const s = String(val).toLowerCase();
    if (s === '*' || s === 'allow' || s.includes('admin') || s.includes('fullaccess')) return 'text-red-400 font-black drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]';
    if (s === 'deny' || s === 'false') return 'text-emerald-400';
    return 'text-slate-300';
  };

  const renderValue = (val: any) => {
    if (typeof val === 'string') return <span className={getSecurityClass(val)}>"{val}"</span>;
    if (typeof val === 'number') return <span className="text-blue-400">{val}</span>;
    if (typeof val === 'boolean') return <span className={val ? 'text-red-400' : 'text-emerald-400'}>{val.toString()}</span>;
    if (val === null) return <span className="text-slate-500 italic">null</span>;
    return null;
  };

  return (
    <div className={`font-mono text-[11px] ${depth > 0 ? 'ml-4 border-l border-slate-800/50 pl-2' : ''}`}>
      <div 
        onClick={() => isObject && setIsExpanded(!isExpanded)}
        className={`group flex items-center gap-2 py-1 px-2 rounded hover:bg-slate-800/50 transition-colors cursor-pointer ${isObject ? '' : 'cursor-default'}`}
      >
        {isObject && (
          <span className="text-slate-500">
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}
        
        {label && <span className="text-purple-400 font-bold">{label}: </span>}
        
        {!isObject ? (
          renderValue(data)
        ) : (
          <span className="text-slate-500 text-[10px] uppercase tracking-widest">
            {isArray ? `Array [${data.length}]` : `Object {${Object.keys(data).length}}`}
          </span>
        )}

        <button 
          onClick={handleCopy}
          className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-white"
          title="Copy Node JSON"
        >
          {copied ? <ShieldCheck size={12} className="text-emerald-500" /> : <Copy size={12} />}
        </button>
      </div>

      {isObject && isExpanded && (
        <div className="animate-fadeIn">
          {Object.entries(data).map(([key, value], idx) => (
            <JsonInspector key={idx} label={key} data={value} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JsonInspector;
