/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getAnalysisResults, getWarnings } from '../../api/admin';
const loading = ref(true);
const students = ref([]);
const analysisData = ref();
onMounted(async () => {
    loading.value = true;
    try {
        const [warningRows, analysis] = await Promise.all([getWarnings(), getAnalysisResults()]);
        students.value = warningRows;
        analysisData.value = analysis;
    }
    catch (error) {
        ElMessage.error(error instanceof Error ? error.message : '后台数据加载失败');
    }
    finally {
        loading.value = false;
    }
});
const riskPalette = {
    高风险: '#ef4444',
    中风险: '#f59e0b',
    低风险: '#10b981'
};
const profilePalette = ['#38bdf8', '#10b981', '#f59e0b', '#818cf8', '#f43f5e'];
const stats = computed(() => {
    const rows = students.value;
    const total = rows.length;
    const highRisk = rows.filter((item) => item.riskLevel === '高风险').length;
    const mediumRisk = rows.filter((item) => item.riskLevel === '中风险').length;
    const registered = rows.filter((item) => item.registrationStatus === '已注册').length;
    const categories = new Set(rows.map((item) => item.profileCategory).filter(Boolean)).size;
    return [
        { label: '样本总量', value: total, note: 'analysis_master.csv 实际学生数' },
        { label: '高风险学生', value: highRisk, note: '需要优先关注' },
        { label: '中风险学生', value: mediumRisk, note: '建议持续跟踪' },
        { label: '已注册账号', value: registered, note: `覆盖率 ${total ? Math.round((registered / total) * 100) : 0}%` },
        { label: '识别模式数', value: categories, note: '来自真实画像标签' }
    ];
});
const riskDistribution = computed(() => {
    const counters = new Map();
    for (const student of students.value) {
        counters.set(student.riskLevel, (counters.get(student.riskLevel) ?? 0) + 1);
    }
    return Array.from(counters.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
});
const profileDistribution = computed(() => {
    const counters = new Map();
    for (const student of students.value) {
        counters.set(student.profileCategory, (counters.get(student.profileCategory) ?? 0) + 1);
    }
    return Array.from(counters.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
});
const topRiskStudents = computed(() => {
    const weight = { 高风险: 3, 中风险: 2, 低风险: 1 };
    return [...students.value]
        .sort((a, b) => ((weight[b.riskLevel] ?? 0) - (weight[a.riskLevel] ?? 0)) || (a.scorePrediction - b.scorePrediction))
        .slice(0, 8);
});
const storyline = computed(() => analysisData.value?.storyline ?? []);
function chartUrl(url) {
    return url.startsWith('http') ? url : `http://localhost:5000${url}`;
}
function percentage(value, total) {
    return total ? Math.round((value / total) * 100) : 0;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-link']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-link']} */ ;
/** @type {__VLS_StyleScopedClasses['header-link']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['student-item']} */ ;
/** @type {__VLS_StyleScopedClasses['score-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['module-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['module-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-row']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-value']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-shell dashboard-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero panel-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-main" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "hero-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "hero-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-actions" },
});
const __VLS_0 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    to: "/warnings",
    ...{ class: "hero-link primary" },
}));
const __VLS_2 = __VLS_1({
    to: "/warnings",
    ...{ class: "hero-link primary" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
var __VLS_3;
const __VLS_4 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    to: "/analysis-results",
    ...{ class: "hero-link" },
}));
const __VLS_6 = __VLS_5({
    to: "/analysis-results",
    ...{ class: "hero-link" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
var __VLS_7;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-strip" },
});
const __VLS_8 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    to: "/warnings",
    ...{ class: "module-chip panel-card" },
}));
const __VLS_10 = __VLS_9({
    to: "/warnings",
    ...{ class: "module-chip panel-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-copy" },
});
var __VLS_11;
const __VLS_12 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    to: "/profiles",
    ...{ class: "module-chip panel-card" },
}));
const __VLS_14 = __VLS_13({
    to: "/profiles",
    ...{ class: "module-chip panel-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-copy" },
});
var __VLS_15;
const __VLS_16 = {}.RouterLink;
/** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    to: "/tasks",
    ...{ class: "module-chip panel-card" },
}));
const __VLS_18 = __VLS_17({
    to: "/tasks",
    ...{ class: "module-chip panel-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "module-copy" },
});
var __VLS_19;
const __VLS_20 = {}.ElSkeleton;
/** @type {[typeof __VLS_components.ElSkeleton, typeof __VLS_components.elSkeleton, typeof __VLS_components.ElSkeleton, typeof __VLS_components.elSkeleton, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    loading: (__VLS_ctx.loading),
    animated: true,
}));
const __VLS_22 = __VLS_21({
    loading: (__VLS_ctx.loading),
    animated: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
{
    const { template: __VLS_thisSlot } = __VLS_23.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-grid" },
    });
    for (const [n] of __VLS_getVForSourceType((5))) {
        const __VLS_24 = {}.ElSkeletonItem;
        /** @type {[typeof __VLS_components.ElSkeletonItem, typeof __VLS_components.elSkeletonItem, ]} */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            key: (n),
            variant: "rect",
            ...{ style: {} },
        }));
        const __VLS_26 = __VLS_25({
            key: (n),
            variant: "rect",
            ...{ style: {} },
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    }
}
{
    const { default: __VLS_thisSlot } = __VLS_23.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-grid" },
    });
    for (const [card] of __VLS_getVForSourceType((__VLS_ctx.stats))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (card.label),
            ...{ class: "summary-card panel-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "summary-label" },
        });
        (card.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "summary-value" },
        });
        (card.value);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "summary-note" },
        });
        (card.note);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content-grid" },
    });
    const __VLS_28 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ class: "panel-card cockpit-card dark-panel" },
    }));
    const __VLS_30 = __VLS_29({
        ...{ class: "panel-card cockpit-card dark-panel" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_31.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header-inner" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "minor-copy light" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.riskDistribution))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.name),
            ...{ class: "bar-row dark-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "bar-dot" },
            ...{ style: ({ background: __VLS_ctx.riskPalette[item.name] ?? '#64748b' }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-track dark-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-fill glow" },
            ...{ style: ({ width: `${__VLS_ctx.percentage(item.value, __VLS_ctx.students.length)}%`, background: __VLS_ctx.riskPalette[item.name] ?? '#64748b' }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-value" },
        });
        (item.value);
        (__VLS_ctx.percentage(item.value, __VLS_ctx.students.length));
    }
    var __VLS_31;
    const __VLS_32 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ class: "panel-card cockpit-card" },
    }));
    const __VLS_34 = __VLS_33({
        ...{ class: "panel-card cockpit-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_35.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header-inner" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "minor-copy" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-list" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.profileDistribution))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.name),
            ...{ class: "bar-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-label profile-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "profile-index" },
            ...{ style: ({ background: __VLS_ctx.profilePalette[index % __VLS_ctx.profilePalette.length] }) },
        });
        (index + 1);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-fill" },
            ...{ style: ({ width: `${__VLS_ctx.percentage(item.value, __VLS_ctx.students.length)}%`, background: __VLS_ctx.profilePalette[index % __VLS_ctx.profilePalette.length] }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-value" },
        });
        (item.value);
    }
    var __VLS_35;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content-grid secondary-grid" },
    });
    const __VLS_36 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        ...{ class: "panel-card" },
    }));
    const __VLS_38 = __VLS_37({
        ...{ class: "panel-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_39.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header-inner" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "minor-copy" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "student-list" },
    });
    for (const [student] of __VLS_getVForSourceType((__VLS_ctx.topRiskStudents))) {
        const __VLS_40 = {}.RouterLink;
        /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            key: (student.studentId),
            to: (`/students/${student.studentId}`),
            ...{ class: "student-item" },
        }));
        const __VLS_42 = __VLS_41({
            key: (student.studentId),
            to: (`/students/${student.studentId}`),
            ...{ class: "student-item" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-main" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-name" },
        });
        (student.name);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-meta" },
        });
        (student.studentId);
        (student.college);
        (student.major);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-side" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "risk-chip" },
            ...{ style: ({ color: __VLS_ctx.riskPalette[student.riskLevel] ?? '#64748b', background: `${__VLS_ctx.riskPalette[student.riskLevel] ?? '#64748b'}18` }) },
        });
        (student.riskLevel);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "score-chip" },
        });
        (student.scorePrediction.toFixed(1));
        var __VLS_43;
    }
    var __VLS_39;
    const __VLS_44 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        ...{ class: "panel-card" },
    }));
    const __VLS_46 = __VLS_45({
        ...{ class: "panel-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_47.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header-inner" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "minor-copy" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "storyline-list" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.storyline))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "storyline-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "storyline-index" },
        });
        (index + 1);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "storyline-text" },
        });
        (item);
    }
    var __VLS_47;
    const __VLS_48 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        ...{ class: "panel-card gallery-panel" },
    }));
    const __VLS_50 = __VLS_49({
        ...{ class: "panel-card gallery-panel" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_51.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header-inner" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        const __VLS_52 = {}.RouterLink;
        /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
        // @ts-ignore
        const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
            to: "/analysis-results",
            ...{ class: "header-link" },
        }));
        const __VLS_54 = __VLS_53({
            to: "/analysis-results",
            ...{ class: "header-link" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_53));
        __VLS_55.slots.default;
        var __VLS_55;
    }
    if (__VLS_ctx.analysisData?.chartStatus && !__VLS_ctx.analysisData.chartStatus.ready) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-alert" },
        });
        (__VLS_ctx.analysisData.chartStatus.message || '分析图表暂未准备完成');
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-preview-grid" },
        });
        for (const [chart] of __VLS_getVForSourceType((__VLS_ctx.analysisData?.charts?.slice(0, 4) ?? []))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (chart.id),
                ...{ class: "chart-preview-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
                src: (__VLS_ctx.chartUrl(chart.url)),
                alt: (chart.title),
                ...{ class: "chart-preview-image" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "chart-preview-title" },
            });
            (chart.title);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "chart-preview-copy" },
            });
            (chart.insight || chart.description);
        }
    }
    var __VLS_51;
}
var __VLS_23;
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['dashboard-page']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-main']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-link']} */ ;
/** @type {__VLS_StyleScopedClasses['primary']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-link']} */ ;
/** @type {__VLS_StyleScopedClasses['module-strip']} */ ;
/** @type {__VLS_StyleScopedClasses['module-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['module-title']} */ ;
/** @type {__VLS_StyleScopedClasses['module-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['module-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['module-title']} */ ;
/** @type {__VLS_StyleScopedClasses['module-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['module-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['module-title']} */ ;
/** @type {__VLS_StyleScopedClasses['module-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-note']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['cockpit-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['light']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-list']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-row']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-row']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-label']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-track']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['glow']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-value']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['cockpit-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-list']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-row']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-label']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-label']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-index']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-value']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['secondary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['student-list']} */ ;
/** @type {__VLS_StyleScopedClasses['student-item']} */ ;
/** @type {__VLS_StyleScopedClasses['student-main']} */ ;
/** @type {__VLS_StyleScopedClasses['student-name']} */ ;
/** @type {__VLS_StyleScopedClasses['student-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['student-side']} */ ;
/** @type {__VLS_StyleScopedClasses['risk-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['score-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['storyline-list']} */ ;
/** @type {__VLS_StyleScopedClasses['storyline-item']} */ ;
/** @type {__VLS_StyleScopedClasses['storyline-index']} */ ;
/** @type {__VLS_StyleScopedClasses['storyline-text']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['gallery-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['header-link']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-image']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-copy']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            loading: loading,
            students: students,
            analysisData: analysisData,
            riskPalette: riskPalette,
            profilePalette: profilePalette,
            stats: stats,
            riskDistribution: riskDistribution,
            profileDistribution: profileDistribution,
            topRiskStudents: topRiskStudents,
            storyline: storyline,
            chartUrl: chartUrl,
            percentage: percentage,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
