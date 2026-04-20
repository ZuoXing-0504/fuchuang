const DEFAULT_API_BASE = 'http://127.0.0.1:5000';
const API_BASE_STORAGE_KEY = 'student-behavior-mobile-api-base';

export function getApiBase() {
  const customValue = uni.getStorageSync(API_BASE_STORAGE_KEY);
  return customValue || DEFAULT_API_BASE;
}

export function setApiBase(value) {
  const normalized = String(value || '').trim();
  if (!normalized) {
    uni.removeStorageSync(API_BASE_STORAGE_KEY);
    return DEFAULT_API_BASE;
  }
  uni.setStorageSync(API_BASE_STORAGE_KEY, normalized);
  return normalized;
}

export function getDefaultApiBase() {
  return DEFAULT_API_BASE;
}

export { API_BASE_STORAGE_KEY };
