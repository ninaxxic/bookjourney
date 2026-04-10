import { GoogleGenAI, Type } from '@google/genai';
import { ApiRequest, ApiResponse, methodNotAllowed, setJson } from '../_lib';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (methodNotAllowed(req, res, ['POST'])) return;

  try {
    const { quote, source, author } = (req.body || {}) as {
      quote?: string;
      source?: string;
      author?: string;
    };

    if (!quote || !source || !author) {
      setJson(res, 400, {
        error: 'INVALID_REQUEST',
        message: 'quote, source, and author are required',
      });
      return;
    }

    const prompt = `According to this quote: "${quote}".
1. Extract 3-5 diverse and visually evocative keywords or short phrases (in English) that capture the visual scene, mood, or specific objects.
2. These keywords are for Unsplash image search. Do NOT just pick the first noun or obvious subject.
3. Include keywords that describe the atmosphere, lighting, or setting (e.g., "cinematic lighting", "misty morning", "ethereal forest").
4. Ensure the keywords are varied to produce diverse results.
5. Provide a brief description of the book "${source}" by ${author} (in Traditional Chinese) and its genre (in Traditional Chinese).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
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
          required: ['keywords', 'description', 'genre'],
        },
      },
    });

    setJson(res, 200, { data: JSON.parse(response.text) });
  } catch (error) {
    console.error(error);
    setJson(res, 500, {
      error: 'GEMINI_FAILED',
      message: error instanceof Error ? error.message : 'Unknown server error',
    });
  }
}
