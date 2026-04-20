/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, nextTick, onMounted, ref } from 'vue';
import { getStudentReport } from '../../api/student';
const data = ref();
const formulaDrawerVisible = ref(false);
const scoreFormulaDrawerVisible = ref(false);
onMounted(async () => {
    data.value = await getStudentReport();
});
async function handlePrint() {
    await nextTick();
    window.print();
}
async function handleExportPdf() {
    await nextTick();
    window.print();
}
function tableTone(title) {
    if (title.includes('原始'))
        return 'raw';
    if (title.includes('主表'))
        return 'master';
    if (title.includes('进阶'))
        return 'derived';
    if (title.includes('模型'))
        return 'model';
    return 'default';
}
function tableToneLabel(title) {
    if (title.includes('原始'))
        return '原始值';
    if (title.includes('主表'))
        return '汇总结果';
    if (title.includes('进阶'))
        return '对比结果';
    if (title.includes('模型'))
        return '判断结果';
    return '数据';
}
function isMissingValue(value) {
    const text = String(value ?? '').trim();
    return text === '暂无原始记录' || text === '模型未返回' || text.includes('原始表中缺失') || text.includes('原表缺失');
}
const scoreFormulaCards = computed(() => {
    const scoreFormulaKeys = ['学习投入展示分', '行为规律展示分', '健康发展展示分', '综合发展展示分', '风险安全展示分'];
    return (data.value?.featureFormulas ?? []).filter((item) => scoreFormulaKeys.includes(item.feature));
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['meta-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-expression']} */ ;
/** @type {__VLS_StyleScopedClasses['content-item']} */ ;
/** @type {__VLS_StyleScopedClasses['content-item']} */ ;
/** @type {__VLS_StyleScopedClasses['content-item']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['content-index']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
/** @type {__VLS_StyleScopedClasses['missing']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-effect']} */ ;
/** @type {__VLS_StyleScopedClasses['table-tone']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['master']} */ ;
/** @type {__VLS_StyleScopedClasses['table-tone']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['raw']} */ ;
/** @type {__VLS_StyleScopedClasses['table-tone']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['derived']} */ ;
/** @type {__VLS_StyleScopedClasses['table-tone']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['model']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['score-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-shell report-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "report-actions no-print" },
});
const __VLS_0 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ 'onClick': {} },
}));
const __VLS_2 = __VLS_1({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
let __VLS_4;
let __VLS_5;
let __VLS_6;
const __VLS_7 = {
    onClick: (...[$event]) => {
        __VLS_ctx.scoreFormulaDrawerVisible = true;
    }
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (...[$event]) => {
        __VLS_ctx.formulaDrawerVisible = true;
    }
};
__VLS_11.slots.default;
var __VLS_11;
const __VLS_16 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_20;
let __VLS_21;
let __VLS_22;
const __VLS_23 = {
    onClick: (__VLS_ctx.handlePrint)
};
__VLS_19.slots.default;
var __VLS_19;
const __VLS_24 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_26 = __VLS_25({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
let __VLS_28;
let __VLS_29;
let __VLS_30;
const __VLS_31 = {
    onClick: (__VLS_ctx.handleExportPdf)
};
__VLS_27.slots.default;
var __VLS_27;
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
(__VLS_ctx.data?.title || '个性化报告');
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "hero-subtitle" },
});
(__VLS_ctx.data?.summary || '这里会把当前画像、关键依据、详细数据和接下来的建议整理成一份完整报告。');
if (__VLS_ctx.data?.reportMeta) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero-meta-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-chip" },
    });
    (__VLS_ctx.data.reportMeta.studentName);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-chip" },
    });
    (__VLS_ctx.data.reportMeta.college);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-chip" },
    });
    (__VLS_ctx.data.reportMeta.major);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-chip accent" },
    });
    (__VLS_ctx.data.reportMeta.profileCategory);
    if (__VLS_ctx.data.reportMeta.profileSubtype) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "meta-chip accent" },
        });
        (__VLS_ctx.data.reportMeta.profileSubtype);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-chip warning" },
    });
    (__VLS_ctx.data.reportMeta.riskLevel);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "meta-chip" },
    });
    (__VLS_ctx.data.reportMeta.reportDate);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "score-grid" },
});
for (const [card] of __VLS_getVForSourceType((__VLS_ctx.data?.scoreCards ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (card.label),
        ...{ class: "score-card panel-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "score-label" },
    });
    (card.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "score-value" },
    });
    (card.score);
}
if (__VLS_ctx.scoreFormulaCards.length) {
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
        ...{ class: "formula-card-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.scoreFormulaCards))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.feature),
            ...{ class: "formula-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "detail-label" },
        });
        (item.feature);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-expression" },
        });
        (item.formula);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "detail-note" },
        });
        (item.explanation);
    }
    var __VLS_35;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-grid" },
});
const __VLS_36 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    ...{ class: "panel-card section-card" },
}));
const __VLS_38 = __VLS_37({
    ...{ class: "panel-card section-card" },
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
    ...{ class: "content-list" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.data?.sections ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "content-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content-index" },
    });
    (index + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content-text" },
    });
    (item);
}
var __VLS_39;
const __VLS_40 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    ...{ class: "panel-card section-card" },
}));
const __VLS_42 = __VLS_41({
    ...{ class: "panel-card section-card" },
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
    ...{ class: "content-list compact" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.data?.evaluations ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "content-item compact-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content-index" },
    });
    (index + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content-text" },
    });
    (item);
}
var __VLS_43;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "detail-grid" },
});
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
    ...{ class: "detail-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.data?.behaviorDetails ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.label),
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-label" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-note" },
    });
    (item.note);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-value" },
        ...{ class: ({ missing: __VLS_ctx.isMissingValue(item.value) }) },
    });
    (item.value);
}
var __VLS_47;
const __VLS_48 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    ...{ class: "panel-card" },
}));
const __VLS_50 = __VLS_49({
    ...{ class: "panel-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
__VLS_51.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_51.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "detail-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.data?.academicDetails ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.label),
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-label" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-note" },
    });
    (item.note);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-value" },
        ...{ class: ({ missing: __VLS_ctx.isMissingValue(item.value) }) },
    });
    (item.value);
}
var __VLS_51;
const __VLS_52 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ class: "panel-card" },
}));
const __VLS_54 = __VLS_53({
    ...{ class: "panel-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
__VLS_55.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_55.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "detail-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.data?.predictionEvidence ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.label),
        ...{ class: "detail-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-label" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-note" },
    });
    (item.reason);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-side" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "detail-effect" },
    });
    (item.effect);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-value" },
        ...{ class: ({ missing: __VLS_ctx.isMissingValue(item.value) }) },
    });
    (item.value);
}
var __VLS_55;
const __VLS_56 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    ...{ class: "panel-card" },
}));
const __VLS_58 = __VLS_57({
    ...{ class: "panel-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_59.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "content-list compact" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.data?.suggestions ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "content-item suggestion" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content-index success" },
    });
    (index + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "content-text" },
    });
    (item);
}
var __VLS_59;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "detail-grid" },
});
if (__VLS_ctx.data?.profileExplanation || __VLS_ctx.data?.profileHighlights?.length) {
    const __VLS_60 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        ...{ class: "panel-card" },
    }));
    const __VLS_62 = __VLS_61({
        ...{ class: "panel-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_63.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header-inner" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "minor-copy" },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-note strong" },
    });
    (__VLS_ctx.data?.profileExplanation);
    if (__VLS_ctx.data?.profileHighlights?.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "step-tags section-tags" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.data.profileHighlights))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (item),
                ...{ class: "step-tag" },
            });
            (item);
        }
    }
    var __VLS_63;
}
const __VLS_64 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    ...{ class: "panel-card" },
}));
const __VLS_66 = __VLS_65({
    ...{ class: "panel-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
__VLS_67.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_67.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "dimension-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.data?.dimensionBasis ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.dimension),
        ...{ class: "dimension-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dimension-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-label" },
    });
    (item.dimension);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-effect" },
    });
    (item.judgement);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dimension-bars" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dimension-bar-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "minor-copy" },
    });
    (item.selfScore);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-fill self" },
        ...{ style: ({ width: `${item.selfScore}%` }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dimension-bar-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "minor-copy" },
    });
    (item.clusterScore);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-fill cluster" },
        ...{ style: ({ width: `${item.clusterScore}%` }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dimension-bar-group" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "minor-copy" },
    });
    (item.overallScore);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "bar-fill overall" },
        ...{ style: ({ width: `${item.overallScore}%` }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-note" },
    });
    (item.summary);
}
var __VLS_67;
const __VLS_68 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    ...{ class: "panel-card" },
}));
const __VLS_70 = __VLS_69({
    ...{ class: "panel-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_71.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "step-list" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.data?.predictionSteps ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.title),
        ...{ class: "step-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-index" },
    });
    (index + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-body" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-label" },
    });
    (item.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-note strong" },
    });
    (item.summary);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-tags" },
    });
    for (const [tag] of __VLS_getVForSourceType((item.items))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            key: (tag),
            ...{ class: "step-tag" },
        });
        (tag);
    }
}
var __VLS_71;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "feature-sections" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tone-guide panel-card" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tone-chip raw" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tone-chip master" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tone-chip derived" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
    ...{ class: "tone-chip model" },
});
for (const [table] of __VLS_getVForSourceType((__VLS_ctx.data?.featureTables ?? []))) {
    const __VLS_72 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        key: (table.title),
        ...{ class: "panel-card" },
    }));
    const __VLS_74 = __VLS_73({
        key: (table.title),
        ...{ class: "panel-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    {
        const { header: __VLS_thisSlot } = __VLS_75.slots;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "card-header-inner" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "table-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (table.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "table-tone" },
            ...{ class: (__VLS_ctx.tableTone(table.title)) },
        });
        (__VLS_ctx.tableToneLabel(table.title));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "minor-copy" },
        });
        (table.description);
    }
    const __VLS_76 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        data: (table.rows),
        stripe: true,
        border: true,
    }));
    const __VLS_78 = __VLS_77({
        data: (table.rows),
        stripe: true,
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_79.slots.default;
    const __VLS_80 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        prop: "label",
        label: "特征名",
        minWidth: "140",
    }));
    const __VLS_82 = __VLS_81({
        prop: "label",
        label: "特征名",
        minWidth: "140",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    const __VLS_84 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        label: "当前值",
        minWidth: "140",
    }));
    const __VLS_86 = __VLS_85({
        label: "当前值",
        minWidth: "140",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_87.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: (['table-value', { missing: __VLS_ctx.isMissingValue(row.value) }]) },
        });
        (row.value);
    }
    var __VLS_87;
    const __VLS_88 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        prop: "source",
        label: "来源",
        minWidth: "150",
    }));
    const __VLS_90 = __VLS_89({
        prop: "source",
        label: "来源",
        minWidth: "150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    const __VLS_92 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
        label: "参与判断",
        width: "100",
    }));
    const __VLS_94 = __VLS_93({
        label: "参与判断",
        width: "100",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    __VLS_95.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_95.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        const __VLS_96 = {}.ElTag;
        /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
        // @ts-ignore
        const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
            type: (row.usedInPrediction ? 'danger' : 'info'),
        }));
        const __VLS_98 = __VLS_97({
            type: (row.usedInPrediction ? 'danger' : 'info'),
        }, ...__VLS_functionalComponentArgsRest(__VLS_97));
        __VLS_99.slots.default;
        (row.usedInPrediction ? '是' : '否');
        var __VLS_99;
    }
    var __VLS_95;
    const __VLS_100 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        prop: "description",
        label: "说明",
        minWidth: "240",
    }));
    const __VLS_102 = __VLS_101({
        prop: "description",
        label: "说明",
        minWidth: "240",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    var __VLS_79;
    var __VLS_75;
}
const __VLS_104 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    modelValue: (__VLS_ctx.formulaDrawerVisible),
    title: "全部计算依据",
    size: "52%",
}));
const __VLS_106 = __VLS_105({
    modelValue: (__VLS_ctx.formulaDrawerVisible),
    title: "全部计算依据",
    size: "52%",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "formula-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "formula-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.data?.featureFormulas ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.feature),
        ...{ class: "formula-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "formula-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-label" },
    });
    (item.feature);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-effect" },
    });
    (item.source);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-note strong" },
    });
    (item.formula);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-note" },
    });
    (item.explanation);
}
var __VLS_107;
const __VLS_108 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    modelValue: (__VLS_ctx.scoreFormulaDrawerVisible),
    title: "得分公式",
    size: "46%",
}));
const __VLS_110 = __VLS_109({
    modelValue: (__VLS_ctx.scoreFormulaDrawerVisible),
    title: "得分公式",
    size: "46%",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
__VLS_111.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "formula-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "formula-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.scoreFormulaCards))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.feature),
        ...{ class: "formula-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "formula-head" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-label" },
    });
    (item.feature);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-effect" },
    });
    (item.source);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-note strong" },
    });
    (item.formula);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "detail-note" },
    });
    (item.explanation);
}
var __VLS_111;
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['report-page']} */ ;
/** @type {__VLS_StyleScopedClasses['report-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['no-print']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-meta-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['accent']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['accent']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['warning']} */ ;
/** @type {__VLS_StyleScopedClasses['meta-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['score-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['score-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['score-label']} */ ;
/** @type {__VLS_StyleScopedClasses['score-value']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-card']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-expression']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-note']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['content-list']} */ ;
/** @type {__VLS_StyleScopedClasses['content-item']} */ ;
/** @type {__VLS_StyleScopedClasses['content-index']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['section-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['content-list']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['content-item']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-item']} */ ;
/** @type {__VLS_StyleScopedClasses['content-index']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-list']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-note']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-list']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-note']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-list']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-item']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-note']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-side']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-effect']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-value']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['content-list']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['content-item']} */ ;
/** @type {__VLS_StyleScopedClasses['suggestion']} */ ;
/** @type {__VLS_StyleScopedClasses['content-index']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['content-text']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-note']} */ ;
/** @type {__VLS_StyleScopedClasses['strong']} */ ;
/** @type {__VLS_StyleScopedClasses['step-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['section-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['step-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-list']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-head']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-effect']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-bars']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-bar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['self']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-bar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['cluster']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-bar-group']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['overall']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-note']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['step-list']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['step-index']} */ ;
/** @type {__VLS_StyleScopedClasses['step-body']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-note']} */ ;
/** @type {__VLS_StyleScopedClasses['strong']} */ ;
/** @type {__VLS_StyleScopedClasses['step-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['step-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-sections']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-guide']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['raw']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['master']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['derived']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['model']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['table-head']} */ ;
/** @type {__VLS_StyleScopedClasses['table-tone']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-list']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-item']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-head']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-effect']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-note']} */ ;
/** @type {__VLS_StyleScopedClasses['strong']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-note']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-list']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-item']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-head']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-label']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-effect']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-note']} */ ;
/** @type {__VLS_StyleScopedClasses['strong']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-note']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            data: data,
            formulaDrawerVisible: formulaDrawerVisible,
            scoreFormulaDrawerVisible: scoreFormulaDrawerVisible,
            handlePrint: handlePrint,
            handleExportPdf: handleExportPdf,
            tableTone: tableTone,
            tableToneLabel: tableToneLabel,
            isMissingValue: isMissingValue,
            scoreFormulaCards: scoreFormulaCards,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
