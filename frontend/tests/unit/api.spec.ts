import { afterAll, beforeAll, expect, it } from 'vitest';
import { ofetch } from 'ofetch';
import { createApp, defineEventHandler, toNodeListener } from 'h3';
import { createApiClient } from '../../app/utils/apiClient';
import { proxyApiRequest } from '../../server/utils/apiProxy';
import { startServer } from './http';

let backend: Awaited<ReturnType<typeof startServer>>;
let proxy: Awaited<ReturnType<typeof startServer>>;
let hits = 0;

beforeAll(async() => {
  backend = await startServer(async(req, res) => {
    hits++;
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    res.writeHead(201, {
      'content-type': 'application/json',
      'set-cookie': [ 'sessionid=example; Path=/; HttpOnly', 'csrftoken=token; Path=/' ],
    });
    res.end(JSON.stringify({ data: {
      url: req.url,
      host: req.headers.host,
      cookie: req.headers.cookie,
      csrf: req.headers['x-csrftoken'],
      body: Buffer.concat(chunks).toString(),
    } }));
  });
  const app = createApp();
  app.use(defineEventHandler(event => proxyApiRequest(event, backend.origin)));
  proxy = await startServer(toNodeListener(app));
});

afterAll(async() => {
  await proxy?.close();
  await backend?.close();
});

it('requires CSRF and reads its current value for each mutation', async() => {
  let token: string | undefined;
  const api = createApiClient(ofetch.create({ baseURL: proxy.origin }), () => token);
  const previousHits = hits;
  expect(await api.post('echo/')).toMatchObject({ ok: false, error: { code: 'csrf_missing' } });
  expect(hits).toBe(previousHits);
  token = 'first-token';
  expect(await api.post('echo/')).toMatchObject({ ok: true, status: 201, data: { csrf: token } });
  token = 'rotated-token';
  expect(await api.post('echo/')).toMatchObject({ ok: true, data: { csrf: token } });
});

it('proxies query, body, cookies, status and separate Set-Cookie headers', async() => {
  const response = await fetch(`${proxy.origin}/api/v1/echo/?page=2`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', cookie: 'sessionid=current', 'x-csrftoken': 'current' },
    body: JSON.stringify({ name: 'Анна' }),
  });
  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ data: {
    url: '/api/v1/echo/?page=2',
    host: new URL(proxy.origin).host,
    cookie: 'sessionid=current',
    csrf: 'current',
    body: '{"name":"Анна"}',
  } });
  expect(response.headers.getSetCookie()).toHaveLength(2);
});
