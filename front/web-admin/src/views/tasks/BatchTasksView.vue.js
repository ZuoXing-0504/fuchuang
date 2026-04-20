/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getStudentDetail, getWarnings } from '../../api/admin';
const router = useRouter();
const rows = ref([]);
const loading = ref(true);
const keyword = ref('');
const selectedStudentId = ref('');
const detail = ref();
const detailLoading = ref(false);
const detailDrawerVisible = ref(false);
const detailError = ref('');
const activeQuickFilter = ref('all');
const riskWeight = {
    高风险: 3,
    中风险: 2,
    低风险: 1
};
onMounted(async () => {
    loading.value = true;
    try {
        rows.value = await getWarnings();
    }
    finally {
        loading.value = false;
    }
});
watch(selectedStudentId, async (studentId) => {
    if (!studentId) {
        detail.value = undefined;
        detailError.value = '';
        return;
    }
    detailLoading.value = true;
    detailError.value = '';
    try {
        detail.value = await getStudentDetail(studentId);
    }
    catch (error) {
        detail.value = undefined;
        detailError.value = error instanceof Error ? error.message : '学生详情加载失败';
        ElMessage.error(detailError.value);
    }
    finally {
        detailLoading.value = false;
    }
});
const queue = computed(() => {
    const q = keyword.value.trim().toLowerCase();
    return [...rows.value]
        .filter((item) => {
        if (activeQuickFilter.value === 'high' && item.riskLevel !== '高风险')
            return false;
        if (activeQuickFilter.value === 'medium' && item.riskLevel !== '中风险')
            return false;
        if (activeQuickFilter.value === 'registered' && item.registrationStatus !== '已注册')
            return false;
        return !q || item.studentId.toLowerCase().includes(q) || item.name.toLowerCase().includes(q) || item.college.toLowerCase().includes(q);
    })
        .sort((a, b) => {
        const riskGap = (riskWeight[b.riskLevel] ?? 0) - (riskWeight[a.riskLevel] ?? 0);
        if (riskGap !== 0) {
            return riskGap;
        }
        return a.scorePrediction - b.scorePrediction;
    })
        .slice(0, 20);
});
const summaryCards = computed(() => {
    const highRisk = rows.value.filter((item) => item.riskLevel === '高风险').length;
    const mediumRisk = rows.value.filter((item) => item.riskLevel === '中风险').length;
    const registered = rows.value.filter((item) => item.registrationStatus === '已注册').length;
    return [
        { key: 'high', label: '高风险待关注', value: highRisk, note: '点击查看高风险名单' },
        { key: 'medium', label: '中风险待跟踪', value: mediumRisk, note: '点击查看跟踪名单' },
        { key: 'registered', label: '已注册学生', value: registered, note: '点击查看已关联账号' },
        { key: 'all', label: '当前队列', value: queue.value.length, note: '显示当前筛选下的前 20 人' }
    ];
});
function categoryFromText(text) {
    if (text.includes('学习') || text.includes('图书馆') || text.includes('成绩'))
        return '学业';
    if (text.includes('夜间') || text.includes('作息') || text.includes('睡眠'))
        return '作息';
    if (text.includes('健康') || text.includes('运动') || text.includes('身体'))
        return '健康';
    if (text.includes('社交') || text.includes('同伴') || text.includes('人际'))
        return '社交';
    return '综合';
}
const suggestionBuckets = computed(() => {
    const counters = new Map();
    for (const item of detail.value?.interventions ?? []) {
        const category = categoryFromText(item);
        counters.set(category, (counters.get(category) ?? 0) + 1);
    }
    return Array.from(counters.entries()).map(([label, value]) => ({ label, value }));
});
function openDetail(studentId) {
    selectedStudentId.value = studentId;
    detailDrawerVisible.value = true;
}
function applyQuickFilter(filter) {
    activeQuickFilter.value = filter;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero-side']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-button']} */ ;
/** @type {__VLS_StyleScopedClasses['queue-item']} */ ;
/** @type {__VLS_StyleScopedClasses['risk-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['risk-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['risk-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['score-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-name']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['bucket-list']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-side']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['queue-side']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-row']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-hero']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-shell workbench-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero panel-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-copy" },
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
    ...{ class: "hero-side" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-chip" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-chip" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-chip" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-grid" },
});
for (const [card] of __VLS_getVForSourceType((__VLS_ctx.summaryCards))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.applyQuickFilter(card.key);
            } },
        key: (card.label),
        type: "button",
        ...{ class: "summary-card summary-button panel-card" },
        ...{ class: ({ active: __VLS_ctx.activeQuickFilter === card.key }) },
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
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "panel-card queue-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "panel-card queue-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy" },
    });
    (__VLS_ctx.activeQuickFilter === 'high' ? '当前查看高风险名单' : __VLS_ctx.activeQuickFilter === 'medium' ? '当前查看中风险跟踪名单' : __VLS_ctx.activeQuickFilter === 'registered' ? '当前查看已注册学生名单' : '点击条目打开干预详情抽屉');
}
const __VLS_4 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    modelValue: (__VLS_ctx.keyword),
    placeholder: "按学号、姓名或学院过滤",
    clearable: true,
    ...{ class: "search-box" },
}));
const __VLS_6 = __VLS_5({
    modelValue: (__VLS_ctx.keyword),
    placeholder: "按学号、姓名或学院过滤",
    clearable: true,
    ...{ class: "search-box" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-box" },
    });
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "queue-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.queue))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    __VLS_ctx.openDetail(item.studentId);
                } },
            key: (item.studentId),
            ...{ class: "queue-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "queue-main" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "queue-name" },
        });
        (item.name || item.studentId);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "queue-meta" },
        });
        (item.studentId);
        (item.college);
        (item.profileCategory);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "queue-side" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "risk-chip" },
            ...{ class: (item.riskLevel) },
        });
        (item.riskLevel);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "score-chip" },
        });
        (item.scorePrediction.toFixed(1));
    }
}
var __VLS_3;
const __VLS_8 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.detailDrawerVisible),
    title: "干预详情",
    size: "560px",
    destroyOnClose: (false),
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.detailDrawerVisible),
    title: "干预详情",
    size: "560px",
    destroyOnClose: (false),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
if (__VLS_ctx.detailLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-box" },
    });
}
else if (__VLS_ctx.detailError) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-box" },
    });
    (__VLS_ctx.detailError);
}
else if (__VLS_ctx.detail) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-shell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-hero dark-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-name" },
    });
    (__VLS_ctx.detail.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-meta" },
    });
    (__VLS_ctx.detail.studentId);
    (__VLS_ctx.detail.college);
    (__VLS_ctx.detail.major);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-tags" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "hero-tag risk" },
    });
    (__VLS_ctx.detail.riskLevel);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "hero-tag" },
    });
    (__VLS_ctx.detail.profileCategory);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "hero-tag info" },
    });
    (__VLS_ctx.detail.registeredUsername ? `已注册 ${__VLS_ctx.detail.registeredUsername}` : '未注册');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-box" },
    });
    (__VLS_ctx.detail.reportSummary || '当前学生暂无可展示的结论摘要。');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "factor-list" },
    });
    for (const [factor, index] of __VLS_getVForSourceType((__VLS_ctx.detail.factors))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (factor.feature),
            ...{ class: "factor-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "factor-index" },
        });
        (index + 1);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "factor-title" },
        });
        (factor.feature);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "factor-copy" },
        });
        (factor.description);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-section" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bucket-list" },
    });
    for (const [bucket] of __VLS_getVForSourceType((__VLS_ctx.suggestionBuckets))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (bucket.label),
            ...{ class: "bucket-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bucket-label" },
        });
        (bucket.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bucket-value" },
        });
        (bucket.value);
    }
    const __VLS_12 = {}.ElCollapse;
    /** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({}));
    const __VLS_14 = __VLS_13({}, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_15.slots.default;
    const __VLS_16 = {}.ElCollapseItem;
    /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        title: "查看行动建议",
        name: "advice",
    }));
    const __VLS_18 = __VLS_17({
        title: "查看行动建议",
        name: "advice",
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_19.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "advice-list" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.detail.interventions))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: "advice-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "advice-index" },
        });
        (index + 1);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "advice-copy" },
        });
        (item);
    }
    var __VLS_19;
    const __VLS_20 = {}.ElCollapseItem;
    /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        title: "查看群体对比",
        name: "compare",
    }));
    const __VLS_22 = __VLS_21({
        title: "查看群体对比",
        name: "compare",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "compare-list" },
    });
    for (const [metric] of __VLS_getVForSourceType((__VLS_ctx.detail.compareMetrics ?? []))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (metric.label),
            ...{ class: "compare-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "compare-label" },
        });
        (metric.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "compare-bars" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "compare-bar-group" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "compare-meta" },
        });
        (metric.selfScore);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "compare-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "compare-fill self" },
            ...{ style: ({ width: `${metric.selfScore}%` }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "compare-bar-group" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "compare-meta" },
        });
        (metric.clusterScore);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "compare-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "compare-fill cluster" },
            ...{ style: ({ width: `${metric.clusterScore}%` }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "compare-bar-group" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "compare-meta" },
        });
        (metric.overallScore);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "compare-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "compare-fill overall" },
            ...{ style: ({ width: `${metric.overallScore}%` }) },
        });
    }
    var __VLS_23;
    var __VLS_15;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-actions" },
    });
    const __VLS_24 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ style: {} },
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (...[$event]) => {
            if (!!(__VLS_ctx.detailLoading))
                return;
            if (!!(__VLS_ctx.detailError))
                return;
            if (!(__VLS_ctx.detail))
                return;
            __VLS_ctx.router.push(`/students/${__VLS_ctx.detail.studentId}`);
            __VLS_ctx.detailDrawerVisible = false;
        }
    };
    __VLS_27.slots.default;
    var __VLS_27;
    const __VLS_32 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (...[$event]) => {
            if (!!(__VLS_ctx.detailLoading))
                return;
            if (!!(__VLS_ctx.detailError))
                return;
            if (!(__VLS_ctx.detail))
                return;
            __VLS_ctx.router.push(`/students/${__VLS_ctx.detail.studentId}/report`);
            __VLS_ctx.detailDrawerVisible = false;
        }
    };
    __VLS_35.slots.default;
    var __VLS_35;
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "loading-box" },
    });
}
var __VLS_11;
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['workbench-page']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-side']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-button']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-note']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['queue-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['search-box']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-box']} */ ;
/** @type {__VLS_StyleScopedClasses['queue-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['queue-item']} */ ;
/** @type {__VLS_StyleScopedClasses['queue-main']} */ ;
/** @type {__VLS_StyleScopedClasses['queue-name']} */ ;
/** @type {__VLS_StyleScopedClasses['queue-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['queue-side']} */ ;
/** @type {__VLS_StyleScopedClasses['risk-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['score-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-box']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-box']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-name']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['risk']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-box']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['factor-list']} */ ;
/** @type {__VLS_StyleScopedClasses['factor-item']} */ ;
/** @type {__VLS_StyleScopedClasses['factor-index']} */ ;
/** @type {__VLS_StyleScopedClasses['factor-title']} */ ;
/** @type {__VLS_StyleScopedClasses['factor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-section']} */ ;
/** @type {__VLS_StyleScopedClasses['section-title']} */ ;
/** @type {__VLS_StyleScopedClasses['bucket-list']} */ ;
/** @type {__VLS_StyleScopedClasses['bucket-item']} */ ;
/** @type {__VLS_StyleScopedClasses['bucket-label']} */ ;
/** @type {__VLS_StyleScopedClasses['bucket-value']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-list']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-item']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-index']} */ ;
/** @type {__VLS_StyleScopedClasses['advice-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-list']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-row']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-label']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-bars']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-bar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-track']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['self']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-bar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-track']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['cluster']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-bar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-track']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['overall']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-box']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            loading: loading,
            keyword: keyword,
            detail: detail,
            detailLoading: detailLoading,
            detailDrawerVisible: detailDrawerVisible,
            detailError: detailError,
            activeQuickFilter: activeQuickFilter,
            queue: queue,
            summaryCards: summaryCards,
            suggestionBuckets: suggestionBuckets,
            openDetail: openDetail,
            applyQuickFilter: applyQuickFilter,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
