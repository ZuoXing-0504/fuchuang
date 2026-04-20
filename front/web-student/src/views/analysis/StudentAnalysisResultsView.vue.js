/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onMounted, ref } from 'vue';
import { getStudentHome } from '../../api/student';
const data = ref();
const chartDrawerVisible = ref(false);
const activeChart = ref();
onMounted(async () => {
    data.value = await getStudentHome();
});
const summaryCards = computed(() => [
    { label: '分析图表', value: data.value?.analysisCharts?.length ?? 0 },
    { label: '已就绪图表', value: data.value?.chartStatus?.availableCount ?? 0 },
    { label: '缺失图表', value: data.value?.chartStatus?.missingCount ?? 0 }
]);
function chartUrl(url) {
    return url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`;
}
const chartDetailMap = {
    '01': {
        xAxis: '学习时长分组区间',
        yAxis: '学生人数',
        competitionUse: '用来展示全体学生的学习投入分布，让你知道自己处在整个样本里的什么位置。',
        requirementFit: '适用于展示学习投入分布和群体画像能力。',
        readingGuide: '先看多数学生集中在哪个区间，再看高投入或低投入是否形成长尾。'
    },
    '02': {
        xAxis: '图书馆打卡次数分组区间',
        yAxis: '学生人数',
        competitionUse: '用来展示线下学习资源利用情况，帮助理解系统为什么会关注图书馆活跃度。',
        requirementFit: '适用于展示资源利用和线下学习场景。',
        readingGuide: '如果低打卡区间人数很多，说明线下资源利用分层明显。'
    },
    '03': {
        xAxis: '健康指数分组区间',
        yAxis: '学生人数',
        competitionUse: '用来展示样本整体健康发展结构，说明系统不是只看成绩。',
        requirementFit: '适用于展示健康发展维度。',
        readingGuide: '重点看中低健康区间是否占比偏高。'
    },
    '04': {
        xAxis: '夜间上网占比分组区间',
        yAxis: '学生人数',
        competitionUse: '用来展示作息和夜间活跃情况，帮助理解行为规律维度。',
        requirementFit: '适用于展示行为规律和夜间活跃特征。',
        readingGuide: '如果高夜间占比呈长尾，说明一部分学生存在更明显的夜间偏移。'
    },
    '05': {
        xAxis: '学习时长',
        yAxis: '风险概率',
        competitionUse: '用来说明学习投入和风险之间的关系，是风险解释的重要图。',
        requirementFit: '适用于展示学习投入和风险之间的关系。',
        readingGuide: '看低学习时长区域是否更容易出现高风险点。'
    },
    '06': {
        xAxis: '图书馆打卡次数',
        yAxis: '风险概率',
        competitionUse: '用来说明资源利用和风险之间的关系，支撑后续干预建议。',
        requirementFit: '适用于展示资源利用和风险之间的关系。',
        readingGuide: '看低图书馆利用区域是否更容易落在高风险一侧。'
    },
    '07': {
        xAxis: '学生画像类别',
        yAxis: '人数',
        competitionUse: '用来展示系统识别出的主要学生群体，以及各类群体的人数占比。',
        requirementFit: '适用于展示当前识别出的主要学生群体分布。',
        readingGuide: '这张图重点回答“系统识别出了哪些群体，每类各有多少人”。'
    },
    '08': {
        xAxis: '核心特征维度',
        yAxis: '各群体标准化均值',
        competitionUse: '用来比较不同画像群体在关键维度上的差异。',
        requirementFit: '适用于展示不同群体在关键维度上的差异。',
        readingGuide: '重点看不同群体在哪些维度上差异最大。'
    }
};
function chartDetail(chart) {
    return chartDetailMap[chart.title.slice(0, 2)] ?? chartDetailMap[chart.title] ?? chartDetailMap[String(chart.title).split('_')[0]] ?? chartDetailMap[chart.id] ?? {
        xAxis: '图表横轴',
        yAxis: '图表纵轴',
        competitionUse: '用于展示全样本分析成果。',
        requirementFit: '适用于展示系统的全样本分析结果。',
        readingGuide: '建议结合整体分布和异常点来解释这张图。'
    };
}
function openChartDrawer(chart) {
    activeChart.value = chart;
    chartDrawerVisible.value = true;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero-side-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-helper']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-shell analysis-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero panel-card" },
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
    ...{ class: "hero-side-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
(__VLS_ctx.data?.chartStatus?.ready ? '已准备完成' : '待补齐');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-side-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-grid" },
});
for (const [card] of __VLS_getVForSourceType((__VLS_ctx.summaryCards))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
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
}
if (__VLS_ctx.data?.chartStatus?.installHint) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-helper panel-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "helper-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "helper-copy" },
    });
    (__VLS_ctx.data.chartStatus.installHint);
}
if (__VLS_ctx.data?.chartStatus && !__VLS_ctx.data.chartStatus.ready) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-alert panel-card" },
    });
    (__VLS_ctx.data.chartStatus.message || '分析图表暂未准备完成');
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-grid" },
    });
    for (const [chart] of __VLS_getVForSourceType((__VLS_ctx.data?.analysisCharts ?? []))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.data?.chartStatus && !__VLS_ctx.data.chartStatus.ready))
                        return;
                    __VLS_ctx.openChartDrawer(chart);
                } },
            key: (chart.title),
            ...{ class: "chart-card panel-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-top" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-title" },
        });
        (chart.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-category" },
        });
        (chart.category);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "chart-badge" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (__VLS_ctx.chartUrl(chart.url)),
            alt: (chart.title),
            ...{ class: "chart-image" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-desc" },
        });
        (chart.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-insight" },
        });
        (chart.insight);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-entry" },
        });
    }
}
const __VLS_0 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.chartDrawerVisible),
    title: (__VLS_ctx.activeChart?.title || '图表说明'),
    size: "620px",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.chartDrawerVisible),
    title: (__VLS_ctx.activeChart?.title || '图表说明'),
    size: "620px",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
if (__VLS_ctx.activeChart) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-drawer" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
        src: (__VLS_ctx.chartUrl(__VLS_ctx.activeChart.url)),
        alt: (__VLS_ctx.activeChart.title),
        ...{ class: "drawer-chart-image" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-copy" },
    });
    (__VLS_ctx.chartDetail(__VLS_ctx.activeChart).xAxis);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-copy" },
    });
    (__VLS_ctx.chartDetail(__VLS_ctx.activeChart).yAxis);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-copy" },
    });
    (__VLS_ctx.chartDetail(__VLS_ctx.activeChart).competitionUse);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-copy" },
    });
    (__VLS_ctx.chartDetail(__VLS_ctx.activeChart).requirementFit);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-copy" },
    });
    (__VLS_ctx.chartDetail(__VLS_ctx.activeChart).readingGuide);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-card success" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-label" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-copy" },
    });
    (__VLS_ctx.activeChart.insight);
}
var __VLS_3;
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-page']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-side']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-side-item']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-side-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-helper']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-title']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-top']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-category']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-image']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-insight']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-drawer']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-chart-image']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-label']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-copy']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            data: data,
            chartDrawerVisible: chartDrawerVisible,
            activeChart: activeChart,
            summaryCards: summaryCards,
            chartUrl: chartUrl,
            chartDetail: chartDetail,
            openChartDrawer: openChartDrawer,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
