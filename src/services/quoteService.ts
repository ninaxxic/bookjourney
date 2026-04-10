import { LiteraryQuoteCSV, LiteraryQuote } from '../types';

let QUOTES: Record<string, Array<LiteraryQuote>> = {};
let quotesLoaded: Promise<Record<string, Array<LiteraryQuote>>> | null = null;

async function ensureQuotesLoaded() {
  if (!quotesLoaded) {
    quotesLoaded = loadQuotesFromCSV('/data/clock_translated.csv');
  }
  return quotesLoaded;
}

/**
 * Load CSV and group rows by time (first column)
 */
async function loadQuotesFromCSV(csvUrl: string) {
  const response = await fetch(csvUrl);

  if (!response.ok) {
    throw new Error(`Failed to load CSV: ${response.status}`);
  }

  const text = await response.text();

  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const firstLine = lines[0]?.toLowerCase();
  const hasHeader = firstLine === 'time|timezone|quote_en|quote_zh|source|author|sfw';
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const result: Record<string, LiteraryQuoteCSV[]> = {};

  dataLines.forEach((line, index) => {
    const parts = line.split('|');

    if (parts.length < 6) {
      console.warn(`Skipping invalid row ${index + 1}`);
      return;
    }

    const [
      time,
      timezone,
      quote_en,
      quote_zh,
      source,
      author,
      sfw = '',
    ] = parts.map(v => v.trim());

    const row: LiteraryQuoteCSV = {
      time,
      timezone,
      quote_en,
      quote_zh,
      source,
      author,
      sfw,
    };

    if (!result[time]) {
      result[time] = [];
    }

    result[time].push(row);
  });

  QUOTES = Object.fromEntries(
    Object.entries(result).sort(([a], [b]) => a.localeCompare(b))
  ) as typeof QUOTES;

  return QUOTES;
}

export async function getTimeCSVQuote(): Promise<LiteraryQuoteCSV> {
  await ensureQuotesLoaded();

  const now = new Date();
  let currentIndex = now.getHours() * 60 + now.getMinutes();

  const indexToTime = (index: number) => {
    const h = Math.floor(index / 60);
    const m = index % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  for (let i = 0; i < 1440; i++) {
    const timeKey = indexToTime(currentIndex);
    const bucket = QUOTES?.[timeKey];

    if (bucket && bucket.length > 0) {
      const randomIndex = Math.floor(Math.random() * bucket.length);
      return bucket[randomIndex];
    }

    currentIndex = (currentIndex + 1) % 1440;
  }

  throw new Error('No quotes available in QUOTES dataset');
}
