/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onMounted, ref } from 'vue';
import { getStudentHome } from '../../api/student';
const data = ref();
onMounted(async () => {
    data.value = await getStudentHome();
});
const quickLinks = [
    { path: '/profile', title: '我的画像', description: '查看当前画像、细分标签和多维表现', action: '进入画像' },
    { path: '/predict', title: '在线预测', description: '修改关键输入项，自己跑一遍奖学金、四六级和发展预测', action: '开始预测' },
    { path: '/compare', title: '群体对比', description: '看看自己与所属群体、全样本的差异位置', action: '查看对比' },
    { path: '/report', title: '个性化报告', description: '集中查看判断依据、解释结论和后续建议', action: '查看报告' },
    { path: '/analysis', title: '全样本分析', description: '浏览全体学生的分析图表与关键结论', action: '查看图表' }
];
const summaryCards = computed(() => data.value?.trendSummary ?? []);
const previewCharts = computed(() => (data.value?.analysisCharts ?? []).slice(0, 4));
const insights = computed(() => data.value?.insights ?? []);
const headlineTags = computed(() => [data.value?.profileCategory, data.value?.riskLevel, data.value?.performanceLevel].filter(Boolean));
function chartUrl(url) {
    return url.startsWith('http') ? url : `http://127.0.0.1:5000${url}`;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['module-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-helper']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['header-link']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['module-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-shell home-page" },
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
(__VLS_ctx.data?.studentName || __VLS_ctx.data?.studentId || '当前学生');
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "hero-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-tags" },
});
for (const [tag] of __VLS_getVForSourceType((__VLS_ctx.headlineTags))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        key: (tag),
        ...{ class: "hero-tag" },
    });
    (tag);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-side" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-side-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-side-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.quickLinks.slice(0, 3)))) {
    const __VLS_0 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        key: (item.path),
        to: (item.path),
        ...{ class: "hero-side-item" },
    }));
    const __VLS_2 = __VLS_1({
        key: (item.path),
        to: (item.path),
        ...{ class: "hero-side-item" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    __VLS_3.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.action);
    var __VLS_3;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "summary-grid" },
});
for (const [card] of __VLS_getVForSourceType((__VLS_ctx.summaryCards))) {
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
}
const __VLS_4 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ class: "panel-card module-panel" },
}));
const __VLS_6 = __VLS_5({
    ...{ class: "panel-card module-panel" },
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
    ...{ class: "module-grid" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.quickLinks))) {
    const __VLS_8 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        key: (item.path),
        to: (item.path),
        ...{ class: "module-card" },
    }));
    const __VLS_10 = __VLS_9({
        key: (item.path),
        to: (item.path),
        ...{ class: "module-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    __VLS_11.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "module-top" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "module-title" },
    });
    (item.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "module-action" },
    });
    (item.action);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "module-copy" },
    });
    (item.description);
    var __VLS_11;
}
var __VLS_7;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-grid" },
});
const __VLS_12 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ class: "panel-card insight-card" },
}));
const __VLS_14 = __VLS_13({
    ...{ class: "panel-card insight-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_15.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "insight-list" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.insights))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "insight-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "insight-index" },
    });
    (index + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "insight-text" },
    });
    (item);
}
var __VLS_15;
const __VLS_16 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ class: "panel-card quick-card" },
}));
const __VLS_18 = __VLS_17({
    ...{ class: "panel-card quick-card" },
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
    ...{ class: "quick-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.quickLinks))) {
    const __VLS_20 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        key: (item.path),
        to: (item.path),
        ...{ class: "quick-item" },
    }));
    const __VLS_22 = __VLS_21({
        key: (item.path),
        to: (item.path),
        ...{ class: "quick-item" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "quick-title" },
    });
    (item.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "quick-desc" },
    });
    (item.description);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "quick-arrow" },
    });
    (item.action);
    var __VLS_23;
}
var __VLS_19;
const __VLS_24 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ class: "panel-card gallery-card" },
}));
const __VLS_26 = __VLS_25({
    ...{ class: "panel-card gallery-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_27.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_28 = {}.RouterLink;
    /** @type {[typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, typeof __VLS_components.RouterLink, typeof __VLS_components.routerLink, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        to: "/analysis",
        ...{ class: "header-link" },
    }));
    const __VLS_30 = __VLS_29({
        to: "/analysis",
        ...{ class: "header-link" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    __VLS_31.slots.default;
    var __VLS_31;
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
    (__VLS_ctx.data.chartStatus.message || '分析图表暂未准备完成');
}
else {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "chart-grid" },
    });
    for (const [chart] of __VLS_getVForSourceType((__VLS_ctx.previewCharts))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (chart.title),
            ...{ class: "chart-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.img)({
            src: (__VLS_ctx.chartUrl(chart.url)),
            alt: (chart.title),
            ...{ class: "chart-image" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-title" },
        });
        (chart.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "chart-copy" },
        });
        (chart.insight || chart.description);
    }
}
var __VLS_27;
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['home-page']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-main']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-side']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-side-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-side-list']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-side-item']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['module-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['module-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['module-card']} */ ;
/** @type {__VLS_StyleScopedClasses['module-top']} */ ;
/** @type {__VLS_StyleScopedClasses['module-title']} */ ;
/** @type {__VLS_StyleScopedClasses['module-action']} */ ;
/** @type {__VLS_StyleScopedClasses['module-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['content-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-list']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-item']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-index']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-text']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-list']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-item']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-title']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['quick-arrow']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['gallery-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['header-link']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-helper']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-title']} */ ;
/** @type {__VLS_StyleScopedClasses['helper-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-card']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-image']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-title']} */ ;
/** @type {__VLS_StyleScopedClasses['chart-copy']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            data: data,
            quickLinks: quickLinks,
            summaryCards: summaryCards,
            previewCharts: previewCharts,
            insights: insights,
            headlineTags: headlineTags,
            chartUrl: chartUrl,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
