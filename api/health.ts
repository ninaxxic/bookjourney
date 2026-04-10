import { ApiRequest, ApiResponse, methodNotAllowed, setJson } from './_lib';

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (methodNotAllowed(req, res, ['GET'])) return;

  setJson(res, 200, {
    ok: true,
    service: 'bookjourney-api',
    time: new Date().toISOString(),
  });
}
