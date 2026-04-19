import { reactive, watch } from 'vue';

export interface AdminLayoutPreferences {
  compactMode: boolean;
  highlightPanels: boolean;
  showBreadcrumb: boolean;
  showContextStrip: boolean;
  riskNotice: boolean;
  reportNotice: boolean;
  taskNotice: boolean;
  showSensitiveFields: boolean;
  allowExportReports: boolean;
  includeFeatureTableInExport: boolean;
  includeExplanationInExport: boolean;
  autoExpandFeatureTable: boolean;
  defaultLandingPage: 'dashboard' | 'warnings' | 'profiles' | 'tasks';
  reportTemplate: 'standard' | 'competition';
}

const STORAGE_KEY = 'student-behavior-admin-layout-preferences';

const defaultPreferences: AdminLayoutPreferences = {
  compactMode: false,
  highlightPanels: true,
  showBreadcrumb: true,
  showContextStrip: true,
  riskNotice: true,
  reportNotice: true,
  taskNotice: true,
  showSensitiveFields: true,
  allowExportReports: true,
  includeFeatureTableInExport: true,
  includeExplanationInExport: true,
  autoExpandFeatureTable: false,
  defaultLandingPage: 'dashboard',
  reportTemplate: 'competition'
};

const state = reactive<AdminLayoutPreferences>(loadPreferences());

watch(
  state,
  (value) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  },
  { deep: true }
);

export function useAdminLayoutPreferences() {
  return state;
}

function loadPreferences(): AdminLayoutPreferences {
  const cache = localStorage.getItem(STORAGE_KEY);
  if (!cache) {
    return { ...defaultPreferences };
  }
  try {
    return { ...defaultPreferences, ...(JSON.parse(cache) as Partial<AdminLayoutPreferences>) };
  } catch {
    return { ...defaultPreferences };
  }
}
