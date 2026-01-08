
import { GoogleGenAI } from "@google/genai";

// A chave será lida automaticamente do ambiente (process.env.API_KEY)
// Certifique-se de configurar a variável de ambiente no seu provedor de hospedagem.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateRepostCaption = async (originalDescription: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `O usuário quer republicar um vídeo com esta descrição: "${originalDescription}". 
      Crie uma legenda de republicação curta, empolgante e com emojis em português.`,
    });
    return response.text || 'Incrível! 🚀';
  } catch (error) {
    console.error('Erro no Gemini:', error);
    return 'Olha isso! 🔥 #vibestream';
  }
};

export const suggestComment = async (videoDescription: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `O vídeo diz: "${videoDescription}". Sugira um comentário curto e amigável em português.`,
    });
    return response.text || 'Muito bom!';
  } catch (error) {
    return 'Incrível! ✨';
  }
};
