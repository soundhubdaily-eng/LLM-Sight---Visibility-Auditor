
import React, { useState, useRef } from 'react';
import { AuditResult } from '../types';
import { MetricCard } from './MetricCard';
import { ShareOfVoiceChart, CompetitorBarChart } from './Charts';
import { 
  Trophy, 
  Eye, 
  Activity, 
  ThumbsUp, 
  ExternalLink, 
  Lightbulb,
  Search,
  Target,
  Share2,
  Download,
  Lock,
  MessageSquare,
  Sparkles,
  Bot,
  Globe,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ResultsDashboardProps {
  result: AuditResult;
  requestUrl: string;
  requestKeyword: string;
}

// --- SUB-COMPONENT: LOCKED FEATURE OVERLAY ---
const LockedFeature: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  return (
    <div className="relative group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
      {/* Blurred Content */}
      <div className="filter blur-sm opacity-50 pointer-events-none select-none transition-all duration-500 group-hover:blur-md group-hover:opacity-40">
        {children}
      </div>
      
      {/* Lock Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/10 transition-colors group-hover:bg-slate-900/30">
        <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-xs transform transition-transform duration-300 group-hover:scale-105">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 mb-3">
            <Lock size={20} />
          </div>
          <h4 className="text-white font-bold text-lg mb-1">{title}</h4>
          <p className="text-slate-400 text-xs mb-4">
            Unlock premium agency insights to view detailed competitor data and share of voice.
          </p>
          <button className="bg-white text-slate-950 px-5 py-2 rounded-full text-xs font-bold hover:bg-indigo-50 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: LLM SIMULATION WIDGET ---
const LLMSimulationWidget: React.FC<{ result: AuditResult; keyword: string }> = ({ result, keyword }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'chat'>('search');
  
  // Format the brand name in the preview text to be highlighted
  const highlightBrand = (text: string) => {
    // Simple heuristic to bold specific terms (can be improved)
    return text;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mb-8 shadow-2xl">
      <div className="bg-slate-950/50 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Generative Preview</h3>
        </div>
        <div className="flex bg-slate-800/80 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${activeTab === 'search' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <Search size={12} /> SGE / Overview
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            <MessageSquare size={12} /> AI Chat
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-slate-900/30 min-h-[300px]">
        {activeTab === 'search' ? (
          /* SEARCH GENERATIVE EXPERIENCE SIMULATION */
          <div className="max-w-3xl mx-auto bg-[#1a1a1a] rounded-2xl border border-[#333] overflow-hidden font-sans">
            <div className="p-4 border-b border-[#333] bg-[#222]">
              <div className="h-2 w-24 bg-[#444] rounded-full mb-3"></div>
              <div className="text-[#a8c7fa] text-xl font-medium mb-1">Generative AI is experimental.</div>
            </div>
            <div className="p-6">
              <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {/* Source Chips */}
                {result.groundingSources.slice(0, 3).map((source, idx) => (
                  <div key={idx} className="flex-shrink-0 w-48 bg-[#2a2a2a] rounded-xl p-3 border border-[#333] hover:bg-[#333] transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full bg-slate-600"></div>
                      <div className="text-[10px] text-slate-400 truncate w-full">{source.title}</div>
                    </div>
                    <div className="h-2 w-3/4 bg-[#444] rounded mb-1.5"></div>
                    <div className="h-2 w-1/2 bg-[#444] rounded"></div>
                  </div>
                ))}
              </div>
              
              <div className="text-slate-300 leading-relaxed text-sm space-y-4">
                <p>
                  Based on the search for <span className="text-white font-semibold">"{keyword}"</span>, here is what we found.
                </p>
                <div className="p-4 bg-[#2a2a2a] rounded-xl border-l-4 border-indigo-500 text-slate-200 italic">
                  "{result.llmResponsePreview}"
                </div>
                <p>
                  Key factors include pricing, availability, and user reviews.
                </p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-[#333]">
                <div className="flex items-center justify-between text-[#a8c7fa] text-sm font-medium cursor-pointer hover:underline">
                  <span>Show more</span>
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* CHAT INTERFACE SIMULATION */
          <div className="max-w-3xl mx-auto flex flex-col gap-6 font-sans">
            {/* User Message */}
            <div className="flex gap-4 justify-end">
              <div className="bg-[#2f2f2f] text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%]">
                Tell me about the best options for {keyword}.
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">U</div>
            </div>

            {/* AI Response */}
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Sparkles size={14} />
              </div>
              <div className="flex-1 space-y-4">
                <div className="text-slate-200 leading-relaxed text-sm">
                  Here are the top results I found. 
                  <span className="font-semibold text-white"> {result.topRankingKeywords[0].keyword} </span> 
                  is a competitive space.
                </div>
                
                <div className="bg-[#1e1e1e] border border-[#333] rounded-xl p-4 shadow-xl">
                   <div className="flex items-start gap-3">
                     <Bot className="text-emerald-400 mt-1" size={20} />
                     <div className="text-slate-300 text-sm">
                       {result.llmResponsePreview}
                     </div>
                   </div>
                   
                   {/* Citations in Chat */}
                   <div className="mt-4 flex flex-wrap gap-2">
                     {result.groundingSources.slice(0, 4).map((source, idx) => (
                       <a key={idx} href={source.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2a2a2a] hover:bg-[#333] border border-[#444] rounded-full text-[10px] text-slate-400 transition-colors">
                         <Globe size={10} />
                         <span className="max-w-[100px] truncate">{source.title}</span>
                       </a>
                     ))}
                   </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg border border-[#444] text-slate-400 text-xs hover:bg-[#2a2a2a] transition-colors">
                     Compare prices
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-[#444] text-slate-400 text-xs hover:bg-[#2a2a2a] transition-colors">
                     What are the reviews?
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, requestUrl, requestKeyword }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadPdf = async () => {
    if (!dashboardRef.current) return;
    setDownloading(true);
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        backgroundColor: '#0f172a',
        ignoreElements: (element) => element.classList.contains('no-print')
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`visibility-audit-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div ref={dashboardRef} className="bg-slate-950 p-2 md:p-8 min-h-screen">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-600/30 uppercase tracking-wider">
               GEO Audit Report
             </span>
             <span className="text-slate-500 text-xs">{new Date().toLocaleDateString()}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Visibility Analysis</h1>
          <p className="text-slate-400 text-sm">Target: <span className="text-white font-mono">{requestUrl}</span></p>
        </div>
        
        <div className="no-print">
          <button 
            onClick={downloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all border border-slate-700 shadow-lg"
          >
            {downloading ? <Activity size={16} className="animate-spin"/> : <Download size={16} />}
            {downloading ? "Generating..." : "Export PDF"}
          </button>
        </div>
      </div>

      {/* --- KPI GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Visibility Score" 
          value={result.overallScore} 
          icon={Trophy} 
          type="score" 
          colorClass={result.overallScore >= 80 ? 'text-emerald-400' : result.overallScore >= 50 ? 'text-amber-400' : 'text-rose-400'}
          subtext="AI Ranking Probability"
        />
        <MetricCard 
          title="Brand Sentiment" 
          value={result.brandSentiment} 
          icon={ThumbsUp} 
          trend={result.brandSentiment === 'Positive' ? 'Good' : 'Needs Work'}
          trendUp={result.brandSentiment === 'Positive'}
          colorClass="text-purple-400"
          subtext="Based on top 10 sources"
        />
        <MetricCard 
          title="Search Rank" 
          value={typeof result.topRankingKeywords[0].rank === 'number' ? result.topRankingKeywords[0].rank : '-'} 
          icon={Target} 
          type="rank"
          colorClass="text-blue-400"
          subtext={`Keyword: ${result.topRankingKeywords[0].keyword}`}
        />
        <MetricCard 
          title="Mentions" 
          value={result.brandMentions} 
          icon={Activity} 
          trend="Detected" 
          trendUp={true} 
          colorClass="text-indigo-400"
          subtext="In analyzed context"
        />
      </div>

      {/* --- LLM SIMULATION WIDGET (NEW) --- */}
      <LLMSimulationWidget result={result} keyword={requestKeyword || result.topRankingKeywords[0].keyword} />

      {/* --- CHARTS ROW (LOCKED FREEMIUM) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Competitor Analysis - LOCKED */}
        <LockedFeature title="Competitor Analysis">
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl h-80">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-white font-semibold flex items-center gap-2">
                 <Target size={18} className="text-emerald-400" /> Market Leaders
               </h3>
             </div>
             <CompetitorBarChart data={result.competitorAnalysis} />
           </div>
        </LockedFeature>

        {/* Share of Voice - LOCKED */}
        <LockedFeature title="Share of Voice">
           <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl h-80">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-white font-semibold flex items-center gap-2">
                 <Share2 size={18} className="text-blue-400" /> Brand Presence
               </h3>
             </div>
             <ShareOfVoiceChart data={result.shareOfVoice} />
           </div>
        </LockedFeature>
      </div>

      {/* --- RECOMMENDATIONS (LIMITED) --- */}
      <div className="mb-8 bg-slate-900/30 border border-slate-800 rounded-2xl p-6 md:p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Lightbulb className="text-yellow-400" size={24} /> 
          Optimization Checklist
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.recommendations.slice(0, 3).map((rec, idx) => {
             const text = typeof rec === 'string' ? rec : rec.text;
             const priority = typeof rec === 'object' ? rec.priority : 'High';
             
             return (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  priority === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 
                  priority === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 
                  'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                }`}>
                  {idx + 1}
                </div>
                <div>
                  <div className="text-slate-200 text-sm font-medium leading-relaxed">{text}</div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{priority} Priority</div>
                </div>
              </div>
             );
          })}
          
          {/* Blurred / Locked Recommendations */}
          {result.recommendations.length > 3 && (
            <div className="relative overflow-hidden rounded-xl border border-dashed border-slate-700 bg-slate-900/20 flex flex-col items-center justify-center p-6 text-center group cursor-pointer hover:bg-slate-900/40 transition-colors">
               <Lock className="text-slate-500 mb-2 group-hover:text-indigo-400 transition-colors" size={24} />
               <p className="text-slate-400 text-sm font-medium">
                 {result.recommendations.length - 3} more recommendations hidden
               </p>
               <span className="text-xs text-indigo-400 mt-1 font-bold">Upgrade to View All</span>
            </div>
          )}
        </div>
      </div>

      {/* --- CITATIONS (OPEN) --- */}
      {result.groundingSources.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ExternalLink size={18} className="text-slate-400" /> 
            Ranked Citations
          </h3>
          <div className="flex flex-wrap gap-3">
            {result.groundingSources.map((source, idx) => (
              <a 
                key={idx}
                href={source.uri} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl text-xs text-slate-400 hover:text-white transition-all hover:shadow-lg hover:shadow-blue-900/10 max-w-xs truncate"
              >
                <Globe size={14} className="shrink-0 text-slate-600" />
                <span className="truncate">{source.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
      
      {/* Footer Branding */}
      <div className="text-center pt-8 border-t border-slate-800/50 text-slate-600 text-xs">
         Generated by LLM Sight Agency Tools • {new Date().getFullYear()}
      </div>

    </div>
  );
};
