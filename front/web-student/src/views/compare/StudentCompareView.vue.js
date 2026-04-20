/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { onMounted, ref } from 'vue';
import { getStudentCompare } from '../../api/student';
const data = ref();
onMounted(async () => {
    data.value = await getStudentCompare();
});
const seriesColors = {
    self: '#1677ff',
    cluster: '#69b1ff',
    overall: '#18a058'
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['ranking-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-row']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-item']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-item']} */ ;
/** @type {__VLS_StyleScopedClasses['ranking-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-side']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-shell compare-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero panel-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-eyebrow" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
    ...{ class: "hero-title" },
});
(__VLS_ctx.data?.studentName ?? '当前学生');
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "hero-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-side" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-chip self" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-chip cluster" },
});
(__VLS_ctx.data?.clusterLabel ?? '所属群体');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-chip overall" },
});
(__VLS_ctx.data?.overallLabel ?? '全样本均值');
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "ranking-grid" },
});
for (const [card] of __VLS_getVForSourceType((__VLS_ctx.data?.rankingCards ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (card.label),
        ...{ class: "ranking-card panel-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ranking-label" },
    });
    (card.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "ranking-value" },
    });
    (card.value);
    (card.suffix);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-grid" },
});
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "panel-card compare-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "panel-card compare-card" },
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
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "compare-list" },
});
for (const [metric] of __VLS_getVForSourceType((__VLS_ctx.data?.compareMetrics ?? []))) {
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
        ...{ class: "bar-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dot" },
        ...{ style: ({ background: __VLS_ctx.seriesColors.self }) },
    });
    (metric.selfScore);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-fill" },
        ...{ style: ({ width: `${metric.selfScore}%`, background: __VLS_ctx.seriesColors.self }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dot" },
        ...{ style: ({ background: __VLS_ctx.seriesColors.cluster }) },
    });
    (metric.clusterScore);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-fill" },
        ...{ style: ({ width: `${metric.clusterScore}%`, background: __VLS_ctx.seriesColors.cluster }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "dot" },
        ...{ style: ({ background: __VLS_ctx.seriesColors.overall }) },
    });
    (metric.overallScore);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-fill" },
        ...{ style: ({ width: `${metric.overallScore}%`, background: __VLS_ctx.seriesColors.overall }) },
    });
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "side-col" },
});
const __VLS_4 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ class: "panel-card side-card" },
}));
const __VLS_6 = __VLS_5({
    ...{ class: "panel-card side-card" },
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
    ...{ class: "trait-list" },
});
for (const [trait] of __VLS_getVForSourceType((__VLS_ctx.data?.clusterTraits ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (trait),
        ...{ class: "trait-item" },
    });
    (trait);
}
var __VLS_7;
const __VLS_8 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ class: "panel-card side-card" },
}));
const __VLS_10 = __VLS_9({
    ...{ class: "panel-card side-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_11.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "explain-list" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.data?.explanations ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "explain-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "explain-index" },
    });
    (index + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "explain-text" },
    });
    (item);
}
var __VLS_11;
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-page']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-side']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['self']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['cluster']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['overall']} */ ;
/** @type {__VLS_StyleScopedClasses['ranking-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['ranking-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['ranking-label']} */ ;
/** @type {__VLS_StyleScopedClasses['ranking-value']} */ ;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-list']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-row']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-label']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-bars']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['dot']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['side-col']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['side-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-list']} */ ;
/** @type {__VLS_StyleScopedClasses['trait-item']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['side-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-list']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-item']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-index']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            data: data,
            seriesColors: seriesColors,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
