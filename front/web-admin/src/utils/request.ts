const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:5000';
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'false').toLowerCase() === 'true';
const STORAGE_KEY = import.meta.env.VITE_AUTH_STORAGE_KEY ?? 'student-behavior-admin-auth';

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
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers ?? {})
      },
      ...options
    });
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
