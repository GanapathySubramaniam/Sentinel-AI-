
import React from 'react';
import { MissingField } from '../types';
import { Zap, AlertTriangle, ChevronRight, Info } from 'lucide-react';

interface DynamicInputFormProps {
  fields: MissingField[];
  formData: Record<string, any>;
  onChange: (id: string, value: any) => void;
  reasoning: string;
}

const DynamicInputForm: React.FC<DynamicInputFormProps> = ({ fields, formData, onChange, reasoning }) => {
  if (fields.length === 0) return null;

  return (
    <div className="mt-8 space-y-6 animate-fadeIn">
      <div className="bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-xl flex gap-4 items-start shadow-[0_0_20px_rgba(79,70,229,0.1)]">
        <div className="bg-indigo-600 p-2 rounded-lg shrink-0">
          <Zap size={18} className="text-white animate-pulse" />
        </div>
        <div>
          <h4 className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-1">Intelligence Assessment Found Gaps</h4>
          <p className="text-[10px] text-slate-400 font-mono italic leading-relaxed">{reasoning}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field) => (
          <div key={field.id} className="group flex flex-col gap-2 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/50 transition-all">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                <ChevronRight size={12} className="text-indigo-500" />
                {field.label}
              </label>
              <div className="relative group/tooltip">
                <Info size={12} className="text-slate-600 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-950 border border-slate-800 rounded text-[9px] text-slate-400 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10">
                  {field.description}
                </div>
              </div>
            </div>

            {field.type === 'select' ? (
              <select
                value={formData[field.id] || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs p-2 rounded outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Select Option...</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === 'boolean' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => onChange(field.id, true)}
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded border transition-all ${formData[field.id] === true ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                >
                  Enabled
                </button>
                <button
                  onClick={() => onChange(field.id, false)}
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded border transition-all ${formData[field.id] === false ? 'bg-red-900/40 border-red-800 text-red-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                >
                  Disabled
                </button>
              </div>
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={formData[field.id] || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                placeholder={field.description}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs p-2 rounded outline-none focus:border-indigo-500 transition-all"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicInputForm;
