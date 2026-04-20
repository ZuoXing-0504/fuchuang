/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getWarnings } from '../../api/admin';
import { getProfileSubtypeExplanation } from '../../utils/profileSubtype';
const router = useRouter();
const rows = ref([]);
const activeDimension = ref('college');
const loading = ref(false);
const loadError = ref('');
const keyword = ref('');
const detailDrawerVisible = ref(false);
const currentAggregate = ref();
async function loadRows() {
    loading.value = true;
    loadError.value = '';
    try {
        rows.value = await getWarnings();
    }
    catch (error) {
        rows.value = [];
        loadError.value = error instanceof Error ? error.message : '院系对比数据加载失败';
    }
    finally {
        loading.value = false;
    }
}
onMounted(async () => {
    await loadRows();
});
function buildAggregate(source, key) {
    const counters = new Map();
    for (const item of source) {
        const raw = String(item[key] ?? '').trim();
        if (!raw) {
            continue;
        }
        const current = counters.get(raw) ?? {
            studentCount: 0,
            highRiskCount: 0,
            mediumRiskCount: 0,
            registeredCount: 0,
            totalScore: 0,
            profiles: {},
            subtypes: {},
            students: []
        };
        current.studentCount += 1;
        current.totalScore += Number(item.scorePrediction ?? 0);
        if (item.riskLevel === '高风险')
            current.highRiskCount += 1;
        if (item.riskLevel === '中风险')
            current.mediumRiskCount += 1;
        if (item.registrationStatus === '已注册')
            current.registeredCount += 1;
        current.profiles[item.profileCategory] = (current.profiles[item.profileCategory] ?? 0) + 1;
        if (item.profileSubtype) {
            current.subtypes[item.profileSubtype] = (current.subtypes[item.profileSubtype] ?? 0) + 1;
        }
        current.students.push(item);
        counters.set(raw, current);
    }
    return Array.from(counters.entries()).map(([label, item]) => {
        const dominantProfile = Object.entries(item.profiles).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '未识别';
        const dominantSubtype = Object.entries(item.subtypes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '未细分';
        return {
            label,
            studentCount: item.studentCount,
            highRiskCount: item.highRiskCount,
            mediumRiskCount: item.mediumRiskCount,
            registeredCount: item.registeredCount,
            riskRate: item.studentCount ? Math.round((item.highRiskCount / item.studentCount) * 100) : 0,
            registeredRate: item.studentCount ? Math.round((item.registeredCount / item.studentCount) * 100) : 0,
            avgScore: item.studentCount ? Number((item.totalScore / item.studentCount).toFixed(1)) : 0,
            dominantProfile,
            dominantSubtype,
            students: item.students.sort((a, b) => Number(b.scorePrediction) - Number(a.scorePrediction))
        };
    }).sort((a, b) => b.riskRate - a.riskRate || b.studentCount - a.studentCount);
}
const collegeRows = computed(() => buildAggregate(rows.value, 'college'));
const majorRows = computed(() => buildAggregate(rows.value, 'major'));
const activeRows = computed(() => {
    const base = activeDimension.value === 'major' ? majorRows.value : collegeRows.value;
    const q = keyword.value.trim().toLowerCase();
    if (!q) {
        return base;
    }
    return base.filter((item) => item.label.toLowerCase().includes(q) || item.dominantProfile.toLowerCase().includes(q) || item.dominantSubtype.toLowerCase().includes(q));
});
const summaryCards = computed(() => [
    { label: '学院分组', value: collegeRows.value.length, note: '真实学院字段聚合' },
    { label: '专业分组', value: majorRows.value.length, note: '真实专业字段聚合' },
    { label: '最高风险学院', value: collegeRows.value[0]?.label ?? '暂无', note: `${collegeRows.value[0]?.riskRate ?? 0}% 高风险率` },
    { label: '当前视图', value: activeDimension.value === 'college' ? '学院' : '专业', note: '点击列表行查看抽屉详情' }
]);
const spotlightRows = computed(() => (activeDimension.value === 'major' ? majorRows.value : collegeRows.value).slice(0, 6));
function openAggregate(row) {
    currentAggregate.value = row;
    detailDrawerVisible.value = true;
}
function subtypeExplanation(subtype) {
    return getProfileSubtypeExplanation(subtype);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['hero-side']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['control-row']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-shell comparison-page" },
});
if (__VLS_ctx.loadError) {
    const __VLS_0 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        type: "error",
        closable: (false),
        ...{ class: "page-alert" },
        title: (`院系对比数据加载失败：${__VLS_ctx.loadError}`),
    }));
    const __VLS_2 = __VLS_1({
        type: "error",
        closable: (false),
        ...{ class: "page-alert" },
        title: (`院系对比数据加载失败：${__VLS_ctx.loadError}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
}
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "hero-note" },
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
(__VLS_ctx.rows.length);
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "summary-note" },
    });
    (card.note);
}
const __VLS_4 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ class: "panel-card main-card" },
}));
const __VLS_6 = __VLS_5({
    ...{ class: "panel-card main-card" },
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
    ...{ class: "control-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "tab-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeDimension = 'college';
        } },
    ...{ class: "tab-btn" },
    ...{ class: ({ active: __VLS_ctx.activeDimension === 'college' }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.activeDimension = 'major';
        } },
    ...{ class: "tab-btn" },
    ...{ class: ({ active: __VLS_ctx.activeDimension === 'major' }) },
});
const __VLS_8 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    modelValue: (__VLS_ctx.keyword),
    clearable: true,
    placeholder: "搜索学院、专业或主导画像",
    ...{ style: {} },
}));
const __VLS_10 = __VLS_9({
    modelValue: (__VLS_ctx.keyword),
    clearable: true,
    placeholder: "搜索学院、专业或主导画像",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "empty-tip" },
    });
}
else {
    const __VLS_12 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        ...{ 'onRowClick': {} },
        data: (__VLS_ctx.activeRows),
        stripe: true,
    }));
    const __VLS_14 = __VLS_13({
        ...{ 'onRowClick': {} },
        data: (__VLS_ctx.activeRows),
        stripe: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    let __VLS_16;
    let __VLS_17;
    let __VLS_18;
    const __VLS_19 = {
        onRowClick: (__VLS_ctx.openAggregate)
    };
    __VLS_15.slots.default;
    const __VLS_20 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        prop: "label",
        label: (__VLS_ctx.activeDimension === 'college' ? '学院' : '专业'),
        minWidth: "220",
    }));
    const __VLS_22 = __VLS_21({
        prop: "label",
        label: (__VLS_ctx.activeDimension === 'college' ? '学院' : '专业'),
        minWidth: "220",
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    const __VLS_24 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
        prop: "studentCount",
        label: "人数",
        width: "90",
    }));
    const __VLS_26 = __VLS_25({
        prop: "studentCount",
        label: "人数",
        width: "90",
    }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    const __VLS_28 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        prop: "highRiskCount",
        label: "高风险",
        width: "90",
    }));
    const __VLS_30 = __VLS_29({
        prop: "highRiskCount",
        label: "高风险",
        width: "90",
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    const __VLS_32 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
        prop: "riskRate",
        label: "高风险率",
        width: "110",
    }));
    const __VLS_34 = __VLS_33({
        prop: "riskRate",
        label: "高风险率",
        width: "110",
    }, ...__VLS_functionalComponentArgsRest(__VLS_33));
    __VLS_35.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_35.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "risk-text" },
        });
        (row.riskRate);
    }
    var __VLS_35;
    const __VLS_36 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        prop: "registeredRate",
        label: "注册覆盖",
        width: "110",
    }));
    const __VLS_38 = __VLS_37({
        prop: "registeredRate",
        label: "注册覆盖",
        width: "110",
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
    __VLS_39.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_39.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        (row.registeredRate);
    }
    var __VLS_39;
    const __VLS_40 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        prop: "avgScore",
        label: "综合发展均值",
        width: "130",
    }));
    const __VLS_42 = __VLS_41({
        prop: "avgScore",
        label: "综合发展均值",
        width: "130",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    const __VLS_44 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        prop: "dominantProfile",
        label: "主导画像",
        minWidth: "160",
    }));
    const __VLS_46 = __VLS_45({
        prop: "dominantProfile",
        label: "主导画像",
        minWidth: "160",
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    const __VLS_48 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
        label: "主导细分",
        minWidth: "230",
    }));
    const __VLS_50 = __VLS_49({
        label: "主导细分",
        minWidth: "230",
    }, ...__VLS_functionalComponentArgsRest(__VLS_49));
    __VLS_51.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_51.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "subtype-cell" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        (row.dominantSubtype);
        if (__VLS_ctx.subtypeExplanation(row.dominantSubtype)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "subtype-note" },
            });
            (__VLS_ctx.subtypeExplanation(row.dominantSubtype));
        }
    }
    var __VLS_51;
    var __VLS_15;
}
var __VLS_7;
const __VLS_52 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    ...{ class: "panel-card compact-card" },
}));
const __VLS_54 = __VLS_53({
    ...{ class: "panel-card compact-card" },
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
    ...{ class: "spotlight-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.spotlightRows))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.openAggregate(item);
            } },
        key: (item.label),
        ...{ class: "spotlight-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "spotlight-name" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "spotlight-meta" },
    });
    (item.studentCount);
    (item.highRiskCount);
    (item.dominantProfile);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "spotlight-rate" },
    });
    (item.riskRate);
}
var __VLS_55;
const __VLS_56 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.detailDrawerVisible),
    title: (__VLS_ctx.currentAggregate?.label || '聚合详情'),
    size: "560px",
    destroyOnClose: (true),
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.detailDrawerVisible),
    title: (__VLS_ctx.currentAggregate?.label || '聚合详情'),
    size: "560px",
    destroyOnClose: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
if (__VLS_ctx.currentAggregate) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-shell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-summary" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-badge" },
    });
    (__VLS_ctx.activeDimension === 'college' ? '学院' : '专业');
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-title" },
    });
    (__VLS_ctx.currentAggregate.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.currentAggregate.studentCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.currentAggregate.highRiskCount);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.currentAggregate.registeredRate);
    const __VLS_60 = {}.ElDescriptions;
    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        column: (1),
        border: true,
    }));
    const __VLS_62 = __VLS_61({
        column: (1),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    const __VLS_64 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        label: "主导画像",
    }));
    const __VLS_66 = __VLS_65({
        label: "主导画像",
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    (__VLS_ctx.currentAggregate.dominantProfile);
    var __VLS_67;
    const __VLS_68 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        label: "主导细分",
    }));
    const __VLS_70 = __VLS_69({
        label: "主导细分",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    __VLS_71.slots.default;
    (__VLS_ctx.currentAggregate.dominantSubtype);
    var __VLS_71;
    if (__VLS_ctx.subtypeExplanation(__VLS_ctx.currentAggregate.dominantSubtype)) {
        const __VLS_72 = {}.ElDescriptionsItem;
        /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
        // @ts-ignore
        const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
            label: "细分说明",
        }));
        const __VLS_74 = __VLS_73({
            label: "细分说明",
        }, ...__VLS_functionalComponentArgsRest(__VLS_73));
        __VLS_75.slots.default;
        (__VLS_ctx.subtypeExplanation(__VLS_ctx.currentAggregate.dominantSubtype));
        var __VLS_75;
    }
    const __VLS_76 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        label: "高风险率",
    }));
    const __VLS_78 = __VLS_77({
        label: "高风险率",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    __VLS_79.slots.default;
    (__VLS_ctx.currentAggregate.riskRate);
    var __VLS_79;
    const __VLS_80 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
        label: "综合发展均值",
    }));
    const __VLS_82 = __VLS_81({
        label: "综合发展均值",
    }, ...__VLS_functionalComponentArgsRest(__VLS_81));
    __VLS_83.slots.default;
    (__VLS_ctx.currentAggregate.avgScore);
    var __VLS_83;
    var __VLS_63;
    const __VLS_84 = {}.ElCollapse;
    /** @type {[typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, typeof __VLS_components.ElCollapse, typeof __VLS_components.elCollapse, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        ...{ class: "drawer-collapse" },
    }));
    const __VLS_86 = __VLS_85({
        ...{ class: "drawer-collapse" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    __VLS_87.slots.default;
    const __VLS_88 = {}.ElCollapseItem;
    /** @type {[typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, typeof __VLS_components.ElCollapseItem, typeof __VLS_components.elCollapseItem, ]} */ ;
    // @ts-ignore
    const __VLS_89 = __VLS_asFunctionalComponent(__VLS_88, new __VLS_88({
        title: "查看该分组学生名单",
        name: "students",
    }));
    const __VLS_90 = __VLS_89({
        title: "查看该分组学生名单",
        name: "students",
    }, ...__VLS_functionalComponentArgsRest(__VLS_89));
    __VLS_91.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "student-list" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.currentAggregate.students.slice(0, 20)))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item.studentId),
            ...{ class: "student-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-name" },
        });
        (item.name || item.studentId);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-meta" },
        });
        (item.studentId);
        (item.profileCategory);
        (item.profileSubtype || '未细分');
        if (__VLS_ctx.subtypeExplanation(item.profileSubtype)) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "student-subtype-note" },
            });
            (__VLS_ctx.subtypeExplanation(item.profileSubtype));
        }
        const __VLS_92 = {}.ElButton;
        /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
        // @ts-ignore
        const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
            ...{ 'onClick': {} },
            type: "primary",
            link: true,
        }));
        const __VLS_94 = __VLS_93({
            ...{ 'onClick': {} },
            type: "primary",
            link: true,
        }, ...__VLS_functionalComponentArgsRest(__VLS_93));
        let __VLS_96;
        let __VLS_97;
        let __VLS_98;
        const __VLS_99 = {
            onClick: (...[$event]) => {
                if (!(__VLS_ctx.currentAggregate))
                    return;
                __VLS_ctx.router.push(`/students/${item.studentId}`);
            }
        };
        __VLS_95.slots.default;
        var __VLS_95;
    }
    var __VLS_91;
    var __VLS_87;
}
var __VLS_59;
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['comparison-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-note']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-side']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-label']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-value']} */ ;
/** @type {__VLS_StyleScopedClasses['summary-note']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['main-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['control-row']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-row']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['tab-btn']} */ ;
/** @type {__VLS_StyleScopedClasses['empty-tip']} */ ;
/** @type {__VLS_StyleScopedClasses['risk-text']} */ ;
/** @type {__VLS_StyleScopedClasses['subtype-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['subtype-note']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-list']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-item']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-name']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['spotlight-rate']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-summary']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-title']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-collapse']} */ ;
/** @type {__VLS_StyleScopedClasses['student-list']} */ ;
/** @type {__VLS_StyleScopedClasses['student-item']} */ ;
/** @type {__VLS_StyleScopedClasses['student-name']} */ ;
/** @type {__VLS_StyleScopedClasses['student-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['student-subtype-note']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            router: router,
            rows: rows,
            activeDimension: activeDimension,
            loading: loading,
            loadError: loadError,
            keyword: keyword,
            detailDrawerVisible: detailDrawerVisible,
            currentAggregate: currentAggregate,
            activeRows: activeRows,
            summaryCards: summaryCards,
            spotlightRows: spotlightRows,
            openAggregate: openAggregate,
            subtypeExplanation: subtypeExplanation,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
