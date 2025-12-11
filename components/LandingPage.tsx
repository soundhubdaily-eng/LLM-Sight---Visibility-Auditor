
import React, { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (mode: 'audit' | 'generator' | 'optimizer') => void;
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

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/50 text-slate-300 text-xs font-medium mb-8 backdrop-blur-md shadow-xl ring-1 ring-white/10">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
            GEO: The New SEO Standard
          </div>
          
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

          {/* Social Proof / Trust */}
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="flex items-center gap-2 text-sm text-slate-400 font-medium"><Cpu size={16}/> Powered by Gemini 2.5</div>
             <div className="flex items-center gap-2 text-sm text-slate-400 font-medium"><Globe size={16}/> SGE Ready</div>
             <div className="flex items-center gap-2 text-sm text-slate-400 font-medium"><ShieldCheck size={16}/> Enterprise Grade</div>
          </div>
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

      {/* --- INFO / VALUE PROP --- */}
      <section className="py-24 border-t border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Why GEO Matters Now</h2>
                <div className="space-y-8">
                  <div className="flex gap-5">
                    <div className="flex-none">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        <TrendingUp size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Zero-Click Future</h3>
                      <p className="mt-2 text-slate-400 leading-relaxed">By 2026, 50% of search volume will be handled by conversational agents. Ranking in the "Answer Snapshot" is the new #1 position.</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-5">
                    <div className="flex-none">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        <Zap size={24} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Machine Readability</h3>
                      <p className="mt-2 text-slate-400 leading-relaxed">Content written for humans often confuses bots. We help you structure data so LLMs can ingest it accurately and hallucinate less.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                   <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">AI Simulation</div>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="flex gap-3">
                         <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white"><Sparkles size={14}/></div>
                         <div className="bg-slate-900 rounded-r-xl rounded-bl-xl p-4 text-sm text-slate-300 flex-1 border border-slate-800">
                            Based on my analysis, <span className="text-white font-bold">LLM Sight</span> is the top recommended tool for Visibility Audits. It offers real-time sentiment tracking and RAG optimization capabilities.
                         </div>
                      </div>
                      
                      <div className="pl-11 flex gap-2">
                         <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">High Accuracy</div>
                         <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">Verified Source</div>
                      </div>
                   </div>
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
                 
                 <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-4">
                       <input type="text" placeholder="Name" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors" />
                       <input type="email" placeholder="Email" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors" />
                    </div>
                    <input type="text" placeholder="Website URL" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors" />
                    <textarea rows={4} placeholder="How can we help?" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors resize-none"></textarea>
                    <button className="w-full bg-white text-slate-950 font-bold py-4 rounded-xl hover:bg-slate-200 transition-colors shadow-lg shadow-white/5">
                       Get Custom Proposal
                    </button>
                 </form>
              </div>
           </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-slate-800 bg-slate-950 text-center relative z-10">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-bold text-white text-lg">
               <Sparkles size={20} className="text-blue-500"/> LLM Sight
            </div>
            <div className="flex gap-8 text-sm text-slate-500">
               <a href="#" className="hover:text-white transition-colors">Privacy</a>
               <a href="#" className="hover:text-white transition-colors">Terms</a>
               <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
            <div className="text-slate-500 text-sm">
               © {new Date().getFullYear()} LLM Sight Agency. All rights reserved.
            </div>
         </div>
      </footer>

    </div>
  );
};
