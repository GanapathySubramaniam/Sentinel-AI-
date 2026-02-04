
import React, { useMemo } from 'react';
import { BookOpen, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface CitationViewerProps {
  content: string;
  onClose: () => void;
  isWarRoomMode?: boolean;
  theme?: 'green' | 'amber' | 'cyan';
}

interface Citation {
  text: string;
  url: string;
}

const CitationViewer: React.FC<CitationViewerProps> = ({ 
  content, 
  onClose, 
  isWarRoomMode = false, 
  theme = 'green' 
}) => {
  const citations = useMemo(() => {
    // 1. Better extraction using specialized regex for markdown and plain URLs
    const markdownRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g;
    const plainUrlRegex = /(?<!\()https?:\/\/[^\s\)\>\]]+/g;
    
    const results: Citation[] = [];
    let match;
    
    // Process markdown links first
    while ((match = markdownRegex.exec(content)) !== null) {
      const title = match[1].trim();
      const url = match[2].trim();
      // Avoid image markdown links (![Title](url))
      const matchIndex = match.index;
      if (matchIndex > 0 && content[matchIndex - 1] === '!') continue;
      
      results.push({ text: title, url });
    }
    
    // Extract remaining plain URLs
    const plainMatches = content.match(plainUrlRegex);
    if (plainMatches) {
        plainMatches.forEach(url => {
            const trimmedUrl = url.trim();
            // Only add if not already captured by markdown regex
            if (!results.some(r => r.url === trimmedUrl)) {
                try {
                    const parsed = new URL(trimmedUrl);
                    const domain = parsed.hostname.replace('www.', '');
                    results.push({ text: `Reference: ${domain}`, url: trimmedUrl });
                } catch(e) {}
            }
        });
    }

    // Try finding references in a specific section if they aren't linked markdown style
    // (Sometimes models list them as "1. Title - URL")
    const listRegex = /^\d+\.\s+(.*?)\s*[:|-]?\s*(https?:\/\/[^\s]+)/gm;
    while ((match = listRegex.exec(content)) !== null) {
        const title = match[1].trim();
        const url = match[2].trim();
        if (!results.some(r => r.url === url)) {
            results.push({ text: title || "External Citation", url });
        }
    }
    
    // Filter duplicates by URL
    return results.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
  }, [content]);

  const getThemeText = () => isWarRoomMode ? (theme === 'green' ? 'text-green-400' : theme === 'amber' ? 'text-amber-400' : 'text-cyan-400') : 'text-blue-400';
  const getThemeHoverBorder = () => isWarRoomMode ? (theme === 'green' ? 'hover:border-green-500' : theme === 'amber' ? 'hover:border-amber-500' : 'hover:border-cyan-500') : 'hover:border-blue-500';
  const getThemeBadgeBg = () => isWarRoomMode ? (theme === 'green' ? 'group-hover:bg-green-900/30' : theme === 'amber' ? 'group-hover:bg-amber-900/30' : 'group-hover:bg-cyan-900/30') : 'group-hover:bg-blue-900/30';

  return (
    <div className={`border-l h-full flex flex-col animate-fadeIn w-full lg:w-96 shadow-2xl overflow-hidden ${isWarRoomMode ? 'bg-black border-slate-800' : 'bg-slate-900 border-slate-800'}`}>
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BookOpen size={16} className={getThemeText()} />
                Authoritative Sources
            </h3>
            <button onClick={onClose} className="text-slate-500 hover:text-white text-xs uppercase font-mono tracking-widest px-2 py-1 rounded hover:bg-slate-800 transition-colors">
                Close
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-slate-900/50">
            {citations.length === 0 ? (
                <div className="text-slate-500 text-xs text-center py-12 px-6 italic border border-dashed border-slate-800 rounded-lg bg-slate-950/30 flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                        <BookOpen size={20} className="opacity-20" />
                    </div>
                    <span className="font-mono uppercase tracking-tighter text-[9px]">No verified archival references found in active report stream.</span>
                </div>
            ) : (
                citations.map((cite, idx) => (
                    <a 
                        key={idx} 
                        href={cite.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`block p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 transition-all group ${getThemeHoverBorder()} hover:bg-slate-800 hover:shadow-lg`}
                    >
                        <div className="flex items-start gap-3">
                             <div className={`mt-1 bg-slate-900 p-2 rounded-lg transition-colors ${getThemeBadgeBg()}`}>
                                <LinkIcon size={14} className={`text-slate-500 group-hover:${getThemeText()}`} />
                             </div>
                             <div className="flex-1 min-w-0">
                                 <div className="text-xs text-slate-300 group-hover:text-white font-semibold break-words leading-relaxed mb-1.5">
                                    {cite.text}
                                 </div>
                                 <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono opacity-60 group-hover:opacity-100">
                                    <span className="truncate">{new URL(cite.url).hostname}</span>
                                    <ExternalLink size={10} className={getThemeText()} />
                                 </div>
                             </div>
                        </div>
                    </a>
                ))
            )}
        </div>
        
        <div className={`p-4 bg-slate-950 border-t border-slate-800 text-[10px] font-mono shrink-0 flex items-center justify-center gap-2 ${isWarRoomMode ? 'text-slate-600' : 'text-slate-600'}`}>
             <div className={`w-1 h-1 rounded-full ${getThemeText().replace('text-', 'bg-')} animate-pulse`}></div>
             VERIFIED COMPLIANCE ARCHIVE
        </div>
    </div>
  );
};

export default CitationViewer;
