import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { LoginPayload, RegisterPayload, StudentUser } from '../types';
import { getCurrentUser, studentLogin, studentRegister } from '../api/auth';

const STORAGE_KEY = 'student-behavior-student-auth';

export const useStudentAuthStore = defineStore('student-auth', () => {
  const user = ref<StudentUser | null>(loadUser());
  const isAuthenticated = computed(() => Boolean(user.value?.token));

  async function login(payload: LoginPayload) {
    user.value = await studentLogin(payload);
    persistUser(user.value);
    await refreshProfile();
  }

  async function register(payload: RegisterPayload) {
    return studentRegister(payload);
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

  return { user, isAuthenticated, login, register, refreshProfile, logout };
});

function loadUser(): StudentUser | null {
  const cache = localStorage.getItem(STORAGE_KEY);
  return cache ? (JSON.parse(cache) as StudentUser) : null;
}

function persistUser(user: StudentUser | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}
