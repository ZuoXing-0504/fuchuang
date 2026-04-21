﻿﻿﻿<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BrandRadar from '../components/BrandRadar.vue';
import { useStudentAuthStore } from '../stores/auth';
import { useStudentLayoutPreferences } from '../utils/layoutPreferences';

const router = useRouter();
const route = useRoute();
const auth = useStudentAuthStore();
const preferences = useStudentLayoutPreferences();
const collapsed = ref(false);

type NavIconKey = 'home' | 'profile' | 'predict' | 'compare' | 'report' | 'analysis' | 'chat' | 'settings';

const navItems = [
  { path: '/home', label: '首页', icon: 'home' as NavIconKey },
  { path: '/profile', label: '我的画像', icon: 'profile' as NavIconKey },
  { path: '/predict', label: '在线预测', icon: 'predict' as NavIconKey },
  { path: '/compare', label: '群体对比', icon: 'compare' as NavIconKey },
  { path: '/report', label: '个性化报告', icon: 'report' as NavIconKey },
  { path: '/analysis', label: '全样本分析', icon: 'analysis' as NavIconKey },
  { path: '/chat', label: '智能助手', icon: 'chat' as NavIconKey },
  { path: '/settings', label: '设置中心', icon: 'settings' as NavIconKey }
];

const navIconPaths: Record<NavIconKey, string[]> = {
  home: ['M4 10.5 12 4l8 6.5', 'M6.5 9.5V20h11V9.5', 'M10 20v-5h4v5'],
  profile: ['M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z', 'M5.5 19a6.5 6.5 0 0 1 13 0'],
  predict: ['M5 17l4-4 3 3 7-7', 'M16 9h3v3'],
  compare: ['M6 6h5v12H6z', 'M13 9h5v9h-5z'],
  report: ['M8 4.5h6l3 3V19H8z', 'M14 4.5V8h3', 'M10 12h5', 'M10 15h5'],
  analysis: ['M6 18V11', 'M11 18V7', 'M16 18v-4'],
  chat: ['M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z', 'M8 10h8', 'M8 14h6'],
  settings: ['M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z', 'M12 3v2.2', 'M12 18.8V21', 'M4.9 4.9l1.6 1.6', 'M17.5 17.5l1.6 1.6', 'M3 12h2.2', 'M18.8 12H21', 'M4.9 19.1l1.6-1.6', 'M17.5 6.5l1.6-1.6']
};

const activeNav = computed(() => {
  const match = navItems.find((item) => route.path.startsWith(item.path));
  return match?.label ?? '首页';
});

const displayName = computed(() => auth.user?.studentId || auth.user?.username || '学生账号');
const displayInitial = computed(() => displayName.value.charAt(0) || '学');
const contextTags = computed(() => [
  auth.user?.studentId || '当前账号',
  activeNav.value,
  preferences.compactMode ? '紧凑模式' : '标准模式'
]);

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>

<template>
  <div class="app-shell" :class="{ collapsed, compact: preferences.compactMode }">
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="brand-wrap">
          <BrandRadar compact />
          <transition name="fade">
            <div v-if="!collapsed" class="brand-copy">
              <div class="brand-title">知行雷达</div>
              <div class="brand-subtitle">学生成长中心</div>
            </div>
          </transition>
        </div>
        <button class="collapse-btn" @click="collapsed = !collapsed">{{ collapsed ? '>' : '<' }}</button>
      </div>

      <nav class="nav-list">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path.startsWith(item.path) }"
        >
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path v-for="segment in navIconPaths[item.icon]" :key="segment" :d="segment" />
            </svg>
          </span>
          <transition name="fade">
            <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
          </transition>
        </router-link>
      </nav>

      <div class="sidebar-bottom">
        <div v-if="!collapsed" class="account-card">
          <div class="account-avatar">{{ displayInitial }}</div>
          <div>
            <div class="account-name">{{ displayName }}</div>
            <div class="account-role">学生账号</div>
          </div>
        </div>
        <button class="logout-button" @click="handleLogout">
          <span class="logout-icon">⇦</span>
          <transition name="fade">
            <span v-if="!collapsed" class="logout-label">退出登录</span>
          </transition>
        </button>
      </div>
    </aside>

    <div class="main-shell">
      <header class="app-header">
        <div>
          <div class="header-title">{{ activeNav }}</div>
          <div v-if="preferences.showBreadcrumb" class="header-breadcrumb">学生端 / {{ activeNav }}</div>
        </div>
        <div class="header-actions">
          <div v-if="preferences.showContextStrip" class="context-strip">
            <span v-for="item in contextTags" :key="item" class="context-chip">{{ item }}</span>
          </div>
          <router-link to="/settings" class="settings-link">设置</router-link>
          <div class="top-avatar">{{ displayInitial }}</div>
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

.sidebar {
  width: 236px;
  background: linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
  border-right: 1px solid rgba(37, 99, 235, 0.08);
  display: flex;
  flex-direction: column;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 100;
  box-shadow: 8px 0 30px rgba(15, 23, 42, 0.04);
  transition: width 0.25s ease;
}

.collapsed .sidebar {
  width: 78px;
}

.sidebar-top,
.sidebar-bottom {
  padding: 16px;
}

.sidebar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-avatar,
.top-avatar,
.nav-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.top-avatar,
.account-avatar {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: linear-gradient(135deg, #1677ff, #5aa9ff);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.24);
}

.brand-title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}

.brand-subtitle {
  margin-top: 2px;
  font-size: 11px;
  color: #64748b;
}

.collapse-btn {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  border: 1px solid #dbe7f6;
  background: #fff;
  color: #1677ff;
  cursor: pointer;
}

.nav-list {
  flex: 1;
  padding: 8px 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
  color: #475569;
  text-decoration: none;
  font-weight: 700;
  overflow: hidden;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.nav-item::before {
  content: '';
  position: absolute;
  inset: 8px auto 8px 8px;
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(22, 119, 255, 0), rgba(22, 119, 255, 0.64), rgba(34, 197, 94, 0));
  opacity: 0;
  transition: opacity 0.2s ease;
}

.nav-item:hover {
  background: #edf5ff;
  color: #1677ff;
  transform: translateX(1px);
}

.nav-item:hover::before,
.nav-item.active::before {
  opacity: 1;
}

.nav-item.active {
  background: linear-gradient(135deg, #1677ff, #4ea4ff);
  color: #fff;
  box-shadow: 0 12px 24px rgba(22, 119, 255, 0.22);
}

.nav-icon {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: rgba(22, 119, 255, 0.1);
  color: #1677ff;
}

.nav-item.active .nav-icon {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.nav-icon svg {
  width: 17px;
  height: 17px;
  stroke: currentColor;
  stroke-width: 1.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.account-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
  background: #f5f9ff;
  border: 1px solid #e3eefb;
  margin-bottom: 12px;
}

.account-name {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.account-role {
  font-size: 12px;
  color: #64748b;
}

.logout-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 16px;
  border: 1px solid rgba(248, 113, 113, 0.18);
  background: linear-gradient(180deg, #fffefe 0%, #fff5f5 100%);
  color: #b45309;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05);
}

.logout-icon {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #fb7185, #f97316);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
}

.logout-label {
  letter-spacing: 0.02em;
}

.main-shell {
  flex: 1;
  margin-left: 236px;
  min-width: 0;
  transition: margin-left 0.25s ease;
}

.collapsed .main-shell {
  margin-left: 78px;
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

.header-breadcrumb {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.context-strip {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.context-chip,
.settings-link {
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
  text-decoration: none;
}

.settings-link {
  color: #1677ff;
}

.content-area {
  padding: 18px 18px 28px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .app-shell {
    display: block;
  }

  .sidebar {
    width: auto;
    position: static;
  }

  .main-shell,
  .collapsed .main-shell {
    margin-left: 0;
  }

  .app-header {
    padding: 12px 14px;
  }

  .content-area {
    padding: 14px 12px 24px;
  }
}
</style>
