
import { GoogleGenAI } from "@google/genai";

// Fixed: Correct initialization as per instructions using process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRepostCaption = async (originalDescription: string): Promise<string> => {
  try {
    // Fixed: Call generateContent directly using the initialized ai object.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `O usuário quer republicar um vídeo com esta descrição: "${originalDescription}". 
      Crie uma legenda de republicação curta, empolgante e com emojis em português.`,
    });
    // Fixed: Accessed .text property directly (not a method call).
    return response.text || 'Incrível! 🚀';
  } catch (error) {
    console.error('Erro no Gemini:', error);
    return 'Olha isso! 🔥 #vibestream';
  }
};

export const suggestComment = async (videoDescription: string): Promise<string> => {
  try {
    // Fixed: Call generateContent directly using the initialized ai object.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `O vídeo diz: "${videoDescription}". Sugira um comentário curto e amigável em português.`,
    });
    // Fixed: Accessed .text property directly.
    return response.text || 'Muito bom!';
  } catch (error) {
    return 'Incrível! ✨';
  }
};
