import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface WasteAnalysis {
  item: string;
  category: string;
  estimatedWeight: string;
  reasonForWaste: string;
  reductionTip: string;
  impactScore: number; // 0-100
}

export async function analyzeWasteImage(base64Image: string): Promise<WasteAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze this image of food waste. Identify the main food item being wasted, its category (Produce, Dairy, Meat, Bakery, Other), estimated weight in grams, likely reason for waste, a tip to reduce this waste in the future, and an environmental impact score from 0-100 (100 being highest impact).
  
  Return the result in JSON format with the following keys:
  item, category, estimatedWeight, reasonForWaste, reductionTip, impactScore`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: base64Image } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function getOptimizationSuggestions(wasteHistory: WasteAnalysis[]): Promise<string[]> {
  const model = "gemini-3-flash-preview";
  const historyText = wasteHistory.map(w => `${w.item} (${w.category}): ${w.reasonForWaste}`).join(", ");
  
  const prompt = `Based on this food waste history: ${historyText}. 
  Provide 3 specific, actionable "Scripted Logic" optimization suggestions for a smart shopping list to reduce future waste. 
  Focus on quantity adjustments, storage improvements, and substitution ideas.
  Return as a JSON array of strings.`;

  const response = await ai.models.generateContent({
    model,
    contents: historyText,
    config: {
      systemInstruction: prompt,
      responseMimeType: "application/json"
    }
  });

  return JSON.parse(response.text || "[]");
}
