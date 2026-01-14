
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AuditRequest, AuditResult, AuditStatus, AuditHistoryItem } from './types';
import { analyzeVisibility } from './services/geminiService';
import { ResultsDashboard } from './components/ResultsDashboard';
import { LlmTxtGenerator } from './components/LlmTxtGenerator';
import { ContentOptimizer } from './components/ContentOptimizer';
import { LandingPage } from './components/LandingPage';
import { Search, Globe, Sparkles, AlertCircle, ArrowRight, BarChart3, Loader2, CheckCircle2, RotateCcw, FileText, ScanSearch, Wand2, History, X, Trash2, Clock, ChevronRight, LayoutGrid, Lock, KeyRound, ShieldCheck, Flag, Plus, ExternalLink, Target, ChevronDown } from 'lucide-react';

const LOADING_STEPS = [
  "Connecting to Search Grounding...",
  "Scanning top search results...",
  "Analyzing specific competitors...",
  "Gauging regional brand sentiment...",
  "Compiling stability-checked report..."
];

const COUNTRIES = [
  { code: 'GLOBAL', name: 'Global Market', emoji: '🌐' },
  { code: 'US', name: 'United States', emoji: '🇺🇸' },
  { code: 'UK', name: 'United Kingdom', emoji: '🇬🇧' },
  { code: 'DE', name: 'Germany', emoji: '🇩🇪' },
  { code: 'FR', name: 'France', emoji: '🇫🇷' },
  { code: 'TR', name: 'Turkey', emoji: '🇹🇷' },
  { code: 'AE', name: 'United Arab Emirates', emoji: '🇦🇪' },
  { code: 'IN', name: 'India', emoji: '🇮🇳' },
  { code: 'AU', name: 'Australia', emoji: '🇦🇺' },
  { code: 'CA', name: 'Canada', emoji: '🇨🇦' },
  { code: 'BR', name: 'Brazil', emoji: '🇧🇷' },
  { code: 'JP', name: 'Japan', emoji: '🇯🇵' },
];

type AppMode = 'home' | 'audit' | 'generator' | 'optimizer';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('home');
  const [url, setUrl] = useState('');
  const [keyword, setKeyword] = useState('');
  const [country, setCountry] = useState('GLOBAL');
  const [competitorInput, setCompetitorInput] = useState('');
  const [competitorList, setCompetitorList] = useState<string[]>([]);
  
  const [status, setStatus] = useState<AuditStatus>(AuditStatus.IDLE);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  
  const [history, setHistory] = useState<AuditHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Grant full access by default to satisfy request for unrestricted reports
  const [isAdmin, setIsAdmin] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('llm_audit_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      setShowAuth(true);
      setClickCount(0);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setShowAuth(false);
      setIsAdmin(true);
      setPassword('');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const saveToHistory = (newResult: AuditResult, targetUrl: string, targetKeyword: string, targetCountry: string) => {
    const newItem: AuditHistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      url: targetUrl,
      keyword: targetKeyword || "Auto-detected",
      country: targetCountry,
      result: newResult
    };

    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 20);
      localStorage.setItem('llm_audit_history', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('llm_audit_history', JSON.stringify(updated));
      return updated;
    });
  };

  const restoreAudit = (item: AuditHistoryItem) => {
    setUrl(item.url);
    setKeyword(item.keyword === "Auto-detected" ? "" : item.keyword);
    setCountry(item.country || 'GLOBAL');
    setResult(item.result);
    setStatus(AuditStatus.COMPLETE);
    setMode('audit');
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (competitorInput.trim() && !competitorList.includes(competitorInput.trim())) {
      setCompetitorList([...competitorList, competitorInput.trim()]);
      setCompetitorInput('');
    }
  };

  const removeCompetitor = (comp: string) => {
    setCompetitorList(competitorList.filter(c => c !== comp));
  };

  const triggerAudit = async (targetUrl: string, targetKeyword: string, targetCountry: string, competitors: string[]) => {
    if (!targetUrl) return;

    setStatus(AuditStatus.ANALYZING);
    setError(null);
    setResult(null);
    setLoadingStepIndex(0);

    const progressInterval = setInterval(() => {
      setLoadingStepIndex(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);

    try {
      const request: AuditRequest = {
        url: targetUrl,
        keywords: targetKeyword.trim() ? [targetKeyword] : [],
        country: targetCountry === 'GLOBAL' ? undefined : targetCountry,
        competitors: competitors.length > 0 ? competitors : undefined
      };

      const data = await analyzeVisibility(request);
      setResult(data);
      saveToHistory(data, targetUrl, targetKeyword, targetCountry);
      setStatus(AuditStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setStatus(AuditStatus.ERROR);
      setError(err.message || "An unexpected error occurred during the audit.");
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleAudit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    triggerAudit(url, keyword, country, competitorList);
  }, [url, keyword, country, competitorList]);

  const handleNewAudit = () => {
    setStatus(AuditStatus.IDLE);
    setUrl('');
    setKeyword('');
    setCountry('GLOBAL');
    setCompetitorList([]);
    setResult(null);
    setMode('audit');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 overflow-hidden flex flex-col font-sans">
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-emerald-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className={`fixed inset-y-0 right-0 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl transform transition-transform duration-300 ease-in-out z-[100] ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={20} className="text-blue-400" /> Recent Audits
            </h3>
            <button onClick={() => setShowHistory(false)} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-center p-8">
                <Clock size={40} className="mb-4 opacity-20" />
                <p className="text-sm">No recent audits found.</p>
              </div>
            ) : (
              history.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => restoreAudit(item)}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getScoreColor(item.result.overallScore)}`}>
                          {item.result.overallScore}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">{item.url}</h4>
                    </div>
                    <button 
                      onClick={(e) => deleteHistoryItem(e, item.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Search size={12} />
                    <span className="truncate">{item.keyword}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <nav className="relative z-50 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => setMode('home')} 
            className="flex items-center gap-2 font-bold text-white text-xl cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
               <Sparkles size={18} className="text-white"/>
            </div>
            <span>LLM Sight</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setMode('audit')} className={`text-sm font-medium transition-colors ${mode === 'audit' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>Auditor</button>
            <button onClick={() => setMode('optimizer')} className={`text-sm font-medium transition-colors ${mode === 'optimizer' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>Optimizer</button>
            <button onClick={() => setMode('generator')} className={`text-sm font-medium transition-colors ${mode === 'generator' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>Generator</button>
          </div>

          <div className="flex items-center gap-3">
             <button 
               onClick={() => setShowHistory(true)}
               className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
               title="History"
             >
               <History size={20} />
             </button>
             {mode !== 'home' && (
               <button 
                 onClick={() => setMode('home')}
                 className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
               >
                 <RotateCcw size={20} />
               </button>
             )}
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col pt-12">
        {mode === 'home' && <LandingPage onNavigate={setMode} isAdmin={isAdmin} handleSecretClick={handleSecretClick} />}
        
        {mode === 'audit' && status === AuditStatus.IDLE && (
          <div className="max-w-4xl mx-auto w-full px-6 animate-fade-in">
             <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Run a <span className="text-blue-400">Visibility Audit</span></h2>
                <p className="text-slate-400 text-lg">See how AI models perceive and recommend your brand in search.</p>
             </div>
             
             <form onSubmit={handleAudit} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Target Website</label>
                    <div className="relative">
                       <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                       <input 
                         type="text" 
                         required
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-blue-500 focus:outline-none transition-all placeholder-slate-700"
                         placeholder="example.com"
                         value={url}
                         onChange={(e) => setUrl(e.target.value)}
                       />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Primary Keyword (Optional)</label>
                    <div className="relative">
                       <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                       <input 
                         type="text" 
                         className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-blue-500 focus:outline-none transition-all placeholder-slate-700"
                         placeholder="e.g. cloud security solutions"
                         value={keyword}
                         onChange={(e) => setKeyword(e.target.value)}
                       />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                   <div className="space-y-2 md:col-span-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Region</label>
                      <select 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:border-blue-500 focus:outline-none transition-all appearance-none cursor-pointer"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code}>{c.emoji} {c.name}</option>
                        ))}
                      </select>
                   </div>
                   
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Competitors (Optional)</label>
                      <div className="flex gap-2">
                         <input 
                           type="text" 
                           className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:border-blue-500 focus:outline-none transition-all placeholder-slate-700"
                           placeholder="competitor.com"
                           value={competitorInput}
                           onChange={(e) => setCompetitorInput(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetitor(e as any))}
                         />
                         <button 
                           type="button"
                           onClick={addCompetitor as any}
                           className="bg-slate-800 hover:bg-slate-700 p-4 rounded-2xl text-white transition-all"
                         >
                           <Plus size={24} />
                         </button>
                      </div>
                      {competitorList.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {competitorList.map(comp => (
                            <span key={comp} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                              {comp}
                              <button type="button" onClick={() => removeCompetitor(comp)}><X size={14} /></button>
                            </span>
                          ))}
                        </div>
                      )}
                   </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 group"
                >
                   Perform Deep Scan <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </form>
          </div>
        )}

        {status === AuditStatus.ANALYZING && (
          <div className="max-w-xl mx-auto w-full px-6 py-20 text-center animate-pulse">
             <div className="relative w-32 h-32 mx-auto mb-10">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <ScanSearch size={48} className="text-blue-500" />
                </div>
             </div>
             <h2 className="text-2xl font-bold text-white mb-2">Analyzing Brand Presence</h2>
             <p className="text-slate-500 mb-8">{LOADING_STEPS[loadingStepIndex]}</p>
             <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500" 
                  style={{ width: `${((loadingStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
                ></div>
             </div>
          </div>
        )}

        {status === AuditStatus.COMPLETE && result && (
          <ResultsDashboard 
            result={result} 
            requestUrl={url} 
            requestKeyword={keyword}
            onContact={() => setMode('home')}
            isAdmin={isAdmin}
            handleSecretClick={handleSecretClick}
          />
        )}

        {status === AuditStatus.ERROR && (
          <div className="max-w-xl mx-auto w-full px-6 py-20 text-center">
             <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
                <AlertCircle size={40} />
             </div>
             <h2 className="text-2xl font-bold text-white mb-4">Audit Failed</h2>
             <p className="text-slate-400 mb-8">{error}</p>
             <button 
               onClick={handleNewAudit}
               className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
             >
                Try Again
             </button>
          </div>
        )}

        {mode === 'generator' && (
          <div className="py-12 px-6">
            <LlmTxtGenerator />
          </div>
        )}

        {mode === 'optimizer' && (
          <div className="py-12 px-6">
            <ContentOptimizer />
          </div>
        )}
      </main>

      {/* Secret Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
           <form onSubmit={handleLogin} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-6">
                 <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-6">Agency Authentication</h3>
              <input 
                type="password" 
                autoFocus
                className={`w-full bg-slate-950 border ${authError ? 'border-rose-500' : 'border-slate-800'} rounded-xl px-4 py-3 text-white text-center mb-4 focus:outline-none focus:border-blue-500`}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {authError && <p className="text-xs text-rose-500 text-center mb-4">Invalid credentials.</p>}
              <div className="flex gap-3">
                 <button type="button" onClick={() => setShowAuth(false)} className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold hover:bg-slate-700">Cancel</button>
                 <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500">Login</button>
              </div>
           </form>
        </div>
      )}
    </div>
  );
};

export default App;
