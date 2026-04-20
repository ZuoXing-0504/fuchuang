/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getModelSummary, getStudentDetail } from '../../api/admin';
const router = useRouter();
const summary = ref();
const searchStudentId = ref('');
const studentDetail = ref();
const studentLoading = ref(false);
const studentError = ref('');
const taskPresentationMap = {
    risk: {
        title: '风险预测',
        description: '识别学生当前的风险水平，是预警链路里的核心任务。',
        primaryMetricKey: 'auc',
        secondaryMetricKey: 'f1'
    },
    scholarship: {
        title: '奖学金获得概率预测',
        description: '评估学生获得奖学金的可能性，用于体现学业与综合发展成果。',
        primaryMetricKey: 'auc',
        secondaryMetricKey: 'f1'
    },
    performance: {
        title: '综合成绩档次分类',
        description: '把学生综合表现划分为高、中、低档次，更适合看多分类稳定性。',
        primaryMetricKey: 'macro_f1',
        secondaryMetricKey: 'accuracy'
    },
    health: {
        title: '健康水平分类',
        description: '根据体测、锻炼与行为规律特征识别健康状态。',
        note: '这一版已经去掉了最直接贴着标签的健康总分特征，指标更克制，也更符合真实业务场景下的解释口径。',
        primaryMetricKey: 'macro_f1',
        secondaryMetricKey: 'accuracy'
    },
    change_trend: {
        title: '变化趋势预测',
        description: '判断学生整体状态更接近上升、稳定还是下降趋势。',
        primaryMetricKey: 'macro_f1',
        secondaryMetricKey: 'accuracy'
    },
    learning_engagement: {
        title: '学习投入档次分类',
        description: '对学习投入做高、中、低档分类，这类任务更适合看 Macro F1 和 Accuracy。',
        note: '学习投入是多分类任务，不应该只盯着 AUC 看。',
        primaryMetricKey: 'macro_f1',
        secondaryMetricKey: 'accuracy'
    },
    development: {
        title: '综合发展档次分类',
        description: '评估学生综合发展水平，更适合看分类一致性而不是单独看 AUC。',
        note: '综合发展也是多分类任务，展示时应把 Macro F1 和 Accuracy 放前面。',
        primaryMetricKey: 'macro_f1',
        secondaryMetricKey: 'accuracy'
    },
    cet4: {
        title: '英语四级通过概率预测',
        description: '基于学生基础特征和学习行为预测四级通过概率。',
        primaryMetricKey: 'auc',
        secondaryMetricKey: 'f1'
    },
    cet6: {
        title: '英语六级通过概率预测',
        description: '基于学生基础特征和学习行为预测六级通过概率。',
        note: '六级样本通过率非常高，类别不平衡会把 AUC 推得很高，所以不能只看一个高 AUC。',
        primaryMetricKey: 'auc',
        secondaryMetricKey: 'f1'
    },
    score_regression: {
        title: '综合成绩预测',
        description: '直接回归预测综合成绩分数，适合放在报告里做分值参考。',
        primaryMetricKey: 'r2',
        secondaryMetricKey: 'rmse'
    }
};
const metricLabelMap = {
    accuracy: 'Accuracy',
    precision: 'Precision',
    recall: 'Recall',
    f1: 'F1',
    auc: 'AUC',
    cv_auc: 'CV AUC',
    macro_precision: 'Macro Precision',
    macro_recall: 'Macro Recall',
    macro_f1: 'Macro F1',
    macro_auc_ovr: 'Macro AUC',
    r2: 'R2',
    rmse: 'RMSE',
    mae: 'MAE'
};
onMounted(async () => {
    summary.value = await getModelSummary();
});
const taskList = computed(() => summary.value?.tasks ?? []);
const onlineCount = computed(() => taskList.value.filter((task) => task.onlineAvailable).length);
const cautionCount = computed(() => taskList.value.filter((task) => Boolean(taskPresentationMap[task.taskKey]?.note)).length);
const overviewCards = computed(() => [
    { label: '预测任务数', value: String(taskList.value.length), tone: 'primary', note: '当前统一预测模块纳入的任务总数' },
    { label: '在线任务数', value: String(onlineCount.value), tone: 'success', note: '已经接入单学生在线预测的任务数' },
    { label: '离线评估任务数', value: String(Math.max(taskList.value.length - onlineCount.value, 0)), tone: 'warning', note: '已有评估结果但仍可继续补强线上推断的任务' },
    { label: '需谨慎解释', value: String(cautionCount.value), tone: 'danger', note: '指标过高或口径特殊，需要补充解释的任务数' }
]);
const moduleNotes = computed(() => [
    '这个模块把风险、奖学金、综合成绩、健康、趋势、学习投入、综合发展、四级、六级等任务统一展示。',
    '二分类任务优先看 AUC 与 F1；多分类任务更适合同时看 Macro F1、Accuracy，再把 AUC 作为辅助参考。',
    '如果某个任务的 AUC 过高，要优先排查数据泄漏、标签过于容易或类别极不平衡，而不是直接把结果当成“完美模型”。'
]);
function academicLookup(detail) {
    return new Map((detail?.academicDetails ?? []).map((item) => [item.label, item.value]));
}
const studentPredictionCards = computed(() => {
    if (!studentDetail.value) {
        return [];
    }
    const detail = studentDetail.value;
    const lookup = academicLookup(detail);
    return [
        { label: '风险等级', value: detail.riskLevel || '未提供', note: '当前风险分类结果' },
        { label: '风险概率', value: lookup.get('风险概率') || '未提供', note: '风险模型给出的总体概率' },
        { label: '综合预测分', value: lookup.get('综合预测分') || detail.scorePredictionLabel || '未提供', note: '综合成绩预测结果' },
        { label: '奖学金概率', value: lookup.get('奖学金概率') || '未提供', note: '奖学金获得概率预测' },
        { label: '英语四级通过概率', value: lookup.get('英语四级通过概率') || '未提供', note: '四级通过概率预测' },
        { label: '英语六级通过概率', value: lookup.get('英语六级通过概率') || '未提供', note: '六级通过概率预测' },
        { label: '学业表现档次', value: lookup.get('学业表现档次') || detail.performanceLevel || '未提供', note: '学业表现分类结果' },
        { label: '学习投入档次预测', value: lookup.get('学习投入档次预测') || '未提供', note: '学习投入分类结果' },
        { label: '高投入概率', value: lookup.get('高投入概率') || '未提供', note: '学习投入模型中的高投入概率' },
        { label: '综合发展档次预测', value: lookup.get('综合发展档次预测') || '未提供', note: '综合发展分类结果' },
        { label: '高发展概率', value: lookup.get('高发展概率') || '未提供', note: '综合发展模型中的高发展概率' },
        { label: '健康状态', value: detail.healthLevel || '未提供', note: '健康水平分类结果' },
        { label: '稳定健康概率', value: lookup.get('稳定健康概率') || '未提供', note: '健康模型中的稳定概率' },
        { label: '上升趋势概率', value: lookup.get('上升趋势概率') || '未提供', note: '变化趋势模型输出' },
        { label: '竞赛活跃概率', value: lookup.get('竞赛活跃概率') || '未提供', note: '竞赛活跃相关预测结果' }
    ];
});
function formatMetricValue(value) {
    if (value === undefined || value === null || Number.isNaN(value))
        return '未提供';
    return value.toFixed(3);
}
function toneType(tone) {
    if (tone === 'success')
        return 'success';
    if (tone === 'warning')
        return 'warning';
    if (tone === 'danger')
        return 'danger';
    return 'primary';
}
function taskView(task) {
    return taskPresentationMap[task.taskKey] ?? {
        title: task.taskName,
        description: task.description,
        primaryMetricKey: task.primaryMetricKey,
        secondaryMetricKey: task.secondaryMetricKey
    };
}
function metricValueMap(row) {
    return new Map(row.values.map((item) => [item.key, item]));
}
function pickBestRow(task, metricKey) {
    let bestRow;
    let bestValue = Number.NEGATIVE_INFINITY;
    for (const row of task.rows) {
        const value = metricValueMap(row).get(metricKey)?.value;
        if (value === undefined || value === null || Number.isNaN(value))
            continue;
        if (value > bestValue) {
            bestValue = value;
            bestRow = row;
        }
    }
    return bestRow ?? task.rows[0];
}
function displayMetrics(task) {
    const view = taskView(task);
    const primaryMetricKey = view.primaryMetricKey ?? task.primaryMetricKey;
    const secondaryMetricKey = view.secondaryMetricKey ?? task.secondaryMetricKey;
    const bestRow = pickBestRow(task, primaryMetricKey);
    const metricMap = bestRow ? metricValueMap(bestRow) : new Map();
    return {
        bestModel: bestRow?.model ?? task.bestModel,
        primaryLabel: metricLabelMap[primaryMetricKey] ?? task.primaryMetricLabel,
        primaryValue: metricMap.get(primaryMetricKey)?.value,
        secondaryLabel: metricLabelMap[secondaryMetricKey] ?? task.secondaryMetricLabel,
        secondaryValue: metricMap.get(secondaryMetricKey)?.value
    };
}
function topImportance(task) {
    return task.importance.slice(0, 5);
}
async function searchStudentPredictions() {
    const studentId = searchStudentId.value.trim();
    if (!studentId) {
        studentError.value = '请输入学号后再查询';
        studentDetail.value = undefined;
        return;
    }
    studentLoading.value = true;
    studentError.value = '';
    try {
        studentDetail.value = await getStudentDetail(studentId);
    }
    catch (error) {
        studentDetail.value = undefined;
        studentError.value = error instanceof Error ? error.message : '该学生预测结果加载失败';
    }
    finally {
        studentLoading.value = false;
    }
}
function openStudentDetail() {
    if (!studentDetail.value?.studentId)
        return;
    router.push(`/students/${studentDetail.value.studentId}`);
}
function openStudentReport() {
    if (!studentDetail.value?.studentId)
        return;
    router.push(`/students/${studentDetail.value.studentId}/report`);
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['student-result-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['task-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['task-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-pair']} */ ;
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
    ...{ class: "panel-card student-query-card" },
}));
const __VLS_2 = __VLS_1({
    ...{ class: "panel-card student-query-card" },
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
    ...{ class: "student-query-bar" },
});
const __VLS_4 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchStudentId),
    placeholder: "输入学号后查看该学生的各项预测结果",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_6 = __VLS_5({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.searchStudentId),
    placeholder: "输入学号后查看该学生的各项预测结果",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onKeyup: (__VLS_ctx.searchStudentPredictions)
};
var __VLS_7;
const __VLS_12 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.studentLoading),
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.studentLoading),
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.searchStudentPredictions)
};
__VLS_15.slots.default;
var __VLS_15;
if (__VLS_ctx.studentDetail) {
    const __VLS_20 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
        ...{ 'onClick': {} },
    }));
    const __VLS_22 = __VLS_21({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    let __VLS_24;
    let __VLS_25;
    let __VLS_26;
    const __VLS_27 = {
        onClick: (__VLS_ctx.openStudentDetail)
    };
    __VLS_23.slots.default;
    var __VLS_23;
}
if (__VLS_ctx.studentDetail) {
    const __VLS_28 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
        ...{ 'onClick': {} },
    }));
    const __VLS_30 = __VLS_29({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_29));
    let __VLS_32;
    let __VLS_33;
    let __VLS_34;
    const __VLS_35 = {
        onClick: (__VLS_ctx.openStudentReport)
    };
    __VLS_31.slots.default;
    var __VLS_31;
}
if (__VLS_ctx.studentError) {
    const __VLS_36 = {}.ElAlert;
    /** @type {[typeof __VLS_components.ElAlert, typeof __VLS_components.elAlert, ]} */ ;
    // @ts-ignore
    const __VLS_37 = __VLS_asFunctionalComponent(__VLS_36, new __VLS_36({
        type: "error",
        closable: (false),
        ...{ class: "student-alert" },
        title: (__VLS_ctx.studentError),
    }));
    const __VLS_38 = __VLS_37({
        type: "error",
        closable: (false),
        ...{ class: "student-alert" },
        title: (__VLS_ctx.studentError),
    }, ...__VLS_functionalComponentArgsRest(__VLS_37));
}
if (__VLS_ctx.studentDetail) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "student-result-wrap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "student-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "student-name" },
    });
    (__VLS_ctx.studentDetail.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "student-copy" },
    });
    (__VLS_ctx.studentDetail.studentId);
    (__VLS_ctx.studentDetail.college);
    (__VLS_ctx.studentDetail.major);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "student-result-grid" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.studentPredictionCards))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (item.label),
            ...{ class: "student-result-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-result-label" },
        });
        (item.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-result-value" },
        });
        (item.value);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "student-result-note" },
        });
        (item.note);
    }
}
var __VLS_3;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "overview-grid" },
});
for (const [card] of __VLS_getVForSourceType((__VLS_ctx.overviewCards))) {
    const __VLS_40 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
        key: (card.label),
        ...{ class: "overview-card" },
    }));
    const __VLS_42 = __VLS_41({
        key: (card.label),
        ...{ class: "overview-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    __VLS_43.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "overview-label" },
    });
    (card.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "overview-value" },
    });
    (card.value);
    const __VLS_44 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
        size: "small",
        round: true,
        type: (__VLS_ctx.toneType(card.tone)),
    }));
    const __VLS_46 = __VLS_45({
        size: "small",
        round: true,
        type: (__VLS_ctx.toneType(card.tone)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_45));
    __VLS_47.slots.default;
    (card.note);
    var __VLS_47;
    var __VLS_43;
}
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
    const __VLS_52 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_53 = __VLS_asFunctionalComponent(__VLS_52, new __VLS_52({
        size: "small",
        round: true,
        type: "info",
    }));
    const __VLS_54 = __VLS_53({
        size: "small",
        round: true,
        type: "info",
    }, ...__VLS_functionalComponentArgsRest(__VLS_53));
    __VLS_55.slots.default;
    var __VLS_55;
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "desc-list" },
});
for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.moduleNotes))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: "desc-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "desc-index" },
    });
    (index + 1);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "desc-text" },
    });
    (item);
}
var __VLS_51;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "task-grid" },
});
for (const [task] of __VLS_getVForSourceType((__VLS_ctx.taskList))) {
    const __VLS_56 = {}.ElCard;
    /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
        key: (task.taskKey),
        ...{ class: "task-card" },
    }));
    const __VLS_58 = __VLS_57({
        key: (task.taskKey),
        ...{ class: "task-card" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    __VLS_59.slots.default;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "task-top" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "task-name" },
    });
    (__VLS_ctx.taskView(task).title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "task-desc" },
    });
    (__VLS_ctx.taskView(task).description);
    const __VLS_60 = {}.ElTag;
    /** @type {[typeof __VLS_components.ElTag, typeof __VLS_components.elTag, typeof __VLS_components.ElTag, typeof __VLS_components.elTag, ]} */ ;
    // @ts-ignore
    const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
        type: (task.onlineAvailable ? 'success' : 'warning'),
        round: true,
    }));
    const __VLS_62 = __VLS_61({
        type: (task.onlineAvailable ? 'success' : 'warning'),
        round: true,
    }, ...__VLS_functionalComponentArgsRest(__VLS_61));
    __VLS_63.slots.default;
    (task.onlineAvailable ? '已接入在线预测' : '仅有离线评估');
    var __VLS_63;
    if (__VLS_ctx.taskView(task).note) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "task-note" },
        });
        (__VLS_ctx.taskView(task).note);
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-pair" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-pill" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-title" },
    });
    (__VLS_ctx.displayMetrics(task).primaryLabel);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-number" },
    });
    (__VLS_ctx.formatMetricValue(__VLS_ctx.displayMetrics(task).primaryValue));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-pill subtle" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-title" },
    });
    (__VLS_ctx.displayMetrics(task).secondaryLabel);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "metric-number" },
    });
    (__VLS_ctx.formatMetricValue(__VLS_ctx.displayMetrics(task).secondaryValue));
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "task-meta" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.displayMetrics(task).bestModel);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (task.source);
    const __VLS_64 = {}.ElTable;
    /** @type {[typeof __VLS_components.ElTable, typeof __VLS_components.elTable, typeof __VLS_components.ElTable, typeof __VLS_components.elTable, ]} */ ;
    // @ts-ignore
    const __VLS_65 = __VLS_asFunctionalComponent(__VLS_64, new __VLS_64({
        data: (task.rows),
        stripe: true,
        size: "small",
        ...{ class: "task-table" },
    }));
    const __VLS_66 = __VLS_65({
        data: (task.rows),
        stripe: true,
        size: "small",
        ...{ class: "task-table" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_65));
    __VLS_67.slots.default;
    const __VLS_68 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
        prop: "model",
        label: "模型",
        minWidth: "150",
    }));
    const __VLS_70 = __VLS_69({
        prop: "model",
        label: "模型",
        minWidth: "150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_69));
    const __VLS_72 = {}.ElTableColumn;
    /** @type {[typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, typeof __VLS_components.ElTableColumn, typeof __VLS_components.elTableColumn, ]} */ ;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
        label: "指标详情",
        minWidth: "320",
    }));
    const __VLS_74 = __VLS_73({
        label: "指标详情",
        minWidth: "320",
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    __VLS_75.slots.default;
    {
        const { default: __VLS_thisSlot } = __VLS_75.slots;
        const [{ row }] = __VLS_getSlotParams(__VLS_thisSlot);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "metric-chip-list" },
        });
        for (const [item] of __VLS_getVForSourceType((row.values))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                key: (item.key),
                ...{ class: "metric-chip" },
            });
            (item.label);
            (item.value.toFixed(3));
        }
    }
    var __VLS_75;
    var __VLS_67;
    if (__VLS_ctx.topImportance(task).length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "importance-block" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "importance-title" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "importance-list" },
        });
        for (const [item] of __VLS_getVForSourceType((__VLS_ctx.topImportance(task)))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (`${task.taskKey}-${item.feature}`),
                ...{ class: "importance-row" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "importance-feature" },
            });
            (item.feature);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "importance-value" },
            });
            ((item.importance * 100).toFixed(1));
        }
    }
    var __VLS_59;
}
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['page-header']} */ ;
/** @type {__VLS_StyleScopedClasses['page-title']} */ ;
/** @type {__VLS_StyleScopedClasses['page-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['student-query-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['student-query-bar']} */ ;
/** @type {__VLS_StyleScopedClasses['student-alert']} */ ;
/** @type {__VLS_StyleScopedClasses['student-result-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['student-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['student-name']} */ ;
/** @type {__VLS_StyleScopedClasses['student-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['student-result-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['student-result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['student-result-label']} */ ;
/** @type {__VLS_StyleScopedClasses['student-result-value']} */ ;
/** @type {__VLS_StyleScopedClasses['student-result-note']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-card']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-label']} */ ;
/** @type {__VLS_StyleScopedClasses['overview-value']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-list']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-item']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-index']} */ ;
/** @type {__VLS_StyleScopedClasses['desc-text']} */ ;
/** @type {__VLS_StyleScopedClasses['task-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['task-card']} */ ;
/** @type {__VLS_StyleScopedClasses['task-top']} */ ;
/** @type {__VLS_StyleScopedClasses['task-name']} */ ;
/** @type {__VLS_StyleScopedClasses['task-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['task-note']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-pair']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-title']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-number']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-pill']} */ ;
/** @type {__VLS_StyleScopedClasses['subtle']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-title']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-number']} */ ;
/** @type {__VLS_StyleScopedClasses['task-meta']} */ ;
/** @type {__VLS_StyleScopedClasses['task-table']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-chip-list']} */ ;
/** @type {__VLS_StyleScopedClasses['metric-chip']} */ ;
/** @type {__VLS_StyleScopedClasses['importance-block']} */ ;
/** @type {__VLS_StyleScopedClasses['importance-title']} */ ;
/** @type {__VLS_StyleScopedClasses['importance-list']} */ ;
/** @type {__VLS_StyleScopedClasses['importance-row']} */ ;
/** @type {__VLS_StyleScopedClasses['importance-feature']} */ ;
/** @type {__VLS_StyleScopedClasses['importance-value']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            searchStudentId: searchStudentId,
            studentDetail: studentDetail,
            studentLoading: studentLoading,
            studentError: studentError,
            taskList: taskList,
            overviewCards: overviewCards,
            moduleNotes: moduleNotes,
            studentPredictionCards: studentPredictionCards,
            formatMetricValue: formatMetricValue,
            toneType: toneType,
            taskView: taskView,
            displayMetrics: displayMetrics,
            topImportance: topImportance,
            searchStudentPredictions: searchStudentPredictions,
            openStudentDetail: openStudentDetail,
            openStudentReport: openStudentReport,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
