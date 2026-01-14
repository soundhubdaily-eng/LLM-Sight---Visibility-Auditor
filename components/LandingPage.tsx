import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  BarChart3, 
  FileText, 
  Wand2, 
  Globe, 
  ShieldCheck, 
  Zap,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Plus,
  Minus,
  Mail,
  MessageSquare,
  Loader2,
  Lock,
  X,
  Trash2,
  Calendar,
  User,
  Link as LinkIcon,
  KeyRound
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (mode: 'audit' | 'generator' | 'optimizer') => void;
  isAdmin: boolean;
  handleSecretClick: () => void;
}

interface Lead {
  id: string;
  date: string;
  name: string;
  email: string;
  website: string;
  message: string;
}

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-blue-400' : 'text-slate-200 group-hover:text-white'}`}>
          {question}
        </span>
        <div className={`flex-shrink-0 ml-4 p-1 rounded-full border transition-all ${isOpen ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'border-slate-700 text-slate-500 group-hover:border-slate-500'}`}>
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-slate-400 leading-relaxed pr-8">
          {answer}
        </p>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, isAdmin, handleSecretClick }) => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    website: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  
  // Admin / Leads State
  const [showLeads, setShowLeads] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Load leads when admin opens leads modal
  useEffect(() => {
    if (showLeads && isAdmin) {
      try {
        const stored = localStorage.getItem('llm_sight_leads');
        if (stored) {
          setLeads(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load leads", e);
      }
    }
  }, [showLeads, isAdmin]);

  const handleDeleteLead = (id: string) => {
    const updated = leads.filter(l => l.id !== id);
    setLeads(updated);
    localStorage.setItem('llm_sight_leads', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all leads?')) {
      setLeads([]);
      localStorage.removeItem('llm_sight_leads');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    // Simulate API network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Save to Local Storage with robust ID generation
    const newLead: Lead = {
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      date: new Date().toISOString(),
      ...formState
    };

    try {
      const existingLeads = JSON.parse(localStorage.getItem('llm_sight_leads') || '[]');
      const updatedLeads = [newLead, ...existingLeads];
      localStorage.setItem('llm_sight_leads', JSON.stringify(updatedLeads));
    } catch (e) {
      console.error("Failed to save lead", e);
    }

    setStatus('success');
    setFormState({ name: '', email: '', website: '', message: '' });

    // Reset success message after 3 seconds
    setTimeout(() => {
      setStatus('idle');
    }, 3000);
  };

  return (
    <div className="flex flex-col animate-fade-in w-full -mt-8">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-32 md:pt-48 md:pb-48 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 right-0 h-full overflow-hidden pointer-events-none z-0">
           <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
           <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
           <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-8 leading-[1.1]">
            Dominate the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 animate-gradient">
              AI Search Landscape
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
            Traditional SEO is fading. We provide the elite toolkit to audit, optimize, and control your brand's narrative in <strong>Generative Engine Results (GE0)</strong>.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('audit')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 duration-300"
            >
              Start Visibility Audit <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('optimizer')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-800/40 text-white border border-slate-700/50 rounded-xl font-bold text-sm hover:bg-slate-800/60 transition-all flex items-center justify-center gap-2 backdrop-blur-sm hover:border-slate-600"
            >
              <Wand2 size={16} /> Optimize Content
            </button>
          </div>

          {isAdmin && (
            <div className="mt-8">
              <button 
                onClick={() => setShowLeads(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all"
              >
                <Mail size={14} /> View Leads Portal
              </button>
            </div>
          )}
        </div>
      </section>

      {/* --- SERVICES GRID --- */}
      <section className="py-24 bg-slate-950 relative">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-16 md:text-center max-w-3xl mx-auto">
             <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-3">Our Technology</h2>
             <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">The Complete GEO Toolkit</h3>
             <p className="text-slate-400 text-lg">
               Reverse-engineer the black box of LLMs. Our suite gives you the specific metrics needed to rank in AI-generated answers.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 grid-rows-2 gap-6 h-auto md:h-[600px]">
            
            {/* Feature 1: The Auditor (Large) */}
            <div 
              onClick={() => onNavigate('audit')}
              className="md:col-span-4 md:row-span-2 group relative overflow-hidden rounded-[2rem] bg-slate-900/50 border border-slate-800 hover:border-blue-500/30 transition-all duration-500 cursor-pointer shadow-2xl flex flex-col"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="p-8 md:p-10 flex-1 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                    <BarChart3 size={28} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20 uppercase tracking-wide">
                    Core Platform
                  </span>
                </div>
                
                <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">Visibility Auditor</h3>
                <p className="text-slate-400 text-lg mb-8 max-w-md leading-relaxed">
                  The industry's first scoring engine for Generative Search.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Brand Sentiment Analysis', 'Competitor Share of Voice', 'Citation Authority Check', 'SGE Rank Tracking'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-300">
                      <CheckCircle2 size={16} className="text-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mock Chart UI */}
              <div className="relative h-48 w-full mt-auto bg-slate-950 border-t border-slate-800 p-6 flex items-end justify-around gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                 {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="w-full bg-slate-800 rounded-t-md relative overflow-hidden group-hover:bg-slate-700 transition-colors" style={{ height: `${h}%` }}>
                       {i === 5 && <div className="absolute inset-0 bg-blue-500/50"></div>}
                    </div>
                 ))}
                 <div className="absolute top-4 left-6 text-xs text-slate-500 font-mono">Visibility Trend</div>
              </div>
            </div>

            {/* Feature 2: Content Optimizer */}
            <div 
              onClick={() => onNavigate('optimizer')}
              className="md:col-span-2 md:row-span-1 group relative overflow-hidden rounded-[2rem] bg-slate-900/50 border border-slate-800 hover:border-purple-500/30 transition-all duration-500 cursor-pointer flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-8 relative z-10">
                 <div className="mb-4 text-purple-400 p-2 bg-purple-500/10 w-fit rounded-xl"><Wand2 size={24} /></div>
                 <h3 className="text-xl font-bold text-white mb-2">RAG Optimizer</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">Refine content for "Fact Density" to ensure LLMs retrieve your data correctly.</p>
              </div>
              <div className="px-8 pb-8 flex items-center text-xs font-bold text-purple-400 uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                Optimize Now <ArrowRight size={14} className="ml-2"/>
              </div>
            </div>

            {/* Feature 3: llms.txt */}
            <div 
              onClick={() => onNavigate('generator')}
              className="md:col-span-2 md:row-span-1 group relative overflow-hidden rounded-[2rem] bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all duration-500 cursor-pointer flex flex-col justify-between"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-8 relative z-10">
                 <div className="mb-4 text-emerald-400 p-2 bg-emerald-500/10 w-fit rounded-xl"><FileText size={24} /></div>
                 <h3 className="text-xl font-bold text-white mb-2">Standardize</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">Generate <code className="text-emerald-400 bg-emerald-950/30 px-1 rounded">llms.txt</code> to guide AI scrapers to your most important pages.</p>
              </div>
              <div className="px-8 pb-8 flex items-center text-xs font-bold text-emerald-400 uppercase tracking-wider group-hover:translate-x-2 transition-transform">
                Generate File <ArrowRight size={14} className="ml-2"/>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 bg-slate-950 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-400">Everything you need to know about Generative Engine Optimization.</p>
          </div>
          
          <div className="space-y-2">
             <FAQItem 
               question="What is GEO vs SEO?" 
               answer="SEO (Search Engine Optimization) targets 10 blue links on Google. GEO (Generative Engine Optimization) optimizes content to be cited in AI-generated answers like ChatGPT, Gemini, and Google SGE. It focuses on 'Fact Density' and machine readability rather than just backlinks." 
             />
             <FAQItem 
               question="How do you measure 'Visibility' in AI?" 
               answer="We run live simulations using Gemini-2.5-flash with Search Grounding. We analyze the top results for your target keyword to see if your brand is mentioned, cited as a source, or recommended in the final AI answer." 
             />
             <FAQItem 
               question="Is the audit tool free?" 
               answer="We offer a robust free tier that includes basic visibility scores and previews. Advanced competitor deep-dives and historical tracking require a Pro Agency subscription." 
             />
             <FAQItem 
               question="What is an llms.txt file?" 
               answer="It's a proposed standard (like robots.txt) for AI agents. It explicitly tells LLMs where your most important documentation and content lives, ensuring they scrape the right data without hallucinating." 
             />
          </div>
        </div>
      </section>

      {/* --- CONTACT SECTION --- */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6">
           <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -mr-16 -mt-16"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                 <div>
                    <h2 className="text-3xl font-bold text-white mb-6">Ready to Future-Proof Your Rankings?</h2>
                    <p className="text-slate-400 leading-relaxed mb-8">
                       The search landscape is shifting faster than ever. Partner with LLM Sight to ensure your brand remains visible in the age of AI.
                    </p>
                    
                    <div className="space-y-4">
                       <div className="flex items-center gap-4 text-slate-300">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                             <Mail size={18} />
                          </div>
                          <span>agency@llmsight.com</span>
                       </div>
                       <div className="flex items-center gap-4 text-slate-300">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400">
                             <MessageSquare size={18} />
                          </div>
                          <span>Live Chat Support (Pro)</span>
                       </div>
                    </div>
                 </div>
                 
                 <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                       <input 
                         type="text" 
                         placeholder="Name" 
                         className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors" 
                         required
                         value={formState.name}
                         onChange={(e) => setFormState(prev => ({...prev, name: e.target.value}))}
                       />
                       <input 
                         type="email" 
                         placeholder="Email" 
                         className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors" 
                         required
                         value={formState.email}
                         onChange={(e) => setFormState(prev => ({...prev, email: e.target.value}))}
                       />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Website URL" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors" 
                      value={formState.website}
                      onChange={(e) => setFormState(prev => ({...prev, website: e.target.value}))}
                    />
                    <textarea 
                      rows={4} 
                      placeholder="How can we help?" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      required
                      value={formState.message}
                      onChange={(e) => setFormState(prev => ({...prev, message: e.target.value}))}
                    ></textarea>
                    
                    <button 
                      type="submit"
                      disabled={status === 'sending' || status === 'success'}
                      className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-2 ${
                        status === 'success' 
                          ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
                          : 'bg-white text-slate-950 hover:bg-slate-200'
                      }`}
                    >
                      {status === 'sending' ? (
                        <>
                          <Loader2 className="animate-spin" size={18} /> Sending...
                        </>
                      ) : status === 'success' ? (
                        <>
                          <CheckCircle2 size={18} /> Proposal Requested!
                        </>
                      ) : (
                        'Get Custom Proposal'
                      )}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-slate-800 bg-slate-900 text-center relative z-10">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-bold text-white text-lg">
               <Sparkles size={20} className="text-blue-500"/> LLM Sight
            </div>
            
            <div className="text-slate-500 text-sm select-none">
               <span 
                 onClick={handleSecretClick}
                 className="cursor-default active:text-slate-400 transition-colors"
               >
                 © {new Date().getFullYear()} LLM Sight Agency. All rights reserved.
               </span>
            </div>
         </div>
      </footer>

      {/* --- LEADS MODAL (ADMIN ONLY) --- */}
      {showLeads && isAdmin && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Inbound Leads</h3>
                      <p className="text-xs text-slate-400">{leads.length} requests received</p>
                    </div>
                 </div>
                 <button onClick={() => setShowLeads(false)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                   <X size={24}/>
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-slate-950/50">
                 {leads.length === 0 ? (
                   <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                      <Mail size={48} className="mb-4 opacity-20" />
                      <p>No inquiries received yet.</p>
                   </div>
                 ) : (
                   <div className="p-6 grid grid-cols-1 gap-4">
                      {leads.map((lead) => (
                        <div key={lead.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/30 transition-colors">
                           <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm">
                                    {lead.name.charAt(0)}
                                 </div>
                                 <div>
                                    <h4 className="font-bold text-white">{lead.name}</h4>
                                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                                       <span className="flex items-center gap-1"><Mail size={12}/> {lead.email}</span>
                                       <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(lead.date).toLocaleDateString()}</span>
                                    </div>
                                 </div>
                              </div>
                              <button 
                                onClick={() => handleDeleteLead(lead.id)}
                                className="p-2 hover:bg-rose-500/10 hover:text-rose-400 text-slate-600 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                           </div>
                           
                           <div className="pl-13 ml-13 border-t border-slate-700/50 pt-4">
                              {lead.website && (
                                <div className="flex items-center gap-2 text-sm text-blue-400 mb-2">
                                   <LinkIcon size={14} /> 
                                   <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" className="hover:underline">
                                     {lead.website}
                                   </a>
                                </div>
                              )}
                              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{lead.message}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                 )}
              </div>
              
              {leads.length > 0 && (
                <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
                   <button 
                     onClick={handleClearAll}
                     className="text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-2 px-4 py-2 hover:bg-rose-500/10 rounded-lg transition-colors"
                   >
                     <Trash2 size={14} /> Delete All Records
                   </button>
                </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
};