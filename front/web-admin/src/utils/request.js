const API_BASE = 'http://127.0.0.1:5000';
const USE_MOCK = false;
const STORAGE_KEY = 'student-behavior-admin-auth';
export async function request(url, config) {
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
        const raw = (await response.json());
        return adapter ? adapter(raw) : raw;
    }
    catch (error) {
        if (fallback) {
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
        return user.token ?? '';
    }
    catch {
        return '';
    }
}
