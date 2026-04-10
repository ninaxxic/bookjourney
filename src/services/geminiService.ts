export async function getGeminiData(quote: string, source: string, author: string) {
  const response = await fetch("/api/gemini-service", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quote, source, author }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Gemini data");
  }

  return await response.json();
}