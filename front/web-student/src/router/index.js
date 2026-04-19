import { createRouter, createWebHashHistory } from 'vue-router';
import StudentLayout from '../layouts/StudentLayout.vue';
import { useStudentAuthStore } from '../stores/auth';
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/login',
            name: 'student-login',
            component: () => import('../views/auth/StudentLoginView.vue'),
            meta: { public: true, title: '学生登录' }
        },
        {
            path: '/',
            component: StudentLayout,
            redirect: '/home',
            meta: { requiresAuth: true },
            children: [
                { path: '/home', name: 'home', component: () => import('../views/home/StudentHomeView.vue'), meta: { title: '我的主页' } },
                { path: '/analysis', name: 'analysis', component: () => import('../views/analysis/StudentAnalysisResultsView.vue'), meta: { title: '分析成果' } },
                { path: '/profile', name: 'profile', component: () => import('../views/profile/StudentProfileView.vue'), meta: { title: '我的画像' } },
                { path: '/compare', name: 'compare', component: () => import('../views/compare/StudentCompareView.vue'), meta: { title: '群体对比' } },
                { path: '/report', name: 'report', component: () => import('../views/report/StudentReportView.vue'), meta: { title: '我的报告' } },
                { path: '/recommendations', name: 'recommendations', component: () => import('../views/recommendations/StudentRecommendationsView.vue'), meta: { title: '我的建议' } },
                { path: '/settings', name: 'settings', component: () => import('../views/settings/StudentSettingsView.vue'), meta: { title: '设置中心' } }
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
