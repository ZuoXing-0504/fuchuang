import { createRouter, createWebHashHistory } from 'vue-router';
import AdminLayout from '../layouts/AdminLayout.vue';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'admin-login',
      component: () => import('../views/auth/AdminLoginView.vue'),
      meta: { public: true, title: '管理员登录' }
    },
    {
      path: '/',
      component: AdminLayout,
      redirect: '/dashboard',
      meta: { requiresAuth: true },
      children: [
        { path: '/dashboard', name: 'dashboard', component: () => import('../views/dashboard/AdminDashboardView.vue'), meta: { title: '总览' } },
        { path: '/profiles', name: 'profiles', component: () => import('../views/profiles/StudentProfilesView.vue'), meta: { title: '院系对比' } },
        { path: '/warnings', name: 'warnings', component: () => import('../views/warnings/RiskWarningsView.vue'), meta: { title: '风险名单' } },
        { path: '/tasks', name: 'tasks', component: () => import('../views/tasks/BatchTasksView.vue'), meta: { title: '干预工作台' } },
        { path: '/students/:id', name: 'student-detail', component: () => import('../views/students/StudentDetailView.vue'), meta: { title: '学生详情' } },
        { path: '/students/:id/report', name: 'student-report', component: () => import('../views/students/AdminStudentReportView.vue'), meta: { title: '完整报告' } },
        { path: '/analysis-results', name: 'analysis-results', component: () => import('../views/analysis/AdminAnalysisResultsView.vue'), meta: { title: '分析成果' } },
        { path: '/settings', name: 'settings', component: () => import('../views/settings/AdminSettingsView.vue'), meta: { title: '设置中心' } },
        { path: '/models', redirect: '/analysis-results' },
        { path: '/tasks-legacy', redirect: '/tasks' }
      ]
    }
  ]
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
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
