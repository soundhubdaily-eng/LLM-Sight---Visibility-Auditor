
import { GoogleGenAI, Type } from "@google/genai";
import { AuditRequest, AuditResult, CompetitorData, LlmTxtRequest, ContentOptimizationRequest, ContentOptimizationResult } from "../types";

const cleanUrl = (url: string) => {
  try {
    const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return hostname.replace('www.', '');
  } catch (e) {
    return url.toLowerCase();
  }
};

export const generateLlmTxtContent = async (req: LlmTxtRequest): Promise<string> => {
  // Always initialize client with environment variable directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Act as a Web Standards Expert. Generate a standard llms.txt file.
    Website: ${req.websiteName} (${req.url})
    Description: ${req.description}
    Pages: ${req.keyPages.join(', ')}
    Format as clean Markdown. No intro/outro.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.0,
        seed: 42
    }
  });

  return response.text || "";
};

export const optimizeContent = async (req: ContentOptimizationRequest): Promise<ContentOptimizationResult> => {
  // Always initialize client with environment variable directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Optimize the following content for AI RAG systems. 
    Focus on fact density and explicit entity relationships.
    Type: ${req.type}
    Content: ${req.content}
    Return JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.0,
      seed: 42,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          aiReadabilityScore: { type: Type.INTEGER },
          factDensity: { type: Type.INTEGER },
          hallucinationRisk: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          identifiedIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
          optimizedContent: { type: Type.STRING }
        }
      }
    }
  });

  return JSON.parse(response.text.replace(/```json\n?|```/g, '').trim());
};

export const analyzeVisibility = async (request: AuditRequest): Promise<AuditResult> => {
  // Always initialize client with environment variable directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const userDomain = cleanUrl(request.url);
  const targetCountry = request.country || "Global Market";
  const providedKeyword = request.keywords[0]?.trim();
  const explicitCompetitors = request.competitors || [];

  const searchPrompt = `
    STRICT STABILITY PROTOCOL ENABLED. 
    Role: Professional GEO Auditor for ${targetCountry}.
    Target: ${request.url} (Domain: ${userDomain}).
    
    COMPETITIVE DIRECTIVE:
    ${explicitCompetitors.length > 0 
      ? `The user has provided these SPECIFIC competitors for comparison: ${explicitCompetitors.join(', ')}. Audit them alongside the target.` 
      : "No explicit competitors provided. Identify the top 5 market leaders in the region."}

    PHASE 1: Business Identification. Analyze ${userDomain}'s business model and target audience in ${targetCountry}.
    PHASE 2: Regional Search. Search for "${providedKeyword || 'primary keywords'}" in ${targetCountry}. 
    PHASE 3: Direct Comparison. Compare ${userDomain} visibility versus ${explicitCompetitors.length > 0 ? explicitCompetitors.join(', ') : 'top regional leaders'}. 
    PHASE 4: Citations. Find where ${userDomain} is mentioned as an authority vs opponents.
  `;

  const searchResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: searchPrompt,
    config: {
      tools: [{ googleSearch: {} }],
      temperature: 0.0,
      seed: 42
    },
  });

  const searchText = searchResponse.text || "";
  const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const groundingSources = groundingChunks
    .map(chunk => chunk.web ? { title: chunk.web.title || 'Source', uri: chunk.web.uri || '' } : null)
    .filter((item): item is { title: string; uri: string } => item !== null && !!item.uri);

  const analysisPrompt = `
    Perform a DETERMINISTIC visibility scoring based on this search context:
    ---
    DATA: ${searchText}
    SOURCES: ${JSON.stringify(groundingSources)}
    ---
    
    STRICT JSON SCHEMA REQUIRED:
    1. "overallScore": 0-100. Be honest.
    2. "competitors": Array of 5-8 entries. ${explicitCompetitors.length > 0 ? "PRIORITIZE comparing against these provided domains: " + explicitCompetitors.join(', ') + "." : "Select top regional leaders."} 
       ALWAYS include ${userDomain} in this list as "Your Brand".
    3. "primaryKeyword": The identified core keyword.
    4. "recommendations": 5-6 strategic regional steps.
    
    Ensure names in "competitors" are clean domain names (e.g. competitor.com).
  `;

  const analysisResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: analysisPrompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.0,
      seed: 42,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          primaryKeyword: { type: Type.STRING },
          overallScore: { type: Type.INTEGER },
          brandSentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] },
          brandMentions: { type: Type.INTEGER },
          rank: { type: Type.INTEGER },
          competitors: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                visibilityScore: { type: Type.INTEGER },
                sentiment: { type: Type.STRING }
              }
            }
          },
          recommendations: {
            type: Type.ARRAY,
            items: {
               type: Type.OBJECT,
               properties: {
                 text: { type: Type.STRING },
                 priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
               }
            }
          },
          groundingSources: {
            type: Type.ARRAY,
            items: {
               type: Type.OBJECT,
               properties: { title: { type: Type.STRING }, uri: { type: Type.STRING } }
            }
          },
          shareOfVoice: {
             type: Type.ARRAY,
             items: {
               type: Type.OBJECT,
               properties: { name: { type: Type.STRING }, value: { type: Type.INTEGER } }
             }
          },
          llmResponsePreview: { type: Type.STRING },
          responseVariations: {
            type: Type.OBJECT,
            properties: {
              standard: { type: Type.STRING },
              detailed: { type: Type.STRING },
              citationFocused: { type: Type.STRING }
            }
          },
          brandAttributes: { type: Type.ARRAY, items: { type: Type.STRING } },
          discoveredKeywords: {
            type: Type.ARRAY,
            items: {
               type: Type.OBJECT,
               properties: { keyword: { type: Type.STRING }, relevance: { type: Type.STRING } }
            }
          }
        }
      }
    }
  });

  const parsedData = JSON.parse(analysisResponse.text.replace(/```json\n?|```/g, '').trim());

  let competitors: CompetitorData[] = (parsedData.competitors || []).map(c => {
    const isUser = c.name.toLowerCase().includes(userDomain.toLowerCase()) || c.name.toLowerCase() === "your brand";
    return {
      ...c,
      name: isUser ? "Your Brand" : c.name.replace(/https?:\/\/(www\.)?/, '').split('/')[0],
      isUser
    };
  });

  // Ensure user brand is present
  if (!competitors.some(c => c.isUser)) {
    competitors.push({
      name: "Your Brand",
      visibilityScore: parsedData.overallScore,
      sentiment: parsedData.brandSentiment,
      isUser: true
    });
  }

  competitors.sort((a, b) => b.visibilityScore - a.visibilityScore);
  const totalScore = competitors.reduce((sum, c) => sum + c.visibilityScore, 0) || 1;
  const shareOfVoice = competitors.map(c => ({
    name: c.name,
    value: Math.round((c.visibilityScore / totalScore) * 100)
  }));

  return {
    ...parsedData,
    competitorAnalysis: competitors,
    shareOfVoice,
    topRankingKeywords: [{ keyword: parsedData.primaryKeyword || providedKeyword || "General", rank: parsedData.rank > 0 ? parsedData.rank : 'Not Found' }],
  };
};
