
import { GoogleGenAI, Type } from "@google/genai";
import { AuditRequest, AuditResult, CompetitorData, LlmTxtRequest, ContentOptimizationRequest, ContentOptimizationResult } from "../types";

// Helper to clean URL for comparison
const cleanUrl = (url: string) => {
  try {
    const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return hostname.replace('www.', '');
  } catch (e) {
    return url.toLowerCase();
  }
};

export const generateLlmTxtContent = async (req: LlmTxtRequest): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Act as a Web Standards Expert specialized in AI interoperability.
    Create a "llms.txt" file content for the following website:
    
    Website Name: ${req.websiteName}
    URL: ${req.url}
    Description: ${req.description}
    Key Pages/Routes: ${req.keyPages.join(', ')}

    Strictly follow these "Things to Consider" for llms.txt creation:
    1. Use simple and clear Markdown format.
    2. Include only important content; avoid unnecessary details.
    3. ABSOLUTELY NO HTML or JavaScript structures. Pure Markdown only.
    4. Provide up-to-date and descriptive information.
    5. Present secondary content (like social links or minor pages) in a separate "Optional" section.
    6. Ensure the tone is objective and machine-readable.

    Structure the file with these headers:
    # ${req.websiteName}
    > [Short Summary]
    
    ## Main Content
    - [Link Name](URL): [Brief description of what the AI will find here]

    ## Optional / Secondary
    - [Link Name](URL)

    Do not include any conversational text before or after the file content. Return ONLY the markdown content.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || "Failed to generate content.";
};

export const optimizeContent = async (req: ContentOptimizationRequest): Promise<ContentOptimizationResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    Act as a RAG (Retrieval-Augmented Generation) Knowledge Engineer.
    
    Task: Analyze the provided website content and optimize it for AI interpretability.
    Content Type: ${req.type}
    
    Raw Content:
    """
    ${req.content}
    """

    Analysis Criteria:
    1. AI Readability Score: How easily can an LLM parse the entities and relationships? (0-100)
    2. Fact Density: The ratio of verifiable facts vs. marketing fluff. (0-100)
    3. Hallucination Risk: Does the text use vague metaphors that might confuse an AI? (Low/Medium/High)
    4. Identified Issues: List specific problems (e.g., "Ambiguous 'It' reference", "Buried pricing data").

    Optimization Goal:
    Rewrite the content into a "RAG-Ready" format.
    - Use clear, hierarchical Markdown headers.
    - Convert paragraphs into bulleted lists where possible.
    - Make "Entity: Attribute" relationships explicit.
    - Remove subjective marketing fluff, keep the facts.
    - Ensure unique value propositions are stated as definitive claims.

    Return the result in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          aiReadabilityScore: { type: Type.INTEGER, description: "Score 0-100" },
          factDensity: { type: Type.INTEGER, description: "Score 0-100" },
          hallucinationRisk: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          identifiedIssues: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          optimizedContent: { type: Type.STRING, description: "The rewritten markdown content" }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Failed to optimize content.");

  return JSON.parse(text) as ContentOptimizationResult;
};

export const analyzeVisibility = async (request: AuditRequest): Promise<AuditResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });
  const userDomain = cleanUrl(request.url);

  // Check if a specific keyword was provided
  const providedKeyword = request.keywords[0]?.trim();
  const isAutoAudit = !providedKeyword;
  
  // 1. Check Ranking & Visibility using Search Grounding
  let searchPrompt = '';
  
  if (isAutoAudit) {
    searchPrompt = `
      Act as an expert SEO Auditor and Competitive Analyst.
      I need to analyze the website: "${request.url}" (Domain: ${userDomain}).
      
      Task 1: Identify the primary industry and the SINGLE most important "Target Keyword" this site should rank for.
      Task 2: Search for the top ranking websites for that identified keyword.
      Task 3: Specifically search for "${userDomain}" to see where it ranks for that keyword. Does it appear on the first page?
      Task 4: List the top 5 direct competitors and their estimated strengths.
      
      Output the top results and a comparative analysis of ${userDomain} vs the market leaders.
    `;
  } else {
    searchPrompt = `
      Act as an expert SEO Auditor.
      Target Keyword: "${providedKeyword}"
      Target Website: "${request.url}" (Domain: ${userDomain})

      Task 1: Search for "${providedKeyword}" and list the top 10 ranking websites/entities.
      Task 2: Specifically check if "${userDomain}" appears in the search results for this keyword.
      Task 3: If "${userDomain}" is found, note its rank (e.g., 1st, 5th, 15th) and sentiment. If not found in the top 10, specifically search for "${userDomain} ${providedKeyword}" to find its relevance.
      Task 4: Identify the main competitors dominating this keyword.
    `;
  }

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
    You are an LLM Visibility Scoring Engine.
    
    Target Website: ${request.url} (Domain: ${userDomain})
    Provided Keyword: ${providedKeyword || "None (Auto-detect requested)"}
    
    Context from Search:
    ${searchText}
    
    Sources Found:
    ${JSON.stringify(groundingSources)}

    Task:
    Analyze the provided context to determine how visible the Target Website is.
    ${isAutoAudit ? "Determine the PRIMARY identified keyword from the context and audit against that." : `Audit against the keyword: "${providedKeyword}"`}
    
    CRITICAL INSTRUCTION FOR COMPETITORS:
    - You MUST create a list of competitors based on the search results.
    - You MUST include the Target Website (${userDomain}) in this list as one of the entries.
    - If the Target Website was not in the top results, add it to the list with a realistic, low Visibility Score (e.g., 5-30) and mark its name clearly as "${userDomain}" or "Your Brand".
    - If it was in the top results, give it a high score (80-100) based on rank.
    
    CRITICAL INSTRUCTION FOR CITATIONS:
    - Review the "Sources Found" list. 
    - Only include sources in "groundingSources" if the text content implies the Target Website is mentioned or linked there.
    - Filter out generic search directories if they don't contain specific info about the brand.

    CRITICAL INSTRUCTION FOR RECOMMENDATIONS:
    - Provide 4-6 specific optimization recommendations.
    - Assign a PRIORITY (High, Medium, Low) to each recommendation based on its potential impact on visibility and effort required.
    - High: Critical issues (e.g., missing schema, poor authority).
    - Medium: Important improvements (e.g., content depth).
    - Low: Nice-to-haves.

    Visibility Score Rubric:
    - Rank 1-3: 90-100
    - Rank 4-10: 70-89
    - Page 2 / Mentioned: 40-69
    - Not Found / Irrelevant: 0-39

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
          primaryKeyword: { type: Type.STRING, description: "The main keyword used for this audit" },
          overallScore: { type: Type.INTEGER, description: "Score for the target website (0-100)" },
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
            items: {
               type: Type.OBJECT,
               properties: {
                 text: { type: Type.STRING, description: "The recommendation description" },
                 priority: { type: Type.STRING, enum: ["High", "Medium", "Low"], description: "Priority level" }
               }
            }
          },
          groundingSources: {
            type: Type.ARRAY,
            items: {
               type: Type.OBJECT,
               properties: {
                 title: { type: Type.STRING },
                 uri: { type: Type.STRING }
               }
            }
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
          brandAttributes: { type: Type.ARRAY, items: { type: Type.STRING } },
          discoveredKeywords: {
            type: Type.ARRAY,
            items: {
               type: Type.OBJECT,
               properties: {
                 keyword: { type: Type.STRING },
                 relevance: { type: Type.STRING, description: "High, Medium, or Low" }
               }
            }
          }
        }
      }
    }
  });

  const jsonText = analysisResponse.text;
  if (!jsonText) throw new Error("Failed to generate analysis");

  const parsedData = JSON.parse(jsonText);

  // --- COMPETITOR LIST PROCESSING ---
  let competitors: CompetitorData[] = parsedData.competitors || [];
  
  // Clean up competitor names and try to find the user
  competitors = competitors.map(c => ({
    ...c,
    name: c.name.replace(/https?:\/\/(www\.)?/, '').split('/')[0] // Simplify URLs to names
  }));

  // Find user in list using multiple possible matching strategies
  const userIndex = competitors.findIndex(c => 
    c.name.toLowerCase().includes(userDomain.toLowerCase()) || 
    userDomain.toLowerCase().includes(c.name.toLowerCase()) ||
    c.name.toLowerCase() === "your brand" ||
    c.name.toLowerCase().includes("target website")
  );

  let userEntry: CompetitorData;

  if (userIndex !== -1) {
    // User exists in list, mark it
    competitors[userIndex].isUser = true;
    if (competitors[userIndex].name.toLowerCase() === "your brand" || competitors[userIndex].name.includes("target")) {
        competitors[userIndex].name = "Your Brand"; 
    }
    userEntry = competitors[userIndex];
  } else {
    // User missing, create explicit entry
    userEntry = {
      name: "Your Brand",
      visibilityScore: parsedData.overallScore, 
      sentiment: parsedData.brandSentiment,
      isUser: true
    };
    competitors.push(userEntry);
  }
  
  // Sort by score descending
  competitors.sort((a, b) => b.visibilityScore - a.visibilityScore);
  
  // LOGIC TO KEEP USER VISIBLE:
  // We want top 8, but if User is #15, we want Top 7 + User.
  const finalCompetitors: CompetitorData[] = [];
  const topSlice = competitors.slice(0, 8);
  const userInTopSlice = topSlice.some(c => c.isUser);

  if (userInTopSlice) {
    // Standard case: User is already high ranking
    competitors = topSlice;
  } else {
    // Edge case: User is ranked low. Take top 7 and append user.
    competitors = competitors.slice(0, 7);
    competitors.push(userEntry);
    // Sort again just in case, though likely user is last
    competitors.sort((a, b) => b.visibilityScore - a.visibilityScore);
  }

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

  return {
    overallScore: parsedData.overallScore || 0,
    brandSentiment: parsedData.brandSentiment || "Neutral",
    brandMentions: parsedData.brandMentions || 0,
    topRankingKeywords: [{ keyword: parsedData.primaryKeyword || providedKeyword || "Unknown", rank: parsedData.rank > 0 ? parsedData.rank : 'Not Found' }],
    competitorAnalysis: competitors,
    recommendations: parsedData.recommendations || [], // Now returns objects
    groundingSources: parsedData.groundingSources || [],
    rawAnalysis: searchText,
    shareOfVoice: shareOfVoice,
    llmResponsePreview: parsedData.llmResponsePreview || "No preview available.",
    brandAttributes: parsedData.brandAttributes || [],
    discoveredKeywords: parsedData.discoveredKeywords || []
  };
};
