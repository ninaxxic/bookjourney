import { GoogleGenAI, Type } from "@google/genai";

type LiteraryQuoteGemini = {
  keywords: string[];
  description: string;
  genre: string;
};

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
  }

  try {
    const { quote, source, author } = req.body ?? {};

    if (!quote || !source || !author) {
      return res.status(400).json({
        error: "Missing required fields: quote, source, author",
      });
    }

    const prompt = `According to this quote: "${quote}".
1. Extract 3-5 diverse and visually evocative keywords or short phrases (in English) that capture the visual scene, mood, or specific objects.
2. These keywords are for Unsplash image search. Do NOT just pick the first noun or obvious subject.
3. Include keywords that describe the atmosphere, lighting, or setting (e.g., "cinematic lighting", "misty morning", "ethereal forest").
4. Ensure the keywords are varied to produce diverse results.
5. Provide a brief description of the book "${source}" by ${author} (in Traditional Chinese) and its genre (in Traditional Chinese).`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            description: { type: Type.STRING },
            genre: { type: Type.STRING },
          },
          required: ["keywords", "description", "genre"],
        },
      },
    });

    const data = JSON.parse(String(response.text)) as LiteraryQuoteGemini;

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching Gemini data:", error);
    return res.status(500).json({
      error: "Failed to generate Gemini data",
    });
  }
}