import { ApiRequest, ApiResponse, methodNotAllowed, savePostcardToNotion, setJson } from './_lib';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (methodNotAllowed(req, res, ['POST'])) return;

  try {
    const payload = req.body as any;

    if (!payload?.username || !payload?.quote || !payload?.imageUrl || !payload?.capturedAt) {
      setJson(res, 400, {
        error: 'INVALID_REQUEST',
        message: 'username, imageUrl, capturedAt and quote are required',
      });
      return;
    }

    const created = await savePostcardToNotion(payload);
    setJson(res, 201, {
      ok: true,
      notionPageId: created?.id,
    });
  } catch (error) {
    console.error(error);
    setJson(res, 500, {
      error: 'NOTION_WRITE_FAILED',
      message: error instanceof Error ? error.message : 'Unknown server error',
    });
  }
}
