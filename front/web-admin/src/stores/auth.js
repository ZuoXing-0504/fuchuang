import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { adminLogin, getCurrentUser } from '../api/auth';
const STORAGE_KEY = 'student-behavior-admin-auth';
export const useAuthStore = defineStore('admin-auth', () => {
    const user = ref(loadUser());
    const isAuthenticated = computed(() => Boolean(user.value?.token));
    async function login(payload) {
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
function loadUser() {
    const cache = localStorage.getItem(STORAGE_KEY);
    return cache ? JSON.parse(cache) : null;
}
function persistUser(user) {
    if (!user) {
        localStorage.removeItem(STORAGE_KEY);
        return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}
