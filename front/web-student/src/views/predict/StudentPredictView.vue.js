/// <reference types="../../../node_modules/.vue-global-types/vue_3.5_0_0_0.d.ts" />
import { onMounted, reactive, ref } from 'vue';
import { getStudentPredictionSchema, submitStudentManualPredict } from '../../api/student';
const schema = ref();
const result = ref();
const loading = ref(false);
const form = reactive({});
onMounted(async () => {
    schema.value = await getStudentPredictionSchema();
    for (const group of schema.value.groups) {
        for (const field of group.fields) {
            form[field.key] = field.defaultValue ?? null;
        }
    }
    await handlePredict();
});
async function handlePredict() {
    loading.value = true;
    try {
        result.value = await submitStudentManualPredict(form);
    }
    finally {
        loading.value = false;
    }
}
function resetToDefault() {
    if (!schema.value)
        return;
    for (const group of schema.value.groups) {
        for (const field of group.fields) {
            form[field.key] = field.defaultValue ?? null;
        }
    }
}
function toneClass(tone) {
    return `tone-${tone || 'primary'}`;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['group-block']} */ ;
/** @type {__VLS_StyleScopedClasses['group-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.section, __VLS_intrinsicElements.section)({
    ...{ class: "page-shell predict-page" },
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
__VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
    ...{ class: "hero-subtitle" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "hero-actions" },
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
    onClick: (__VLS_ctx.resetToDefault)
};
__VLS_3.slots.default;
var __VLS_3;
const __VLS_8 = {}.ElButton;
/** @type {[typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ]} */ ;
// @ts-ignore
const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.loading),
}));
const __VLS_10 = __VLS_9({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_9));
let __VLS_12;
let __VLS_13;
let __VLS_14;
const __VLS_15 = {
    onClick: (__VLS_ctx.handlePredict)
};
__VLS_11.slots.default;
var __VLS_11;
const __VLS_16 = {}.ElCard;
/** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
    ...{ class: "panel-card" },
}));
const __VLS_18 = __VLS_17({
    ...{ class: "panel-card" },
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
for (const [group] of __VLS_getVForSourceType((__VLS_ctx.schema?.groups ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (group.title),
        ...{ class: "group-block" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "group-title" },
    });
    (group.title);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "group-desc" },
    });
    (group.description);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "form-grid" },
    });
    for (const [field] of __VLS_getVForSourceType((group.fields))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (field.key),
            ...{ class: "field-card" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            ...{ class: "field-label" },
        });
        (field.label);
        if (field.unit) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: "field-unit" },
            });
            (field.unit);
        }
        if (field.type !== 'number') {
            const __VLS_20 = {}.ElInput;
            /** @type {[typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ]} */ ;
            // @ts-ignore
            const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
                modelValue: (__VLS_ctx.form[field.key]),
                placeholder: (field.placeholder),
                clearable: true,
            }));
            const __VLS_22 = __VLS_21({
                modelValue: (__VLS_ctx.form[field.key]),
                placeholder: (field.placeholder),
                clearable: true,
            }, ...__VLS_functionalComponentArgsRest(__VLS_21));
        }
        else {
            const __VLS_24 = {}.ElInputNumber;
            /** @type {[typeof __VLS_components.ElInputNumber, typeof __VLS_components.elInputNumber, ]} */ ;
            // @ts-ignore
            const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
                modelValue: __VLS_ctx.form[field.key],
                controls: (false),
                ...{ class: "field-number" },
                placeholder: (field.placeholder),
            }));
            const __VLS_26 = __VLS_25({
                modelValue: __VLS_ctx.form[field.key],
                controls: (false),
                ...{ class: "field-number" },
                placeholder: (field.placeholder),
            }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        }
    }
}
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "note-list" },
});
for (const [item] of __VLS_getVForSourceType((__VLS_ctx.schema?.notes ?? []))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (item),
        ...{ class: "note-item" },
    });
    (item);
}
var __VLS_19;
if (__VLS_ctx.result) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-wrap" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "result-grid" },
    });
    for (const [card] of __VLS_getVForSourceType((__VLS_ctx.result.cards))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.article, __VLS_intrinsicElements.article)({
            key: (card.label),
            ...{ class: "result-card panel-card" },
            ...{ class: (__VLS_ctx.toneClass(card.tone)) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-label" },
        });
        (card.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-value" },
        });
        (card.value);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-desc" },
        });
        (card.description);
    }
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
        ...{ class: "model-output-list" },
    });
    for (const [card] of __VLS_getVForSourceType((__VLS_ctx.result.cards))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (`${card.label}-list`),
            ...{ class: "model-output-item" },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "model-output-label" },
        });
        (card.label);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "result-desc" },
        });
        (card.description);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({
            ...{ class: "model-output-value" },
        });
        (card.value);
    }
    var __VLS_31;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "section-grid" },
    });
    for (const [section] of __VLS_getVForSourceType((__VLS_ctx.result.sections))) {
        const __VLS_32 = {}.ElCard;
        /** @type {[typeof __VLS_components.ElCard, typeof __VLS_components.elCard, typeof __VLS_components.ElCard, typeof __VLS_components.elCard, ]} */ ;
        // @ts-ignore
        const __VLS_33 = __VLS_asFunctionalComponent(__VLS_32, new __VLS_32({
            key: (section.title),
            ...{ class: "panel-card" },
        }));
        const __VLS_34 = __VLS_33({
            key: (section.title),
            ...{ class: "panel-card" },
        }, ...__VLS_functionalComponentArgsRest(__VLS_33));
        __VLS_35.slots.default;
        {
            const { header: __VLS_thisSlot } = __VLS_35.slots;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "card-header-inner" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (section.title);
        }
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "section-list" },
        });
        for (const [item] of __VLS_getVForSourceType((section.items))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (`${section.title}-${item.label}`),
                ...{ class: "section-item" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (item.label);
            __VLS_asFunctionalElement(__VLS_intrinsicElements.strong, __VLS_intrinsicElements.strong)({});
            (item.value);
        }
        var __VLS_35;
    }
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
    }
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "note-list result-notes" },
    });
    for (const [item] of __VLS_getVForSourceType((__VLS_ctx.result.notes))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (item),
            ...{ class: "note-item" },
        });
        (item);
    }
    var __VLS_39;
}
/** @type {__VLS_StyleScopedClasses['page-shell']} */ ;
/** @type {__VLS_StyleScopedClasses['predict-page']} */ ;
/** @type {__VLS_StyleScopedClasses['hero']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-eyebrow']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-title']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-subtitle']} */ ;
/** @type {__VLS_StyleScopedClasses['hero-actions']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['group-block']} */ ;
/** @type {__VLS_StyleScopedClasses['group-title']} */ ;
/** @type {__VLS_StyleScopedClasses['group-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['form-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['field-card']} */ ;
/** @type {__VLS_StyleScopedClasses['field-label']} */ ;
/** @type {__VLS_StyleScopedClasses['field-unit']} */ ;
/** @type {__VLS_StyleScopedClasses['field-number']} */ ;
/** @type {__VLS_StyleScopedClasses['note-list']} */ ;
/** @type {__VLS_StyleScopedClasses['note-item']} */ ;
/** @type {__VLS_StyleScopedClasses['result-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['result-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['result-card']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['result-label']} */ ;
/** @type {__VLS_StyleScopedClasses['result-value']} */ ;
/** @type {__VLS_StyleScopedClasses['result-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['minor-copy']} */ ;
/** @type {__VLS_StyleScopedClasses['model-output-list']} */ ;
/** @type {__VLS_StyleScopedClasses['model-output-item']} */ ;
/** @type {__VLS_StyleScopedClasses['model-output-label']} */ ;
/** @type {__VLS_StyleScopedClasses['result-desc']} */ ;
/** @type {__VLS_StyleScopedClasses['model-output-value']} */ ;
/** @type {__VLS_StyleScopedClasses['section-grid']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['section-list']} */ ;
/** @type {__VLS_StyleScopedClasses['section-item']} */ ;
/** @type {__VLS_StyleScopedClasses['panel-card']} */ ;
/** @type {__VLS_StyleScopedClasses['card-header-inner']} */ ;
/** @type {__VLS_StyleScopedClasses['note-list']} */ ;
/** @type {__VLS_StyleScopedClasses['result-notes']} */ ;
/** @type {__VLS_StyleScopedClasses['note-item']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            schema: schema,
            result: result,
            loading: loading,
            form: form,
            handlePredict: handlePredict,
            resetToDefault: resetToDefault,
            toneClass: toneClass,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
