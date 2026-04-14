export async function pushToNotion(payload: {
  userName: string;
  time: string;
  timezone: string;
  capturedAtISO: string;
  quote_en: string;
  quote_zh: string;
  source: string;
  author: string;
  genre: string;
  keywords: string[];
  image: string;
}) {
  const response = await fetch("/api/notion-service", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Failed to push to Notion");
  }

  return data;
}
