
import React from 'react';
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
  MessageSquareQuote,
  Tag
} from 'lucide-react';

interface ResultsDashboardProps {
  result: AuditResult;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-amber-400";
    return "text-rose-400";
  };

  const getSentimentColor = (sentiment: string) => {
     switch(sentiment.toLowerCase()) {
       case 'positive': return "text-emerald-400";
       case 'negative': return "text-rose-400";
       default: return "text-blue-300";
     }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard 
          title="LLM Visibility Score" 
          value={result.overallScore} 
          icon={Trophy} 
          type="score"
          colorClass={getScoreColor(result.overallScore)}
          subtext={result.overallScore > 70 ? "Excellent Visibility" : result.overallScore > 40 ? "Moderate Visibility" : "Low Visibility"}
        />
        <MetricCard 
          title="Search Position" 
          value={result.topRankingKeywords[0].rank} 
          icon={Target}
          type="rank"
          colorClass="text-indigo-400"
          subtext="Rank in LLM cited sources"
        />
         <MetricCard 
          title="Brand Sentiment" 
          value={result.brandSentiment} 
          icon={ThumbsUp}
          colorClass={getSentimentColor(result.brandSentiment)}
          subtext="Based on grounding analysis"
        />
        <MetricCard 
          title="Citations Found" 
          value={result.groundingSources.length} 
          icon={ExternalLink}
          colorClass="text-blue-400"
          subtext="Direct links in response"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Content Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Simulated Response Preview - NEW FEATURE */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquareQuote size={20} className="text-purple-400" />
              Simulated LLM Answer Preview
            </h3>
            <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500"></div>
              <p className="text-slate-300 text-sm leading-relaxed font-mono">
                "{result.llmResponsePreview}"
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Brand Attributes:</span>
                <div className="flex flex-wrap gap-2">
                  {result.brandAttributes.map((attr, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs">
                      {attr}
                    </span>
                  ))}
                  {result.brandAttributes.length === 0 && <span className="text-xs text-slate-600">N/A</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Competitor Analysis */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Eye size={20} className="text-blue-400" />
                Competitor Landscape
              </h3>
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-slate-400">You</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-slate-400">Competitors</span>
                 </div>
              </div>
            </div>
            <CompetitorBarChart data={result.competitorAnalysis} />
          </div>

          {/* Recommendations */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm flex-1">
            <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
              <Lightbulb size={20} className="text-yellow-400" />
              Optimization Opportunities
            </h3>
            <div className="grid gap-3">
              {result.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-colors">
                  <div className="min-w-[24px] h-[24px] rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400 text-xs font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Section */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           {/* Share of Voice */}
           <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity size={20} className="text-indigo-400" />
              Share of Voice
            </h3>
            <ShareOfVoiceChart data={result.shareOfVoice} />
          </div>

          {/* Citations List */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm flex-1 flex flex-col max-h-[500px]">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Search size={20} className="text-emerald-400" />
              Source Citations
            </h3>
            <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
              {result.groundingSources.length > 0 ? (
                result.groundingSources.map((source, index) => (
                  <a 
                    key={index} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-3 rounded-xl bg-slate-700/20 hover:bg-slate-700/50 border border-slate-700/30 hover:border-blue-500/30 transition-all group cursor-pointer relative"
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-blue-400 group-hover:text-blue-300 truncate">
                          {source.title}
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-slate-600 group-hover:text-white transition-colors flex-shrink-0" />
                    </div>
                    <div className="text-xs text-slate-500 truncate pl-9 font-mono opacity-80 group-hover:opacity-100">
                      {new URL(source.uri).hostname}
                    </div>
                  </a>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center p-4 border-2 border-dashed border-slate-700 rounded-xl">
                  <Search size={24} className="text-slate-600 mb-2" />
                  <p className="text-slate-500 text-sm">No direct sources cited in this context.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
               <Download size={16} /> Export PDF
            </button>
            <button className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
               <Share2 size={16} /> Share Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
