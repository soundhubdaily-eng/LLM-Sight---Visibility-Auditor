
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { CompetitorData } from '../types';
import { AlertCircle } from 'lucide-react';

// Modern palette
const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1'];

interface VoiceChartProps {
  data: Array<{ name: string; value: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isUser = payload[0].payload.isUser;
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl shadow-black/50 z-50">
        <p className={`text-sm font-medium mb-1 ${isUser ? 'text-emerald-400' : 'text-slate-200'}`}>
          {label || payload[0].name} {isUser ? '(You)' : ''}
        </p>
        <p className="text-blue-400 text-sm font-bold">
          Score: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export const ShareOfVoiceChart: React.FC<VoiceChartProps> = ({ data }) => {
  // Check for empty data
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="h-64 w-full flex flex-col items-center justify-center text-slate-500 border border-slate-700/30 rounded-xl bg-slate-800/20">
        <AlertCircle className="mb-2 opacity-50" size={24} />
        <span className="text-sm">Not enough data for Share of Voice</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
             verticalAlign="bottom" 
             height={36} 
             iconType="circle"
             formatter={(value) => <span className="text-slate-400 text-xs ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

interface CompetitorChartProps {
  data: CompetitorData[];
}

export const CompetitorBarChart: React.FC<CompetitorChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
     return (
      <div className="h-72 w-full flex flex-col items-center justify-center text-slate-500 border border-slate-700/30 rounded-xl bg-slate-800/20">
        <span className="text-sm">No competitor data found</span>
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.4} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
            tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            cursor={{ fill: '#334155', opacity: 0.2 }}
            content={<CustomTooltip />}
          />
          <Bar 
            dataKey="visibilityScore" 
            radius={[6, 6, 0, 0]} 
            barSize={40}
            animationDuration={1500}
          >
            {data.map((entry, index) => (
               <Cell 
                 key={`cell-${index}`} 
                 fill={entry.isUser ? '#10b981' : '#3b82f6'} // Emerald for user, Blue for others
                 stroke={entry.isUser ? '#34d399' : 'none'}
                 strokeWidth={entry.isUser ? 2 : 0}
               />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
