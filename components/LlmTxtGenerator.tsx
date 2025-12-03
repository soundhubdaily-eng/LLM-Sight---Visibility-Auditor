
import React, { useState } from 'react';
import { generateLlmTxtContent } from '../services/geminiService';
import { FileText, Copy, Download, Check, RefreshCw, FileCode } from 'lucide-react';

export const LlmTxtGenerator: React.FC = () => {
  const [formData, setFormData] = useState({
    websiteName: '',
    url: '',
    description: '',
    keyPages: '',
  });
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const content = await generateLlmTxtContent({
        ...formData,
        keyPages: formData.keyPages.split(',').map(s => s.trim()).filter(s => s),
      });
      setGeneratedContent(content);
    } catch (error) {
      console.error(error);
      setGeneratedContent('Error generating file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'llms.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Generate your <span className="text-emerald-400 font-mono">llms.txt</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Help AI agents navigate your website efficiently. Create a standard-compliant 
          file that tells LLMs exactly what your site contains.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-xl h-fit">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Website Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                placeholder="My Brand"
                value={formData.websiteName}
                onChange={e => setFormData({...formData, websiteName: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Homepage URL</label>
              <input
                type="url"
                required
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                placeholder="https://example.com"
                value={formData.url}
                onChange={e => setFormData({...formData, url: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Brief Description</label>
              <textarea
                required
                rows={3}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
                placeholder="What does your website do? e.g., 'A comprehensive documentation site for...'"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Key Pages / Routes</label>
              <textarea
                 rows={3}
                 className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none"
                 placeholder="Comma separated URLs. e.g. /docs, /pricing, /about"
                 value={formData.keyPages}
                 onChange={e => setFormData({...formData, keyPages: e.target.value})}
              />
              <p className="text-[10px] text-slate-500 mt-1">Separate multiple URLs with commas.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                   <RefreshCw className="animate-spin" size={18} /> Generating...
                </>
              ) : (
                <>
                   <FileText size={18} /> Generate File
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Area */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-0 shadow-2xl overflow-hidden flex flex-col h-full min-h-[400px]">
          <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
             <div className="flex items-center gap-2 text-slate-300">
               <FileCode size={16} className="text-emerald-400"/>
               <span className="text-sm font-mono font-medium">llms.txt</span>
             </div>
             {generatedContent && (
               <div className="flex gap-2">
                 <button 
                   onClick={handleCopy}
                   className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"
                   title="Copy"
                 >
                   {copied ? <Check size={16} className="text-emerald-400"/> : <Copy size={16} />}
                 </button>
                 <button 
                   onClick={handleDownload}
                   className="p-1.5 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors"
                   title="Download"
                 >
                   <Download size={16} />
                 </button>
               </div>
             )}
          </div>
          
          <div className="flex-1 p-4 overflow-auto bg-slate-950/50 relative">
             {generatedContent ? (
               <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap">{generatedContent}</pre>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 p-8 text-center opacity-60">
                 <FileText size={48} className="mb-4 stroke-1" />
                 <p className="text-sm">Fill out the details to generate your optimized llms.txt file.</p>
                 <div className="mt-4 text-xs max-w-xs border-t border-slate-700/50 pt-4">
                    <p className="mb-2"><strong>Tips:</strong></p>
                    <ul className="text-left space-y-1 list-disc pl-4">
                       <li>Use Markdown format</li>
                       <li>Avoid HTML/JS</li>
                       <li>Keep it concise</li>
                    </ul>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};
