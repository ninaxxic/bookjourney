const TAIPEI_TIMEZONE = "Asia/Taipei";

function formatTaipeiDateTime(capturedAtISO: string) {
  const sourceDate = new Date(capturedAtISO);
  if (Number.isNaN(sourceDate.getTime())) {
    throw new Error("Invalid capturedAtISO");
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TAIPEI_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(sourceDate);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  ) as Record<string, string>;

  const year = values.year;
  const month = values.month;
  const day = values.day;
  const hour = values.hour;
  const minute = values.minute;
  const second = values.second;

  return {
    timeTaipei: `${hour}:${minute}`,
    capturedAtTaipeiISO: `${year}-${month}-${day}T${hour}:${minute}:${second}+08:00`,
  };
}

const NOTION_API_KEY = process.env.NOTION_API_KEY || "";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

type NotionServiceBody = {
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
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }


  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    return res.status(500).json({
      error: "Missing NOTION_API_KEY or NOTION_DATABASE_ID",
    });
  }


  try {
    const {
      userName,
      capturedAtISO,
      quote_en,
      quote_zh,
      source,
      author,
      genre,
      keywords,
      image,
    } = (req.body ?? {}) as NotionServiceBody;

    if (
      !userName ||
      !capturedAtISO ||
      !quote_en ||
      !quote_zh ||
      !source ||
      !author ||
      !genre ||
      !image
    ) {
      return res.status(400).json({
        error:
          "Missing required fields: userName, capturedAtISO, quote_en, quote_zh, source, author, genre, image",
      });
    }



    if (!Array.isArray(keywords)) {
      return res.status(400).json({
        error: "keywords must be an array of strings",
      });
    }

    const { timeTaipei, capturedAtTaipeiISO } = formatTaipeiDateTime(capturedAtISO);


    const notionResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: {
          database_id: NOTION_DATABASE_ID,
        },
        properties: {
          // Assumes quote_en is the Title property in Notion
          quote_en: {
            rich_text: [
              {
                text: {
                  content: quote_en,
                },
              },
            ],
          },
          userName: {
            title: [
              {
                text: {
                  content: userName,
                },
              },
            ],
          },
          time: {
            rich_text: [
              {
                text: {
                  content: timeTaipei,
                },
              },
            ],
          },
          timezone: {
            rich_text: [
              {
                text: {
                  content: TAIPEI_TIMEZONE,
                },
              },
            ],
          },
          capturedAtTaipei: {
            date: {
              start: capturedAtTaipeiISO,
            },
          },
          quote_zh: {
            rich_text: [
              {
                text: {
                  content: quote_zh,
                },
              },
            ],
          },
          source: {
            rich_text: [
              {
                text: {
                  content: source,
                },
              },
            ],
          },
          author: {
            rich_text: [
              {
                text: {
                  content: author,
                },
              },
            ],
          },
          genre: {
            rich_text: [
              {
                text: {
                  content: genre,
                },
              },
            ],
          },
          keywords: {
            multi_select: keywords
              .filter((k) => typeof k === "string" && k.trim().length > 0)
              .map((k) => ({ name: k.trim() })),
          },
          image: {
            url: image,
          },
        },
      }),
    });

    const notionData = await notionResponse.json();

    if (!notionResponse.ok) {
      console.error("Notion API error:", notionData);
      return res.status(notionResponse.status).json({
        error: "Failed to create Notion page",
        details: notionData,
      });
    }

    return res.status(200).json({
      success: true,
      pageId: notionData.id,
      notion: notionData,
    });
  } catch (error) {
    console.error("Error in notion-service:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
