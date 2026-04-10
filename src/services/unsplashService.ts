export async function fetchImageByKeywords(keywords: string[] | undefined): Promise<string> {

const response = await fetch('/api/unsplash-service', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    keywords: keywords,
  }),
});

  if (!response.ok) {
    throw new Error("Failed to fetch Gemini data");
  }

const { url } = await response.json()

return url;
}
