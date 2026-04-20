/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getStudentDetail } from '../../api/admin';
import { getProfileCategoryExplanation, getProfileSubtypeExplanation } from '../../utils/profileSubtype';
const route = useRoute();
const router = useRouter();
const detail = ref();
const searchStudentId = ref(String(route.params.id ?? ''));
const panelDrawerVisible = ref(false);
const activePanel = ref('profile');
const formulaDrawerVisible = ref(false);
const profileExplainVisible = ref(false);
async function loadDetail(studentId) {
    if (!studentId) {
        return;
    }
    detail.value = await getStudentDetail(studentId);
}
onMounted(async () => {
    await loadDetail(String(route.params.id ?? ''));
});
watch(() => route.params.id, async (studentId) => {
    searchStudentId.value = String(studentId ?? '');
    await loadDetail(String(studentId ?? ''));
});
const baseInfo = computed(() => {
    if (!detail.value) {
        return [];
    }
    return [
        { label: '学号', value: detail.value.studentId },
        { label: '学院', value: detail.value.college || '未提供' },
        { label: '专业', value: detail.value.major || '未提供' },
        { label: '表现档次', value: detail.value.performanceLevel || '未提供' },
        { label: '健康档次', value: detail.value.healthLevel || '未提供' },
        { label: '账号状态', value: detail.value.registeredUsername ? `${detail.value.registrationStatus}（${detail.value.registeredUsername}）` : (detail.value.registrationStatus || '未注册') }
    ];
});
const insightCards = computed(() => {
    if (!detail.value) {
        return [];
    }
    return [
        {
            key: 'profile',
            title: '画像解释',
            note: detail.value.profileSubtype || detail.value.profileCategory,
            summary: detail.value.profileExplanation || '查看主画像和细分画像的解释说明。'
        },
        {
            key: 'evidence',
            title: '预测依据',
            note: `${detail.value.predictionEvidence?.length ?? 0} 条依据`,
            summary: detail.value.predictionEvidence?.[0]?.reason || '查看原始特征如何影响画像与风险。'
        },
        {
            key: 'metrics',
            title: '详细特征',
            note: `${(detail.value.behaviorDetails?.length ?? 0) + (detail.value.academicDetails?.length ?? 0)} 项明细`,
            summary: '查看行为明细、学业明细和群体对比。'
        },
        {
            key: 'risk',
            title: '风险结论',
            note: `${detail.value.factors?.length ?? 0} 条说明`,
            summary: detail.value.reportSummary || '查看风险解释与完整报告入口。'
        },
        {
            key: 'pipeline',
            title: '预测链路',
            note: `${detail.value.predictionSteps?.length ?? 0} 个步骤`,
            summary: '查看从原始特征到画像与风险输出的过程。'
        }
    ];
});
const activePanelTitle = computed(() => {
    switch (activePanel.value) {
        case 'profile': return '画像与细分解释';
        case 'evidence': return '预测依据与维度判读';
        case 'metrics': return '详细特征与群体对比';
        case 'risk': return '风险解释与报告入口';
        case 'pipeline': return '预测链路';
        default: return '详情';
    }
});
const profileHighlights = computed(() => {
    if (!detail.value) {
        return [];
    }
    return detail.value.profileHighlights?.length
        ? detail.value.profileHighlights
        : [
            detail.value.profileSubtype || detail.value.profileCategory,
            ...(detail.value.secondaryTags ?? []).slice(0, 3),
            ...(detail.value.dimensionBasis ?? []).slice(0, 2).map((item) => `${item.dimension}：${item.judgement}`)
        ].filter(Boolean);
});
const scoreFormulaCards = computed(() => {
    const scoreFormulaKeys = ['学习投入展示分', '行为规律展示分', '健康发展展示分', '综合发展展示分', '风险安全展示分'];
    return (detail.value?.featureFormulas ?? []).filter((item) => scoreFormulaKeys.includes(item.feature));
});
const profileExplainBlocks = computed(() => {
    if (!detail.value)
        return [];
    const blocks = [];
    const categoryText = getProfileCategoryExplanation(detail.value.profileCategory);
    const subtypeText = getProfileSubtypeExplanation(detail.value.profileSubtype);
    if (categoryText) {
        blocks.push({ title: `主画像：${detail.value.profileCategory}`, body: categoryText });
    }
    if (subtypeText && detail.value.profileSubtype) {
        blocks.push({ title: `细分子类：${detail.value.profileSubtype}`, body: subtypeText });
    }
    if (detail.value.profileExplanation) {
        blocks.push({ title: '系统个体解释', body: detail.value.profileExplanation });
    }
    return blocks;
});
function handleSearch() {
    const value = searchStudentId.value.trim();
    if (!value) {
        return;
    }
    router.push(`/students/${value}`);
}
function openReport() {
    if (!detail.value?.studentId) {
        return;
    }
    router.push(`/students/${detail.value.studentId}/report`);
}
function openPanel(panel) {
    activePanel.value = panel;
    panelDrawerVisible.value = true;
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
/** @type {__VLS_StyleScopedClasses['insight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-value']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-row']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['factor-index']} */ ;
/** @type {__VLS_StyleScopedClasses['step-index']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-index']} */ ;
/** @type {__VLS_StyleScopedClasses['base-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['compare-row']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
// CSS variable injection 
// CSS variable injection end 
if (__VLS_ctx.detail) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
        ...{ class: "page-shell detail-page" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "page-header" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({
        ...{ class: "page-title" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "page-subtitle" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "header-actions" },
    });
    const __VLS_0 = {}.ElInput;
    /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.searchStudentId),
        placeholder: "输入学号直接查询",
        clearable: true,
        ...{ style: {} },
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onKeyup': {} },
        modelValue: (__VLS_ctx.searchStudentId),
        placeholder: "输入学号直接查询",
        clearable: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    let __VLS_4;
    let __VLS_5;
    let __VLS_6;
    const __VLS_7 = {
        onKeyup: (__VLS_ctx.handleSearch)
    };
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
            __VLS_ctx.profileExplainVisible = true;
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
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.detail))
                return;
            __VLS_ctx.formulaDrawerVisible = true;
        }
    };
    __VLS_19.slots.default;
    var __VLS_19;
    const __VLS_24 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        ...{ 'onClick': {} },
    }));
    const __VLS_26 = __VLS_25({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    let __VLS_28;
    let __VLS_29;
    let __VLS_30;
    const __VLS_31 = {
        onClick: (__VLS_ctx.openReport)
    };
    __VLS_27.slots.default;
    var __VLS_27;
    const __VLS_32 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_34 = __VLS_33({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    let __VLS_36;
    let __VLS_37;
    let __VLS_38;
    const __VLS_39 = {
        onClick: (__VLS_ctx.handleSearch)
    };
    __VLS_35.slots.default;
    var __VLS_35;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero panel-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero-name" },
    });
    (__VLS_ctx.detail.studentId);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero-meta" },
    });
    (__VLS_ctx.detail.studentId);
    (__VLS_ctx.detail.college);
    (__VLS_ctx.detail.major);
    if (__VLS_ctx.detail.profileSubtype) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "hero-subtype" },
        });
        (__VLS_ctx.detail.profileSubtype);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "hero-tags" },
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
    (__VLS_ctx.detail.scorePredictionLabel || '未提供');
    if (__VLS_ctx.detail.secondaryTags?.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tag-band panel-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "band-label" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "band-tags" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.detail.secondaryTags))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (item),
                ...{ class: "band-tag" },
            });
            (item);
        }
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "base-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.baseInfo))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (item.label),
            ...{ class: "base-card panel-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "base-label" },
        });
        (item.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "base-value" },
        });
        (item.value);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-layout" },
    });
    const __VLS_40 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        ...{ class: "panel-card summary-panel" },
    }));
    const __VLS_42 = __VLS_41({
        ...{ class: "panel-card summary-panel" },
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
        ...{ class: "summary-box" },
    });
    (__VLS_ctx.detail.reportSummary);
    const __VLS_44 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        ...{ 'onClick': {} },
        type: "primary",
        plain: true,
    }));
    const __VLS_46 = __VLS_45({
        ...{ 'onClick': {} },
        type: "primary",
        plain: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    let __VLS_48;
    let __VLS_49;
    let __VLS_50;
    const __VLS_51 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.detail))
                return;
            __VLS_ctx.openPanel('risk');
        }
    };
    __VLS_47.slots.default;
    var __VLS_47;
    var __VLS_43;
    const __VLS_52 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        ...{ class: "panel-card summary-panel" },
    }));
    const __VLS_54 = __VLS_53({
        ...{ class: "panel-card summary-panel" },
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
        ...{ class: "insight-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.insightCards))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.detail))
                        return;
                    __VLS_ctx.openPanel(item.key);
                } },
            key: (item.key),
            ...{ class: "insight-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "insight-head" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "insight-title" },
        });
        (item.title);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "insight-note" },
        });
        (item.note);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "insight-copy" },
        });
        (item.summary);
    }
    var __VLS_55;
    const __VLS_56 = {}.ElDrawer;
    /** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        modelValue: (__VLS_ctx.panelDrawerVisible),
        title: (__VLS_ctx.activePanelTitle),
        size: "640px",
    }));
    const __VLS_58 = __VLS_57({
        modelValue: (__VLS_ctx.panelDrawerVisible),
        title: (__VLS_ctx.activePanelTitle),
        size: "640px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    if (__VLS_ctx.activePanel === 'profile') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "drawer-shell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "summary-box" },
        });
        (__VLS_ctx.detail.profileExplanation || '系统会结合学习投入、行为规律、图书馆使用、夜间活跃和风险敏感度，对当前主画像继续细分。');
        if (__VLS_ctx.profileHighlights.length) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "highlight-list" },
            });
            for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.profileHighlights))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (item),
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
        }
    }
    else if (__VLS_ctx.activePanel === 'evidence') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "drawer-shell" },
        });
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
                ...{ class: "snapshot-label" },
            });
            (item.label);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "snapshot-note" },
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
                ...{ class: "snapshot-value" },
                ...{ class: ({ missing: __VLS_ctx.isMissingValue(item.value) }) },
            });
            (item.value);
        }
        const __VLS_60 = {}.ElCollapse;
        /** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, ]} */ ;
        // @ts-ignore
        const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({}));
        const __VLS_62 = __VLS_61({}, ...__VLS_functionalComponentArgsRest(__VLS_61));
        __VLS_63.slots.default;
        const __VLS_64 = {}.ElCollapseItem;
        /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
        // @ts-ignore
        const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
            title: "查看维度判读",
            name: "dimension",
        }));
        const __VLS_66 = __VLS_65({
            title: "查看维度判读",
            name: "dimension",
        }, ...__VLS_functionalComponentArgsRest(__VLS_65));
        __VLS_67.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "dimension-list" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.detail.dimensionBasis ?? []))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (item.dimension),
                ...{ class: "dimension-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "dimension-head" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "snapshot-label" },
            });
            (item.dimension);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "dimension-judgement" },
            });
            (item.judgement);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "compare-bars" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "compare-bar-group" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "compare-meta" },
            });
            (item.selfScore);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "compare-track" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "compare-fill self" },
                ...{ style: ({ width: `${item.selfScore}%` }) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "compare-bar-group" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "compare-meta" },
            });
            (item.clusterScore);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "compare-track" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "compare-fill cluster" },
                ...{ style: ({ width: `${item.clusterScore}%` }) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "compare-bar-group" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "compare-meta" },
            });
            (item.overallScore);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "compare-track" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "compare-fill overall" },
                ...{ style: ({ width: `${item.overallScore}%` }) },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "snapshot-note" },
            });
            (item.summary);
        }
        var __VLS_67;
        var __VLS_63;
    }
    else if (__VLS_ctx.activePanel === 'metrics') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "drawer-shell" },
        });
        if (__VLS_ctx.scoreFormulaCards.length) {
            const __VLS_68 = {}.ElAlert;
            /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
            // @ts-ignore
            const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
                type: "info",
                closable: (false),
                showIcon: true,
                title: "需要看分数怎么来的？可点顶部“得分公式”查看核心分数说明。",
            }));
            const __VLS_70 = __VLS_69({
                type: "info",
                closable: (false),
                showIcon: true,
                title: "需要看分数怎么来的？可点顶部“得分公式”查看核心分数说明。",
            }, ...__VLS_functionalComponentArgsRest(__VLS_69));
        }
        const __VLS_72 = {}.ElCollapse;
        /** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
        const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
        __VLS_75.slots.default;
        const __VLS_76 = {}.ElCollapseItem;
        /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
        // @ts-ignore
        const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
            title: "行为明细快照",
            name: "behavior",
        }));
        const __VLS_78 = __VLS_77({
            title: "行为明细快照",
            name: "behavior",
        }, ...__VLS_functionalComponentArgsRest(__VLS_77));
        __VLS_79.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "snapshot-list" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.detail.behaviorDetails ?? []))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (item.label),
                ...{ class: "snapshot-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "snapshot-label" },
            });
            (item.label);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "snapshot-note" },
            });
            (item.note);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "snapshot-value" },
                ...{ class: ({ missing: __VLS_ctx.isMissingValue(item.value) }) },
            });
            (item.value);
        }
        var __VLS_79;
        const __VLS_80 = {}.ElCollapseItem;
        /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
        // @ts-ignore
        const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
            title: "学业明细快照",
            name: "academic",
        }));
        const __VLS_82 = __VLS_81({
            title: "学业明细快照",
            name: "academic",
        }, ...__VLS_functionalComponentArgsRest(__VLS_81));
        __VLS_83.slots.default;
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "snapshot-list" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.detail.academicDetails ?? []))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (item.label),
                ...{ class: "snapshot-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "snapshot-label" },
            });
            (item.label);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "snapshot-note" },
            });
            (item.note);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "snapshot-value" },
                ...{ class: ({ missing: __VLS_ctx.isMissingValue(item.value) }) },
            });
            (item.value);
        }
        var __VLS_83;
        const __VLS_84 = {}.ElCollapseItem;
        /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
        // @ts-ignore
        const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
            title: "群体对比",
            name: "compare",
        }));
        const __VLS_86 = __VLS_85({
            title: "群体对比",
            name: "compare",
        }, ...__VLS_functionalComponentArgsRest(__VLS_85));
        __VLS_87.slots.default;
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
        var __VLS_87;
        var __VLS_75;
    }
    else if (__VLS_ctx.activePanel === 'risk') {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "drawer-shell" },
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
                ...{ class: "factor-name" },
            });
            (factor.feature);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "factor-copy" },
            });
            (factor.description);
        }
        const __VLS_88 = {}.ElCard;
        /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
        // @ts-ignore
        const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
            ...{ class: "panel-card" },
        }));
        const __VLS_90 = __VLS_89({
            ...{ class: "panel-card" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_89));
        __VLS_91.slots.default;
        {
            const { header: __VLS_thisSlot } = __VLS_91.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "card-header-inner" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "minor-copy" },
            });
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "report-entry" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "intervention-text" },
        });
        const __VLS_92 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            ...{ 'onClick': {} },
            type: "primary",
        }));
        const __VLS_94 = __VLS_93({
            ...{ 'onClick': {} },
            type: "primary",
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        let __VLS_96;
        let __VLS_97;
        let __VLS_98;
        const __VLS_99 = {
            onClick: (__VLS_ctx.openReport)
        };
        __VLS_95.slots.default;
        var __VLS_95;
        var __VLS_91;
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "drawer-shell" },
        });
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
                ...{ class: "step-title" },
            });
            (item.title);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "step-summary" },
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
    }
    var __VLS_59;
    const __VLS_100 = {}.ElDrawer;
    /** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
    // @ts-ignore
    const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
        modelValue: (__VLS_ctx.formulaDrawerVisible),
        title: "核心分数公式",
        size: "520px",
    }));
    const __VLS_102 = __VLS_101({
        modelValue: (__VLS_ctx.formulaDrawerVisible),
        title: "核心分数公式",
        size: "520px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_101));
    __VLS_103.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-shell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-box" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.scoreFormulaCards))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.feature),
            ...{ class: "formula-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-title" },
        });
        (item.feature);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-expression" },
        });
        (item.formula);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-copy" },
        });
        (item.explanation);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "formula-source" },
        });
        (item.source);
    }
    if (!__VLS_ctx.scoreFormulaCards.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "loading-box" },
        });
    }
    var __VLS_103;
    const __VLS_104 = {}.ElDialog;
    /** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
    // @ts-ignore
    const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
        modelValue: (__VLS_ctx.profileExplainVisible),
        title: "画像说明",
        width: "560px",
    }));
    const __VLS_106 = __VLS_105({
        modelValue: (__VLS_ctx.profileExplainVisible),
        title: "画像说明",
        width: "560px",
    }, ...__VLS_functionalComponentArgsRest(__VLS_105));
    __VLS_107.slots.default;
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
    var __VLS_107;
}
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['detail-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-name']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtype']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['risk']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['info']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-band']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['band-label']} */ ;
/** @type {__VLS_StyleScopedClasses['band-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['band-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['base-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['base-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['base-label']} */ ;
/** @type {__VLS_StyleScopedClasses['base-value']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-layout']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-box']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-panel']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-card']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-head']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-title']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-note']} */ ;
/** @type {__VLS_StyleScopedClasses['insight-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-box']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-list']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-item']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-index']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-list']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-item']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-label']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-note']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-side']} */ ;
/** @type {__VLS_StyleScopedClasses['evidence-effect']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-value']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-list']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-item']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-head']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-label']} */ ;
/** @type {__VLS_StyleScopedClasses['dimension-judgement']} */ ;
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
/** @type {__VLS_StyleScopedClasses['snapshot-note']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-list']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-label']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-note']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-value']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-list']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-item']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-label']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-note']} */ ;
/** @type {__VLS_StyleScopedClasses['snapshot-value']} */ ;
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
/** @type {__VLS_StyleScopedClasses['drawer-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['factor-list']} */ ;
/** @type {__VLS_StyleScopedClasses['factor-item']} */ ;
/** @type {__VLS_StyleScopedClasses['factor-index']} */ ;
/** @type {__VLS_StyleScopedClasses['factor-name']} */ ;
/** @type {__VLS_StyleScopedClasses['factor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['report-entry']} */ ;
/** @type {__VLS_StyleScopedClasses['intervention-text']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['step-list']} */ ;
/** @type {__VLS_StyleScopedClasses['step-item']} */ ;
/** @type {__VLS_StyleScopedClasses['step-index']} */ ;
/** @type {__VLS_StyleScopedClasses['step-body']} */ ;
/** @type {__VLS_StyleScopedClasses['step-title']} */ ;
/** @type {__VLS_StyleScopedClasses['step-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['step-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['step-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-box']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-card']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-title']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-expression']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['formula-source']} */ ;
/** @type {__VLS_StyleScopedClasses['loading-box']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-dialog']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-card']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-title']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['explain-note']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            detail: detail,
            searchStudentId: searchStudentId,
            panelDrawerVisible: panelDrawerVisible,
            activePanel: activePanel,
            formulaDrawerVisible: formulaDrawerVisible,
            profileExplainVisible: profileExplainVisible,
            baseInfo: baseInfo,
            insightCards: insightCards,
            activePanelTitle: activePanelTitle,
            profileHighlights: profileHighlights,
            scoreFormulaCards: scoreFormulaCards,
            profileExplainBlocks: profileExplainBlocks,
            handleSearch: handleSearch,
            openReport: openReport,
            openPanel: openPanel,
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
