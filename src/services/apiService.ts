import { LiteraryQuoteGemini, Postcard } from '../types';

export async function getGeminiDataFromApi(quote: string, source: string, author: string): Promise<LiteraryQuoteGemini> {
  const response = await fetch('/api/ai/enrich-quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quote, source, author }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to enrich quote: ${response.status} ${text}`);
  }

  const payload = await response.json();
  return payload.data;
}

export async function collectPostcardToNotion(postcard: Postcard): Promise<void> {
  const response = await fetch('/api/collect-postcard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postcard),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to save postcard to Notion: ${response.status} ${text}`);
  }
}
