/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onMounted, ref } from 'vue';
import { getAnalysisResults } from '../../api/admin';
const data = ref();
const loading = ref(true);
const chartDrawerVisible = ref(false);
const activeChart = ref();
onMounted(async () => {
    loading.value = true;
    try {
        data.value = await getAnalysisResults();
    }
    finally {
        loading.value = false;
    }
});
const toneColorMap = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
};
const competitionNotes = computed(() => [
    '这些图表不是装饰信息，而是系统对全样本数据做出的核心分析结果。',
    '它们共同支撑群体画像、风险关联、行为规律和资源利用等多个分析视角。',
    '建议按“基础分布 -> 风险关联 -> 群体画像”这条顺序阅读，整体逻辑最清晰。'
]);
function chartUrl(url) {
    return url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`;
}
const chartDetailMap = {
    '01': {
        xAxis: '学习时长分组区间',
        yAxis: '学生人数',
        competitionUse: '展示全样本学习投入的总体分布，证明系统具备群体层面的分析能力。',
        requirementFit: '适用于展示学习投入结构、群体画像和整体可视化分析结果。',
        readingGuide: '先看高峰落在哪个学习时长区间，再看是否有长尾分布，用来说明整体投入结构。'
    },
    '02': {
        xAxis: '图书馆打卡次数分组区间',
        yAxis: '学生人数',
        competitionUse: '展示线下学习资源利用情况，补足“线上行为之外”的学习场景分析。',
        requirementFit: '适用于展示资源利用维度和群体分层情况。',
        readingGuide: '如果低打卡区间人数很多，说明资源利用存在明显分层，可作为后续解释依据。'
    },
    '03': {
        xAxis: '健康指数分组区间',
        yAxis: '学生人数',
        competitionUse: '展示健康发展结构，说明系统不是只看成绩，也覆盖身心发展维度。',
        requirementFit: '适用于展示健康发展维度的整体结构。',
        readingGuide: '重点看健康指数是否集中在中低段，用来说明健康发展这一维是否需要重点关注。'
    },
    '04': {
        xAxis: '夜间上网占比分组区间',
        yAxis: '学生人数',
        competitionUse: '展示夜间行为偏移和作息规律，是行为规律维度的重要证据。',
        requirementFit: '适用于展示行为规律和夜间活跃特征。',
        readingGuide: '如果高夜间占比呈明显长尾，就能说明少数学生存在更明显的夜间偏移。'
    },
    '05': {
        xAxis: '学习时长',
        yAxis: '风险概率',
        competitionUse: '展示学习投入和风险之间的关联，用来解释风险模型为什么这样判断。',
        requirementFit: '适用于展示学习投入和风险之间的关联。',
        readingGuide: '重点看低学习时长区域是否聚集更多高风险点，这能直接支撑“学习投入不足会抬高风险”。'
    },
    '06': {
        xAxis: '图书馆打卡次数',
        yAxis: '风险概率',
        competitionUse: '展示资源利用和风险之间的关系，补足线下场景的解释链路。',
        requirementFit: '适用于展示资源利用和风险之间的关联。',
        readingGuide: '如果低图书馆利用区域更容易出现高风险点，就能支撑“补线下学习资源利用”的干预建议。'
    },
    '07': {
        xAxis: '学生画像类别',
        yAxis: '人数',
        competitionUse: '展示四类主画像的样本分布，是群体模式识别成果的直接证明。',
        requirementFit: '适用于展示当前识别出的主要学生群体分布。',
        readingGuide: '这张图主要回答“系统到底识别出哪些群体、每类有多少人”，是聚类成果最直观的图。'
    },
    '08': {
        xAxis: '核心特征维度',
        yAxis: '各群体标准化均值',
        competitionUse: '比较不同画像群体在学习投入、行为规律、健康发展等维度上的差异。',
        requirementFit: '适用于展示不同群体在关键维度上的差异。',
        readingGuide: '如果不同群体在多条维度线上差异明显，就能说明这四类画像是有真实行为差异支撑的。'
    }
};
function chartDetail(chart) {
    return chartDetailMap[chart.id] ?? {
        xAxis: '图表横轴',
        yAxis: '图表纵轴',
        competitionUse: '用于展示系统的分析成果。',
        requirementFit: '适用于展示系统的全样本分析结果。',
        readingGuide: '建议结合峰值、分布和异常点来说明这张图。'
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
/** @type {__VLS_StyleScopedClasses['hero-side']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['storyline-item']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-item']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-helper']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
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
for (const [card] of __VLS_getVForSourceType((__VLS_ctx.data?.summaryCards ?? []))) {
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
        ...{ style: ({ color: __VLS_ctx.toneColorMap[card.tone] }) },
    });
    (card.value);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-grid" },
});
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "panel-card dark-panel" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "panel-card dark-panel" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy light" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "storyline-list" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.data?.storyline ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "storyline-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "story-index" },
    });
    (index + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "story-text" },
    });
    (item);
}
var __VLS_3;
const __VLS_4 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ class: "panel-card helper-panel" },
}));
const __VLS_6 = __VLS_5({
    ...{ class: "panel-card helper-panel" },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
__VLS_7.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_7.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "helper-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.competitionNotes))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item),
        ...{ class: "helper-item" },
    });
    (item);
}
if (__VLS_ctx.data?.chartStatus?.installHint) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-helper" },
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
        ...{ class: "chart-alert" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "alert-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "alert-copy" },
    });
    (__VLS_ctx.data.chartStatus.message || '请检查图表生成依赖和输出目录。');
}
var __VLS_7;
if (__VLS_ctx.loading) {
    const __VLS_8 = {}.ElSkeleton;
    /** @type {[typeof __VLS_components.ElSkeleton, typeof __VLS_components.elSkeleton, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        animated: true,
        rows: (8),
    }));
    const __VLS_10 = __VLS_9({
        animated: true,
        rows: (8),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
}
else if (__VLS_ctx.data?.chartStatus?.ready) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-grid" },
    });
    for (const [chart] of __VLS_getVForSourceType((__VLS_ctx.data?.charts ?? []))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            ...{ onClick: (...[$event]) => {
                    if (!!(__VLS_ctx.loading))
                        return;
                    if (!(__VLS_ctx.data?.chartStatus?.ready))
                        return;
                    __VLS_ctx.openChartDrawer(chart);
                } },
            key: (chart.id),
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
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-id" },
        });
        (chart.id);
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
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "insight-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (chart.insight);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-entry" },
        });
    }
}
const __VLS_12 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    modelValue: (__VLS_ctx.chartDrawerVisible),
    title: (__VLS_ctx.activeChart?.title || '图表说明'),
    size: "620px",
}));
const __VLS_14 = __VLS_13({
    modelValue: (__VLS_ctx.chartDrawerVisible),
    title: (__VLS_ctx.activeChart?.title || '图表说明'),
    size: "620px",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
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
var __VLS_15;
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['analysis-page']} */ ;
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
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dark-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['light']} */ ;
/** @type {__VLS_StyleScopedClasses['storyline-list']} */ ;
/** @type {__VLS_StyleScopedClasses['storyline-item']} */ ;
/** @type {__VLS_StyleScopedClasses['story-index']} */ ;
/** @type {__VLS_StyleScopedClasses['story-text']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-list']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-item']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-helper']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-title']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-title']} */ ;
/** @type {__VLS_StyleScopedClasses['alert-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-top']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-category']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-id']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-image']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-insight']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-label']} */ ;
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
            loading: loading,
            chartDrawerVisible: chartDrawerVisible,
            activeChart: activeChart,
            toneColorMap: toneColorMap,
            competitionNotes: competitionNotes,
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
