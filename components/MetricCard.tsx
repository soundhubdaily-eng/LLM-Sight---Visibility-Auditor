import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  colorClass?: string;
  type?: 'score' | 'standard' | 'rank';
  subtext?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  colorClass = "text-blue-500",
  type = 'standard',
  subtext
}) => {
  
  const isScore = type === 'score';
  const numValue = typeof value === 'number' ? value : 0;
  
  // Calculate circle props for score type
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isScore ? circumference - (numValue / 100) * circumference : 0;

  return (
    <div className="relative overflow-hidden bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-slate-600/80 transition-all duration-300 group hover:shadow-lg hover:shadow-blue-900/10">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl group-hover:from-white/10 transition-all"></div>
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-slate-700/30 ${colorClass} ring-1 ring-inset ring-white/5`}>
            <Icon size={20} />
          </div>
          <h3 className="text-slate-400 text-sm font-medium tracking-wide uppercase">{title}</h3>
        </div>
        
        {isScore && (
          <div className="relative flex items-center justify-center w-16 h-16 -mt-2 -mr-2">
             <svg className="transform -rotate-90 w-16 h-16">
              <circle
                className="text-slate-700"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="32"
                cy="32"
              />
              <circle
                className={colorClass.replace('text-', 'text-')} // Just ensures we use the color class
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx="32"
                cy="32"
                style={{ transition: "stroke-dashoffset 1s ease-out" }}
              />
            </svg>
            <span className={`absolute text-sm font-bold ${colorClass}`}>{value}</span>
          </div>
        )}
      </div>

      <div className="relative z-10">
        {!isScore && (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
            {type === 'rank' && typeof value === 'number' && (
               <span className="text-xs text-slate-400">/ 10</span>
            )}
          </div>
        )}
        
        {isScore && (
          <div className="h-8 flex items-center">
             <span className="text-sm text-slate-400">{subtext || 'Overall Visibility'}</span>
          </div>
        )}

        {(trend || subtext) && !isScore && (
          <div className="mt-2 flex items-center gap-2">
             {trend && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {trend}
                </span>
             )}
             {subtext && <span className="text-xs text-slate-500">{subtext}</span>}
          </div>
        )}
      </div>
    </div>
  );
};