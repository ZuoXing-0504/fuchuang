/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { nextTick, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getStudentDetail } from '../../api/admin';
const route = useRoute();
const router = useRouter();
const detail = ref();
const formulaDrawerVisible = ref(false);
const loading = ref(true);
const loadError = ref('');
async function loadDetail(studentId) {
    if (!studentId) {
        return;
    }
    loading.value = true;
    loadError.value = '';
    try {
        detail.value = await getStudentDetail(studentId);
    }
    catch (error) {
        detail.value = undefined;
        loadError.value = error instanceof Error ? error.message : '报告加载失败';
    }
    finally {
        loading.value = false;
    }
}
onMounted(async () => {
    await loadDetail(String(route.params.id ?? ''));
});
watch(() => route.params.id, async (studentId) => {
    await loadDetail(String(studentId ?? ''));
});
const reportMeta = ref([]);
const scoreFormulaCards = ref([]);
const profileHighlights = ref([]);
watch(detail, (value) => {
    if (!value) {
        reportMeta.value = [];
        scoreFormulaCards.value = [];
        profileHighlights.value = [];
        return;
    }
    reportMeta.value = [
        { label: '学号', value: value.studentId },
        { label: '姓名', value: value.name },
        { label: '学院', value: value.college || '未提供' },
        { label: '专业', value: value.major || '未提供' },
        { label: '表现档次', value: value.performanceLevel || '未提供' },
        { label: '健康档次', value: value.healthLevel || '未提供' },
        { label: '风险等级', value: value.riskLevel || '未提供' },
        { label: '画像类别', value: value.profileCategory || '未提供' },
        { label: '账号状态', value: value.registeredUsername ? `${value.registrationStatus}（${value.registeredUsername}）` : (value.registrationStatus || '未注册') }
    ];
    const scoreFormulaKeys = ['学习投入展示分', '行为规律展示分', '健康发展展示分', '综合发展展示分', '风险安全展示分'];
    scoreFormulaCards.value = (value.featureFormulas ?? [])
        .filter((item) => scoreFormulaKeys.includes(item.feature))
        .map((item) => ({
        title: item.feature,
        formula: item.formula,
        explanation: item.explanation,
        source: item.source
    }));
    profileHighlights.value = value.profileHighlights?.length
        ? value.profileHighlights
        : [
            value.profileSubtype || value.profileCategory,
            ...(value.secondaryTags ?? []).slice(0, 3),
            ...(value.dimensionBasis ?? []).slice(0, 2).map((item) => `${item.dimension}：${item.judgement}`)
        ].filter(Boolean);
}, { immediate: true });
function featureCount() {
    return (detail.value?.featureTables ?? []).reduce((sum, item) => sum + item.rows.length, 0);
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
        return '展示主表';
    if (title.includes('进阶'))
        return '展示分/对比';
    if (title.includes('模型'))
        return '模型/规则';
    return '数据';
}
async function handlePrint() {
    await nextTick();
    window.print();
}
async function handleExportPdf() {
    await nextTick();
    window.print();
}
function backToDetail() {
    if (!detail.value?.studentId) {
        return;
    }
    router.push(`/students/${detail.value.studentId}`);
}
function isMissingValue(value) {
    const text = String(value ?? '').trim();
    return text === '暂无原始记录' || text === '模型未返回' || text.includes('原始表中缺失') || text.includes('原表缺失');
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['ordered-list']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-value']} */ ;
/** @type {__VLS_StyleScopedClasses['missing']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['missing']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['table-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['table-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['table-tone']} */ ;
/** @type {__VLS_StyleScopedClasses['raw']} */ ;
/** @type {__VLS_StyleScopedClasses['table-tone']} */ ;
/** @type {__VLS_StyleScopedClasses['master']} */ ;
/** @type {__VLS_StyleScopedClasses['table-tone']} */ ;
/** @type {__VLS_StyleScopedClasses['derived']} */ ;
/** @type {__VLS_StyleScopedClasses['table-tone']} */ ;
/** @type {__VLS_StyleScopedClasses['model']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-block']} */ ;
/** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['dual-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['report-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['report-paper']} */ ;
/** @type {__VLS_StyleScopedClasses['section-block']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.detail) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "report-shell" },
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
        onClick: (__VLS_ctx.backToDetail)
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
            if (!(__VLS_ctx.detail))
                return;
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        ...{ class: "report-paper" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.header, __VLS_intrinsicElements.header)({
        ...{ class: "report-hero" },
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
    (__VLS_ctx.detail.reportTitle || '个性化成长评价报告');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "hero-subtitle" },
    });
    (__VLS_ctx.detail.reportSummary);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero-tags" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "hero-tag" },
    });
    (__VLS_ctx.detail.studentId);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "hero-tag" },
    });
    (__VLS_ctx.detail.profileCategory);
    if (__VLS_ctx.detail.profileSubtype) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "hero-tag" },
        });
        (__VLS_ctx.detail.profileSubtype);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "hero-tag risk" },
    });
    (__VLS_ctx.detail.riskLevel);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "hero-tag info" },
    });
    (__VLS_ctx.detail.scorePredictionLabel || '未提供');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "hero-tag neutral" },
    });
    (__VLS_ctx.featureCount());
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "section-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "info-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.reportMeta))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.label),
            ...{ class: "info-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "info-label" },
        });
        (item.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "info-value" },
        });
        (item.value);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "section-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dual-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "evidence-note" },
    });
    (__VLS_ctx.detail.profileExplanation || '系统会结合学习投入、行为规律、图书馆使用、夜间活跃和风险敏感度，对主画像继续细分。');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    if (__VLS_ctx.profileHighlights.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tag-list" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.profileHighlights))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (item),
                ...{ class: "tiny-tag" },
            });
            (item);
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "evidence-note" },
        });
    }
    if (__VLS_ctx.scoreFormulaCards.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
            ...{ class: "section-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-header" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-card-grid" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.scoreFormulaCards))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (item.title),
                ...{ class: "formula-card" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "formula-card-title" },
            });
            (item.title);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "formula-card-formula" },
            });
            (item.formula);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "formula-card-copy" },
            });
            (item.explanation);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "formula-card-source" },
            });
            (item.source);
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "section-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dual-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ol, __VLS_intrinsicElements.ol)({
        ...{ class: "ordered-list" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.detail.reportSections ?? []))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (`section-${index}`),
        });
        (item);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.ol, __VLS_intrinsicElements.ol)({
        ...{ class: "ordered-list success" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.detail.interventions ?? []))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.li, __VLS_intrinsicElements.li)({
            key: (`intervention-${index}`),
        });
        (item);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "section-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dual-grid" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "evidence-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.detail.predictionEvidence ?? []))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.label),
            ...{ class: "evidence-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "evidence-label" },
        });
        (item.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "evidence-note" },
        });
        (item.reason);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "evidence-side" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "evidence-effect" },
        });
        (item.effect);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "evidence-value" },
            ...{ class: ({ missing: __VLS_ctx.isMissingValue(item.value) }) },
        });
        (item.value);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "panel" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "step-list" },
    });
    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.detail.predictionSteps ?? []))) {
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
            ...{ class: "evidence-label" },
        });
        (item.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "evidence-note" },
        });
        (item.summary);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tag-list" },
        });
        for (const [entry] of __VLS_getVForSourceType((item.items))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (entry),
                ...{ class: "tiny-tag" },
            });
            (entry);
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "section-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "dimension-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.detail.dimensionBasis ?? []))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.dimension),
            ...{ class: "dimension-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "dimension-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "evidence-label" },
        });
        (item.dimension);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "evidence-note" },
        });
        (item.summary);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "judge-chip" },
        });
        (item.judgement);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.selfScore);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-fill self" },
            ...{ style: ({ width: `${item.selfScore}%` }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.clusterScore);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-fill cluster" },
            ...{ style: ({ width: `${item.clusterScore}%` }) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (item.overallScore);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-track" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "bar-fill overall" },
            ...{ style: ({ width: `${item.overallScore}%` }) },
        });
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "section-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "tone-guide" },
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
    for (const [table] of __VLS_getVForSourceType((__VLS_ctx.detail.featureTables ?? []))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (table.title),
            ...{ class: "table-section" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "table-title-row" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "table-title-top" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({});
        (table.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "table-tone" },
            ...{ class: (__VLS_ctx.tableTone(table.title)) },
        });
        (__VLS_ctx.tableToneLabel(table.title));
        __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
        (table.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "table-count" },
        });
        (table.rows.length);
        const __VLS_32 = {}.ElTable;
        /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            data: (table.rows),
            stripe: true,
            border: true,
            ...{ class: "feature-table" },
        }));
        const __VLS_34 = __VLS_33({
            data: (table.rows),
            stripe: true,
            border: true,
            ...{ class: "feature-table" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        const __VLS_36 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
            prop: "label",
            label: "特征名",
            minWidth: "150",
        }));
        const __VLS_38 = __VLS_37({
            prop: "label",
            label: "特征名",
            minWidth: "150",
        }, ...__VLS_functionalComponentArgsRest(__VLS_37));
        const __VLS_40 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
            label: "当前值",
            minWidth: "140",
        }));
        const __VLS_42 = __VLS_41({
            label: "当前值",
            minWidth: "140",
        }, ...__VLS_functionalComponentArgsRest(__VLS_41));
        __VLS_43.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_43.slots;
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: (['table-value', { missing: __VLS_ctx.isMissingValue(row.value) }]) },
            });
            (row.value);
        }
        var __VLS_43;
        const __VLS_44 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
            prop: "source",
            label: "数据来源",
            minWidth: "150",
        }));
        const __VLS_46 = __VLS_45({
            prop: "source",
            label: "数据来源",
            minWidth: "150",
        }, ...__VLS_functionalComponentArgsRest(__VLS_45));
        const __VLS_48 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
            label: "参与预测",
            width: "100",
        }));
        const __VLS_50 = __VLS_49({
            label: "参与预测",
            width: "100",
        }, ...__VLS_functionalComponentArgsRest(__VLS_49));
        __VLS_51.slots.default;
        {
            const { default: __VLS_thisSlot } = __VLS_51.slots;
            const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
            const __VLS_52 = {}.ElTag;
            /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
            // @ts-ignore
            const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
                type: (row.usedInPrediction ? 'danger' : 'info'),
            }));
            const __VLS_54 = __VLS_53({
                type: (row.usedInPrediction ? 'danger' : 'info'),
            }, ...__VLS_functionalComponentArgsRest(__VLS_53));
            __VLS_55.slots.default;
            (row.usedInPrediction ? '是' : '否');
            var __VLS_55;
        }
        var __VLS_51;
        const __VLS_56 = {}.ElTableColumn;
        /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
        // @ts-ignore
        const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
            prop: "description",
            label: "说明",
            minWidth: "260",
        }));
        const __VLS_58 = __VLS_57({
            prop: "description",
            label: "说明",
            minWidth: "260",
        }, ...__VLS_functionalComponentArgsRest(__VLS_57));
        var __VLS_35;
    }
    const __VLS_60 = {}.ElDrawer;
    /** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        modelValue: (__VLS_ctx.formulaDrawerVisible),
        title: "特征计算依据",
        size: "52%",
    }));
    const __VLS_62 = __VLS_61({
        modelValue: (__VLS_ctx.formulaDrawerVisible),
        title: "特征计算依据",
        size: "52%",
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "formula-copy" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "formula-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.detail.featureFormulas ?? []))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.feature),
            ...{ class: "formula-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-title" },
        });
        (item.feature);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-source" },
        });
        (item.source);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-text" },
        });
        (item.formula);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-text" },
        });
        (item.explanation);
    }
    var __VLS_63;
}
else if (__VLS_ctx.loading) {
    const __VLS_64 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        description: "正在生成个性化报告...",
    }));
    const __VLS_66 = __VLS_65({
        description: "正在生成个性化报告...",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    var __VLS_68 = {};
    var __VLS_67;
}
else {
    const __VLS_69 = {}.ElEmpty;
    /** @type {[typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ]} */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        description: (__VLS_ctx.loadError || '未获取到报告数据'),
    }));
    const __VLS_71 = __VLS_70({
        description: (__VLS_ctx.loadError || '未获取到报告数据'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    var __VLS_73 = {};
    var __VLS_72;
}
/** @type {__VLS_StyleScopedClasses['report-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['report-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['no-print']} */ ;
/** @type {__VLS_StyleScopedClasses['report-paper']} */ ;
/** @type {__VLS_StyleScopedClasses['report-hero']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['risk']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['neutral']} */ ;
/** @type {__VLS_StyleScopedClasses['section-block']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['info-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['info-card']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['section-block']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['dual-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-note']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-list']} */ ;
/** @type {__VLS_StyleScopedClasses['tiny-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-note']} */ ;
/** @type {__VLS_StyleScopedClasses['section-block']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-card-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-card']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-card-formula']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-card-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-card-source']} */ ;
/** @type {__VLS_StyleScopedClasses['section-block']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['dual-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['ordered-list']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['ordered-list']} */ ;
/** @type {__VLS_StyleScopedClasses['success']} */ ;
/** @type {__VLS_StyleScopedClasses['section-block']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['dual-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-list']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-item']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-label']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-note']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-side']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-effect']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-value']} */ ;
/** @type {__VLS_StyleScopedClasses['panel']} */ ;
/** @type {__VLS_StyleScopedClasses['step-list']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['step-index']} */ ;
/** @type {__VLS_StyleScopedClasses['step-body']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-label']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-note']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-list']} */ ;
/** @type {__VLS_StyleScopedClasses['tiny-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['section-block']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-list']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-card']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-head']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-label']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-note']} */ ;
/** @type {__VLS_StyleScopedClasses['judge-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-block']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-row']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['self']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-row']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['cluster']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-row']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['overall']} */ ;
/** @type {__VLS_StyleScopedClasses['section-block']} */ ;
/** @type {__VLS_StyleScopedClasses['section-header']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-guide']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['raw']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['master']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['derived']} */ ;
/** @type {__VLS_StyleScopedClasses['tone-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['model']} */ ;
/** @type {__VLS_StyleScopedClasses['table-section']} */ ;
/** @type {__VLS_StyleScopedClasses['table-title-row']} */ ;
/** @type {__VLS_StyleScopedClasses['table-title-top']} */ ;
/** @type {__VLS_StyleScopedClasses['table-tone']} */ ;
/** @type {__VLS_StyleScopedClasses['table-count']} */ ;
/** @type {__VLS_StyleScopedClasses['feature-table']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-list']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-item']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-head']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-title']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-source']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-block']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-label']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-text']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-block']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-label']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            detail: detail,
            formulaDrawerVisible: formulaDrawerVisible,
            loading: loading,
            loadError: loadError,
            reportMeta: reportMeta,
            scoreFormulaCards: scoreFormulaCards,
            profileHighlights: profileHighlights,
            featureCount: featureCount,
            tableTone: tableTone,
            tableToneLabel: tableToneLabel,
            handlePrint: handlePrint,
            handleExportPdf: handleExportPdf,
            backToDetail: backToDetail,
            isMissingValue: isMissingValue,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
