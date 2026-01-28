
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Get initial skill recommendations (JSON mode)
 */
export async function getSkillRecommendations(currentSkills: string[], goalSkills: string[]) {
  const prompt = `Based on my current skills: ${currentSkills.join(', ')} and my learning goals: ${goalSkills.join(', ')}, provide 3 concrete learning paths and specific resources.`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedTime: { type: Type.STRING },
          },
          required: ["title", "description", "estimatedTime"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}

/**
 * Start a teaching conversation with Gemini
 */
export function createSkillMentorChat(userSkills: string[], targetSkills: string[]) {
  const systemInstruction = `You are the SkillX AI Mentor. 
  The user knows: ${userSkills.join(', ')}. 
  The user wants to learn: ${targetSkills.join(', ')}.
  Your goal is to be a supportive teacher. Explain complex topics simply, provide small exercises, and answer questions. 
  Keep responses concise and formatted with markdown for clarity.`;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
    },
  });
}
