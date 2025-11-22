import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateGameAsset = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        // We can't set aspect ratio/size easily on flash-image in all envs yet, but defaults are usually square-ish
      }
    });

    // Iterate through parts to find image
    if (response.candidates && response.candidates.length > 0) {
        const parts = response.candidates[0].content.parts;
        for (const part of parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.error("Asset generation failed", error);
    // Fallback placeholder if API fails or quota exceeded
    return `https://picsum.photos/seed/${Math.random()}/300/300`;
  }
};
