﻿import { createRouter, createWebHashHistory } from 'vue-router';
import StudentLayout from '../layouts/StudentLayout.vue';
import { useStudentAuthStore } from '../stores/auth';
import StudentLoginView from '../views/auth/StudentLoginView.vue';
import StudentHomeView from '../views/home/StudentHomeView.vue';
import StudentAnalysisResultsView from '../views/analysis/StudentAnalysisResultsView.vue';
import StudentProfileView from '../views/profile/StudentProfileView.vue';
import StudentPredictView from '../views/predict/StudentPredictView.vue';
import StudentCompareView from '../views/compare/StudentCompareView.vue';
import StudentReportView from '../views/report/StudentReportView.vue';
import StudentChatView from '../views/chat/StudentChatView.vue';
import StudentSettingsView from '../views/settings/StudentSettingsView.vue';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'student-login',
      component: StudentLoginView,
      meta: { public: true, title: '学生登录' }
    },
    {
      path: '/',
      component: StudentLayout,
      redirect: '/home',
      meta: { requiresAuth: true },
      children: [
        { path: '/home', name: 'home', component: StudentHomeView, meta: { title: '首页' } },
        { path: '/analysis', name: 'analysis', component: StudentAnalysisResultsView, meta: { title: '全样本分析' } },
        { path: '/profile', name: 'profile', component: StudentProfileView, meta: { title: '我的画像' } },
        { path: '/predict', name: 'predict', component: StudentPredictView, meta: { title: '在线预测' } },
        { path: '/compare', name: 'compare', component: StudentCompareView, meta: { title: '群体对比' } },
        { path: '/report', name: 'report', component: StudentReportView, meta: { title: '个性化报告' } },
        { path: '/chat', name: 'chat', component: StudentChatView, meta: { title: '智能助手' } },
        { path: '/settings', name: 'settings', component: StudentSettingsView, meta: { title: '设置中心' } }
      ]
    }
  ]
});

router.beforeEach(async (to) => {
  const authStore = useStudentAuthStore();
  if (to.meta.public) {
    return true;
  }
  if (!authStore.isAuthenticated) {
    return '/login';
  }
  if (!authStore.user && authStore.isAuthenticated) {
    await authStore.refreshProfile();
  }
  return true;
});

export default router;
