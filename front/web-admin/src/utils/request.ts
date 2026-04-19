const API_BASE = 'http://127.0.0.1:5000';
const USE_MOCK = false;
const STORAGE_KEY = 'student-behavior-admin-auth';

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
      const errorText = await readErrorMessage(response);
      throw new Error(errorText || `Request failed: ${response.status}`);
    }
    const raw = (await response.json()) as R;
    return adapter ? adapter(raw) : ((raw as unknown) as T);
  } catch (error) {
    if (fallback) {
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
    const user = JSON.parse(raw) as { token?: string };
    return user.token ?? '';
  } catch {
    return '';
  }
}
