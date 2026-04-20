/// <reference types="../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
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
    { path: '/home', label: '首页', icon: 'home' },
    { path: '/profile', label: '我的画像', icon: 'profile' },
    { path: '/predict', label: '在线预测', icon: 'predict' },
    { path: '/compare', label: '群体对比', icon: 'compare' },
    { path: '/report', label: '个性化报告', icon: 'report' },
    { path: '/analysis', label: '全样本分析', icon: 'analysis' },
    { path: '/settings', label: '设置中心', icon: 'settings' }
];
const navIconPaths = {
    home: ['M4 10.5 12 4l8 6.5', 'M6.5 9.5V20h11V9.5', 'M10 20v-5h4v5'],
    profile: ['M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z', 'M5.5 19a6.5 6.5 0 0 1 13 0'],
    predict: ['M5 17l4-4 3 3 7-7', 'M16 9h3v3'],
    compare: ['M6 6h5v12H6z', 'M13 9h5v9h-5z'],
    report: ['M8 4.5h6l3 3V19H8z', 'M14 4.5V8h3', 'M10 12h5', 'M10 15h5'],
    analysis: ['M6 18V11', 'M11 18V7', 'M16 18v-4'],
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
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-top']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['top-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['account-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['main-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-link']} */ ;
/** @type {__VLS_StyleScopedClasses['app-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['main-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['collapsed']} */ ;
/** @type {__VLS_StyleScopedClasses['main-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['content-area']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "app-shell" },
    ...{ class: ({ collapsed: __VLS_ctx.collapsed, compact: __VLS_ctx.preferences.compactMode }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.aside, __VLS_intrinsicElements.aside)({
    ...{ class: "sidebar" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-top" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "brand-wrap" },
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
    x: "7",
    y: "8",
    width: "34",
    height: "32",
    rx: "12",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M16 31V18h16v13",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M20 25c1.4-2.8 3.1-4.2 4-4.2s2.6 1.4 4 4.2",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path)({
    d: "M20 31h8",
});
const __VLS_0 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    name: "fade",
}));
const __VLS_2 = __VLS_1({
    name: "fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (!__VLS_ctx.collapsed) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "brand-copy" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "brand-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "brand-subtitle" },
    });
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.collapsed = !__VLS_ctx.collapsed;
        } },
    ...{ class: "collapse-btn" },
});
(__VLS_ctx.collapsed ? '>' : '<');
__VLS_asFunctionalElement(__VLS_intrinsicElements.nav, __VLS_intrinsicElements.nav)({
    ...{ class: "nav-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.navItems))) {
    const __VLS_4 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        key: (item.path),
        to: (item.path),
        ...{ class: "nav-item" },
        ...{ class: ({ active: __VLS_ctx.route.path.startsWith(item.path) }) },
    }));
    const __VLS_6 = __VLS_5({
        key: (item.path),
        to: (item.path),
        ...{ class: "nav-item" },
        ...{ class: ({ active: __VLS_ctx.route.path.startsWith(item.path) }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
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
    const __VLS_8 = {}.transition;
    /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        name: "fade",
    }));
    const __VLS_10 = __VLS_9({
        name: "fade",
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    if (!__VLS_ctx.collapsed) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "nav-label" },
        });
        (item.label);
    }
    var __VLS_11;
    var __VLS_7;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "sidebar-bottom" },
});
if (!__VLS_ctx.collapsed) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "account-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "account-avatar" },
    });
    (__VLS_ctx.displayInitial);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "account-name" },
    });
    (__VLS_ctx.displayName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "account-role" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.handleLogout) },
    ...{ class: "logout-button" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
const __VLS_12 = {}.transition;
/** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    name: "fade",
}));
const __VLS_14 = __VLS_13({
    name: "fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
if (!__VLS_ctx.collapsed) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
}
var __VLS_15;
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
if (__VLS_ctx.preferences.showBreadcrumb) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-breadcrumb" },
    });
    (__VLS_ctx.activeNav);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
if (__VLS_ctx.preferences.showContextStrip) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "context-strip" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.contextTags))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            key: (item),
            ...{ class: "context-chip" },
        });
        (item);
    }
}
const __VLS_16 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    to: "/settings",
    ...{ class: "settings-link" },
}));
const __VLS_18 = __VLS_17({
    to: "/settings",
    ...{ class: "settings-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "top-avatar" },
});
(__VLS_ctx.displayInitial);
__VLS_asFunctionalElement(__VLS_intrinsicElements.main, __VLS_intrinsicElements.main)({
    ...{ class: "content-area" },
});
const __VLS_20 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({}));
const __VLS_22 = __VLS_21({}, ...__VLS_functionalComponentArgsRest(__VLS_21));
/** @type {__VLS_StyleScopedClasses['app-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-top']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-title']} */ ;
/** @type {__VLS_StyleScopedClasses['brand-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['collapse-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-list']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-item']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['nav-label']} */ ;
/** @type {__VLS_StyleScopedClasses['sidebar-bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['account-card']} */ ;
/** @type {__VLS_StyleScopedClasses['account-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['account-name']} */ ;
/** @type {__VLS_StyleScopedClasses['account-role']} */ ;
/** @type {__VLS_StyleScopedClasses['logout-button']} */ ;
/** @type {__VLS_StyleScopedClasses['main-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['app-header']} */ ;
/** @type {__VLS_StyleScopedClasses['header-title']} */ ;
/** @type {__VLS_StyleScopedClasses['header-breadcrumb']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['context-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['context-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-link']} */ ;
/** @type {__VLS_StyleScopedClasses['top-avatar']} */ ;
/** @type {__VLS_StyleScopedClasses['content-area']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            route: route,
            preferences: preferences,
            collapsed: collapsed,
            navItems: navItems,
            navIconPaths: navIconPaths,
            activeNav: activeNav,
            displayName: displayName,
            displayInitial: displayInitial,
            contextTags: contextTags,
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
