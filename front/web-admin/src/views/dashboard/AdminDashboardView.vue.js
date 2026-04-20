/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getAnalysisResults, getWarnings } from '../../api/admin';
const router = useRouter();
const loading = ref(true);
const students = ref([]);
const analysisData = ref();
const activeEntry = ref(null);
const drawerVisible = ref(false);
const riskPalette = {
    高风险: '#ef4444',
    中风险: '#f59e0b',
    低风险: '#10b981'
};
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
const stats = computed(() => {
    const rows = students.value;
    const total = rows.length;
    const highRisk = rows.filter((item) => item.riskLevel === '高风险').length;
    const mediumRisk = rows.filter((item) => item.riskLevel === '中风险').length;
    const registered = rows.filter((item) => item.registrationStatus === '已注册').length;
    return {
        total,
        highRisk,
        mediumRisk,
        registered,
        registerRate: total ? Math.round((registered / total) * 100) : 0
    };
});
const riskDistribution = computed(() => {
    const counters = new Map();
    for (const student of students.value) {
        counters.set(student.riskLevel, (counters.get(student.riskLevel) ?? 0) + 1);
    }
    return Array.from(counters.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
});
const profileDistribution = computed(() => {
    const counters = new Map();
    for (const student of students.value) {
        counters.set(student.profileCategory, (counters.get(student.profileCategory) ?? 0) + 1);
    }
    return Array.from(counters.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
});
const topRiskStudents = computed(() => {
    const weight = { 高风险: 3, 中风险: 2, 低风险: 1 };
    return [...students.value]
        .sort((a, b) => ((weight[b.riskLevel] ?? 0) - (weight[a.riskLevel] ?? 0)) || (a.scorePrediction - b.scorePrediction))
        .slice(0, 6);
});
const quickEntries = computed(() => [
    {
        key: 'warnings',
        title: '风险名单',
        subtitle: '查看重点学生名单，并进入单学生详情和完整报告。',
        route: '/warnings',
        tone: 'warning',
        stats: `${stats.value.highRisk} 名高风险`
    },
    {
        key: 'profiles',
        title: '院系对比',
        subtitle: '查看学院与专业层级的风险比例、注册覆盖率和主导画像。',
        route: '/profiles',
        tone: 'profile',
        stats: `${profileDistribution.value.length} 类真实画像`
    },
    {
        key: 'tasks',
        title: '干预工作台',
        subtitle: '按优先级查看重点学生，并进入干预详情。',
        route: '/tasks',
        tone: 'task',
        stats: `${Math.min(topRiskStudents.value.length, 6)} 名优先学生`
    },
    {
        key: 'analysis',
        title: '分析成果',
        subtitle: '集中查看全样本分析图与关键结论。',
        route: '/analysis-results',
        tone: 'analysis',
        stats: `${analysisData.value?.charts?.length ?? 0} 张图表`
    }
]);
const entryDetails = computed(() => {
    const entry = activeEntry.value;
    if (!entry) {
        return [];
    }
    if (entry.key === 'warnings') {
        return topRiskStudents.value.map((student) => ({
            title: `${student.studentId} · ${student.riskLevel}`,
            copy: `${student.studentId} · ${student.college} · ${student.profileCategory}${student.profileSubtype ? ` / ${student.profileSubtype}` : ''}`
        }));
    }
    if (entry.key === 'profiles') {
        return profileDistribution.value.slice(0, 6).map((item, index) => ({
            title: `${index + 1}. ${item.name}`,
            copy: `当前共有 ${item.value} 人落在该主画像中。`
        }));
    }
    if (entry.key === 'tasks') {
        return topRiskStudents.value.map((student) => ({
            title: student.studentId,
            copy: `${student.college} · ${student.major} · 综合发展 ${student.scorePrediction.toFixed(1)}`
        }));
    }
    return (analysisData.value?.storyline ?? []).slice(0, 6).map((item, index) => ({
        title: `分析结论 ${index + 1}`,
        copy: item
    }));
});
const spotlightCards = computed(() => [
    { label: '样本总量', value: stats.value.total, note: '真实学生记录' },
    { label: '高风险学生', value: stats.value.highRisk, note: '优先干预对象' },
    { label: '中风险学生', value: stats.value.mediumRisk, note: '建议持续跟踪' },
    { label: '注册覆盖', value: `${stats.value.registerRate}%`, note: `${stats.value.registered} 个已注册账号` }
]);
function chartUrl(url) {
    return url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`;
}
function percentage(value, total) {
    return total ? Math.round((value / total) * 100) : 0;
}
function openEntry(entry) {
    activeEntry.value = entry;
    drawerVisible.value = true;
}
function jumpToEntry(route) {
    drawerVisible.value = false;
    router.push(route);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-card']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-card']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-card']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-card']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-card']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['student-item']} */ ;
/** @type {__VLS_StyleScopedClasses['score-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-card']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-row']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-shell dashboard-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero panel-card" },
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
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    type: "primary",
    round: true,
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    type: "primary",
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.jumpToEntry('/warnings');
    }
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    round: true,
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    round: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (...[$event]) => {
        __VLS_ctx.jumpToEntry('/analysis-results');
    }
};
__VLS_11.slots.default;
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-grid" },
});
for (const [card] of __VLS_getVForSourceType((__VLS_ctx.spotlightCards))) {
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
const __VLS_16 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ class: "panel-card entry-panel" },
}));
const __VLS_18 = __VLS_17({
    ...{ class: "panel-card entry-panel" },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_19.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "entry-grid" },
});
for (const [entry] of __VLS_getVForSourceType((__VLS_ctx.quickEntries))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.openEntry(entry);
            } },
        key: (entry.key),
        ...{ class: "entry-card" },
        ...{ class: (entry.tone) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "entry-top" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "entry-kicker" },
    });
    (entry.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "entry-stat" },
    });
    (entry.stats);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "entry-copy" },
    });
    (entry.subtitle);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "entry-footer" },
    });
}
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-grid" },
});
const __VLS_20 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ class: "panel-card distribution-panel" },
}));
const __VLS_22 = __VLS_21({
    ...{ class: "panel-card distribution-panel" },
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
__VLS_23.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_23.slots;
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
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.riskDistribution))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.name),
        ...{ class: "bar-row" },
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
        ...{ class: "bar-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-fill" },
        ...{ style: ({ width: `${__VLS_ctx.percentage(item.value, __VLS_ctx.students.length)}%`, background: __VLS_ctx.riskPalette[item.name] ?? '#64748b' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-value" },
    });
    (item.value);
    (__VLS_ctx.percentage(item.value, __VLS_ctx.students.length));
}
var __VLS_23;
const __VLS_24 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ class: "panel-card" },
}));
const __VLS_26 = __VLS_25({
    ...{ class: "panel-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_27.slots;
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.router.push(`/students/${student.studentId}`);
            } },
        key: (student.studentId),
        ...{ class: "student-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "student-main" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "student-name" },
    });
    (student.studentId);
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
}
var __VLS_27;
const __VLS_28 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ class: "panel-card gallery-panel" },
}));
const __VLS_30 = __VLS_29({
    ...{ class: "panel-card gallery-panel" },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_31.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_32 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        link: true,
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (...[$event]) => {
            __VLS_ctx.jumpToEntry('/analysis-results');
        }
    };
    __VLS_35.slots.default;
    var __VLS_35;
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
    for (const [chart] of __VLS_getVForSourceType((__VLS_ctx.analysisData?.charts?.slice(0, 3) ?? []))) {
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
var __VLS_31;
const __VLS_40 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.drawerVisible),
    title: (__VLS_ctx.activeEntry?.title || '功能摘要'),
    size: "460px",
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.drawerVisible),
    title: (__VLS_ctx.activeEntry?.title || '功能摘要'),
    size: "460px",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
if (__VLS_ctx.activeEntry) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-shell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-stat" },
    });
    (__VLS_ctx.activeEntry.stats);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-copy" },
    });
    (__VLS_ctx.activeEntry.subtitle);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-list" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.entryDetails))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (`${__VLS_ctx.activeEntry.key}-${index}`),
            ...{ class: "drawer-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "drawer-index" },
        });
        (index + 1);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "drawer-item-title" },
        });
        (item.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "drawer-item-copy" },
        });
        (item.copy);
    }
    const __VLS_44 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ style: {} },
    }));
    const __VLS_46 = __VLS_45({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    let __VLS_48;
    let __VLS_49;
    let __VLS_50;
    const __VLS_51 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.activeEntry))
                return;
            __VLS_ctx.jumpToEntry(__VLS_ctx.activeEntry.route);
        }
    };
    __VLS_47.slots.default;
    (__VLS_ctx.activeEntry.title);
    var __VLS_47;
}
var __VLS_43;
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['dashboard-page']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-main']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-note']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-card']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-top']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-kicker']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['entry-footer']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['distribution-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-list']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-row']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-label']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-value']} */ ;
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
/** @type {__VLS_StyleScopedClasses['gallery-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-image']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-preview-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-stat']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-list']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-item']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-index']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-item-title']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-item-copy']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            students: students,
            analysisData: analysisData,
            activeEntry: activeEntry,
            drawerVisible: drawerVisible,
            riskPalette: riskPalette,
            riskDistribution: riskDistribution,
            topRiskStudents: topRiskStudents,
            quickEntries: quickEntries,
            entryDetails: entryDetails,
            spotlightCards: spotlightCards,
            chartUrl: chartUrl,
            percentage: percentage,
            openEntry: openEntry,
            jumpToEntry: jumpToEntry,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
