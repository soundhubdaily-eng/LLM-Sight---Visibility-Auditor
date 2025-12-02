import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AuditRequest, AuditResult, AuditStatus } from './types';
import { analyzeVisibility } from './services/geminiService';
import { ResultsDashboard } from './components/ResultsDashboard';
import { Search, Globe, Sparkles, AlertCircle, ArrowRight, BarChart3, Loader2, CheckCircle2, Plus, RotateCcw } from 'lucide-react';

// Loading steps to keep user engaged during API call
const LOADING_STEPS = [
  "Connecting to Search Grounding...",
  "Scanning top search results...",
  "Identifying competitors...",
  "Analyzing brand sentiment...",
  "Compiling visibility report..."
];

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<AuditStatus>(AuditStatus.IDLE);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  
  // Background parallax ref
  const mouseRef = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    let interval: any;
    if (status === AuditStatus.ANALYZING) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [status]);

  const handleAudit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !keyword) return;

    setStatus(AuditStatus.ANALYZING);
    setError(null);
    setResult(null);

    try {
      const request: AuditRequest = {
        url,
        keywords: [keyword],
      };

      const data = await analyzeVisibility(request);
      setResult(data);
      setStatus(AuditStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setStatus(AuditStatus.ERROR);
      setError(err.message || "An unexpected error occurred during the audit.");
    }
  }, [url, keyword]);

  const handleNewAudit = () => {
    setStatus(AuditStatus.IDLE);
    setUrl('');
    setKeyword('');
  };

  return (
    <div className="relative min-h-screen bg-slate-900 text-slate-200 selection:bg-blue-500/30 overflow-hidden flex flex-col">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-emerald-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-md sticky top-0 z-50 bg-slate-900/60 supports-[backdrop-filter]:bg-slate-900/60 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleNewAudit}>
            <div className="bg-gradient-to-tr from-blue-600 to-emerald-500 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <Sparkles className="text-white" size={18} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              LLM Sight <span className="text-slate-500 font-normal text-sm ml-2 hidden sm:inline-block">Visibility Auditor</span>
            </h1>
          </div>
          <div className="text-xs font-medium text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_2px_rgba(16,185,129,0.3)]"></span>
            Gemini 2.5 Flash
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 w-full">
        
        {/* Main Content Container */}
        <div className={`flex-1 flex flex-col transition-all duration-500 ${status === AuditStatus.COMPLETE ? 'justify-start pt-8 pb-12' : 'justify-center items-center py-12'}`}>
          
          {/* 1. IDLE STATE: Hero & Form */}
          {status === AuditStatus.IDLE && (
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20 mb-8">
                <Sparkles size={14} /> New: Search Grounding V2 Analysis
              </div>
              <h2 className="text-5xl sm:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1] text-center">
                How visible is your brand <br/>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-500">in the AI Era?</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed text-center mb-12">
                Traditional SEO is changing. Audit your ranking, sentiment, and citations across Generative Search Engines with our Gemini-powered analysis.
              </p>

              <div className="w-full max-w-2xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <form onSubmit={handleAudit} className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-3 shadow-2xl flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center bg-slate-800/50 rounded-xl px-4 border border-transparent focus-within:border-blue-500/50 focus-within:bg-slate-800 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all h-16">
                    <Globe className="text-slate-500 mr-3" size={20} />
                    <div className="flex-1 py-1">
                      <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Website URL</label>
                      <input
                        type="text"
                        placeholder="example.com"
                        className="bg-transparent border-none text-white placeholder-slate-600 focus:ring-0 w-full p-0 text-base font-medium outline-none"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="w-px bg-slate-700/50 my-2 hidden sm:block"></div>
                  <div className="flex-1 flex items-center bg-slate-800/50 rounded-xl px-4 border border-transparent focus-within:border-blue-500/50 focus-within:bg-slate-800 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all h-16">
                    <Search className="text-slate-500 mr-3" size={20} />
                    <div className="flex-1 py-1">
                      <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Target Keyword</label>
                      <input
                        type="text"
                        placeholder="e.g. Enterprise CRM"
                        className="bg-transparent border-none text-white placeholder-slate-600 focus:ring-0 w-full p-0 text-base font-medium outline-none"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 sm:w-auto w-full h-16 sm:h-auto"
                  >
                    <span>Audit</span>
                    <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 2. LOADING STATE: Centered Spinner */}
          {status === AuditStatus.ANALYZING && (
            <div className="w-full max-w-lg mx-auto flex flex-col items-center animate-fade-in my-auto">
              <div className="relative w-24 h-24 mb-10">
                  <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="text-blue-400 animate-pulse" size={24} />
                  </div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-8">Running Visibility Audit...</h3>

              <div className="space-y-4 w-full bg-slate-800/30 p-6 rounded-2xl border border-slate-700/30 backdrop-blur-sm">
                  {LOADING_STEPS.map((step, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-4 transition-all duration-500 ${
                        idx === loadingStepIndex 
                          ? 'opacity-100 translate-x-0 text-blue-400 font-medium' 
                          : idx < loadingStepIndex 
                            ? 'opacity-50 translate-x-0 text-emerald-500' 
                            : 'opacity-30 translate-x-0 text-slate-500'
                      }`}
                    >
                      {idx < loadingStepIndex ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                          <CheckCircle2 size={14} />
                        </div>
                      ) : idx === loadingStepIndex ? (
                        <Loader2 size={20} className="animate-spin text-blue-400" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-700" />
                      )}
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 3. ERROR STATE */}
          {status === AuditStatus.ERROR && (
            <div className="w-full max-w-2xl mx-auto text-center animate-fade-in">
              <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-semibold text-white mb-1">Audit Failed</h3>
                   <p className="text-slate-300">{error}</p>
                </div>
                <button 
                  onClick={handleNewAudit}
                  className="mt-2 px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* 4. RESULTS STATE */}
          {status === AuditStatus.COMPLETE && result && (
            <div className="w-full animate-fade-in">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800/50 pb-8 mb-8 gap-6">
                <div>
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/20 p-2.5 rounded-xl">
                      <BarChart3 className="text-emerald-400" size={24} />
                    </div>
                    Audit Report
                  </h2>
                  <div className="flex items-center gap-2 mt-3 ml-1 text-slate-400 text-sm">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">{url}</span>
                    <span>on keyword</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">{keyword}</span>
                  </div>
                </div>
                
                <button 
                  onClick={handleNewAudit}
                  className="group relative px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all hover:shadow-blue-600/30 hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                  Start New Audit
                </button>
              </div>

              <ResultsDashboard result={result} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;