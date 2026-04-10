import { createApi } from 'unsplash-js';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';

const unsplash = createApi({
  accessKey: UNSPLASH_ACCESS_KEY,
});

export default async function handler(req: any, res: any) {
  // Only allow POST (optional but recommended)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { keywords } = req.body;

    const safeKeywords =
      keywords && keywords.length > 0
        ? keywords
        : ['nature', 'landscape'];

    // Fallback if no API key
    if (!UNSPLASH_ACCESS_KEY) {
      const seed = safeKeywords
        .join('-')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

      return res.status(200).json({
        url: `https://picsum.photos/seed/${seed}/1200/800`,
        source: 'fallback-no-key',
      });
    }

    // Pick random keyword
    const query =
      safeKeywords[Math.floor(Math.random() * safeKeywords.length)];

    const result = await unsplash.search.getPhotos({
      query,
      orientation: 'landscape',
      perPage: 1,
    });

    if (result.errors) {
      throw new Error(result.errors[0]);
    }

    if (result.response && result.response.results.length > 0) {
      return res.status(200).json({
        url: result.response.results[0].urls.regular,
        source: 'unsplash',
        query,
      });
    }

    // fallback if no result
    return res.status(200).json({
      url: `https://picsum.photos/seed/${query}/1200/800`,
      source: 'fallback-no-result',
    });

  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);

    const fallbackQuery = 'fallback';

    return res.status(200).json({
      url: `https://picsum.photos/seed/${fallbackQuery}/1200/800`,
      source: 'fallback-error',
    });
  }
}