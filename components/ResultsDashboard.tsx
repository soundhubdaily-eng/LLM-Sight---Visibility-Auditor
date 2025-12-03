
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
  MessageSquareQuote,
  Check,
  Tag,
  Link,
  Loader2,
  Copy,
  AlertTriangle,
  ArrowUpCircle,
  MinusCircle
} from 'lucide-react';

interface ResultsDashboardProps {
  result: AuditResult;
  requestUrl: string;
  requestKeyword: string;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, requestUrl, requestKeyword }) => {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [previewCopied, setPreviewCopied] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

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

  const getPriorityStyles = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'high': return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case 'medium': return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case 'low': return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default: return "bg-slate-700/50 text-slate-400 border-slate-700";
    }
  };

  // Function to print the page (Export PDF) via Snapshot
  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    setExporting(true);

    try {
      // Dynamic imports to ensure app doesn't break if libs fail to load
      // @ts-ignore
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule;
      
      // @ts-ignore
      const jspdfModule = await import('jspdf');
      const jsPDF = jspdfModule.jsPDF || jspdfModule.default?.jsPDF || jspdfModule.default;

      if (!html2canvas || !jsPDF) {
        throw new Error("PDF libraries failed to load");
      }

      // Small delay to allow state changes if any
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2, // Higher scale for better resolution
        useCORS: true,
        backgroundColor: '#0f172a', // Match background color
        logging: false,
        windowWidth: 1280, // Force desktop width to prevent mobile cut-off
        onclone: (clonedDoc: Document) => {
             // Force standard desktop width on the cloned document
             // This prevents text from wrapping strangely or cutting off on mobile devices
             const clonedElement = clonedDoc.querySelector('.p-4.md\\:p-8') as HTMLElement;
             if (clonedElement) {
                clonedElement.style.width = '1280px';
                clonedElement.style.padding = '40px';
             }

             // Expand scrollable areas
             const scrollable = clonedDoc.querySelector('.overflow-y-auto');
             if(scrollable) {
                (scrollable as HTMLElement).style.overflow = 'visible';
                (scrollable as HTMLElement).style.height = 'auto';
                (scrollable as HTMLElement).style.maxHeight = 'none';
             }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions to fit the image
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height] 
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`LLM-Audit-${new Date().toISOString().split('T')[0]}.pdf`);

    } catch (err) {
      console.error("PDF Generation failed:", err);
      alert("Failed to generate PDF snapshot. Falling back to browser print.");
      window.print(); // Fallback to standard print
    } finally {
      setExporting(false);
    }
  };

  // Function to share via URL
  const handleShare = async () => {
    // Generate permalink with query params
    const params = new URLSearchParams();
    params.set('url', requestUrl);
    if (requestKeyword) params.set('keyword', requestKeyword);
    params.set('audit', 'true');
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    
    // Copy to Clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyPreview = async () => {
    try {
      await navigator.clipboard.writeText(result.llmResponsePreview);
      setPreviewCopied(true);
      setTimeout(() => setPreviewCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy preview', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      
      {/* Top Stats Row */}
      <div ref={dashboardRef} className="p-4 md:p-8 bg-slate-900 text-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
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
              subtext={`Rank for "${result.topRankingKeywords[0].keyword}"`}
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
              subtext="Verified Brand Mentions"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Content Column */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Simulated Response Preview */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MessageSquareQuote size={20} className="text-purple-400" />
                    Simulated LLM Answer Preview
                  </h3>
                  <button
                    onClick={handleCopyPreview}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 border border-slate-700/50 text-xs font-medium text-slate-300 hover:text-white transition-all"
                    title="Copy to clipboard"
                  >
                    {previewCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {previewCopied ? "Copied" : "Copy Text"}
                  </button>
                </div>
                
                <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-blue-500"></div>
                  <p className="text-slate-300 text-sm leading-relaxed font-mono whitespace-pre-wrap">
                    "{result.llmResponsePreview}"
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center gap-2">
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
                  {result.recommendations.map((rec, index) => {
                    // Compatibility for old history records that might be strings
                    const isObject = typeof rec !== 'string';
                    const text = isObject ? rec.text : rec;
                    const priority = isObject ? rec.priority : null;
                    
                    return (
                      <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-colors group">
                        <div className="min-w-[24px] h-[24px] rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400 text-xs font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-start justify-between gap-4">
                             <p className="text-slate-300 text-sm leading-relaxed">
                               {text}
                             </p>
                             {priority && (
                               <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border flex-shrink-0 ${getPriorityStyles(priority)}`}>
                                 {priority}
                               </span>
                             )}
                           </div>
                        </div>
                      </div>
                    );
                  })}
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

              {/* Discovered Keywords (New Feature) */}
              {result.discoveredKeywords && result.discoveredKeywords.length > 0 && (
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Tag size={20} className="text-emerald-400" />
                    Discovered Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                     {result.discoveredKeywords.map((k, i) => (
                        <span key={i} className={`text-xs px-2.5 py-1 rounded-full border ${i === 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' : 'bg-slate-700/30 border-slate-700 text-slate-300'}`}>
                          {k.keyword}
                        </span>
                     ))}
                  </div>
                </div>
              )}

              {/* Citations List */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm flex-1 flex flex-col max-h-[500px] overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Search size={20} className="text-emerald-400" />
                  Verified Mentions & Citations
                </h3>
                <div className="space-y-3 flex-1 pr-2">
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
                      <p className="text-slate-500 text-sm">No direct mentions found in top search results.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      </div>
          
      {/* Actions */}
      <div className="flex gap-3 no-print mt-auto px-4 md:px-0">
        <button 
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 min-w-0"
        >
           {exporting ? <Loader2 size={16} className="animate-spin flex-shrink-0"/> : <Download size={16} className="flex-shrink-0" />} 
           <span className="truncate">{exporting ? "Generating PDF..." : "Export PDF (Snapshot)"}</span>
        </button>
        <button 
          onClick={handleShare}
          className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 relative min-w-0"
        >
           {copied ? <Check size={16} className="text-emerald-400 flex-shrink-0" /> : <Link size={16} className="flex-shrink-0"/>} 
           <span className="truncate">{copied ? "Link Copied!" : "Share Link"}</span>
        </button>
      </div>

    </div>
  );
};
