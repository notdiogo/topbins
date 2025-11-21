import { GoogleGenAI, Type } from "@google/genai";

// Get API key from Vite environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the client only if API key is available
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateTacticalBrief = async (opponentType: string, mood: string) => {
  // Check if API key is configured
  if (!ai) {
    throw new Error("Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }
  
  try {
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      You are PRECISION-OS, an advanced tactical AI system from a futuristic urban football underground.
      Analyze match variables and generate a high-velocity tactical directive.
      
      Input:
      - Opponent Type: "${opponentType}"
      - Squad Morale: "${mood}"
      
      Style Guidelines:
      - Tone: Robotic, aggressive, precise, motivational but technical.
      - Keywords: Override, Velocity, Zone-Lock, System, Impact.
      - Length: Under 80 words.
      
      Output specific data points:
      1. "strategy": The core directive text.
      2. "focusPoints": 3 extremely short (2-4 words) command phrases (e.g., "INITIATE HIGH PRESS", "LOCK ZONE 14").
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategy: {
              type: Type.STRING,
              description: "The tactical directive text."
            },
            focusPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 short command phrases."
            }
          },
          required: ["strategy", "focusPoints"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating briefing:", error);
    throw error;
  }
};