import type { FetchOptions } from 'ofetch';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiPagination {
  page: number
  page_size: number
  count: number
  next: string | null
  previous: string | null
}

export interface ApiFieldError {
  code: string
  message: string
}

export type ApiErrorKind = 'http' | 'network' | 'aborted' | 'invalid_response' | 'invalid_request' | 'csrf';

export interface ApiError {
  kind: ApiErrorKind
  code: string
  message: string
  fields: Record<string, ApiFieldError[]>
}

export type ApiResult<T> = {
  ok: true
  status: number
  data: T | null
  pagination?: ApiPagination
} | {
  ok: false
  status: number | null
  error: ApiError
};

export interface ApiRequestOptions {
  method?: ApiMethod
  query?: Record<string, string | number | boolean | undefined>
  body?: FetchOptions<'json'>['body']
  headers?: HeadersInit
  signal?: AbortSignal
}
