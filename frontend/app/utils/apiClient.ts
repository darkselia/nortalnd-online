import type { ApiError, ApiErrorKind, ApiMethod, ApiPagination, ApiRequestOptions, ApiResult } from '../types/api';
import type { FetchOptions } from 'ofetch';

type ApiFetch = (
  path: string,
  options: FetchOptions & { method: ApiMethod, headers: Record<string, string> },
) => Promise<unknown>;

function failure(kind: ApiErrorKind, code: string, message: string, status: number | null = null) {
  return { ok: false as const, status, error: { kind, code, message, fields: {} } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function apiPath(path: string): string | null {
  try {
    const decoded = decodeURIComponent(path);
    if (!path || decoded.startsWith('/') || /[\s\\?#:]/.test(decoded) ||
      decoded.split('/').some(segment => segment === '.' || segment === '..')) return null;
    return `/api/v1/${path}`;
  } catch {
    return null;
  }
}

function httpError(status: number, body: unknown) {
  const result = failure('http', 'http_error', 'Не удалось выполнить запрос.', status);
  const error = isRecord(body) && isRecord(body.error) ? body.error : undefined;
  if (typeof error?.code === 'string') result.error.code = error.code;
  if (status < 500) {
    if (typeof error?.message === 'string') result.error.message = error.message;
    if (isRecord(error?.fields)) result.error.fields = error.fields as ApiError['fields'];
  }
  return result;
}

function responseResult<T>(status: number, body: unknown): ApiResult<T> {
  if (status < 200 || status >= 300) return httpError(status, body);
  if (status === 204) return { ok: true, status, data: null };
  if (!isRecord(body) || !Object.hasOwn(body, 'data')) {
    return failure('invalid_response', 'invalid_response', 'Сервер вернул ответ неизвестного формата.', status);
  }
  return {
    ok: true,
    status,
    data: body.data as T,
    ...isRecord(body.pagination) ? { pagination: body.pagination as unknown as ApiPagination } : {},
  };
}

function requestHeaders(options: ApiRequestOptions, csrfToken?: string) {
  const headers = new Headers(options.headers);
  headers.set('accept', 'application/json');
  if (csrfToken) headers.set('x-csrftoken', csrfToken);
  if (options.body instanceof FormData) headers.delete('content-type');
  return Object.fromEntries(headers);
}

function requestError(status: number | null, signal?: AbortSignal) {
  if (signal?.aborted) return failure('aborted', 'request_aborted', 'Запрос отменён.');
  if (status !== null) {
    return failure('invalid_response', 'invalid_response', 'Сервер вернул ответ неизвестного формата.', status);
  }
  return failure('network', 'network_error', 'Не удалось связаться с сервером. Проверьте соединение.');
}

async function sendRequest<T>(
  fetcher: ApiFetch,
  url: string,
  options: ApiRequestOptions & { method: ApiMethod },
  csrfToken?: string,
): Promise<ApiResult<T>> {
  let status: number | null = null;
  try {
    const body = await fetcher(url, {
      ...options,
      headers: requestHeaders(options, csrfToken),
      retry: 0,
      redirect: 'error',
      credentials: 'same-origin',
      cache: 'no-store',
      responseType: 'json',
      ignoreResponseError: true,
      onResponse: ({ response }) => { status = response.status; },
    });
    return status === null
      ? failure('invalid_response', 'invalid_response', 'Сервер вернул ответ неизвестного формата.')
      : responseResult<T>(status, body);
  } catch {
    return requestError(status, options.signal);
  }
}

export async function requestApi<T = unknown>(
  fetcher: ApiFetch,
  path: string,
  options: ApiRequestOptions = {},
  readCsrfToken: () => string | undefined = () => undefined,
): Promise<ApiResult<T>> {
  const url = apiPath(path);
  if (!url) return failure('invalid_request', 'invalid_path', 'Нужен относительный путь внутри API v1.');
  if (options.signal?.aborted) return failure('aborted', 'request_aborted', 'Запрос отменён.');

  const method = options.method ?? 'GET';
  const csrfToken = method === 'GET' ? undefined : readCsrfToken();
  if (method !== 'GET' && !csrfToken) {
    return failure('csrf', 'csrf_missing', 'Не удалось подтвердить безопасность запроса. Обновите страницу.');
  }
  return sendRequest<T>(fetcher, url, { ...options, method }, csrfToken);
}

export function createApiClient(fetcher: ApiFetch, readCsrfToken?: () => string | undefined) {
  const request = <T = unknown>(path: string, options?: ApiRequestOptions) => requestApi<T>(fetcher, path, options, readCsrfToken);
  type Options = Omit<ApiRequestOptions, 'method'>;
  return {
    request,
    get: <T = unknown>(path: string, options?: Options) => request<T>(path, { ...options, method: 'GET' }),
    post: <T = unknown>(path: string, options?: Options) => request<T>(path, { ...options, method: 'POST' }),
    put: <T = unknown>(path: string, options?: Options) => request<T>(path, { ...options, method: 'PUT' }),
    patch: <T = unknown>(path: string, options?: Options) => request<T>(path, { ...options, method: 'PATCH' }),
    delete: <T = unknown>(path: string, options?: Options) => request<T>(path, { ...options, method: 'DELETE' }),
  };
}
