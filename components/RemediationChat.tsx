
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, Terminal, Paperclip, X, FileText, Image as ImageIcon, Loader2, Sparkles, Check, RotateCcw, FileCode } from 'lucide-react';
import { ChatMessage, ComplianceStandard, UserPersona, FileAttachment } from '../types';
import { Chat } from '@google/genai';
import { createRemediationChat, sendMessageToChat } from '../services/geminiService';

interface RemediationChatProps {
    designInput: string;
    complianceTarget?: ComplianceStandard;
    complianceTargets?: ComplianceStandard[];
    persona: UserPersona;
    analysisResult: string;
    onUpdateReport?: (newContent: string, reason: string) => void;
}

const RemediationChat: React.FC<RemediationChatProps> = ({ designInput, complianceTargets = [], persona, analysisResult, onUpdateReport }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'model',
            text: `SentinelAI Copilot initialized for **${persona}**. I'm monitoring risks against: ${complianceTargets.join(', ')}. \n\nHow can I help you implement these fixes today? You can also upload architecture diagrams or configuration snippets for further analysis.`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<FileAttachment[]>([]);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [showApplyButton, setShowApplyButton] = useState(false);
    const [lastUserPrompt, setLastUserPrompt] = useState<string>('');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const chat = createRemediationChat(designInput, complianceTargets, persona, analysisResult);
        setChatSession(chat);
    }, [designInput, complianceTargets, persona, analysisResult]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        
        const newAttachments: FileAttachment[] = [];
        for (const file of Array.from(files) as File[]) {
            if (file.size > 10 * 1024 * 1024) {
                alert(`${file.name} is too large (>10MB)`);
                continue;
            }

            const extension = file.name.split('.').pop()?.toLowerCase();
            const isTextBased = ['tf', 'hcl', 'yaml', 'yml', 'json', 'txt', 'md', 'sh', 'py'].includes(extension || '');

            if (isTextBased) {
                const reader = new FileReader();
                const textPromise = new Promise<string>((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                });
                reader.readAsText(file);
                const text = await textPromise;
                
                newAttachments.push({
                    name: file.name,
                    mimeType: file.type || 'text/plain',
                    data: '', // Text files don't need base64 for text parts
                    size: file.size,
                    textContent: text
                });
            } else {
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onload = () => resolve((reader.result as string).split(',')[1]);
                });
                reader.readAsDataURL(file);
                const base64Data = await base64Promise;

                newAttachments.push({
                    name: file.name,
                    mimeType: file.type,
                    data: base64Data,
                    size: file.size
                });
            }
        }
        setAttachedFiles(prev => [...prev, ...newAttachments]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        if ((!input.trim() && attachedFiles.length === 0) || !chatSession || isLoading) return;
        
        const currentInput = input;
        const currentAttachments = [...attachedFiles];
        
        const attachmentNames = currentAttachments.map(a => `📎 ${a.name}`).join(', ');
        const displayMsg = currentInput + (attachmentNames ? `\n\n*Attached: ${attachmentNames}*` : '');
        
        const userMsg: ChatMessage = { role: 'user', text: displayMsg, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setLastUserPrompt(currentInput || "File analysis request");
        
        setInput('');
        setAttachedFiles([]);
        setIsLoading(true);
        setShowApplyButton(false);

        try {
            const responseText = await sendMessageToChat(chatSession, currentInput || "", currentAttachments);
            let cleanText = responseText.trim();
            const wrapperRegex = /^```(?:markdown)?\s*([\s\S]*?)\s*```$/i;
            const match = cleanText.match(wrapperRegex);
            if (match) cleanText = match[1].trim();
            
            setMessages(prev => [...prev, { role: 'model', text: cleanText, timestamp: new Date() }]);
            if (cleanText.length > 20) {
                setShowApplyButton(true);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "Chat connection lost.", timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyChanges = async () => {
        if (!chatSession || !onUpdateReport || isApplying) return;

        setIsApplying(true);
        try {
            const hiddenPrompt = `Generate the FULL UPDATED security assessment report incorporating all changes, remediations, and details we just discussed. 

            ### STRICT REQUIREMENTS:
            1. **CITATIONS**: You MUST RETAIN and RE-OUTPUT every single external authoritative citation (e.g., NIST links, ISO links, CIS benchmarks) from the original report. Do not omit them.
            2. **FORMAT**: Ensure you follow the original report structure: TL;DR, Discovery, Threat Modeling, Mermaid Diagram, Gap Analysis Table, Remediation Code, Risk Score, and Citations section.
            3. **HIDDEN BLOCK**: Include the "::FINDING::" structured block at the very end.
            4. **CLEANLINESS**: Return ONLY the raw markdown of the full updated report. No conversational filler.`;
            
            const updatedReport = await sendMessageToChat(chatSession, hiddenPrompt);
            let cleanReport = updatedReport.trim();
            
            const wrapperRegex = /^```(?:markdown)?\s*([\s\S]*?)\s*```$/i;
            const match = cleanReport.match(wrapperRegex);
            if (match) cleanReport = match[1].trim();

            onUpdateReport(cleanReport, `Updated via chat: "${lastUserPrompt}"`);
            
            setMessages(prev => [...prev, { 
                role: 'model', 
                text: "✅ Changes applied successfully. The main security report has been updated with our latest findings and remediations. Citations have been preserved in the repository.", 
                timestamp: new Date() 
            }]);
            setShowApplyButton(false);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', text: "Failed to apply changes to the report.", timestamp: new Date() }]);
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900 overflow-hidden relative">
            {/* Header / Status Bar */}
            <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-purple-400" />
                    <div className="text-[10px] font-bold text-slate-300">Targeting: <span className="text-pink-400">{persona.split(' ')[0]}</span></div>
                </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <Bot size={18} className="text-purple-400 mt-1 flex-shrink-0" />}
                        <div className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                        </div>
                        {msg.role === 'user' && <User size={18} className="text-indigo-400 mt-1 flex-shrink-0" />}
                    </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start items-center">
                    <Bot size={18} className="text-purple-400 flex-shrink-0" />
                    <div className="bg-slate-800 text-slate-500 rounded-lg p-3 text-xs border border-slate-700 flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" />
                      Auditing your request...
                    </div>
                  </div>
                )}

                {showApplyButton && !isLoading && !isApplying && (
                    <div className="flex flex-col items-center gap-3 p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-xl animate-fadeIn">
                        <div className="text-[10px] text-indigo-300 font-mono uppercase tracking-widest text-center">
                           Would you like me to apply these changes to the report?
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleApplyChanges}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/40"
                            >
                                <Sparkles size={12} /> Apply to Report
                            </button>
                            <button 
                                onClick={() => setShowApplyButton(false)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded transition-all"
                            >
                                <X size={12} /> Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {isApplying && (
                  <div className="flex gap-3 justify-start items-center">
                    <Sparkles size={18} className="text-indigo-400 flex-shrink-0 animate-pulse" />
                    <div className="bg-indigo-900/20 text-indigo-300 rounded-lg p-3 text-xs border border-indigo-800/50 flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" />
                      Re-rendering full security report...
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Attachment Preview Area */}
            {attachedFiles.length > 0 && (
                <div className="p-2 bg-slate-950/80 border-t border-slate-800 flex gap-2 overflow-x-auto custom-scrollbar shrink-0">
                    {attachedFiles.map((file, idx) => (
                        <div key={idx} className="flex-shrink-0 flex items-center gap-2 bg-slate-800 border border-slate-700 px-2 py-1 rounded text-[10px] text-slate-300 group">
                            {file.textContent ? <FileCode size={12} className="text-emerald-400" /> : file.mimeType.includes('image') ? <ImageIcon size={12} className="text-pink-400" /> : <FileText size={12} className="text-blue-400" />}
                            <span className="max-w-[100px] truncate">{file.name}</span>
                            <button onClick={() => removeAttachment(idx)} className="text-slate-500 hover:text-white">
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
                <div className="flex gap-2 items-center">
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*,application/pdf,.tf,.hcl,.yaml,.yml,.json,.txt"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                        title="Attach technical context (Images/PDFs/Code)"
                    >
                        <Paperclip size={18} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask Copilot for remediation advice..."
                        className="flex-1 bg-slate-900 text-slate-200 text-xs rounded border border-slate-700 px-3 py-2 outline-none focus:border-indigo-500 transition-all"
                        disabled={isLoading || isApplying}
                    />
                    <button 
                        onClick={handleSend} 
                        disabled={isLoading || isApplying || (!input.trim() && attachedFiles.length === 0)} 
                        className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-900/20 transition-all"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RemediationChat;