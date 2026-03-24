import { GoogleGenAI, Type } from "@google/genai";
import { Paper, Note, Doc } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async semanticSearch(query: string): Promise<Partial<Paper>[]> {
    const model = genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for scientific papers related to: "${query}". Return a JSON array of papers with title, authors (array), year, abstract, and DOI.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              authors: { type: Type.ARRAY, items: { type: Type.STRING } },
              year: { type: Type.NUMBER },
              abstract: { type: Type.STRING },
              doi: { type: Type.STRING }
            },
            required: ["title", "authors", "year", "abstract"]
          }
        }
      }
    });

    const response = await model;
    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Failed to parse search results", e);
      return [];
    }
  },

  async summarizePaper(paper: Paper): Promise<string> {
    const model = genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the following paper:
      Title: ${paper.title}
      Abstract: ${paper.abstract}
      
      Provide a concise summary including:
      - Main Conclusion
      - Methodology
      - Key Values/Results`,
    });

    const response = await model;
    return response.text || "Summary unavailable.";
  },

  async answerFromKnowledgeBase(query: string, context: (Paper | Note | Doc)[]): Promise<{ answer: string; citations: string[] }> {
    const contextText = context.map(item => {
      const title = (item as any).title;
      if ('abstract' in item) {
        return `[Paper: ${title}] ${item.abstract}`;
      } else if ('content' in item && 'createdAt' in item) {
        return `[Note: ${title}] ${item.content}`;
      } else if ('content' in item && 'addedAt' in item) {
        return `[Document: ${title}] ${item.content}`;
      } else {
        return `[Source: ${title}]`;
      }
    }).join("\n\n");

    const model = genAI.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `You are a research assistant. Answer the following question based ONLY on the provided context. 
      If the answer is not in the context, say you don't know.
      Cite your sources using [Paper: Title], [Note: Title], or [Document: Title].
      
      Context:
      ${contextText}
      
      Question: ${query}`,
    });

    const response = await model;
    const answer = response.text || "I couldn't find an answer in the knowledge base.";
    
    // Simple citation extraction
    const citations = context
      .filter(item => answer.includes((item as any).title))
      .map(item => item.id);

    return { answer, citations };
  },

  async generateCode(task: string): Promise<string> {
    const model = genAI.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Write a Python script to perform the following research task: ${task}. 
      Include comments explaining the code. Return ONLY the code block.`,
    });

    const response = await model;
    return response.text || "# Failed to generate code";
  },

  async findCitations(paper: Paper): Promise<{ citations: Partial<Paper>[], citedBy: Partial<Paper>[] }> {
    const model = genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `For the following research paper, find 3 papers it likely cites and 3 papers that likely cite it. 
      Return a JSON object with two arrays: "citations" and "citedBy". 
      Each paper should have title, authors (array), year, abstract, and DOI.
      
      Paper Title: ${paper.title}
      Abstract: ${paper.abstract}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            citations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  authors: { type: Type.ARRAY, items: { type: Type.STRING } },
                  year: { type: Type.NUMBER },
                  abstract: { type: Type.STRING },
                  doi: { type: Type.STRING }
                },
                required: ["title", "authors", "year", "abstract"]
              }
            },
            citedBy: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  authors: { type: Type.ARRAY, items: { type: Type.STRING } },
                  year: { type: Type.NUMBER },
                  abstract: { type: Type.STRING },
                  doi: { type: Type.STRING }
                },
                required: ["title", "authors", "year", "abstract"]
              }
            }
          }
        }
      }
    });

    const response = await model;
    try {
      return JSON.parse(response.text || '{"citations": [], "citedBy": []}');
    } catch (e) {
      console.error("Failed to parse citation results", e);
      return { citations: [], citedBy: [] };
    }
  }
};
