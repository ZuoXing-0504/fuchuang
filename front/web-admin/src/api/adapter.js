const profileCategoryMap = {
    '0': '自律待提升型',
    '1': '波动预警型',
    '2': '潜力发展型',
    '3': '全面领先型'
};
export function unwrapPayload(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }
    if (payload && typeof payload === 'object') {
        const record = payload;
        for (const key of ['data', 'result', 'records', 'list']) {
            if (key in record) {
                return record[key];
            }
        }
    }
    return payload;
}
export function adaptStudentMetricsList(payload) {
    const raw = unwrapPayload(payload);
    const rows = Array.isArray(raw)
        ? raw
        : unwrapPayload(raw?.list) ?? [];
    return rows.map(adaptStudentMetrics);
}
export function adaptDashboardOverview(payload) {
    const raw = unwrapPayload(payload) ?? {};
    if ('kpis' in raw) {
        return raw;
    }
    return {
        kpis: raw.kpis ?? [],
        riskDistribution: normalizeChartArray(raw.riskDistribution),
        performanceDistribution: normalizeChartArray(raw.performanceDistribution),
        profileDistribution: normalizeChartArray(raw.profileDistribution),
        topRisks: adaptStudentMetricsList(raw.topRisks ?? raw.topRiskStudents ?? [])
    };
}
export function adaptClusterInsights(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            category: getString(row, ['category', '画像类别', 'cluster', '学生画像类别'], '潜力发展型'),
            title: getString(row, ['title', '群体标题'], '群体画像'),
            description: getString(row, ['description', '群体说明'], ''),
            radar: normalizeRadarArray(row.radar),
            averages: normalizeNamedValueArray(row.averages),
            students: adaptStudentMetricsList(row.students ?? row.studentList ?? [])
        };
    });
}
export function adaptStudentDetail(payload) {
    const row = unwrapPayload(payload) ?? {};
    const base = adaptStudentMetrics(row);
    return {
        ...base,
        radar: normalizeRadarArray(row.radar),
        factors: normalizeFactors(row.factors ?? row.featureImportance ?? row.keyFactors),
        compareMetrics: normalizeCompareMetrics(row.compareMetrics),
        interventions: normalizeStringArray(row.interventions ?? row.suggestions ?? row.recommendations),
        scorePredictionLabel: getString(row, ['scorePredictionLabel'], ''),
        reportTitle: getString(row, ['reportTitle', 'title'], '个性化成长评价报告'),
        reportSummary: getString(row, ['reportSummary', 'summary', '建议摘要'], ''),
        reportSections: normalizeStringArray(row.reportSections ?? row.sections),
        reportEvaluations: normalizeStringArray(row.reportEvaluations ?? row.evaluations),
        behaviorDetails: normalizeDetailSnapshotItems(row.behaviorDetails),
        academicDetails: normalizeDetailSnapshotItems(row.academicDetails),
        dimensionBasis: normalizeDimensionBasis(row.dimensionBasis),
        predictionSteps: normalizePredictionSteps(row.predictionSteps),
        predictionEvidence: normalizePredictionEvidence(row.predictionEvidence),
        featureTables: normalizeFeatureTables(row.featureTables),
        featureFormulas: normalizeFeatureFormulas(row.featureFormulas)
    };
}
export function adaptModelSummary(payload) {
    const raw = unwrapPayload(payload) ?? {};
    return {
        metrics: adaptModelMetrics(raw.metrics ?? raw.metricList ?? raw.models ?? []),
        importance: adaptFeatureImportance(raw.importance ?? raw.featureImportance ?? raw.features ?? []),
        description: normalizeStringArray(raw.description ?? raw.descriptions ?? raw.notes)
    };
}
export function adaptBatchTaskList(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            taskId: getString(row, ['taskId', 'task_id', 'id'], `TASK-${Date.now()}`),
            filename: getString(row, ['filename', 'fileName', '文件名'], 'unknown.csv'),
            status: normalizeTaskStatus(getString(row, ['status', '任务状态'], '处理中')),
            createdAt: getString(row, ['createdAt', 'created_at', '创建时间'], ''),
            records: getNumber(row, ['records', 'recordCount', '记录数'], 0)
        };
    });
}
export function adaptBatchTask(payload) {
    return adaptBatchTaskList([unwrapPayload(payload)])[0];
}
export function adaptAnalysisResults(payload) {
    const raw = unwrapPayload(payload) ?? {};
    const summaryRows = unwrapPayload(raw.summaryCards) ?? [];
    const chartRows = unwrapPayload(raw.charts) ?? [];
    return {
        summaryCards: summaryRows.map((item) => {
            const row = item;
            return {
                label: getString(row, ['label'], '指标'),
                value: getNumber(row, ['value'], 0),
                tone: getString(row, ['tone'], 'primary')
            };
        }),
        chartStatus: normalizeChartStatus(raw.chartStatus),
        charts: chartRows.map((item) => {
            const row = item;
            return {
                id: getString(row, ['id'], ''),
                title: getString(row, ['title'], '分析成果'),
                file: getString(row, ['file'], ''),
                url: getString(row, ['url'], ''),
                category: getString(row, ['category'], '分析'),
                description: getString(row, ['description'], ''),
                insight: getString(row, ['insight'], '')
            };
        }),
        storyline: normalizeStringArray(raw.storyline)
    };
}
function normalizeChartStatus(payload) {
    const row = unwrapPayload(payload) ?? {};
    return {
        ready: Boolean(row.ready),
        message: getString(row, ['message'], ''),
        missingCount: getNumber(row, ['missingCount'], 0),
        availableCount: getNumber(row, ['availableCount'], 0),
        installHint: getString(row, ['installHint'], '')
    };
}
function normalizeAnalysisResultCharts(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            id: getString(row, ['id'], ''),
            title: getString(row, ['title'], '分析成果'),
            file: getString(row, ['file'], ''),
            url: getString(row, ['url'], ''),
            category: getString(row, ['category'], '分析'),
            description: getString(row, ['description'], ''),
            insight: getString(row, ['insight'], '')
        };
    });
}
function normalizeCompareMetrics(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            label: getString(row, ['label'], '指标'),
            selfScore: getNumber(row, ['selfScore', 'self'], 0),
            overallScore: getNumber(row, ['overallScore', 'overall'], 0),
            clusterScore: getNumber(row, ['clusterScore', 'cluster'], 0)
        };
    });
}
function adaptStudentMetrics(item) {
    const row = item;
    const profileCode = getString(row, ['profileCategory', '学生画像类别', 'profile_category'], '');
    const riskLabel = getNumber(row, ['riskLabel', '风险标签', 'risk_label'], 0);
    const performance = getString(row, ['performanceLevel', '表现档次', 'performance_level'], '中表现');
    return {
        studentId: getString(row, ['studentId', 'student_id', '学号'], 'unknown'),
        name: getString(row, ['name', 'studentName', '姓名'], '未知学生'),
        gender: getString(row, ['gender', '性别'], '未知'),
        college: getString(row, ['college', '学院'], '未知学院'),
        major: getString(row, ['major', '专业'], '未知专业'),
        grade: getString(row, ['grade', '年级'], '未知年级'),
        className: getString(row, ['className', 'class_name', '班级'], '未知班级'),
        riskLabel,
        riskLevel: normalizeRiskLevel(getString(row, ['riskLevel', '风险等级'], ''), riskLabel),
        performanceLevel: performance,
        profileCategory: profileCategoryMap[profileCode] ?? getString(row, ['profileCategoryName', '画像类别名称'], profileCode || '潜力发展型'),
        healthLevel: getString(row, ['healthLevel', '健康档次', 'health_level'], '中'),
        scholarshipProbability: normalizeProbability(getNumber(row, ['scholarshipProbability', '奖学金概率', 'scholarship_probability'], 0)),
        scorePrediction: getNumber(row, ['scorePrediction', '预测成绩', 'score_prediction'], 0),
        registrationStatus: getString(row, ['registrationStatus'], '未注册'),
        secondaryTags: normalizeStringArray(row.secondaryTags ?? row.behaviorTags ?? row.tags),
        registeredUsername: getString(row, ['registeredUsername', 'username'], '')
    };
}
function adaptModelMetrics(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            model: getString(row, ['model', '模型'], 'unknown'),
            accuracy: getNumber(row, ['accuracy'], 0),
            precision: getNumber(row, ['precision'], 0),
            recall: getNumber(row, ['recall'], 0),
            f1: getNumber(row, ['f1'], 0),
            auc: getNumber(row, ['auc'], 0),
            cvAuc: getNumber(row, ['cvAuc', 'cv_auc'], 0)
        };
    });
}
function adaptFeatureImportance(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            feature: getString(row, ['feature', '特征', 'name'], 'unknown'),
            importance: getNumber(row, ['importance', '重要性', 'value'], 0)
        };
    });
}
function normalizeChartArray(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            name: getString(row, ['name', 'label', '类别'], '未知'),
            value: getNumber(row, ['value', 'count', '数量'], 0)
        };
    });
}
function normalizeNamedValueArray(payload, nameKey = 'name') {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            name: getString(row, [nameKey, 'indicator', 'label', 'name'], '指标'),
            value: getNumber(row, ['value', 'score', 'importance'], 0)
        };
    });
}
function normalizeRadarArray(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            indicator: getString(row, ['indicator', 'name', 'label'], '指标'),
            value: getNumber(row, ['value', 'score', 'importance'], 0)
        };
    });
}
function normalizeFactors(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            feature: getString(row, ['feature', '特征', 'name'], '未知因素'),
            impact: getNumber(row, ['impact', 'importance', 'value'], 0),
            description: getString(row, ['description', 'desc', '说明'], '')
        };
    });
}
function normalizeDetailSnapshotItems(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            label: getString(row, ['label', 'name'], '明细'),
            value: getString(row, ['value'], ''),
            note: getString(row, ['note', 'description'], '')
        };
    }).filter((item) => item.value);
}
function normalizeDimensionBasis(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            dimension: getString(row, ['dimension'], '维度'),
            selfScore: getNumber(row, ['selfScore'], 0),
            overallScore: getNumber(row, ['overallScore'], 0),
            clusterScore: getNumber(row, ['clusterScore'], 0),
            judgement: getString(row, ['judgement'], ''),
            summary: getString(row, ['summary'], '')
        };
    });
}
function normalizePredictionSteps(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            title: getString(row, ['title'], '步骤'),
            summary: getString(row, ['summary'], ''),
            items: normalizeStringArray(row.items)
        };
    });
}
function normalizePredictionEvidence(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            label: getString(row, ['label'], '特征'),
            value: getString(row, ['value'], ''),
            effect: getString(row, ['effect'], ''),
            reason: getString(row, ['reason'], '')
        };
    });
}
function normalizeFeatureTables(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            title: getString(row, ['title'], '特征表'),
            description: getString(row, ['description'], ''),
            rows: normalizeFeatureTableRows(row.rows)
        };
    });
}
function normalizeFeatureTableRows(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            label: getString(row, ['label'], '特征'),
            key: getString(row, ['key'], ''),
            value: getString(row, ['value'], '未提供'),
            unit: getString(row, ['unit'], ''),
            source: getString(row, ['source'], ''),
            usedInPrediction: Boolean(row.usedInPrediction),
            description: getString(row, ['description'], '')
        };
    });
}
function normalizeFeatureFormulas(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            feature: getString(row, ['feature'], '特征'),
            formula: getString(row, ['formula'], ''),
            explanation: getString(row, ['explanation'], ''),
            source: getString(row, ['source'], '')
        };
    });
}
function normalizeStringArray(payload) {
    const rows = unwrapPayload(payload);
    if (!Array.isArray(rows)) {
        return [];
    }
    return rows.map((item) => String(item));
}
function normalizeRiskLevel(source, riskLabel) {
    if (source === '高风险' || source === '中风险' || source === '低风险') {
        return source;
    }
    return riskLabel === 1 ? '高风险' : '低风险';
}
function normalizeTaskStatus(status) {
    if (status.includes('完成')) {
        return '已完成';
    }
    if (status.includes('失败')) {
        return '失败';
    }
    return '处理中';
}
function normalizeProbability(value) {
    if (value > 1) {
        return Number((value / 100).toFixed(4));
    }
    return value;
}
function getString(row, keys, fallback = '') {
    for (const key of keys) {
        const value = row[key];
        if (value !== undefined && value !== null) {
            const text = String(value).trim();
            if (text !== '' && !['nan', 'null', 'none', 'undefined'].includes(text.toLowerCase())) {
                return text;
            }
        }
    }
    return fallback;
}
function getNumber(row, keys, fallback = 0) {
    for (const key of keys) {
        const value = row[key];
        if (value !== undefined && value !== null && `${value}` !== '') {
            const parsed = Number(value);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
    }
    return fallback;
}
