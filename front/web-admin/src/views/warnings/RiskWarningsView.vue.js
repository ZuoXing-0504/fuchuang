/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onMounted, reactive, ref } from 'vue';
import { getStudentDetail, getWarnings } from '../../api/admin';
import { getProfileSubtypeExplanation } from '../../utils/profileSubtype';
const source = ref([]);
const filterDrawerVisible = ref(false);
const drawerVisible = ref(false);
const currentDetail = ref();
const keyword = ref('');
const loading = ref(false);
const loadError = ref('');
const filters = reactive({ college: '', major: '', riskLevel: '', profileCategory: '', registrationStatus: '' });
async function loadWarnings() {
    loading.value = true;
    loadError.value = '';
    try {
        source.value = await getWarnings();
    }
    catch (error) {
        source.value = [];
        loadError.value = error instanceof Error ? error.message : '风险名单加载失败';
    }
    finally {
        loading.value = false;
    }
}
onMounted(async () => {
    await loadWarnings();
});
const colleges = computed(() => [...new Set(source.value.map((item) => item.college).filter(Boolean))].sort());
const majors = computed(() => [...new Set(source.value.map((item) => item.major).filter(Boolean))].sort());
const riskLevels = computed(() => [...new Set(source.value.map((item) => item.riskLevel).filter(Boolean))]);
const categories = computed(() => [...new Set(source.value.map((item) => item.profileCategory).filter(Boolean))]);
const registrationStates = computed(() => [...new Set(source.value.map((item) => item.registrationStatus).filter(Boolean))]);
const filteredRows = computed(() => source.value.filter((item) => {
    const q = keyword.value.trim();
    return (!q || item.studentId.includes(q)) &&
        (!filters.college || item.college === filters.college) &&
        (!filters.major || item.major === filters.major) &&
        (!filters.riskLevel || item.riskLevel === filters.riskLevel) &&
        (!filters.profileCategory || item.profileCategory === filters.profileCategory) &&
        (!filters.registrationStatus || item.registrationStatus === filters.registrationStatus);
}));
async function openDetail(studentId) {
    currentDetail.value = await getStudentDetail(studentId);
    drawerVisible.value = true;
}
function goToStudentDetail(studentId) {
    window.location.hash = `#/students/${encodeURIComponent(studentId)}`;
}
function goToStudentReport(studentId) {
    window.location.hash = `#/students/${encodeURIComponent(studentId)}/report`;
}
function handleRowClick(row) {
    openDetail(row.studentId);
}
function subtypeExplanation(subtype) {
    return getProfileSubtypeExplanation(subtype);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['filter-count']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-list']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['single']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-shell warning-page" },
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "status-inline" },
});
(__VLS_ctx.source.length);
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "header-actions" },
});
const __VLS_0 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.keyword),
    placeholder: "输入学号查询",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.keyword),
    placeholder: "输入学号查询",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const __VLS_4 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (...[$event]) => {
        __VLS_ctx.filterDrawerVisible = true;
    }
};
__VLS_7.slots.default;
var __VLS_7;
const __VLS_12 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.loading),
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.loadWarnings)
};
__VLS_15.slots.default;
var __VLS_15;
if (__VLS_ctx.loadError) {
    const __VLS_20 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        type: "error",
        closable: (false),
        ...{ class: "page-alert" },
        title: (`风险名单加载失败：${__VLS_ctx.loadError}`),
    }));
    const __VLS_22 = __VLS_21({
        type: "error",
        closable: (false),
        ...{ class: "page-alert" },
        title: (`风险名单加载失败：${__VLS_ctx.loadError}`),
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "layout-grid single" },
});
const __VLS_24 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
    ...{ class: "panel-card table-card" },
}));
const __VLS_26 = __VLS_25({
    ...{ class: "panel-card table-card" },
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
const __VLS_28 = {}.ElTable;
/** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onRowClick': {} },
    data: (__VLS_ctx.filteredRows),
    height: "620",
    stripe: true,
}));
const __VLS_30 = __VLS_29({
    ...{ 'onRowClick': {} },
    data: (__VLS_ctx.filteredRows),
    height: "620",
    stripe: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onRowClick: (__VLS_ctx.handleRowClick)
};
__VLS_31.slots.default;
const __VLS_36 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
    prop: "studentId",
    label: "学号",
    width: "140",
}));
const __VLS_38 = __VLS_37({
    prop: "studentId",
    label: "学号",
    width: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_37));
const __VLS_40 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    prop: "college",
    label: "学院",
    minWidth: "180",
}));
const __VLS_42 = __VLS_41({
    prop: "college",
    label: "学院",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
const __VLS_44 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    prop: "major",
    label: "专业",
    minWidth: "160",
}));
const __VLS_46 = __VLS_45({
    prop: "major",
    label: "专业",
    minWidth: "160",
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
const __VLS_48 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    prop: "riskLevel",
    label: "风险等级",
    width: "100",
}));
const __VLS_50 = __VLS_49({
    prop: "riskLevel",
    label: "风险等级",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
const __VLS_52 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
    prop: "profileCategory",
    label: "画像类别",
    minWidth: "140",
}));
const __VLS_54 = __VLS_53({
    prop: "profileCategory",
    label: "画像类别",
    minWidth: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_53));
const __VLS_56 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    label: "细分画像",
    minWidth: "220",
}));
const __VLS_58 = __VLS_57({
    label: "细分画像",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_59.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_59.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "subtype-cell" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    (row.profileSubtype || '未细分');
    if (__VLS_ctx.subtypeExplanation(row.profileSubtype)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "subtype-note" },
        });
        (__VLS_ctx.subtypeExplanation(row.profileSubtype));
    }
}
var __VLS_59;
const __VLS_60 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    label: "二级标签",
    minWidth: "220",
}));
const __VLS_62 = __VLS_61({
    label: "二级标签",
    minWidth: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
__VLS_63.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_63.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    if (row.secondaryTags?.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tag-list compact" },
        });
        for (const [item] of __VLS_getVForSourceType((row.secondaryTags))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (item),
                ...{ class: "tag-chip" },
            });
            (item);
        }
    }
    else {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "minor-copy" },
        });
    }
}
var __VLS_63;
const __VLS_64 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
    prop: "registrationStatus",
    label: "账号状态",
    width: "110",
}));
const __VLS_66 = __VLS_65({
    prop: "registrationStatus",
    label: "账号状态",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_65));
const __VLS_68 = {}.ElTableColumn;
/** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    label: "操作",
    width: "220",
}));
const __VLS_70 = __VLS_69({
    label: "操作",
    width: "220",
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
{
    const { default: __VLS_thisSlot } = __VLS_71.slots;
    const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
    const __VLS_72 = {}.ElSpace;
    /** @type {[typeof __VLS_components.ElSpace, typeof __VLS_components.elSpace, typeof __VLS_components.ElSpace, typeof __VLS_components.elSpace, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({}));
    const __VLS_74 = __VLS_73({}, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    const __VLS_76 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
        ...{ 'onClick': {} },
        type: "primary",
        link: true,
        size: "small",
    }));
    const __VLS_78 = __VLS_77({
        ...{ 'onClick': {} },
        type: "primary",
        link: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_77));
    let __VLS_80;
    let __VLS_81;
    let __VLS_82;
    const __VLS_83 = {
        onClick: (...[$event]) => {
            __VLS_ctx.goToStudentDetail(row.studentId);
        }
    };
    __VLS_79.slots.default;
    var __VLS_79;
    const __VLS_84 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
        ...{ 'onClick': {} },
        type: "primary",
        link: true,
        size: "small",
    }));
    const __VLS_86 = __VLS_85({
        ...{ 'onClick': {} },
        type: "primary",
        link: true,
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_85));
    let __VLS_88;
    let __VLS_89;
    let __VLS_90;
    const __VLS_91 = {
        onClick: (...[$event]) => {
            __VLS_ctx.goToStudentReport(row.studentId);
        }
    };
    __VLS_87.slots.default;
    var __VLS_87;
    var __VLS_75;
}
var __VLS_71;
var __VLS_31;
var __VLS_27;
const __VLS_92 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    modelValue: (__VLS_ctx.filterDrawerVisible),
    title: "筛选条件",
    size: "360px",
}));
const __VLS_94 = __VLS_93({
    modelValue: (__VLS_ctx.filterDrawerVisible),
    title: "筛选条件",
    size: "360px",
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.ElForm;
/** @type {[typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    labelPosition: "top",
}));
const __VLS_98 = __VLS_97({
    labelPosition: "top",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
__VLS_99.slots.default;
const __VLS_100 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "学院",
}));
const __VLS_102 = __VLS_101({
    label: "学院",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
__VLS_103.slots.default;
const __VLS_104 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    modelValue: (__VLS_ctx.filters.college),
    clearable: true,
    placeholder: "全部学院",
}));
const __VLS_106 = __VLS_105({
    modelValue: (__VLS_ctx.filters.college),
    clearable: true,
    placeholder: "全部学院",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
__VLS_107.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.colleges))) {
    const __VLS_108 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
        key: (item),
        label: (item),
        value: (item),
    }));
    const __VLS_110 = __VLS_109({
        key: (item),
        label: (item),
        value: (item),
    }, ...__VLS_functionalComponentArgsRest(__VLS_109));
}
var __VLS_107;
var __VLS_103;
const __VLS_112 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    label: "专业",
}));
const __VLS_114 = __VLS_113({
    label: "专业",
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_115.slots.default;
const __VLS_116 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    modelValue: (__VLS_ctx.filters.major),
    clearable: true,
    placeholder: "全部专业",
}));
const __VLS_118 = __VLS_117({
    modelValue: (__VLS_ctx.filters.major),
    clearable: true,
    placeholder: "全部专业",
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_119.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.majors))) {
    const __VLS_120 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
        key: (item),
        label: (item),
        value: (item),
    }));
    const __VLS_122 = __VLS_121({
        key: (item),
        label: (item),
        value: (item),
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
}
var __VLS_119;
var __VLS_115;
const __VLS_124 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    label: "风险等级",
}));
const __VLS_126 = __VLS_125({
    label: "风险等级",
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
__VLS_127.slots.default;
const __VLS_128 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    modelValue: (__VLS_ctx.filters.riskLevel),
    clearable: true,
    placeholder: "全部等级",
}));
const __VLS_130 = __VLS_129({
    modelValue: (__VLS_ctx.filters.riskLevel),
    clearable: true,
    placeholder: "全部等级",
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
__VLS_131.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.riskLevels))) {
    const __VLS_132 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
        key: (item),
        label: (item),
        value: (item),
    }));
    const __VLS_134 = __VLS_133({
        key: (item),
        label: (item),
        value: (item),
    }, ...__VLS_functionalComponentArgsRest(__VLS_133));
}
var __VLS_131;
var __VLS_127;
const __VLS_136 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    label: "画像类别",
}));
const __VLS_138 = __VLS_137({
    label: "画像类别",
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
__VLS_139.slots.default;
const __VLS_140 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_141 = __VLS_asFunctionalComponent(__VLS_140, new __VLS_140({
    modelValue: (__VLS_ctx.filters.profileCategory),
    clearable: true,
    placeholder: "全部类别",
}));
const __VLS_142 = __VLS_141({
    modelValue: (__VLS_ctx.filters.profileCategory),
    clearable: true,
    placeholder: "全部类别",
}, ...__VLS_functionalComponentArgsRest(__VLS_141));
__VLS_143.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.categories))) {
    const __VLS_144 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
        key: (item),
        label: (item),
        value: (item),
    }));
    const __VLS_146 = __VLS_145({
        key: (item),
        label: (item),
        value: (item),
    }, ...__VLS_functionalComponentArgsRest(__VLS_145));
}
var __VLS_143;
var __VLS_139;
const __VLS_148 = {}.ElFormItem;
/** @type {[typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ]} */ ;
// @ts-ignore
const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({
    label: "账号状态",
}));
const __VLS_150 = __VLS_149({
    label: "账号状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_149));
__VLS_151.slots.default;
const __VLS_152 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    modelValue: (__VLS_ctx.filters.registrationStatus),
    clearable: true,
    placeholder: "全部状态",
}));
const __VLS_154 = __VLS_153({
    modelValue: (__VLS_ctx.filters.registrationStatus),
    clearable: true,
    placeholder: "全部状态",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
__VLS_155.slots.default;
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.registrationStates))) {
    const __VLS_156 = {}.ElOption;
    /** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
    // @ts-ignore
    const __VLS_157 = __VLS_asFunctionalComponent(__VLS_156, new __VLS_156({
        key: (item),
        label: (item),
        value: (item),
    }));
    const __VLS_158 = __VLS_157({
        key: (item),
        label: (item),
        value: (item),
    }, ...__VLS_functionalComponentArgsRest(__VLS_157));
}
var __VLS_155;
var __VLS_151;
var __VLS_99;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "filter-count" },
});
(__VLS_ctx.filteredRows.length);
var __VLS_95;
const __VLS_160 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    modelValue: (__VLS_ctx.drawerVisible),
    title: "学生概览",
    size: "480px",
    destroyOnClose: (true),
}));
const __VLS_162 = __VLS_161({
    modelValue: (__VLS_ctx.drawerVisible),
    title: "学生概览",
    size: "480px",
    destroyOnClose: (true),
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
__VLS_163.slots.default;
if (__VLS_ctx.currentDetail) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-name" },
    });
    (__VLS_ctx.currentDetail.studentId);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-meta" },
    });
    (__VLS_ctx.currentDetail.studentId);
    (__VLS_ctx.currentDetail.college);
    (__VLS_ctx.currentDetail.major);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-tags" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "drawer-tag risk" },
    });
    (__VLS_ctx.currentDetail.riskLevel);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "drawer-tag" },
    });
    (__VLS_ctx.currentDetail.profileCategory);
    if (__VLS_ctx.currentDetail.profileSubtype) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: "drawer-tag" },
        });
        (__VLS_ctx.currentDetail.profileSubtype);
    }
    if (__VLS_ctx.subtypeExplanation(__VLS_ctx.currentDetail.profileSubtype)) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "drawer-subtype-note" },
        });
        (__VLS_ctx.subtypeExplanation(__VLS_ctx.currentDetail.profileSubtype));
    }
    if (__VLS_ctx.currentDetail.secondaryTags?.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "tag-list" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.currentDetail.secondaryTags))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (item),
                ...{ class: "tag-chip" },
            });
            (item);
        }
    }
    const __VLS_164 = {}.ElDescriptions;
    /** @type {[typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, typeof __VLS_components.ElDescriptions, typeof __VLS_components.elDescriptions, ]} */ ;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent(__VLS_164, new __VLS_164({
        column: (1),
        border: true,
    }));
    const __VLS_166 = __VLS_165({
        column: (1),
        border: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    __VLS_167.slots.default;
    const __VLS_168 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
        label: "表现档次",
    }));
    const __VLS_170 = __VLS_169({
        label: "表现档次",
    }, ...__VLS_functionalComponentArgsRest(__VLS_169));
    __VLS_171.slots.default;
    (__VLS_ctx.currentDetail.performanceLevel);
    var __VLS_171;
    const __VLS_172 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
        label: "健康档次",
    }));
    const __VLS_174 = __VLS_173({
        label: "健康档次",
    }, ...__VLS_functionalComponentArgsRest(__VLS_173));
    __VLS_175.slots.default;
    (__VLS_ctx.currentDetail.healthLevel);
    var __VLS_175;
    const __VLS_176 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
        label: "账号状态",
    }));
    const __VLS_178 = __VLS_177({
        label: "账号状态",
    }, ...__VLS_functionalComponentArgsRest(__VLS_177));
    __VLS_179.slots.default;
    (__VLS_ctx.currentDetail.registeredUsername ? `${__VLS_ctx.currentDetail.registrationStatus}（${__VLS_ctx.currentDetail.registeredUsername}）` : __VLS_ctx.currentDetail.registrationStatus);
    var __VLS_179;
    const __VLS_180 = {}.ElDescriptionsItem;
    /** @type {[typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, typeof __VLS_components.ElDescriptionsItem, typeof __VLS_components.elDescriptionsItem, ]} */ ;
    // @ts-ignore
    const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
        label: "综合结论",
    }));
    const __VLS_182 = __VLS_181({
        label: "综合结论",
    }, ...__VLS_functionalComponentArgsRest(__VLS_181));
    __VLS_183.slots.default;
    (__VLS_ctx.currentDetail.reportSummary);
    var __VLS_183;
    var __VLS_167;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-actions" },
    });
    const __VLS_184 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ style: {} },
    }));
    const __VLS_186 = __VLS_185({
        ...{ 'onClick': {} },
        type: "primary",
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    let __VLS_188;
    let __VLS_189;
    let __VLS_190;
    const __VLS_191 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.currentDetail))
                return;
            __VLS_ctx.goToStudentDetail(__VLS_ctx.currentDetail.studentId);
            __VLS_ctx.drawerVisible = false;
        }
    };
    __VLS_187.slots.default;
    var __VLS_187;
    const __VLS_192 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }));
    const __VLS_194 = __VLS_193({
        ...{ 'onClick': {} },
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    let __VLS_196;
    let __VLS_197;
    let __VLS_198;
    const __VLS_199 = {
        onClick: (...[$event]) => {
            if (!(__VLS_ctx.currentDetail))
                return;
            __VLS_ctx.goToStudentReport(__VLS_ctx.currentDetail.studentId);
            __VLS_ctx.drawerVisible = false;
        }
    };
    __VLS_195.slots.default;
    var __VLS_195;
}
var __VLS_163;
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['warning-page']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['status-inline']} */ ;
/** @type {__VLS_StyleScopedClasses['header-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['page-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['layout-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['single']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['table-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['subtype-cell']} */ ;
/** @type {__VLS_StyleScopedClasses['subtype-note']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-list']} */ ;
/** @type {__VLS_StyleScopedClasses['compact']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['filter-count']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-content']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-name']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-tags']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['risk']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-tag']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-subtype-note']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-list']} */ ;
/** @type {__VLS_StyleScopedClasses['tag-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-actions']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            source: source,
            filterDrawerVisible: filterDrawerVisible,
            drawerVisible: drawerVisible,
            currentDetail: currentDetail,
            keyword: keyword,
            loading: loading,
            loadError: loadError,
            filters: filters,
            loadWarnings: loadWarnings,
            colleges: colleges,
            majors: majors,
            riskLevels: riskLevels,
            categories: categories,
            registrationStates: registrationStates,
            filteredRows: filteredRows,
            goToStudentDetail: goToStudentDetail,
            goToStudentReport: goToStudentReport,
            handleRowClick: handleRowClick,
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
