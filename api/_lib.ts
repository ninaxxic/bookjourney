export type ApiRequest = {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
};

export type ApiResponse = {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => ApiResponse;
  send: (body: string) => void;
};

export function setJson(res: ApiResponse, statusCode: number, payload: unknown) {
  res.status(statusCode).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(payload));
}

export function methodNotAllowed(req: ApiRequest, res: ApiResponse, allowed: string[]) {
  if (!allowed.includes(req.method || '')) {
    setJson(res, 405, { error: `Method ${req.method} Not Allowed` });
    return true;
  }
  return false;
}

const NOTION_VERSION = process.env.NOTION_API_VERSION || '2022-06-28';

function asRichText(content: string) {
  return [{ text: { content } }];
}

function parseMinuteIndex(time: string): number {
  const [h, m] = time.split(':').map((v) => Number(v));
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return Math.max(0, Math.min(1439, h * 60 + m));
}

export type PostcardPayload = {
  username: string;
  imageUrl: string;
  capturedAt: string;
  quote: {
    time: string;
    timezone?: string;
    quote_en: string;
    quote_zh: string;
    source: string;
    author: string;
    genre?: string;
    keywords?: string[];
  };
};

export async function savePostcardToNotion(payload: PostcardPayload) {
  const token = process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) {
    throw new Error('Missing NOTION_API_KEY or NOTION_DATABASE_ID');
  }

  const time = payload.quote.time || payload.capturedAt.slice(0, 5);
  const minuteIndex = parseMinuteIndex(time);
  const timezone = payload.quote.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const notionPayload = {
    parent: { database_id: databaseId },
    properties: {
      UserName: { rich_text: asRichText(payload.username) },
      Time: { title: asRichText(time) },
      MinuteIndex: { number: minuteIndex },
      Timezone: { rich_text: asRichText(timezone) },
      QuoteEN: { rich_text: asRichText(payload.quote.quote_en) },
      QuoteZH: { rich_text: asRichText(payload.quote.quote_zh) },
      Source: { rich_text: asRichText(payload.quote.source) },
      Author: { rich_text: asRichText(payload.quote.author) },
      GenreZH: { rich_text: asRichText(payload.quote.genre || '') },
      ImageKeywords: {
        multi_select: (payload.quote.keywords || []).slice(0, 20).map((name) => ({ name: String(name).slice(0, 100) })),
      },
      ImageURL: { url: payload.imageUrl || null },
    },
  };

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notionPayload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Notion create failed (${response.status}): ${text}`);
  }

  return response.json();
}
