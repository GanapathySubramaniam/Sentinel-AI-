import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Helper to clean common formatting issues from LLM output
  const sanitizeMermaidCode = (code: string): string => {
    let clean = code.trim();
    
    // Remove markdown code block delimiters
    clean = clean.replace(/^```mermaid\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');

    // Split into lines for deeper cleaning
    let lines = clean.split('\n');
    
    // Filter out lines that look like markdown lists or plain text explanations
    lines = lines.filter(line => {
        const trimmed = line.trim();
        // Skip markdown list items (- item, * item) unless they look like connection definitions 
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) return false;
        
        // Skip backticks which might be leftovers
        if (trimmed.startsWith('`')) return false;

        // CRITICAL: Remove explicit styling that overrides dark mode theme
        // We will inject our own controllable classes (like 'threat') later
        if (trimmed.startsWith('style ') || trimmed.startsWith('classDef ') || trimmed.startsWith('linkStyle ')) return false;

        return true;
    });

    // NOTE: We no longer strip ":::\w+" here because we WANT to support ":::threat" 
    // which the LLM is instructed to use.
    clean = lines.join('\n').trim();
    
    // Ensure it starts with 'graph' or 'flowchart'
    if (!clean.startsWith('graph') && !clean.startsWith('flowchart')) {
        // Default to graph TD if missing
        clean = `graph TD\n${clean}`;
    }
    
    // INJECT CUSTOM CLASSES
    // 'threat': Dark red fill, bright red border, thick stroke for visibility
    clean += `\nclassDef threat fill:#450a0a,stroke:#ef4444,stroke-width:4px,color:#ffffff;`;
    
    return clean;
  };

  useEffect(() => {
    const renderChart = async () => {
      if (!chart) return;
      
      const cleanChart = sanitizeMermaidCode(chart);

      try {
        // Reset state
        setError(null);
        setSvg('');

        mermaid.initialize({ 
            startOnLoad: false, 
            theme: 'base', // Base theme allows for granular variable control
            securityLevel: 'loose',
            fontFamily: '"JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
            themeVariables: {
                darkMode: true,
                background: '#020617', // Match Slate 950 container
                mainBkg: '#020617',

                // Nodes (Default Blue/Slate Theme)
                primaryColor: '#1e293b',      // Slate 800 (Node Background)
                primaryTextColor: '#ffffff',  // Pure White (High Contrast Text)
                primaryBorderColor: '#60a5fa', // Blue 400 (Vibrant Border)
                
                // Lines & Labels
                lineColor: '#cbd5e1',         // Slate 300 (Visible Lines)
                secondaryColor: '#334155',    // Slate 700
                tertiaryColor: '#0f172a',     // Slate 900 (Subgraphs)
                tertiaryBorderColor: '#475569', // Slate 600

                // General Text
                textColor: '#e2e8f0',         // Slate 200
            }
        });
        
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        // Use mermaid.render which returns an object { svg }
        const { svg } = await mermaid.render(id, cleanChart);
        
        setSvg(svg);
      } catch (err: any) {
        console.error("Mermaid Render Error:", err);
        // Better error message
        setError(`Failed to render attack path graph. Syntax error in generated code.`);
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
      return (
          <div className="w-full p-4 border border-red-900/50 bg-red-950/20 rounded-lg">
              <div className="text-red-400 text-xs font-mono mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {error}
              </div>
              <details className="text-[10px] text-slate-500 font-mono">
                  <summary className="cursor-pointer hover:text-slate-400 mb-2">Show Raw Code</summary>
                  <pre className="bg-slate-950 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {chart}
                  </pre>
              </details>
          </div>
      );
  }

  return (
    <div 
        ref={containerRef}
        className="w-full overflow-x-auto bg-slate-950 p-6 rounded-lg border border-slate-800 flex justify-center items-center min-h-[300px] shadow-inner"
        dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
};

export default MermaidDiagram;