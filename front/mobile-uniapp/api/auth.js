import { adaptCurrentUser } from './adapter';
import { request } from '../common/request';
import { clearSession, redirectAfterLogin, saveSession } from '../common/session';

function saveAndReturnUser(payload, role) {
  const user = {
    ...adaptCurrentUser(payload),
    role
  };
  saveSession(user);
  return user;
}

export async function login(payload) {
  const role = payload.role || 'student';
  const response = await request('/api/auth/login', {
    method: 'POST',
    auth: false,
    data: {
      username: payload.username,
      password: payload.password,
      role
    }
  });
  const sessionUser = saveAndReturnUser(response, role);
  try {
    const currentUser = await getCurrentUser();
    const normalizedUser = {
      ...sessionUser,
      ...currentUser,
      token: currentUser.token || sessionUser.token,
      tokenExpiresAt: currentUser.tokenExpiresAt || sessionUser.tokenExpiresAt,
      role
    };
    saveSession(normalizedUser);
    return normalizedUser;
  } catch {
    return sessionUser;
  }
}

export async function registerStudent(payload) {
  const response = await request('/api/auth/register', {
    method: 'POST',
    auth: false,
    data: payload
  });
  const data = response && response.data ? response.data : response;
  return {
    username: String((data && data.username) || payload.username),
    studentId: String((data && data.studentId) || payload.studentId),
    name: String((data && data.name) || payload.studentId)
  };
}

export async function getCurrentUser() {
  const response = await request('/api/auth/me');
  return adaptCurrentUser(response);
}

export function handleLoginSuccess(user) {
  redirectAfterLogin(user.role);
}

export function logout() {
  clearSession();
  uni.reLaunch({ url: '/pages/login/index' });
}
