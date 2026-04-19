import { reactive, watch } from 'vue';
const STORAGE_KEY = 'student-behavior-admin-layout-preferences';
const defaultPreferences = {
    compactMode: false,
    highlightPanels: true,
    showBreadcrumb: true,
    showContextStrip: true
};
const state = reactive(loadPreferences());
watch(state, (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}, { deep: true });
export function useAdminLayoutPreferences() {
    return state;
}
function loadPreferences() {
    const cache = localStorage.getItem(STORAGE_KEY);
    if (!cache) {
        return { ...defaultPreferences };
    }
    try {
        return { ...defaultPreferences, ...JSON.parse(cache) };
    }
    catch {
        return { ...defaultPreferences };
    }
}
