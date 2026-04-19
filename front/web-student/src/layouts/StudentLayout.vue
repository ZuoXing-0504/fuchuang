<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStudentAuthStore } from '../stores/auth';
import { useStudentLayoutPreferences } from '../utils/layoutPreferences';

const router = useRouter();
const route = useRoute();
const auth = useStudentAuthStore();
const preferences = useStudentLayoutPreferences();
const collapsed = ref(false);

const navItems = [
  { path: '/home', label: '首页', icon: '首' },
  { path: '/profile', label: '我的画像', icon: '像' },
  { path: '/compare', label: '群体对比', icon: '比' },
  { path: '/report', label: '个性化报告', icon: '报' },
  { path: '/analysis', label: '全样本分析', icon: '析' },
  { path: '/settings', label: '设置中心', icon: '设' }
];

const activeNav = computed(() => {
  const match = navItems.find((item) => route.path.startsWith(item.path));
  return match?.label ?? '首页';
});

const displayName = computed(() => auth.user?.name || auth.user?.studentId || '学生');
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
          <div class="brand-icon">SB</div>
          <transition name="fade">
            <div v-if="!collapsed" class="brand-copy">
              <div class="brand-title">学生成长档案</div>
              <div class="brand-subtitle">Student Growth Center</div>
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
          <span class="nav-icon">{{ item.icon }}</span>
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
          <span>退</span>
          <transition name="fade">
            <span v-if="!collapsed">退出登录</span>
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

.brand-icon,
.account-avatar,
.top-avatar,
.nav-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.brand-icon,
.top-avatar,
.account-avatar {
  width: 40px;
  height: 40px;
  border-radius: 14px;
  background: linear-gradient(135deg, #1677ff, #5aa9ff);
  color: #fff;
  font-size: 13px;
  font-weight: 900;
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
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
  color: #475569;
  text-decoration: none;
  font-weight: 700;
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
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: rgba(22, 119, 255, 0.1);
  color: #1677ff;
  font-size: 13px;
  font-weight: 900;
}

.nav-item.active .nav-icon {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
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
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid #dbe7f6;
  background: #fff;
  color: #475569;
  cursor: pointer;
  font-weight: 700;
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
