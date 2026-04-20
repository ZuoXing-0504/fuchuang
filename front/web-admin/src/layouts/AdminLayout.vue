<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BrandRadar from '../components/BrandRadar.vue';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

type NavIconKey = 'home' | 'warning' | 'compare' | 'tasks' | 'models' | 'analysis' | 'settings';

const navItems = [
  { path: '/dashboard', label: '首页', icon: 'home' as NavIconKey },
  { path: '/warnings', label: '风险名单', icon: 'warning' as NavIconKey },
  { path: '/profiles', label: '院系对比', icon: 'compare' as NavIconKey },
  { path: '/tasks', label: '干预工作台', icon: 'tasks' as NavIconKey },
  { path: '/models', label: '预测模块', icon: 'models' as NavIconKey },
  { path: '/analysis-results', label: '分析成果', icon: 'analysis' as NavIconKey },
  { path: '/settings', label: '设置中心', icon: 'settings' as NavIconKey }
];

const navIconPaths: Record<NavIconKey, string[]> = {
  home: ['M4 10.5 12 4l8 6.5', 'M6.5 9.5V20h11V9.5', 'M10 20v-5h4v5'],
  warning: ['M12 4 20 18H4L12 4Z', 'M12 9v4', 'M12 16h.01'],
  compare: ['M6 6h5v12H6z', 'M13 9h5v9h-5z'],
  tasks: ['M8 5h8', 'M6 8h12v10H6z', 'M9 12h6', 'M9 15h4'],
  models: ['M5 17l4-4 3 3 7-7', 'M16 9h3v3'],
  analysis: ['M6 18V11', 'M11 18V7', 'M16 18v-4'],
  settings: ['M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z', 'M12 3v2.2', 'M12 18.8V21', 'M4.9 4.9l1.6 1.6', 'M17.5 17.5l1.6 1.6', 'M3 12h2.2', 'M18.8 12H21', 'M4.9 19.1l1.6-1.6', 'M17.5 6.5l1.6-1.6']
};

const activeNav = computed(() => {
  if (route.path.startsWith('/students/')) {
    return '学生详情';
  }
  if (route.path.startsWith('/analysis-results')) {
    return '分析成果';
  }
  if (route.path.startsWith('/models')) {
    return '预测模块';
  }
  const match = navItems.find((item) => route.path.startsWith(item.path));
  return match?.label ?? '首页';
});

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <div class="app-shell">
    <aside class="side-nav">
      <div class="brand-block">
        <BrandRadar compact />
        <div class="brand-copy">
          <div class="brand-title">知行雷达</div>
          <div class="brand-subtitle">校园行为洞察后台</div>
        </div>
      </div>

      <nav class="nav-list">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: route.path.startsWith(item.path) }"
          @click="router.push(item.path)"
        >
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path v-for="segment in navIconPaths[item.icon]" :key="segment" :d="segment" />
            </svg>
          </span>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>

      <div class="account-panel">
        <div class="account-name">{{ auth.user?.name ?? auth.user?.username ?? 'admin001' }}</div>
        <div class="account-role">{{ auth.user?.username ?? 'admin001' }}</div>
        <button class="logout-button" @click="handleLogout">退出登录</button>
      </div>
    </aside>

    <div class="main-shell">
      <header class="app-header">
        <div>
          <div class="header-title">{{ activeNav }}</div>
          <div class="header-subtitle">从总览、名单、对比到完整报告，统一查看学生行为洞察结果。</div>
        </div>

        <div class="header-actions">
          <span class="header-chip">{{ auth.user?.username ?? 'admin001' }}</span>
          <span class="header-chip accent">{{ activeNav }}</span>
        </div>
      </header>

      <main class="content-area">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(180deg, #f5f8fc 0%, #eef4fb 100%);
}

.side-nav {
  width: 232px;
  min-height: 100vh;
  padding: 20px 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
  border-right: 1px solid rgba(37, 99, 235, 0.08);
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: sticky;
  top: 0;
  box-shadow: 8px 0 30px rgba(15, 23, 42, 0.04);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 4px 10px;
}

.brand-copy {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}

.brand-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: #64748b;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  border: 0;
  background: transparent;
  color: #475569;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
}

.nav-item:hover {
  background: #edf5ff;
  color: #1677ff;
}

.nav-item.active {
  background: linear-gradient(135deg, #1677ff, #4ea4ff);
  color: #fff;
  box-shadow: 0 12px 24px rgba(22, 119, 255, 0.22);
}

.nav-icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(22, 119, 255, 0.1);
  color: #1677ff;
}

.nav-item.active .nav-icon {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.nav-icon svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.nav-label {
  font-size: 13px;
  font-weight: 700;
}

.account-panel {
  margin-top: auto;
  border-radius: 18px;
  padding: 14px;
  background: #f5f9ff;
  border: 1px solid #e3eefb;
}

.account-name {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.account-role {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.logout-button {
  width: 100%;
  margin-top: 14px;
  border: 1px solid #dbe7f6;
  border-radius: 12px;
  padding: 10px 0;
  background: #fff;
  color: #475569;
  cursor: pointer;
  font-weight: 700;
}

.main-shell {
  flex: 1;
  min-width: 0;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 22px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.header-title {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}

.header-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.header-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f3f7fd;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.header-chip.accent {
  color: #1677ff;
}

.content-area {
  padding: 18px 18px 28px;
}

@media (max-width: 640px) {
  .app-shell {
    display: block;
  }

  .side-nav {
    width: auto;
    min-height: auto;
    position: static;
  }

  .app-header {
    padding: 12px 14px;
  }

  .content-area {
    padding: 14px 12px 24px;
  }
}
</style>
