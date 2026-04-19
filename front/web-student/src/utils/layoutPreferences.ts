import { reactive, watch } from 'vue';

export interface StudentLayoutPreferences {
  compactMode: boolean;
  highlightPanels: boolean;
  showBreadcrumb: boolean;
  showContextStrip: boolean;
}

const STORAGE_KEY = 'student-behavior-student-layout-preferences';

const defaultPreferences: StudentLayoutPreferences = {
  compactMode: false,
  highlightPanels: true,
  showBreadcrumb: true,
  showContextStrip: true
};

const state = reactive<StudentLayoutPreferences>(loadPreferences());

watch(
  state,
  (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  },
  { deep: true }
);

export function useStudentLayoutPreferences() {
  return state;
}

function loadPreferences(): StudentLayoutPreferences {
  const cache = localStorage.getItem(STORAGE_KEY);
  if (!cache) {
    return { ...defaultPreferences };
  }
  try {
    return { ...defaultPreferences, ...(JSON.parse(cache) as Partial<StudentLayoutPreferences>) };
  } catch {
    return { ...defaultPreferences };
  }
}
