
export interface AuditRequest {
  url: string;
  keywords: string[];
  country?: string;
  competitors?: string[];
}

export interface CompetitorData {
  name: string;
  visibilityScore: number;
  sentiment: string;
  isUser?: boolean;
}

export interface RankingItem {
  rank: number;
  source: string;
  isUserSite: boolean;
}

export interface RecommendationItem {
  text: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface AuditResult {
  overallScore: number;
  brandSentiment: 'Positive' | 'Neutral' | 'Negative';
  brandMentions: number;
  topRankingKeywords: Array<{ keyword: string; rank: number | 'Not Found' }>;
  competitorAnalysis: CompetitorData[];
  recommendations: (string | RecommendationItem)[]; 
  groundingSources: Array<{ title: string; uri: string }>;
  rawAnalysis: string;
  shareOfVoice: Array<{ name: string; value: number }>;
  llmResponsePreview: string;
  brandAttributes: string[];
  discoveredKeywords?: Array<{ keyword: string; relevance: string }>;
  responseVariations?: {
    standard: string;
    detailed: string;
    citationFocused: string;
  };
}

export interface AuditHistoryItem {
  id: string;
  timestamp: number;
  url: string;
  keyword: string;
  country?: string;
  result: AuditResult;
}

export interface LlmTxtRequest {
  websiteName: string;
  url: string;
  description: string;
  keyPages: string[]; 
}

export interface ContentOptimizationRequest {
  content: string;
  type: 'Homepage' | 'About Us' | 'Product Page' | 'Blog Post' | 'Documentation';
}

export interface ContentOptimizationResult {
  aiReadabilityScore: number; 
  factDensity: number; 
  hallucinationRisk: 'Low' | 'Medium' | 'High';
  identifiedIssues: string[];
  optimizedContent: string;
}

export enum AuditStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}
