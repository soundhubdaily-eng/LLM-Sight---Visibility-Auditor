
import React, { useState } from 'react';
import { optimizeContent } from '../services/geminiService';
import { ContentOptimizationResult } from '../types';
import { Sparkles, ArrowRight, Wand2, Copy, Check, AlertTriangle, FileText, BarChart, Bot } from 'lucide-react';

export const ContentOptimizer: React.FC = () => {
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState<'Homepage' | 'About Us' | 'Product Page' | 'Blog Post' | 'Documentation'>('Homepage');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ContentOptimizationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleOptimize = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await optimizeContent({ content, type: contentType });
      setResult(data);
    } catch (err) {
      console.error(err);
      // Fallback or error handling could go here
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.optimizedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in pb-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Make your content <span className="text-blue-400 font-mono">RAG-Ready</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          AI models struggle with fluff. Optimize your text to increase Fact Density and reduce Hallucination Risk, ensuring LLMs understand your brand correctly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        
        {/* INPUT SECTION */}
        <div className="flex flex-col h-full">
          <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2 text-slate-300 font-semibold">
                 <FileText size={18} className="text-blue-400"/>
                 Raw Content
               </div>
               <select 
                 value={contentType}
                 onChange={(e) => setContentType(e.target.value as any)}
                 className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
               >
                 <option value="Homepage">Homepage</option>
                 <option value="About Us">About Us</option>
                 <option value="Product Page">Product Page</option>
                 <option value="Documentation">Documentation</option>
                 <option value="Blog Post">Blog Post</option>
               </select>
            </div>
            
            <textarea
              className="flex-1 w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none font-mono text-sm leading-relaxed min-h-[300px]"
              placeholder="Paste your website text here (e.g. 'We are a leading provider of comprehensive solutions...')"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            <button
              onClick={handleOptimize}
              disabled={loading || !content.trim()}
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Wand2 className="animate-spin" size={18} /> Optimizing...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Analyze & Optimize
                </>
              )}
            </button>
          </div>
        </div>

        {/* OUTPUT SECTION */}
        <div className="flex flex-col h-full">
          {result ? (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-0 shadow-2xl overflow-hidden flex flex-col h-full animate-fade-in">
              
              {/* Metrics Header */}
              <div className="bg-slate-800/80 p-5 border-b border-slate-700 grid grid-cols-3 gap-4">
                 <div className="text-center">
                   <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">AI Readability</div>
                   <div className={`text-xl font-bold ${result.aiReadabilityScore > 80 ? 'text-emerald-400' : result.aiReadabilityScore > 50 ? 'text-yellow-400' : 'text-rose-400'}`}>
                     {result.aiReadabilityScore}/100
                   </div>
                 </div>
                 <div className="text-center border-l border-slate-700">
                   <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Fact Density</div>
                   <div className="text-xl font-bold text-blue-400">
                     {result.factDensity}%
                   </div>
                 </div>
                 <div className="text-center border-l border-slate-700">
                   <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Hallucination Risk</div>
                   <div className={`text-xl font-bold flex items-center justify-center gap-1 ${result.hallucinationRisk === 'Low' ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {result.hallucinationRisk === 'High' && <AlertTriangle size={16} />}
                     {result.hallucinationRisk}
                   </div>
                 </div>
              </div>

              {/* Optimized Content */}
              <div className="flex-1 flex flex-col min-h-[400px]">
                 <div className="bg-slate-800/50 px-5 py-3 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-medium">
                       <Bot size={16} /> Optimized Version
                    </div>
                    <button 
                       onClick={handleCopy}
                       className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-700/50 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                    >
                       {copied ? <Check size={14}/> : <Copy size={14}/>}
                       {copied ? "Copied" : "Copy"}
                    </button>
                 </div>
                 
                 <div className="flex-1 p-5 overflow-y-auto bg-slate-950/30">
                    <div className="prose prose-invert prose-sm max-w-none">
                       <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 leading-relaxed font-normal">
                          {result.optimizedContent}
                       </pre>
                    </div>

                    {/* Identified Issues List */}
                    {result.identifiedIssues.length > 0 && (
                      <div className="mt-6 pt-4 border-t border-slate-800/50">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Fixes Applied:</h4>
                        <div className="space-y-2">
                           {result.identifiedIssues.map((issue, idx) => (
                             <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                               <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                               <span>{issue}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/20 border border-slate-700/30 rounded-2xl flex flex-col items-center justify-center h-full min-h-[400px] text-slate-600 p-8 text-center border-dashed">
               <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                 <BarChart size={32} className="opacity-50" />
               </div>
               <h3 className="text-lg font-medium text-slate-500 mb-2">Ready to Optimize</h3>
               <p className="text-sm max-w-xs">
                 Paste your content on the left to generate an AI-friendly version with higher ranking potential.
               </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
