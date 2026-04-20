import { studentUser } from '../mock/student';
import { request } from '../utils/request';
function unwrapUser(payload) {
    const record = (payload ?? {});
    const data = (record.data ?? payload);
    return {
        id: String(data.id ?? data.userId ?? studentUser.id),
        userId: Number(data.userId ?? data.id ?? 0) || undefined,
        username: String(data.username ?? ''),
        studentId: String(data.studentId ?? data.student_id ?? ''),
        name: String(data.name ?? studentUser.name),
        role: 'student',
        token: String(data.token ?? studentUser.token),
        tokenExpiresAt: data.tokenExpiresAt ? String(data.tokenExpiresAt) : undefined
    };
}
export function studentLogin(payload) {
    return request('/api/auth/login', {
        options: { method: 'POST', body: JSON.stringify({ ...payload, role: 'student' }) },
        fallback: () => ({ ...studentUser, username: payload.username, studentId: payload.username, name: payload.username || studentUser.name }),
        adapter: unwrapUser
    });
}
export function getCurrentUser() {
    return request('/api/auth/me', {
        fallback: () => studentUser,
        adapter: unwrapUser
    });
}
export function studentRegister(payload) {
    return request('/api/auth/register', {
        options: { method: 'POST', body: JSON.stringify(payload) },
        adapter: (raw) => {
            const record = (raw ?? {});
            const data = (record.data ?? raw);
            return {
                username: String(data.username ?? payload.username),
                studentId: String(data.studentId ?? payload.studentId),
                name: String(data.name ?? payload.studentId)
            };
        }
    });
}
