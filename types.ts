
export interface AuditRequest {
  url: string;
  keywords: string[];
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

export interface AuditResult {
  overallScore: number;
  brandSentiment: 'Positive' | 'Neutral' | 'Negative';
  brandMentions: number;
  topRankingKeywords: Array<{ keyword: string; rank: number | 'Not Found' }>;
  competitorAnalysis: CompetitorData[];
  recommendations: string[];
  groundingSources: Array<{ title: string; uri: string }>;
  rawAnalysis: string;
  shareOfVoice: Array<{ name: string; value: number }>;
  llmResponsePreview: string;
  brandAttributes: string[];
}

export enum AuditStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}
