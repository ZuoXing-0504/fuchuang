import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { AuthUser, LoginPayload } from '../types';
import { adminLogin, getCurrentUser } from '../api/auth';

const STORAGE_KEY = 'student-behavior-admin-auth';

export const useAuthStore = defineStore('admin-auth', () => {
  const user = ref<AuthUser | null>(loadUser());
  const isAuthenticated = computed(() => Boolean(user.value?.token));

  async function login(payload: LoginPayload) {
    user.value = await adminLogin(payload);
    persistUser(user.value);
  }

  async function refreshProfile() {
    if (!user.value?.token) {
      return;
    }
    user.value = await getCurrentUser();
    persistUser(user.value);
  }

  function logout() {
    user.value = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  return { user, isAuthenticated, login, refreshProfile, logout };
});

function loadUser(): AuthUser | null {
  const cache = localStorage.getItem(STORAGE_KEY);
  return cache ? (JSON.parse(cache) as AuthUser) : null;
}

function persistUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}
