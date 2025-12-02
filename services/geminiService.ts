
import { GoogleGenAI, Type } from "@google/genai";
import { AuditRequest, AuditResult, CompetitorData } from "../types";

// Helper to clean URL for comparison
const cleanUrl = (url: string) => {
  try {
    const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return hostname.replace('www.', '');
  } catch (e) {
    return url.toLowerCase();
  }
};

export const analyzeVisibility = async (request: AuditRequest): Promise<AuditResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });
  const userDomain = cleanUrl(request.url);

  // 1. Check Ranking & Visibility using Search Grounding
  const keyword = request.keywords[0] || "generic";
  
  const searchPrompt = `
    Act as an objective search engine evaluator. 
    I want to know the top 10 websites recommended for the query: "${keyword}".
    
    Also, check if the specific website "${request.url}" is mentioned in the top results or discussions found via Google Search.
    
    Finally, analyze the sentiment and authority of "${request.url}" based on the search results.
  `;

  const searchResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: searchPrompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const searchText = searchResponse.text || "";
  const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  const groundingSources = groundingChunks
    .map(chunk => chunk.web ? { title: chunk.web.title || 'Source', uri: chunk.web.uri || '' } : null)
    .filter((item): item is { title: string; uri: string } => item !== null && !!item.uri);

  // 2. Analyze the data gathered to generate structured metrics
  const analysisPrompt = `
    You are an LLM Visibility Audit tool.
    
    Target Website: ${request.url} (Domain: ${userDomain})
    Target Keyword: ${keyword}
    
    Context from Search Grounding:
    ${searchText}
    
    Sources Found:
    ${JSON.stringify(groundingSources)}

    Task:
    Analyze the provided context to determine how visible the Target Website is for the Target Keyword.
    
    1. Determine a "Visibility Score" (0-100). 0 = Not found/mentioned. 100 = Top result/Highly praised.
    2. Determine the rank of the target website in the context provided (if a list was generated). If not found, return 0.
    3. Identify competitors mentioned in the context.
    4. Provide specific technical and content recommendations to improve visibility in LLM answers (GEO - Generative Engine Optimization).
    5. Estimate "Share of Voice" among competitors found in the text.
    6. Write a simulated LLM response (2-3 sentences) answering the user's query, naturally mentioning top players.
    7. List 3-5 key adjectives or brand attributes associated with the target website based on the context (or "N/A" if unknown).

    Return strictly JSON.
  `;

  const analysisResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: analysisPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.INTEGER },
          brandSentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] },
          brandMentions: { type: Type.INTEGER, description: "Approximate count of mentions in the source text" },
          rank: { type: Type.INTEGER, description: "Rank in the top list, 0 if not found" },
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
            items: { type: Type.STRING }
          },
          shareOfVoice: {
             type: Type.ARRAY,
             items: {
               type: Type.OBJECT,
               properties: {
                 name: { type: Type.STRING },
                 value: { type: Type.INTEGER }
               }
             }
          },
          llmResponsePreview: { type: Type.STRING, description: "Simulated short answer from an LLM about the query" },
          brandAttributes: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  const jsonText = analysisResponse.text;
  if (!jsonText) throw new Error("Failed to generate analysis");

  const parsedData = JSON.parse(jsonText);

  // --- COMPETITOR LIST PROCESSING ---
  let competitors: CompetitorData[] = parsedData.competitors || [];
  
  // Clean up competitor names
  competitors = competitors.map(c => ({
    ...c,
    name: c.name.replace(/https?:\/\/(www\.)?/, '').split('/')[0] // Simplify URLs to names
  }));

  // Find user in list
  const userIndex = competitors.findIndex(c => 
    c.name.toLowerCase().includes(userDomain.toLowerCase()) || 
    userDomain.toLowerCase().includes(c.name.toLowerCase())
  );

  if (userIndex !== -1) {
    competitors[userIndex].isUser = true;
    // Make sure name is clear
    if (!competitors[userIndex].name.toLowerCase().includes("you")) {
        competitors[userIndex].name = `${competitors[userIndex].name}`; 
    }
  } else {
    // Explicitly add user if not found
    competitors.push({
      name: "Your Brand",
      visibilityScore: parsedData.overallScore, // Use overall score for the user bar
      sentiment: parsedData.brandSentiment,
      isUser: true
    });
  }
  
  // Sort by score descending
  competitors.sort((a, b) => b.visibilityScore - a.visibilityScore);
  // Limit to top 8
  competitors = competitors.slice(0, 8);


  // --- SHARE OF VOICE PROCESSING ---
  let shareOfVoice = parsedData.shareOfVoice || [];
  
  // If SoV is empty or malformed, calculate from competitor scores
  if (!shareOfVoice || shareOfVoice.length === 0) {
     const totalScore = competitors.reduce((sum, c) => sum + c.visibilityScore, 0) || 1;
     shareOfVoice = competitors.map(c => ({
       name: c.name,
       value: Math.round((c.visibilityScore / totalScore) * 100)
     }));
  }
  
  // Ensure user is marked in SoV if possible (by name matching)
  // Note: SoV schema structure is simple {name, value}, we don't pass 'isUser' here usually but we can rely on name.

  return {
    overallScore: parsedData.overallScore || 0,
    brandSentiment: parsedData.brandSentiment || "Neutral",
    brandMentions: parsedData.brandMentions || 0,
    topRankingKeywords: [{ keyword: keyword, rank: parsedData.rank > 0 ? parsedData.rank : 'Not Found' }],
    competitorAnalysis: competitors,
    recommendations: parsedData.recommendations || ["Focus on entity authority", "Improve structured data"],
    groundingSources: groundingSources,
    rawAnalysis: searchText,
    shareOfVoice: shareOfVoice,
    llmResponsePreview: parsedData.llmResponsePreview || "No preview available.",
    brandAttributes: parsedData.brandAttributes || []
  };
};
