import { LiteraryQuoteCSV, LiteraryQuote } from '../types';

// Global variable
let QUOTES: Record<string, Array<LiteraryQuote>> = {};
await loadQuotesFromCSV("/data/clock_translated.csv");

/**
 * Load CSV and group rows by time (first column)
 */
async function loadQuotesFromCSV(csvUrl:string) {
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
  const hasHeader = firstLine === "time|timezone|quote_en|quote_zh|source|author|sfw";
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const result = {};

  dataLines.forEach((line, index) => {
    const parts = line.split("|");

    if (parts.length < 7) {
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
      sfw,
    ] = parts.map(v => v.trim());

    const row:LiteraryQuoteCSV = {
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

  // Optional: sort keys (important if you iterate later)
  QUOTES = Object.fromEntries(
    Object.entries(result).sort(([a], [b]) => a.localeCompare(b))
  ) as typeof QUOTES;

  return QUOTES;
}

export async function getTimeCSVQuote(): Promise<LiteraryQuoteCSV> {
  const now = new Date();

  // Convert current time to minutes index (0–1439)
  let currentIndex = now.getHours() * 60 + now.getMinutes();

  // Helper: index → "HH:MM"
  const indexToTime = (index: number) => {
    const h = Math.floor(index / 60);
    const m = index % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // Loop max 1440 times (full day safety)
  for (let i = 0; i < 1440; i++) {
    const timeKey = indexToTime(currentIndex);
    const bucket = QUOTES?.[timeKey];

    if (bucket && bucket.length > 0) {
      const randomIndex = Math.floor(Math.random() * bucket.length);
      const quote = bucket[randomIndex];
      return quote;
    }

    // Move to next minute (wrap around 24h)
    currentIndex = (currentIndex + 1) % 1440;
  }

  // Fallback (no quotes at all)
  throw new Error("No quotes available in QUOTES dataset");
}