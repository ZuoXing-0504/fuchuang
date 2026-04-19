import type { LoginPayload, RegisterPayload, StudentUser } from '../types';
import { studentUser } from '../mock/student';
import { request } from '../utils/request';

function unwrapUser(payload: unknown): StudentUser {
  const record = (payload ?? {}) as Record<string, unknown>;
  const data = (record.data ?? payload) as Record<string, unknown>;
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

export function studentLogin(payload: LoginPayload) {
  return request<StudentUser>('/api/auth/login', {
    options: { method: 'POST', body: JSON.stringify({ ...payload, role: 'student' }) },
    fallback: () => ({ ...studentUser, username: payload.username, studentId: payload.username, name: payload.username || studentUser.name }),
    adapter: unwrapUser
  });
}

export function getCurrentUser() {
  return request<StudentUser>('/api/auth/me', {
    fallback: () => studentUser,
    adapter: unwrapUser
  });
}

export function studentRegister(payload: RegisterPayload) {
  return request<{ username: string; studentId: string; name: string }>('/api/auth/register', {
    options: { method: 'POST', body: JSON.stringify(payload) },
    adapter: (raw: unknown) => {
      const record = (raw ?? {}) as Record<string, unknown>;
      const data = (record.data ?? raw) as Record<string, unknown>;
      return {
        username: String(data.username ?? payload.username),
        studentId: String(data.studentId ?? payload.studentId),
        name: String(data.name ?? payload.studentId)
      };
    }
  });
}
