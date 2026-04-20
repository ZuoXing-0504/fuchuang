/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
const props = defineProps();
const toneMap = {
    danger: { color: '#ef4444', bg: 'linear-gradient(135deg, #fef2f2, #fee2e2)', iconBg: 'linear-gradient(135deg, #ef4444, #f87171)', glow: 'rgba(239, 68, 68, 0.15)' },
    warning: { color: '#f59e0b', bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)', iconBg: 'linear-gradient(135deg, #f59e0b, #fbbf24)', glow: 'rgba(245, 158, 11, 0.15)' },
    success: { color: '#10b981', bg: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', iconBg: 'linear-gradient(135deg, #10b981, #34d399)', glow: 'rgba(16, 185, 129, 0.15)' },
    primary: { color: '#2563eb', bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)', iconBg: 'linear-gradient(135deg, #2563eb, #3b82f6)', glow: 'rgba(37, 99, 235, 0.15)' }
};
const iconMap = {
    danger: '⚠',
    warning: '⚡',
    success: '✦',
    primary: '◆'
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-card panel-card" },
    ...{ style: ({ background: __VLS_ctx.toneMap[props.tone].bg }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-top" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-icon" },
    ...{ style: ({ background: __VLS_ctx.toneMap[props.tone].iconBg, boxShadow: `0 4px 12px ${__VLS_ctx.toneMap[props.tone].glow}` }) },
});
(__VLS_ctx.iconMap[props.tone]);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-delta" },
    ...{ style: ({ color: __VLS_ctx.toneMap[props.tone].color, background: `${__VLS_ctx.toneMap[props.tone].color}12` }) },
});
(props.delta);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-value" },
    ...{ style: ({ color: __VLS_ctx.toneMap[props.tone].color }) },
});
(props.value);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stat-label" },
});
(props.label);
/** @type {__VLS_StyleScopedClasses['stat-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-top']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-icon']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-delta']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-value']} */ ;
/** @type {__VLS_StyleScopedClasses['stat-label']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            toneMap: toneMap,
            iconMap: iconMap,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
