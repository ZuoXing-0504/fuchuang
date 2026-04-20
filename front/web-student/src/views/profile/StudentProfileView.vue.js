/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getStudentCompare, getStudentProfile, getStudentRecommendations } from '../../api/student';
import { getProfileCategoryExplanation, getProfileSubtypeExplanation } from '../../utils/profileSubtype';
const router = useRouter();
const profile = ref();
const compare = ref();
const recommendations = ref();
const profileExplainVisible = ref(false);
onMounted(async () => {
    const [profileData, compareData, recommendationData] = await Promise.all([
        getStudentProfile(),
        getStudentCompare(),
        getStudentRecommendations()
    ]);
    profile.value = profileData;
    compare.value = compareData;
    recommendations.value = recommendationData;
});
const sortedRadar = computed(() => [...(profile.value?.radar ?? [])].sort((a, b) => b.value - a.value));
const subtypeExplanation = computed(() => getProfileSubtypeExplanation(profile.value?.profileSubtype));
const headlineCards = computed(() => {
    const scholarshipPercent = Math.round((profile.value?.scholarshipProbability ?? 0) * 100);
    return [
        { label: '风险等级', value: profile.value?.riskLevel || '未提供', note: '用于说明当前风险状态' },
        { label: '健康档次', value: profile.value?.healthLevel || '未提供', note: '反映当前健康发展状态' },
        { label: '奖学金概率', value: `${scholarshipPercent}%`, note: '综合发展相关预测结果' },
        { label: '群体标签', value: compare.value?.clusterLabel || profile.value?.profileCategory || '未提供', note: '你当前最接近的学生群体' }
    ];
});
const insightList = computed(() => {
    const result = [];
    if (profile.value?.profileExplanation) {
        result.push(profile.value.profileExplanation);
    }
    if (profile.value?.profileHighlights?.length) {
        result.push(...profile.value.profileHighlights.slice(0, 3));
    }
    if (compare.value?.explanations?.length) {
        result.push(...compare.value.explanations.slice(0, 2));
    }
    return result.slice(0, 6);
});
const radarTop = computed(() => sortedRadar.value.slice(0, 3));
const radarBottom = computed(() => [...sortedRadar.value].slice(-2).reverse());
const actionItems = computed(() => {
    const recs = recommendations.value?.recommendations ?? [];
    return recs.slice(0, 4);
});
const profileExplainBlocks = computed(() => {
    if (!profile.value)
        return [];
    const blocks = [];
    const categoryText = getProfileCategoryExplanation(profile.value.profileCategory);
    if (categoryText) {
        blocks.push({ title: `主画像：${profile.value.profileCategory}`, body: categoryText });
    }
    if (subtypeExplanation.value && profile.value.profileSubtype) {
        blocks.push({ title: `细分子类：${profile.value.profileSubtype}`, body: subtypeExplanation.value });
    }
    if (profile.value.profileExplanation) {
        blocks.push({ title: '系统个体解释', body: profile.value.profileExplanation });
    }
    return blocks;
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['badge-label']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-note']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-action']} */ ;
/** @type {__VLS_StyleScopedClasses['card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-item']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-item']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-item']} */ ;
/** @type {__VLS_StyleScopedClasses['band-title']} */ ;
/** @type {__VLS_StyleScopedClasses['band-row']} */ ;
/** @type {__VLS_StyleScopedClasses['band-card']} */ ;
/** @type {__VLS_StyleScopedClasses['band-card']} */ ;
/** @type {__VLS_StyleScopedClasses['weak']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['action-category']} */ ;
/** @type {__VLS_StyleScopedClasses['action-priority']} */ ;
/** @type {__VLS_StyleScopedClasses['action-priority']} */ ;
/** @type {__VLS_StyleScopedClasses['action-priority']} */ ;
/** @type {__VLS_StyleScopedClasses['action-priority']} */ ;
/** @type {__VLS_StyleScopedClasses['card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['band-row']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-shell profile-page" },
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
(__VLS_ctx.profile?.profileCategory || '当前画像');
if (__VLS_ctx.profile?.profileSubtype) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero-subtype" },
    });
    (__VLS_ctx.profile.profileSubtype);
}
if (__VLS_ctx.subtypeExplanation) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero-subtype-note" },
    });
    (__VLS_ctx.subtypeExplanation);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "hero-subtitle" },
});
(__VLS_ctx.profile?.description || '这里会从画像标签、多维表现、群体位置和建议方向四个层面，帮助你理解自己当前的状态。');
if (__VLS_ctx.profile?.secondaryTags?.length) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero-tags" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.profile.secondaryTags))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            key: (item),
            ...{ class: "hero-tag" },
        });
        (item);
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-side" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.headlineCards))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (item.label),
        ...{ class: "hero-badge" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "badge-label" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "badge-value" },
    });
    (item.value);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "badge-note" },
    });
    (item.note);
}
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
    ...{ class: "hero-action outline" },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
    ...{ class: "hero-action outline" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.profileExplainVisible = true;
    }
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    ...{ class: "hero-action" },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    ...{ class: "hero-action" },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/report');
    }
};
__VLS_11.slots.default;
var __VLS_11;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "card-grid" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.headlineCards))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (`${item.label}-grid`),
        ...{ class: "summary-card panel-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-label" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-value" },
    });
    (item.value);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-note" },
    });
    (item.note);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "main-grid" },
});
const __VLS_16 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ class: "panel-card metric-panel" },
}));
const __VLS_18 = __VLS_17({
    ...{ class: "panel-card metric-panel" },
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
    ...{ class: "metric-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.profile?.radar ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.indicator),
        ...{ class: "metric-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-name" },
    });
    (item.indicator);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-fill" },
        ...{ style: ({ width: `${item.value}%` }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-value" },
    });
    (item.value);
}
var __VLS_19;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "side-col" },
});
const __VLS_20 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ class: "panel-card" },
}));
const __VLS_22 = __VLS_21({
    ...{ class: "panel-card" },
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
if (__VLS_ctx.subtypeExplanation) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "subtype-panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "subtype-panel-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "subtype-panel-copy" },
    });
    (__VLS_ctx.subtypeExplanation);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "highlight-list" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.insightList))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (`${index}-${item}`),
        ...{ class: "highlight-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "highlight-index" },
    });
    (index + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "highlight-copy" },
    });
    (item);
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
    ...{ class: "tag-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.profile?.strengths ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        key: (item),
        ...{ class: "tag success" },
    });
    (item);
}
var __VLS_27;
const __VLS_28 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ class: "panel-card" },
}));
const __VLS_30 = __VLS_29({
    ...{ class: "panel-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_31.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tag-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.profile?.weaknesses ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        key: (item),
        ...{ class: "tag warn" },
    });
    (item);
}
var __VLS_31;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "detail-grid" },
});
const __VLS_32 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    ...{ class: "panel-card" },
}));
const __VLS_34 = __VLS_33({
    ...{ class: "panel-card" },
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
    ...{ class: "compare-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.compare?.compareMetrics ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.label),
        ...{ class: "compare-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "compare-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-name" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "compare-values" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.selfScore);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.clusterScore);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (item.overallScore);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "compare-bars" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "compare-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "compare-fill self" },
        ...{ style: ({ width: `${item.selfScore}%` }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "compare-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "compare-fill cluster" },
        ...{ style: ({ width: `${item.clusterScore}%` }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "compare-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "compare-fill overall" },
        ...{ style: ({ width: `${item.overallScore}%` }) },
    });
}
var __VLS_35;
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
    ...{ class: "rank-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.compare?.rankingCards ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.label),
        ...{ class: "rank-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "rank-name" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-note" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "rank-score" },
    });
    (item.value);
    (item.suffix);
}
var __VLS_39;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "detail-grid" },
});
const __VLS_40 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ class: "panel-card" },
}));
const __VLS_42 = __VLS_41({
    ...{ class: "panel-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_43.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "rank-band" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "band-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "band-row" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.radarTop))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.indicator),
        ...{ class: "band-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "rank-name" },
    });
    (item.indicator);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "band-score" },
    });
    (item.value);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "band-title weak" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "band-row" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.radarBottom))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.indicator),
        ...{ class: "band-card weak" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "rank-name" },
    });
    (item.indicator);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "band-score" },
    });
    (item.value);
}
var __VLS_43;
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
    ...{ class: "action-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.actionItems))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.id),
        ...{ class: "action-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "action-top" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "action-category" },
    });
    (item.category);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "action-priority" },
        ...{ class: (item.priority) },
    });
    (item.priority);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "action-title" },
    });
    (item.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "highlight-copy" },
    });
    (item.description);
}
const __VLS_48 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_50 = __VLS_49({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
let __VLS_52;
let __VLS_53;
let __VLS_54;
const __VLS_55 = {
    onClick: (...[$event]) => {
        __VLS_ctx.router.push('/report');
    }
};
__VLS_51.slots.default;
var __VLS_51;
var __VLS_47;
const __VLS_56 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.profileExplainVisible),
    title: "画像说明",
    width: "560px",
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.profileExplainVisible),
    title: "画像说明",
    width: "560px",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "explain-dialog" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.profileExplainBlocks))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.title),
        ...{ class: "explain-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "explain-title" },
    });
    (item.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "explain-copy" },
    });
    (item.body);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "explain-note" },
});
var __VLS_59;
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['profile-page']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtype']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtype-note']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-side']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-label']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-value']} */ ;
/** @type {__VLS_StyleScopedClasses['badge-note']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-action']} */ ;
/** @type {__VLS_StyleScopedClasses['outline']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-action']} */ ;
/** @type {__VLS_StyleScopedClasses['card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-note']} */ ;
/** @type {__VLS_StyleScopedClasses['main-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-list']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-row']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-name']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-track']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-value']} */ ;
/** @type {__VLS_StyleScopedClasses['side-col']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['subtype-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['subtype-panel-title']} */ ;
/** @type {__VLS_StyleScopedClasses['subtype-panel-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-list']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-item']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-index']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-list']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-list']} */ ;
/** @type {__VLS_StyleScopedClasses['tag']} */ ;
/** @type {__VLS_StyleScopedClasses['warn']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-list']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-item']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-head']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-name']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-values']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-bars']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-track']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['self']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-track']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['cluster']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-track']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['overall']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-list']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-item']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-name']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-note']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-score']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-band']} */ ;
/** @type {__VLS_StyleScopedClasses['band-title']} */ ;
/** @type {__VLS_StyleScopedClasses['band-row']} */ ;
/** @type {__VLS_StyleScopedClasses['band-card']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-name']} */ ;
/** @type {__VLS_StyleScopedClasses['band-score']} */ ;
/** @type {__VLS_StyleScopedClasses['band-title']} */ ;
/** @type {__VLS_StyleScopedClasses['weak']} */ ;
/** @type {__VLS_StyleScopedClasses['band-row']} */ ;
/** @type {__VLS_StyleScopedClasses['band-card']} */ ;
/** @type {__VLS_StyleScopedClasses['weak']} */ ;
/** @type {__VLS_StyleScopedClasses['rank-name']} */ ;
/** @type {__VLS_StyleScopedClasses['band-score']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['action-list']} */ ;
/** @type {__VLS_StyleScopedClasses['action-item']} */ ;
/** @type {__VLS_StyleScopedClasses['action-top']} */ ;
/** @type {__VLS_StyleScopedClasses['action-category']} */ ;
/** @type {__VLS_StyleScopedClasses['action-priority']} */ ;
/** @type {__VLS_StyleScopedClasses['action-title']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-card']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-title']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-note']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            profile: profile,
            compare: compare,
            profileExplainVisible: profileExplainVisible,
            subtypeExplanation: subtypeExplanation,
            headlineCards: headlineCards,
            insightList: insightList,
            radarTop: radarTop,
            radarBottom: radarBottom,
            actionItems: actionItems,
            profileExplainBlocks: profileExplainBlocks,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
