import type { AuthUser, LoginPayload } from '../types';
import { request } from '../utils/request';

function unwrapUser(payload: unknown): AuthUser {
  const record = (payload ?? {}) as Record<string, unknown>;
  const data = (record.data ?? payload) as Record<string, unknown>;

  return {
    id: String(data.id ?? data.userId ?? ''),
    userId: Number(data.userId ?? data.id ?? 0) || undefined,
    username: data.username ? String(data.username) : undefined,
    studentId: data.studentId ? String(data.studentId) : undefined,
    name: String(data.name ?? data.username ?? ''),
    role: String(data.role ?? 'admin') as AuthUser['role'],
    college: data.college ? String(data.college) : undefined,
    token: String(data.token ?? '')
  };
}

export function adminLogin(payload: LoginPayload) {
  return request<AuthUser>('/api/auth/login', {
    options: { method: 'POST', body: JSON.stringify({ ...payload, role: 'admin' }) },
    adapter: unwrapUser
  });
}

export function getCurrentUser() {
  return request<AuthUser>('/api/auth/me', {
    adapter: unwrapUser
  });
}
