import { getRequestHeader, getRequestURL, proxyRequest, setHeader, setResponseStatus } from 'h3';
import type { H3Event } from 'h3';
import { fetch as nodeFetch } from 'node-fetch-native/node';

function proxyError(event: H3Event, status: number, code: string, message: string) {
  setResponseStatus(event, status);
  setHeader(event, 'cache-control', 'no-store');
  return { error: { code, message, fields: {} } };
}

export async function proxyApiRequest(event: H3Event, backendOrigin: string) {
  let origin: URL;
  try {
    origin = new URL(backendOrigin);
    if (![ 'http:', 'https:' ].includes(origin.protocol) || origin.username || origin.password ||
      origin.pathname !== '/' || origin.search || origin.hash) {
      throw new Error('Invalid backend origin');
    }
  } catch {
    return proxyError(event, 503, 'backend_not_configured', 'Сервис API не настроен.');
  }
  const requestUrl = getRequestURL(event);
  if (!requestUrl.pathname.startsWith('/api/')) {
    return proxyError(event, 400, 'invalid_path', 'Недопустимый путь API.');
  }
  try {
    return await proxyRequest(event, `${origin.origin}${requestUrl.pathname}${requestUrl.search}`, {

      // H3 already ships this Node transport; it preserves Host unlike native fetch.
      fetch: nodeFetch,
      headers: { host: getRequestHeader(event, 'host') ?? origin.host },
      fetchOptions: { redirect: 'manual' },
      sendStream: false,
      onResponse: () => setHeader(event, 'cache-control', 'no-store'),
    });
  } catch {
    if (event.node.res.headersSent) {
      event.node.res.destroy();
      return;
    }
    return proxyError(event, 502, 'backend_unavailable', 'Сервис API временно недоступен.');
  }
}
