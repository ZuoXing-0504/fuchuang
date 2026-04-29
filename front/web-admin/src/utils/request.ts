const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'false').toLowerCase() === 'true';
const STORAGE_KEY = import.meta.env.VITE_AUTH_STORAGE_KEY ?? 'student-behavior-admin-auth';
const REQUEST_TIMEOUT_MS = 15000;

function buildRequestUrl(url: string) {
  const normalizedBase = String(API_BASE || '').replace(/\/+$/, '');
  const normalizedPath = String(url || '').replace(/^\/+/, '');

  if (!normalizedBase) {
    return `/${normalizedPath}`;
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  const baseEndsWithApi = normalizedBase.endsWith('/api');
  const pathStartsWithApi = normalizedPath === 'api' || normalizedPath.startsWith('api/');
  const finalPath = baseEndsWithApi && pathStartsWithApi ? normalizedPath.slice(4) : normalizedPath;

  return `${normalizedBase}/${finalPath}`.replace(/(?<!:)\/{2,}/g, '/');
}

export interface RequestOptions<T, R = T> {
  options?: RequestInit;
  fallback?: () => Promise<T> | T;
  adapter?: (raw: R) => T;
}

export async function request<T, R = T>(url: string, config?: RequestOptions<T, R>): Promise<T> {
  const { options, fallback, adapter } = config ?? {};
  if (USE_MOCK && fallback) {
    return fallback();
  }

  try {
    const token = readToken();
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(buildRequestUrl(url), {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options?.headers ?? {})
        },
        signal: controller.signal,
        ...options
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
      }
      const errorText = await readErrorMessage(response);
      const error = new Error(errorText || `Request failed: ${response.status}`);
      error.name = response.status === 401 ? 'UnauthorizedError' : 'RequestError';
      throw error;
    }
    const raw = (await response.json()) as R;
    return adapter ? adapter(raw) : ((raw as unknown) as T);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('后端接口响应超时，请确认 Flask 服务已启动并可访问。');
    }
    if (fallback && (!isUnauthorizedError(error) || USE_MOCK)) {
      return fallback();
    }
    throw error;
  }
}

async function readErrorMessage(response: Response) {
  try {
    const raw = (await response.json()) as { message?: string };
    return raw.message ?? '';
  } catch {
    return '';
  }
}

function readToken() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return '';
  try {
    const user = JSON.parse(raw) as { token?: string; tokenExpiresAt?: string };
    if (user.tokenExpiresAt && Date.parse(user.tokenExpiresAt) <= Date.now()) {
      handleUnauthorized();
      return '';
    }
    return user.token ?? '';
  } catch {
    return '';
  }
}

function handleUnauthorized() {
  localStorage.removeItem(STORAGE_KEY);
  if (typeof window !== 'undefined' && !window.location.hash.startsWith('#/login')) {
    window.location.hash = '#/login';
  }
}

function isUnauthorizedError(error: unknown) {
  return error instanceof Error && error.name === 'UnauthorizedError';
}
