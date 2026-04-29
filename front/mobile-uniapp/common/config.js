const FALLBACK_LAN_API_BASE = 'http://150.158.131.93/api';
const FALLBACK_PRODUCTION_API_BASE = 'http://150.158.131.93/api';
const API_BASE_STORAGE_KEY = 'student-behavior-mobile-api-base';

function resolveDefaultApiBase() {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = String(window.location.hostname || '').trim();
    if (!host || host === 'localhost' || host === '127.0.0.1') {
      return FALLBACK_PRODUCTION_API_BASE;
    }
    return `http://${host}/api`;
  }
  return FALLBACK_PRODUCTION_API_BASE;
}

const DEFAULT_API_BASE = resolveDefaultApiBase();

function normalizeApiBase(value) {
  let normalized = String(value || '').trim();
  if (!normalized) {
    return '';
  }

  // Fix common manual input mistakes like http:///host/api or https:////host/api
  normalized = normalized.replace(/^([a-z]+:)\/*/i, (_, protocol) => `${protocol}//`);
  normalized = normalized.replace(/\/+$/, '');

  return normalized;
}

export function getApiBase() {
  const customValue = uni.getStorageSync(API_BASE_STORAGE_KEY);
  return normalizeApiBase(customValue || DEFAULT_API_BASE);
}

export function setApiBase(value) {
  const normalized = normalizeApiBase(value);
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

export function getProductionApiBaseTemplate() {
  return FALLBACK_PRODUCTION_API_BASE;
}

export { API_BASE_STORAGE_KEY };
