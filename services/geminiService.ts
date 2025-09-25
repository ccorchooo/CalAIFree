import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { MealAnalysis } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const mealAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    mealName: {
      type: Type.STRING,
      description: "A short, descriptive name for the meal (e.g., 'Spaghetti Bolognese', 'Avocado Toast with Egg')."
    },
    ingredients: {
      type: Type.ARRAY,
      description: "A list of the main ingredients identified in the meal.",
      items: { type: Type.STRING }
    },
    calories: {
      type: Type.INTEGER,
      description: "An estimated total calorie count for the meal. Provide a single integer value."
    },
    macros: {
      type: Type.OBJECT,
      description: "An estimated breakdown of macronutrients in grams.",
      properties: {
        protein: { type: Type.INTEGER, description: "Estimated protein in grams." },
        carbs: { type: Type.INTEGER, description: "Estimated carbohydrates in grams." },
        fats: { type: Type.INTEGER, description: "Estimated fats in grams." },
      },
      required: ["protein", "carbs", "fats"]
    },
    healthScore: {
        type: Type.INTEGER,
        description: "A health score for the meal on a scale of 1 to 10, where 1 is least healthy and 10 is most healthy."
    },
    reasoning: {
        type: Type.STRING,
        description: "A brief, one-sentence explanation of how the calorie estimate and health score were derived based on the visible ingredients and portion size."
    }
  },
  required: ["mealName", "ingredients", "calories", "macros", "healthScore", "reasoning"],
};

export const analyzeMealImage = async (imageDataUrl: string): Promise<MealAnalysis> => {
  const base64Data = imageDataUrl.split(',')[1];
  
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Data,
    },
  };

  const textPart = {
    text: "Analyze this image of a meal. Identify the meal, its primary ingredients, and estimate the total calorie count. Also provide an estimated breakdown of macronutrients (protein, carbs, fats) in grams, and a health score from 1-10. Provide your reasoning for the estimates."
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: mealAnalysisSchema,
      }
    });

    const jsonText = response.text.trim();
    const analysisResult: MealAnalysis = JSON.parse(jsonText);
    
    if (!analysisResult.macros || typeof analysisResult.macros.protein !== 'number') {
        throw new Error("Invalid response format from API: macros are missing or incorrect.");
    }

    return analysisResult;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof SyntaxError) {
      console.error("Failed to parse JSON response:", error);
      throw new Error("Received an invalid response from the analysis service.");
    }
    throw new Error("Failed to get analysis from Gemini API.");
  }
};

export const startChatSession = (): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are Cal AI, a friendly and knowledgeable nutrition assistant. You can answer questions about food, health, and diet. You can also provide recipe ideas and help users understand their nutritional data. Keep your answers encouraging, concise, and easy to understand. Use emojis where appropriate to maintain a friendly tone.',
    },
  });
  return chat;
};