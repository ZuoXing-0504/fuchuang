import { getApiBase } from './config';
import { clearSession, getToken } from './session';

function normalizeErrorMessage(payload, fallback) {
  if (payload && typeof payload === 'object' && payload.message) {
    return String(payload.message);
  }
  return fallback;
}

export function request(url, options = {}) {
  const {
    method = 'GET',
    data,
    header = {},
    auth = true
  } = options;

  return new Promise((resolve, reject) => {
    const token = auth ? getToken() : '';
    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    };
    if (token) {
      requestHeader.Authorization = 'Bearer ' + token;
    }
    uni.request({
      url: getApiBase() + url,
      method,
      data,
      header: requestHeader,
      success: (response) => {
        const { statusCode, data: payload } = response;
        if (statusCode >= 200 && statusCode < 300) {
          resolve(payload);
          return;
        }
        if (statusCode === 401) {
          clearSession();
          uni.reLaunch({ url: '/pages/login/index' });
        }
        reject(new Error(normalizeErrorMessage(payload, '请求失败：' + statusCode)));
      },
      fail: (error) => {
        const message = error && error.errMsg ? error.errMsg : '网络请求失败，请检查后端是否启动';
        reject(new Error(message));
      }
    });
  });
}
