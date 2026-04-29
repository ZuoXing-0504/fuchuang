const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'false').toLowerCase() === 'true';
const STORAGE_KEY = import.meta.env.VITE_AUTH_STORAGE_KEY ?? 'student-behavior-admin-auth';
function buildRequestUrl(url) {
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
export async function request(url, config) {
    const { options, fallback, adapter } = config ?? {};
    if (USE_MOCK && fallback) {
        return fallback();
    }
    try {
        const token = readToken();
        const response = await fetch(buildRequestUrl(url), {
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
        const raw = (await response.json());
        return adapter ? adapter(raw) : raw;
    }
    catch (error) {
        if (fallback && (!isUnauthorizedError(error) || USE_MOCK)) {
            return fallback();
        }
        throw error;
    }
}
async function readErrorMessage(response) {
    try {
        const raw = (await response.json());
        return raw.message ?? '';
    }
    catch {
        return '';
    }
}
function readToken() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw)
        return '';
    try {
        const user = JSON.parse(raw);
        if (user.tokenExpiresAt && Date.parse(user.tokenExpiresAt) <= Date.now()) {
            handleUnauthorized();
            return '';
        }
        return user.token ?? '';
    }
    catch {
        return '';
    }
}
function handleUnauthorized() {
    localStorage.removeItem(STORAGE_KEY);
    if (typeof window !== 'undefined' && !window.location.hash.startsWith('#/login')) {
        window.location.hash = '#/login';
    }
}
function isUnauthorizedError(error) {
    return error instanceof Error && error.name === 'UnauthorizedError';
}
