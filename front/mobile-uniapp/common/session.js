const AUTH_STORAGE_KEY = 'student-behavior-mobile-auth';

function getHomePath(role) {
  return role === 'admin' ? '/pages/admin/home/index' : '/pages/student/home/index';
}

export function readSession() {
  const raw = uni.getStorageSync(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const session = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (session && session.tokenExpiresAt && Date.parse(session.tokenExpiresAt) <= Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  uni.setStorageSync(AUTH_STORAGE_KEY, session);
  return session;
}

export function clearSession() {
  uni.removeStorageSync(AUTH_STORAGE_KEY);
}

export function getToken() {
  const session = readSession();
  return session && session.token ? session.token : '';
}

export function getCurrentRole() {
  const session = readSession();
  return session && session.role ? session.role : '';
}

export function ensureRole(role) {
  const session = readSession();
  if (!session || (role && session.role !== role)) {
    clearSession();
    uni.reLaunch({ url: '/pages/login/index' });
    return null;
  }
  return session;
}

export function redirectAfterLogin(role) {
  uni.reLaunch({ url: getHomePath(role) });
}

export function redirectIfLoggedIn() {
  const session = readSession();
  if (session && session.role) {
    uni.reLaunch({ url: getHomePath(session.role) });
    return true;
  }
  return false;
}

export { AUTH_STORAGE_KEY };
