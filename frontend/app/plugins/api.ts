import { createApiClient } from '../utils/apiClient';

export default defineNuxtPlugin(() => {
  const requestFetch = useRequestFetch();
  const host = useRequestHeaders(['host']);
  const api = createApiClient((path, options) => requestFetch(path, {
    ...options,
    headers: { ...options.headers, ...host },
  }), () => {
    if (import.meta.server) return undefined;
    const cookie = document.cookie.split(';').find(part => part.trim().startsWith('csrftoken='));
    try {
      return cookie ? decodeURIComponent(cookie.trim().slice('csrftoken='.length)) : undefined;
    } catch {
      return undefined;
    }
  });
  return { provide: { api } };
});
