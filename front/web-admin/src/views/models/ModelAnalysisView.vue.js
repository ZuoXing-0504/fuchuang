/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onMounted, ref } from 'vue';
import { getModelSummary } from '../../api/admin';
const summary = ref();
onMounted(async () => {
    summary.value = await getModelSummary();
});
const maxImportance = computed(() => {
    if (!summary.value?.importance.length)
        return 1;
    return Math.max(...summary.value.importance.map(i => i.importance));
});
const barColors = ['#2563eb', '#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa'];
const modelColorMap = {
    'RandomForest': '#10b981',
    'LogisticRegression': '#3b82f6',
    'ExtraTrees': '#f59e0b'
};
const getMetricLevel = (val) => {
    if (val >= 0.9)
        return { color: '#10b981', bg: '#d1fae5', label: '优秀' };
    if (val >= 0.85)
        return { color: '#3b82f6', bg: '#dbeafe', label: '良好' };
    if (val >= 0.8)
        return { color: '#f59e0b', bg: '#fef3c7', label: '一般' };
    return { color: '#ef4444', bg: '#fee2e2', label: '待优化' };
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['metric-val']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-item']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-shell" },
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
const __VLS_0 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    ...{ class: "panel-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "panel-card" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_3.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_3.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    const __VLS_4 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
        effect: "dark",
        round: true,
        size: "small",
        type: "success",
    }));
    const __VLS_6 = __VLS_5({
        effect: "dark",
        round: true,
        size: "small",
        type: "success",
    }, ...__VLS_functionalComponentArgsRest(__VLS_5));
    __VLS_7.slots.default;
    (__VLS_ctx.summary?.metrics.length ?? 0);
    var __VLS_7;
}
const __VLS_8 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    data: (__VLS_ctx.summary?.metrics ?? []),
    stripe: true,
}));
const __VLS_10 = __VLS_9({
    data: (__VLS_ctx.summary?.metrics ?? []),
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
__VLS_11.slots.default;
const __VLS_12 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    prop: "model",
    label: "模型",
    width: "180",
}));
const __VLS_14 = __VLS_13({
    prop: "model",
    label: "模型",
    width: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
__VLS_15.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_15.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "model-cell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "model-dot" },
        ...{ style: ({ background: __VLS_ctx.modelColorMap[row.model] ?? '#64748b' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "model-name" },
    });
    (row.model);
}
var __VLS_15;
const __VLS_16 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    prop: "accuracy",
    label: "Accuracy",
    width: "120",
}));
const __VLS_18 = __VLS_17({
    prop: "accuracy",
    label: "Accuracy",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
__VLS_19.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_19.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-cell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "metric-val" },
    });
    (row.accuracy.toFixed(3));
    const __VLS_20 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        color: (__VLS_ctx.getMetricLevel(row.accuracy).bg),
        ...{ style: ({ color: __VLS_ctx.getMetricLevel(row.accuracy).color, border: 'none' }) },
        size: "small",
        effect: "dark",
        round: true,
    }));
    const __VLS_22 = __VLS_21({
        color: (__VLS_ctx.getMetricLevel(row.accuracy).bg),
        ...{ style: ({ color: __VLS_ctx.getMetricLevel(row.accuracy).color, border: 'none' }) },
        size: "small",
        effect: "dark",
        round: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    __VLS_23.slots.default;
    (__VLS_ctx.getMetricLevel(row.accuracy).label);
    var __VLS_23;
}
var __VLS_19;
const __VLS_24 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    prop: "precision",
    label: "Precision",
    width: "120",
}));
const __VLS_26 = __VLS_25({
    prop: "precision",
    label: "Precision",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
__VLS_27.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_27.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "metric-val" },
    });
    (row.precision.toFixed(3));
}
var __VLS_27;
const __VLS_28 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    prop: "recall",
    label: "Recall",
    width: "120",
}));
const __VLS_30 = __VLS_29({
    prop: "recall",
    label: "Recall",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
__VLS_31.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_31.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "metric-val" },
    });
    (row.recall.toFixed(3));
}
var __VLS_31;
const __VLS_32 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
    prop: "f1",
    label: "F1",
    width: "120",
}));
const __VLS_34 = __VLS_33({
    prop: "f1",
    label: "F1",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
__VLS_35.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_35.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "metric-val" },
    });
    (row.f1.toFixed(3));
}
var __VLS_35;
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    prop: "auc",
    label: "AUC",
    width: "120",
}));
const __VLS_38 = __VLS_37({
    prop: "auc",
    label: "AUC",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
__VLS_39.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_39.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-cell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "metric-val highlight" },
    });
    (row.auc.toFixed(3));
}
var __VLS_39;
const __VLS_40 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    prop: "cvAuc",
    label: "CV AUC",
    width: "120",
}));
const __VLS_42 = __VLS_41({
    prop: "cvAuc",
    label: "CV AUC",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_43.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_43.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "metric-val highlight" },
    });
    (row.cvAuc.toFixed(3));
}
var __VLS_43;
var __VLS_11;
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "split-grid" },
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
    const __VLS_48 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        effect: "dark",
        round: true,
        size: "small",
        type: "primary",
    }));
    const __VLS_50 = __VLS_49({
        effect: "dark",
        round: true,
        size: "small",
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    var __VLS_51;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "importance-list" },
});
for (const [item, i] of __VLS_getVForSourceType((__VLS_ctx.summary?.importance ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.feature),
        ...{ class: "importance-row" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "imp-rank" },
        ...{ style: ({ background: __VLS_ctx.barColors[i] ?? '#64748b' }) },
    });
    (i + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "imp-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "imp-name" },
    });
    (item.feature);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "imp-bar-track" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "imp-bar-fill" },
        ...{ style: ({ width: `${(item.importance / __VLS_ctx.maxImportance) * 100}%`, background: __VLS_ctx.barColors[i] ?? '#64748b' }) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "imp-value" },
        ...{ style: ({ color: __VLS_ctx.barColors[i] ?? '#64748b' }) },
    });
    ((item.importance * 100).toFixed(1));
}
var __VLS_47;
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
    const __VLS_56 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        effect: "dark",
        round: true,
        size: "small",
        type: "info",
    }));
    const __VLS_58 = __VLS_57({
        effect: "dark",
        round: true,
        size: "small",
        type: "info",
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    var __VLS_59;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "desc-list" },
});
for (const [item, i] of __VLS_getVForSourceType((__VLS_ctx.summary?.description ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (i),
        ...{ class: "desc-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "desc-rank" },
        ...{ style: ({ background: ['#2563eb', '#3b82f6', '#6366f1'][i] ?? '#64748b' }) },
    });
    (i + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "desc-text" },
    });
    (item);
}
var __VLS_55;
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['model-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['model-dot']} */ ;
/** @type {__VLS_StyleScopedClasses['model-name']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-val']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-val']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-val']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-val']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-val']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-val']} */ ;
/** @type {__VLS_StyleScopedClasses['highlight']} */ ;
/** @type {__VLS_StyleScopedClasses['split-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['importance-list']} */ ;
/** @type {__VLS_StyleScopedClasses['importance-row']} */ ;
/** @type {__VLS_StyleScopedClasses['imp-rank']} */ ;
/** @type {__VLS_StyleScopedClasses['imp-content']} */ ;
/** @type {__VLS_StyleScopedClasses['imp-name']} */ ;
/** @type {__VLS_StyleScopedClasses['imp-bar-track']} */ ;
/** @type {__VLS_StyleScopedClasses['imp-bar-fill']} */ ;
/** @type {__VLS_StyleScopedClasses['imp-value']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-list']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-item']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-rank']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-text']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            summary: summary,
            maxImportance: maxImportance,
            barColors: barColors,
            modelColorMap: modelColorMap,
            getMetricLevel: getMetricLevel,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
