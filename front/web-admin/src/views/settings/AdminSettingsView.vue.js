/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { computed, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useAuthStore } from '../../stores/auth';
import { useAdminLayoutPreferences } from '../../utils/layoutPreferences';
const auth = useAuthStore();
const preferences = useAdminLayoutPreferences();
const accountRows = computed(() => [
    { label: '姓名', value: auth.user?.name || '张老师' },
    { label: '账号', value: auth.user?.username || 'admin001' },
    { label: '角色', value: auth.user?.role || 'admin' },
    { label: '权限范围', value: '管理员全局视角' }
]);
const statusCards = computed(() => [
    { label: '数据状态', value: 'analysis_master 已接入' },
    { label: '模型状态', value: '风险预测可用' },
    { label: '报告状态', value: preferences.allowExportReports ? '允许导出' : '仅预览' },
    { label: '默认首页', value: preferences.defaultLandingPage }
]);
const passwordDialogVisible = ref(false);
const deviceDrawerVisible = ref(false);
const permissionDrawerVisible = ref(false);
const helpDrawerVisible = ref(false);
const helpTitle = ref('帮助中心');
const helpContent = ref('');
const passwordForm = reactive({
    currentPassword: '',
    nextPassword: '',
    confirmPassword: ''
});
const deviceRows = computed(() => [
    { name: '当前浏览器', status: '在线', location: '本机 Windows', lastActive: '刚刚' },
    { name: '后台管理会话', status: '在线', location: '管理控制台', lastActive: '当前会话' },
    { name: '最近一次登录记录', status: '离线', location: '本机浏览器', lastActive: '今日较早' }
]);
const permissionRows = computed(() => [
    { label: '风险名单与学生详情', value: '可查看学生名单、画像、详细特征和完整报告。' },
    { label: '分析成果与院系对比', value: '可查看全样本图表、学院对比和专业对比结果。' },
    { label: '导出权限', value: preferences.allowExportReports ? '当前允许导出完整报告。' : '当前仅允许在线预览。' },
    { label: '敏感字段可见性', value: preferences.showSensitiveFields ? '当前显示详细行为与成绩字段。' : '当前隐藏敏感字段。' }
]);
function openPasswordDialog() {
    passwordDialogVisible.value = true;
}
function submitPasswordChange() {
    if (!passwordForm.currentPassword || !passwordForm.nextPassword || !passwordForm.confirmPassword) {
        ElMessage.warning('请先填写完整的密码信息。');
        return;
    }
    if (passwordForm.nextPassword !== passwordForm.confirmPassword) {
        ElMessage.warning('两次输入的新密码不一致，请重新确认。');
        return;
    }
    passwordDialogVisible.value = false;
    passwordForm.currentPassword = '';
    passwordForm.nextPassword = '';
    passwordForm.confirmPassword = '';
    ElMessage.success('已记录修改密码请求，请按新密码重新登录。');
}
function openDeviceDrawer() {
    deviceDrawerVisible.value = true;
}
async function handleLogoutAllDevices() {
    await ElMessageBox.confirm('确定要让当前账号在其他设备上全部退出登录吗？', '退出全部设备', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
    });
    ElMessage.success('已发起全部设备退出。');
}
function openPermissionDrawer() {
    permissionDrawerVisible.value = true;
}
function openHelp(title, content) {
    helpTitle.value = title;
    helpContent.value = content;
    helpDrawerVisible.value = true;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['select-row']} */ ;
/** @type {__VLS_StyleScopedClasses['status-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['status-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['action-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['status-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['select-row']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-shell settings-page" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero panel-card" },
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-badge" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "status-grid" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.statusCards))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
        key: (item.label),
        ...{ class: "status-card panel-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "status-label" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "status-value" },
    });
    (item.value);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "settings-grid" },
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
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.accountRows))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.label),
        ...{ class: "info-item" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-label" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "info-value" },
    });
    (item.value);
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-grid" },
});
const __VLS_4 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_5 = __VLS_asFunctionalComponent(__VLS_4, new __VLS_4({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_6 = __VLS_5({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_5));
let __VLS_8;
let __VLS_9;
let __VLS_10;
const __VLS_11 = {
    onClick: (__VLS_ctx.openPasswordDialog)
};
__VLS_7.slots.default;
var __VLS_7;
const __VLS_12 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_14 = __VLS_13({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
let __VLS_16;
let __VLS_17;
let __VLS_18;
const __VLS_19 = {
    onClick: (__VLS_ctx.openDeviceDrawer)
};
__VLS_15.slots.default;
var __VLS_15;
const __VLS_20 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_22 = __VLS_21({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_21));
let __VLS_24;
let __VLS_25;
let __VLS_26;
const __VLS_27 = {
    onClick: (__VLS_ctx.handleLogoutAllDevices)
};
__VLS_23.slots.default;
var __VLS_23;
const __VLS_28 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_30 = __VLS_29({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_29));
let __VLS_32;
let __VLS_33;
let __VLS_34;
const __VLS_35 = {
    onClick: (__VLS_ctx.openPermissionDrawer)
};
__VLS_31.slots.default;
var __VLS_31;
var __VLS_3;
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
    ...{ class: "switch-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
const __VLS_40 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_41 = __VLS_asFunctionalComponent(__VLS_40, new __VLS_40({
    modelValue: (__VLS_ctx.preferences.riskNotice),
}));
const __VLS_42 = __VLS_41({
    modelValue: (__VLS_ctx.preferences.riskNotice),
}, ...__VLS_functionalComponentArgsRest(__VLS_41));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
const __VLS_44 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_45 = __VLS_asFunctionalComponent(__VLS_44, new __VLS_44({
    modelValue: (__VLS_ctx.preferences.reportNotice),
}));
const __VLS_46 = __VLS_45({
    modelValue: (__VLS_ctx.preferences.reportNotice),
}, ...__VLS_functionalComponentArgsRest(__VLS_45));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
const __VLS_48 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_49 = __VLS_asFunctionalComponent(__VLS_48, new __VLS_48({
    modelValue: (__VLS_ctx.preferences.taskNotice),
}));
const __VLS_50 = __VLS_49({
    modelValue: (__VLS_ctx.preferences.taskNotice),
}, ...__VLS_functionalComponentArgsRest(__VLS_49));
var __VLS_39;
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
    ...{ class: "switch-list" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
const __VLS_56 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_57 = __VLS_asFunctionalComponent(__VLS_56, new __VLS_56({
    modelValue: (__VLS_ctx.preferences.showSensitiveFields),
}));
const __VLS_58 = __VLS_57({
    modelValue: (__VLS_ctx.preferences.showSensitiveFields),
}, ...__VLS_functionalComponentArgsRest(__VLS_57));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
const __VLS_60 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_61 = __VLS_asFunctionalComponent(__VLS_60, new __VLS_60({
    modelValue: (__VLS_ctx.preferences.allowExportReports),
}));
const __VLS_62 = __VLS_61({
    modelValue: (__VLS_ctx.preferences.allowExportReports),
}, ...__VLS_functionalComponentArgsRest(__VLS_61));
var __VLS_55;
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
    ...{ class: "form-stack" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "select-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
const __VLS_68 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_69 = __VLS_asFunctionalComponent(__VLS_68, new __VLS_68({
    modelValue: (__VLS_ctx.preferences.reportTemplate),
    ...{ style: {} },
}));
const __VLS_70 = __VLS_69({
    modelValue: (__VLS_ctx.preferences.reportTemplate),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_69));
__VLS_71.slots.default;
const __VLS_72 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_73 = __VLS_asFunctionalComponent(__VLS_72, new __VLS_72({
    label: "标准模板",
    value: "standard",
}));
const __VLS_74 = __VLS_73({
    label: "标准模板",
    value: "standard",
}, ...__VLS_functionalComponentArgsRest(__VLS_73));
const __VLS_76 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_77 = __VLS_asFunctionalComponent(__VLS_76, new __VLS_76({
    label: "完整模板",
    value: "competition",
}));
const __VLS_78 = __VLS_77({
    label: "完整模板",
    value: "competition",
}, ...__VLS_functionalComponentArgsRest(__VLS_77));
var __VLS_71;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-item compact-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
const __VLS_80 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent(__VLS_80, new __VLS_80({
    modelValue: (__VLS_ctx.preferences.includeFeatureTableInExport),
}));
const __VLS_82 = __VLS_81({
    modelValue: (__VLS_ctx.preferences.includeFeatureTableInExport),
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-item compact-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
const __VLS_84 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_85 = __VLS_asFunctionalComponent(__VLS_84, new __VLS_84({
    modelValue: (__VLS_ctx.preferences.includeExplanationInExport),
}));
const __VLS_86 = __VLS_85({
    modelValue: (__VLS_ctx.preferences.includeExplanationInExport),
}, ...__VLS_functionalComponentArgsRest(__VLS_85));
var __VLS_67;
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
    ...{ class: "form-stack" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "select-row" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
const __VLS_92 = {}.ElSelect;
/** @type {[typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, typeof __VLS_components.ElSelect, typeof __VLS_components.elSelect, ]} */ ;
// @ts-ignore
const __VLS_93 = __VLS_asFunctionalComponent(__VLS_92, new __VLS_92({
    modelValue: (__VLS_ctx.preferences.defaultLandingPage),
    ...{ style: {} },
}));
const __VLS_94 = __VLS_93({
    modelValue: (__VLS_ctx.preferences.defaultLandingPage),
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_93));
__VLS_95.slots.default;
const __VLS_96 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_97 = __VLS_asFunctionalComponent(__VLS_96, new __VLS_96({
    label: "总览",
    value: "dashboard",
}));
const __VLS_98 = __VLS_97({
    label: "总览",
    value: "dashboard",
}, ...__VLS_functionalComponentArgsRest(__VLS_97));
const __VLS_100 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_101 = __VLS_asFunctionalComponent(__VLS_100, new __VLS_100({
    label: "风险名单",
    value: "warnings",
}));
const __VLS_102 = __VLS_101({
    label: "风险名单",
    value: "warnings",
}, ...__VLS_functionalComponentArgsRest(__VLS_101));
const __VLS_104 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_105 = __VLS_asFunctionalComponent(__VLS_104, new __VLS_104({
    label: "院系对比",
    value: "profiles",
}));
const __VLS_106 = __VLS_105({
    label: "院系对比",
    value: "profiles",
}, ...__VLS_functionalComponentArgsRest(__VLS_105));
const __VLS_108 = {}.ElOption;
/** @type {[typeof __VLS_components.ElOption, typeof __VLS_components.elOption, ]} */ ;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent(__VLS_108, new __VLS_108({
    label: "干预工作台",
    value: "tasks",
}));
const __VLS_110 = __VLS_109({
    label: "干预工作台",
    value: "tasks",
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
var __VLS_95;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-item compact-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
const __VLS_112 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_113 = __VLS_asFunctionalComponent(__VLS_112, new __VLS_112({
    modelValue: (__VLS_ctx.preferences.autoExpandFeatureTable),
}));
const __VLS_114 = __VLS_113({
    modelValue: (__VLS_ctx.preferences.autoExpandFeatureTable),
}, ...__VLS_functionalComponentArgsRest(__VLS_113));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-item compact-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
const __VLS_116 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_117 = __VLS_asFunctionalComponent(__VLS_116, new __VLS_116({
    modelValue: (__VLS_ctx.preferences.compactMode),
}));
const __VLS_118 = __VLS_117({
    modelValue: (__VLS_ctx.preferences.compactMode),
}, ...__VLS_functionalComponentArgsRest(__VLS_117));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-item compact-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
const __VLS_120 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_121 = __VLS_asFunctionalComponent(__VLS_120, new __VLS_120({
    modelValue: (__VLS_ctx.preferences.highlightPanels),
}));
const __VLS_122 = __VLS_121({
    modelValue: (__VLS_ctx.preferences.highlightPanels),
}, ...__VLS_functionalComponentArgsRest(__VLS_121));
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-item compact-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-title" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "stack-switch" },
});
const __VLS_124 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_125 = __VLS_asFunctionalComponent(__VLS_124, new __VLS_124({
    modelValue: (__VLS_ctx.preferences.showBreadcrumb),
}));
const __VLS_126 = __VLS_125({
    modelValue: (__VLS_ctx.preferences.showBreadcrumb),
}, ...__VLS_functionalComponentArgsRest(__VLS_125));
const __VLS_128 = {}.ElSwitch;
/** @type {[typeof __VLS_components.ElSwitch, typeof __VLS_components.elSwitch, ]} */ ;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent(__VLS_128, new __VLS_128({
    modelValue: (__VLS_ctx.preferences.showContextStrip),
}));
const __VLS_130 = __VLS_129({
    modelValue: (__VLS_ctx.preferences.showContextStrip),
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
var __VLS_91;
const __VLS_132 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_133 = __VLS_asFunctionalComponent(__VLS_132, new __VLS_132({
    ...{ class: "panel-card full-span" },
}));
const __VLS_134 = __VLS_133({
    ...{ class: "panel-card full-span" },
}, ...__VLS_functionalComponentArgsRest(__VLS_133));
__VLS_135.slots.default;
{
    const { header: __VLS_thisSlot } = __VLS_135.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "card-header-inner" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "minor-copy" },
    });
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-grid" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-value" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "switch-copy" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "system-item" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "info-label" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "action-grid" },
});
const __VLS_136 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_138 = __VLS_137({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_137));
let __VLS_140;
let __VLS_141;
let __VLS_142;
const __VLS_143 = {
    onClick: (...[$event]) => {
        __VLS_ctx.openHelp('使用说明', '系统支持按风险、画像、院系和完整报告多维查看学生情况。');
    }
};
__VLS_139.slots.default;
var __VLS_139;
const __VLS_144 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_145 = __VLS_asFunctionalComponent(__VLS_144, new __VLS_144({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_146 = __VLS_145({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_145));
let __VLS_148;
let __VLS_149;
let __VLS_150;
const __VLS_151 = {
    onClick: (...[$event]) => {
        __VLS_ctx.openHelp('问题反馈', '如遇到数据缺失、页面异常或报告生成问题，可先刷新并重新加载当前页面。');
    }
};
__VLS_147.slots.default;
var __VLS_147;
const __VLS_152 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent(__VLS_152, new __VLS_152({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_154 = __VLS_153({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
let __VLS_156;
let __VLS_157;
let __VLS_158;
const __VLS_159 = {
    onClick: (...[$event]) => {
        __VLS_ctx.openHelp('版本信息', '当前版本已支持完整报告、特征总表、计算依据和干预工作台抽屉详情。');
    }
};
__VLS_155.slots.default;
var __VLS_155;
const __VLS_160 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
    ...{ 'onClick': {} },
    plain: true,
}));
const __VLS_162 = __VLS_161({
    ...{ 'onClick': {} },
    plain: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_161));
let __VLS_164;
let __VLS_165;
let __VLS_166;
const __VLS_167 = {
    onClick: (...[$event]) => {
        __VLS_ctx.openHelp('帮助中心', '建议优先从风险名单、院系对比和干预工作台进入，再进入单学生详情和完整报告。');
    }
};
__VLS_163.slots.default;
var __VLS_163;
var __VLS_135;
const __VLS_168 = {}.ElDialog;
/** @type {[typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, typeof __VLS_components.ElDialog, typeof __VLS_components.elDialog, ]} */ ;
// @ts-ignore
const __VLS_169 = __VLS_asFunctionalComponent(__VLS_168, new __VLS_168({
    modelValue: (__VLS_ctx.passwordDialogVisible),
    title: "修改密码",
    width: "420px",
}));
const __VLS_170 = __VLS_169({
    modelValue: (__VLS_ctx.passwordDialogVisible),
    title: "修改密码",
    width: "420px",
}, ...__VLS_functionalComponentArgsRest(__VLS_169));
__VLS_171.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "form-stack" },
});
const __VLS_172 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({
    modelValue: (__VLS_ctx.passwordForm.currentPassword),
    type: "password",
    showPassword: true,
    placeholder: "当前密码",
}));
const __VLS_174 = __VLS_173({
    modelValue: (__VLS_ctx.passwordForm.currentPassword),
    type: "password",
    showPassword: true,
    placeholder: "当前密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_173));
const __VLS_176 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_177 = __VLS_asFunctionalComponent(__VLS_176, new __VLS_176({
    modelValue: (__VLS_ctx.passwordForm.nextPassword),
    type: "password",
    showPassword: true,
    placeholder: "新密码",
}));
const __VLS_178 = __VLS_177({
    modelValue: (__VLS_ctx.passwordForm.nextPassword),
    type: "password",
    showPassword: true,
    placeholder: "新密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_177));
const __VLS_180 = {}.ElInput;
/** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
// @ts-ignore
const __VLS_181 = __VLS_asFunctionalComponent(__VLS_180, new __VLS_180({
    modelValue: (__VLS_ctx.passwordForm.confirmPassword),
    type: "password",
    showPassword: true,
    placeholder: "确认新密码",
}));
const __VLS_182 = __VLS_181({
    modelValue: (__VLS_ctx.passwordForm.confirmPassword),
    type: "password",
    showPassword: true,
    placeholder: "确认新密码",
}, ...__VLS_functionalComponentArgsRest(__VLS_181));
{
    const { footer: __VLS_thisSlot } = __VLS_171.slots;
    const __VLS_184 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_185 = __VLS_asFunctionalComponent(__VLS_184, new __VLS_184({
        ...{ 'onClick': {} },
    }));
    const __VLS_186 = __VLS_185({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_185));
    let __VLS_188;
    let __VLS_189;
    let __VLS_190;
    const __VLS_191 = {
        onClick: (...[$event]) => {
            __VLS_ctx.passwordDialogVisible = false;
        }
    };
    __VLS_187.slots.default;
    var __VLS_187;
    const __VLS_192 = {}.ElButton;
    /** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
    // @ts-ignore
    const __VLS_193 = __VLS_asFunctionalComponent(__VLS_192, new __VLS_192({
        ...{ 'onClick': {} },
        type: "primary",
    }));
    const __VLS_194 = __VLS_193({
        ...{ 'onClick': {} },
        type: "primary",
    }, ...__VLS_functionalComponentArgsRest(__VLS_193));
    let __VLS_196;
    let __VLS_197;
    let __VLS_198;
    const __VLS_199 = {
        onClick: (__VLS_ctx.submitPasswordChange)
    };
    __VLS_195.slots.default;
    var __VLS_195;
}
var __VLS_171;
const __VLS_200 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent(__VLS_200, new __VLS_200({
    modelValue: (__VLS_ctx.deviceDrawerVisible),
    title: "登录设备管理",
    size: "420px",
}));
const __VLS_202 = __VLS_201({
    modelValue: (__VLS_ctx.deviceDrawerVisible),
    title: "登录设备管理",
    size: "420px",
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
__VLS_203.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "drawer-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.deviceRows))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.name),
        ...{ class: "drawer-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-card-title" },
    });
    (item.name);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-card-copy" },
    });
    (item.status);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-card-copy" },
    });
    (item.location);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-card-copy" },
    });
    (item.lastActive);
}
var __VLS_203;
const __VLS_204 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_205 = __VLS_asFunctionalComponent(__VLS_204, new __VLS_204({
    modelValue: (__VLS_ctx.permissionDrawerVisible),
    title: "权限说明",
    size: "420px",
}));
const __VLS_206 = __VLS_205({
    modelValue: (__VLS_ctx.permissionDrawerVisible),
    title: "权限说明",
    size: "420px",
}, ...__VLS_functionalComponentArgsRest(__VLS_205));
__VLS_207.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "drawer-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.permissionRows))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item.label),
        ...{ class: "drawer-card" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-card-title" },
    });
    (item.label);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "drawer-card-copy" },
    });
    (item.value);
}
var __VLS_207;
const __VLS_208 = {}.ElDrawer;
/** @type {[typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, typeof __VLS_components.ElDrawer, typeof __VLS_components.elDrawer, ]} */ ;
// @ts-ignore
const __VLS_209 = __VLS_asFunctionalComponent(__VLS_208, new __VLS_208({
    modelValue: (__VLS_ctx.helpDrawerVisible),
    title: (__VLS_ctx.helpTitle),
    size: "420px",
}));
const __VLS_210 = __VLS_209({
    modelValue: (__VLS_ctx.helpDrawerVisible),
    title: (__VLS_ctx.helpTitle),
    size: "420px",
}, ...__VLS_functionalComponentArgsRest(__VLS_209));
__VLS_211.slots.default;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "drawer-card-copy" },
});
(__VLS_ctx.helpContent);
var __VLS_211;
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-page']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-badge']} */ ;
/** @type {__VLS_StyleScopedClasses['status-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['status-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['status-label']} */ ;
/** @type {__VLS_StyleScopedClasses['status-value']} */ ;
/** @type {__VLS_StyleScopedClasses['settings-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['info-list']} */ ;
/** @type {__VLS_StyleScopedClasses['info-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['info-value']} */ ;
/** @type {__VLS_StyleScopedClasses['action-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-list']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-title']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-title']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-title']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-list']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-title']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-title']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['form-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['select-row']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-title']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-item']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-title']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-item']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-title']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['form-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['select-row']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-title']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-item']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-title']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-item']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-title']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-item']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-title']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-item']} */ ;
/** @type {__VLS_StyleScopedClasses['compact-item']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-title']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['stack-switch']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['full-span']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['system-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['system-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['system-value']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['system-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['system-value']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['system-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['system-value']} */ ;
/** @type {__VLS_StyleScopedClasses['switch-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['system-item']} */ ;
/** @type {__VLS_StyleScopedClasses['info-label']} */ ;
/** @type {__VLS_StyleScopedClasses['action-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['form-stack']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-list']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-list']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card-title']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-card-copy']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            preferences: preferences,
            accountRows: accountRows,
            statusCards: statusCards,
            passwordDialogVisible: passwordDialogVisible,
            deviceDrawerVisible: deviceDrawerVisible,
            permissionDrawerVisible: permissionDrawerVisible,
            helpDrawerVisible: helpDrawerVisible,
            helpTitle: helpTitle,
            helpContent: helpContent,
            passwordForm: passwordForm,
            deviceRows: deviceRows,
            permissionRows: permissionRows,
            openPasswordDialog: openPasswordDialog,
            submitPasswordChange: submitPasswordChange,
            openDeviceDrawer: openDeviceDrawer,
            handleLogoutAllDevices: handleLogoutAllDevices,
            openPermissionDrawer: openPermissionDrawer,
            openHelp: openHelp,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
