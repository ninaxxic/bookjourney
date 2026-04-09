import { createApi } from 'unsplash-js';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';

const unsplash = createApi({
  accessKey: UNSPLASH_ACCESS_KEY,
});

export async function fetchImageByKeywords(keywords: string[] | undefined): Promise<string> {
  const safeKeywords = keywords && keywords.length > 0 ? keywords : ['nature', 'landscape'];

  if (!UNSPLASH_ACCESS_KEY) {
    // Fallback to picsum with a random seed based on keywords
    const seed = safeKeywords.join('-').toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://picsum.photos/seed/${seed}/1200/800`;
  }

  try {
    // Pick a random keyword from the list to increase diversity
    const query = safeKeywords[Math.floor(Math.random() * safeKeywords.length)];
    
    const result = await unsplash.search.getPhotos({
      query,
      orientation: 'landscape',
      perPage: 1,
    });

    console.log({query, result});
    
    if (result.errors) {
      throw new Error(result.errors[0]);
    }

    if (result.response && result.response.results.length > 0) {
      return result.response.results[0].urls.regular;
    }
    
    return `https://picsum.photos/seed/${query}/1200/800`;
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    const fallbackQuery = safeKeywords[Math.floor(Math.random() * safeKeywords.length)];
    return `https://picsum.photos/seed/${fallbackQuery}/1200/800`;
  }
}
