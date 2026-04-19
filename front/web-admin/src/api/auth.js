import { request } from '../utils/request';
function unwrapUser(payload) {
    const record = (payload ?? {});
    const data = (record.data ?? payload);
    return {
        id: String(data.id ?? data.userId ?? ''),
        userId: Number(data.userId ?? data.id ?? 0) || undefined,
        username: data.username ? String(data.username) : undefined,
        studentId: data.studentId ? String(data.studentId) : undefined,
        name: String(data.name ?? data.username ?? ''),
        role: String(data.role ?? 'admin'),
        college: data.college ? String(data.college) : undefined,
        token: String(data.token ?? '')
    };
}
export function adminLogin(payload) {
    return request('/api/auth/login', {
        options: { method: 'POST', body: JSON.stringify({ ...payload, role: 'admin' }) },
        adapter: unwrapUser
    });
}
export function getCurrentUser() {
    return request('/api/auth/me', {
        adapter: unwrapUser
    });
}
