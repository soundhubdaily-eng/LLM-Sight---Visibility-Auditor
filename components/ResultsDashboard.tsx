import React, { useState, useRef } from 'react';
import { AuditResult } from '../types';
import { MetricCard } from './MetricCard';
import { ShareOfVoiceChart, CompetitorBarChart } from './Charts';
import { 
  Trophy, 
  Activity, 
  ThumbsUp, 
  Search,
  Target,
  Share2,
  Download,
  Lock,
  MessageSquare,
  Sparkles,
  Bot,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Loader2,
  FileBarChart
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ResultsDashboardProps {
  result: AuditResult;
  requestUrl: string;
  requestKeyword: string;
  onContact: () => void;
  isAdmin?: boolean;
  handleSecretClick?: () => void;
}

const LLMSimulationWidget: React.FC<{ result: AuditResult; keyword: string }> = ({ result, keyword }) => {
  const [activeTab, setActiveTab] = useState<'search' | 'chat'>('search');
  const [responseStyle, setResponseStyle] = useState<'standard' | 'detailed' | 'citation'>('standard');

  const getResponseText = () => {
    if (result.responseVariations) {
      if (responseStyle === 'detailed') return result.responseVariations.detailed;
      if (responseStyle === 'citation') return result.responseVariations.citationFocused;
      return result.responseVariations.standard;
    }
    return result.llmResponsePreview;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden mb-8 shadow-2xl simulation-widget">
      <div className="bg-slate-950/50 border-b border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide">Generative Preview</h3>
        </div>
        <div className="flex bg-slate-800/80 p-1 rounded-lg">
          <button onClick={() => setActiveTab('search')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'search' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>Search</button>
          <button onClick={() => setActiveTab('chat')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${activeTab === 'chat' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Chat</button>
        </div>
      </div>
      <div className="p-6 md:p-8 bg-slate-900/30 min-h-[300px] print-bg-white">
        <div className="max-w-3xl mx-auto font-sans">
          <div className="bg-[#1a1a1a] print:bg-white border border-[#333] print:border-slate-200 rounded-2xl overflow-hidden p-6 shadow-xl">
            <div className="text-slate-300 print:text-slate-800 leading-relaxed text-sm whitespace-pre-wrap">{getResponseText()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, requestUrl, requestKeyword, onContact, isAdmin = false, handleSecretClick }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const downloadPdf = async () => {
    if (!isAdmin) {
       onContact();
       return;
    }
    
    if (!dashboardRef.current) return;
    setIsExporting(true);
    
    try {
      // Step 1: Force scroll to top to prevent offset issues
      window.scrollTo(0, 0);
      await new Promise(resolve => setTimeout(resolve, 300));

      const element = dashboardRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // Premium quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#0f172a',
        width: 1200, // Normalized width for predictable PDF aspect ratio
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          const container = clonedDoc.querySelector('.results-container') as HTMLElement;
          if (container) {
            container.style.width = '1200px';
            container.style.padding = '40px';
            container.style.filter = 'none';
            container.style.opacity = '1';
          }
          const noPrints = clonedDoc.querySelectorAll('.no-print');
          noPrints.forEach(el => (el as HTMLElement).style.display = 'none');
          const unblur = clonedDoc.querySelector('.print-unblurred') as HTMLElement;
          if (unblur) {
            unblur.style.filter = 'none';
            unblur.style.opacity = '1';
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), undefined, 'FAST');
      pdf.save(`LLM-Sight-Report-${userDomainClean(requestUrl)}.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Failed to export PDF. Try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const userDomainClean = (u: string) => u.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  return (
    <div ref={dashboardRef} className="bg-slate-950 p-2 md:p-8 min-h-screen results-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="bg-blue-600/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-600/30 uppercase tracking-wider">GEO Market Report</span>
             {isAdmin && <span className="bg-emerald-600/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-600/30 uppercase flex items-center gap-1"><ShieldCheck size={10} /> Verified</span>}
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Visibility Analysis</h1>
          <p className="text-slate-400 text-sm">Target: <span className="text-white font-mono">{requestUrl}</span></p>
        </div>
        <div className="no-print">
          <button onClick={downloadPdf} disabled={isExporting} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all border ${isAdmin ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500' : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'} disabled:opacity-50`}>
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : isAdmin ? <Download size={16} /> : <Lock size={16} />}
            {isExporting ? 'Building PDF...' : 'Download PDF Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MetricCard title="Visibility Score" value={result.overallScore} icon={Trophy} type="score" colorClass={result.overallScore >= 80 ? 'text-emerald-400' : 'text-blue-400'} subtext="Ranking Authority" />
        <MetricCard title="Sentiment" value={result.brandSentiment} icon={ThumbsUp} trendUp={result.brandSentiment === 'Positive'} colorClass="text-purple-400" />
        <MetricCard title="Regional Rank" value={typeof result.topRankingKeywords[0].rank === 'number' ? result.topRankingKeywords[0].rank : '-'} icon={Target} type="rank" colorClass="text-blue-400" subtext={`Keyword: ${result.topRankingKeywords[0].keyword}`} />
        <MetricCard title="AI Mentions" value={result.brandMentions} icon={FileBarChart} colorClass="text-indigo-400" />
      </div>

      <div className="relative rounded-3xl overflow-hidden bg-slate-900/20 border border-slate-800/50">
         {!isAdmin && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-start pt-16 md:pt-24 bg-slate-950/70 backdrop-blur-[3px]">
               <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-lg text-center mx-4 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-blue-500/20 rotate-3"><Lock size={32} /></div>
                    <h3 className="text-2xl font-bold text-white mb-3">Unlock Agency Data</h3>
                    <p className="text-slate-400 mb-8 leading-relaxed text-sm">Competitive metrics and share-of-voice calculations are restricted to Pro accounts.</p>
                    <button onClick={onContact} className="w-full py-4 bg-white text-slate-950 hover:bg-slate-200 rounded-xl font-bold text-lg shadow-xl shadow-white/5 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"><span>Get Agency Access</span><MessageSquare size={18} /></button>
                  </div>
               </div>
            </div>
         )}
         <div className={`transition-all duration-700 ${!isAdmin ? 'filter blur-md opacity-30 pointer-events-none select-none' : 'opacity-100'} p-4 md:p-8 space-y-8 print-unblurred`}>
            <LLMSimulationWidget result={result} keyword={requestKeyword || "identified sector"} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl h-80 chart-container">
                <div className="flex items-center justify-between mb-6"><h3 className="text-white font-semibold flex items-center gap-2"><Target size={18} className="text-blue-400" /> Direct Competitors</h3></div>
                <CompetitorBarChart data={result.competitorAnalysis} />
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl h-80 chart-container">
                <div className="flex items-center justify-between mb-6"><h3 className="text-white font-semibold flex items-center gap-2"><Share2 size={18} className="text-emerald-400" /> Market Share of Voice</h3></div>
                <ShareOfVoiceChart data={result.shareOfVoice} />
              </div>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 md:p-8">
               <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><CheckCircle2 size={24} className="text-emerald-400" /> Strategic Roadmap</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {result.recommendations.map((rec, i) => {
                    const text = typeof rec === 'string' ? rec : rec.text;
                    const priority = typeof rec === 'string' ? 'Medium' : rec.priority;
                    return (
                      <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                        <div className="mt-1 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">{i+1}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priority === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>{priority} Priority</span>
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">{text}</p>
                        </div>
                      </div>
                    );
                 })}
               </div>
            </div>
         </div>
      </div>
      <div className="text-center pt-8 mt-8 border-t border-slate-800/50 text-slate-600 text-[10px] select-none no-print">
         <span onClick={handleSecretClick} className="cursor-pointer hover:text-slate-400">© {new Date().getFullYear()} LLM Sight Proprietary Intelligence</span>
      </div>
    </div>
  );
};