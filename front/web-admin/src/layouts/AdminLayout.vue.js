/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const navItems = [
    { path: '/dashboard', label: '首页', icon: 'home' },
    { path: '/warnings', label: '风险名单', icon: 'warning' },
    { path: '/profiles', label: '院系对比', icon: 'compare' },
    { path: '/tasks', label: '干预工作台', icon: 'tasks' },
    { path: '/models', label: '预测模块', icon: 'models' },
    { path: '/analysis-results', label: '分析成果', icon: 'analysis' },
    { path: '/settings', label: '设置中心', icon: 'settings' }
];
const navIconPaths = {
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['brand-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['header-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['app-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['content-area']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "side-nav" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-block" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-icon" },
    'aria-hidden': "true",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    viewBox: "0 0 48 48",
    fill: "none",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.rect)({
    x: "6",
    y: "10",
    width: "36",
    height: "28",
    rx: "12",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M15 30V20l9-6 9 6v10",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M20 24h8",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M24 19.5V28",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
    ...{ class: "nav-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.navItems))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.router.push(item.path);
            } },
        key: (item.path),
        ...{ class: "nav-item" },
        ...{ class: ({ active: __VLS_ctx.route.path.startsWith(item.path) }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "nav-icon" },
        'aria-hidden': "true",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        viewBox: "0 0 24 24",
        fill: "none",
    });
    for (const [segment] of __VLS_getVForSourceType((__VLS_ctx.navIconPaths[item.icon]))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
            key: (segment),
            d: (segment),
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "nav-label" },
    });
    (item.label);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "account-panel" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "account-name" },
});
(__VLS_ctx.auth.user?.name ?? __VLS_ctx.auth.user?.username ?? 'admin001');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "account-role" },
});
(__VLS_ctx.auth.user?.username ?? 'admin001');
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.handleLogout) },
    ...{ class: "logout-button" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-shell" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
    ...{ class: "app-header" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-title" },
});
(__VLS_ctx.activeNav);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "header-chip" },
});
(__VLS_ctx.auth.user?.username ?? 'admin001');
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "header-chip accent" },
});
(__VLS_ctx.activeNav);
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "content-area" },
});
const __VLS_0 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['app-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['side-nav']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-block']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-list']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-label']} */ ;
/** @type {__VLS_StyleScopedClasses['account-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['account-name']} */ ;
/** @type {__VLS_StyleScopedClasses['account-role']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-button']} */ ;
/** @type {__VLS_StyleScopedClasses['main-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-title']} */ ;
/** @type {__VLS_StyleScopedClasses['header-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['header-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['header-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['accent']} */ ;
/** @type {__VLS_StyleScopedClasses['content-area']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            route: route,
            auth: auth,
            navItems: navItems,
            navIconPaths: navIconPaths,
            activeNav: activeNav,
            handleLogout: handleLogout,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
