const profileCategoryMap = {
    '0': '高投入稳健型',
    '1': '低投入风险型',
    '2': '夜间波动型',
    '3': '发展过渡型'
};
export function unwrapPayload(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }
    if (payload && typeof payload === 'object') {
        const record = payload;
        for (const key of ['data', 'result', 'records']) {
            if (key in record) {
                return record[key];
            }
        }
    }
    return payload;
}
export function adaptStudentMetricsList(payload) {
    const raw = unwrapPayload(payload);
    let rows = [];
    if (Array.isArray(raw)) {
        rows = raw;
    }
    else if (raw && typeof raw === 'object') {
        const record = raw;
        rows = Array.isArray(record.list) ? record.list : [];
    }
    return rows.map(adaptStudentMetrics);
}
export function adaptDashboardOverview(payload) {
    const raw = unwrapPayload(payload) ?? {};
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
            category: getString(row, ['category', 'clusterLabel'], '群体画像'),
            title: getString(row, ['title'], '群体画像'),
            description: getString(row, ['description'], ''),
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
        profileExplanation: getString(row, ['profileExplanation'], ''),
        profileHighlights: normalizeStringArray(row.profileHighlights),
        compareMetrics: normalizeCompareMetrics(row.compareMetrics),
        interventions: normalizeStringArray(row.interventions ?? row.suggestions ?? row.recommendations),
        scorePredictionLabel: getString(row, ['scorePredictionLabel'], ''),
        reportTitle: getString(row, ['reportTitle', 'title'], '个性化成长评价报告'),
        reportSummary: getString(row, ['reportSummary', 'summary'], ''),
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
        description: normalizeStringArray(raw.description ?? raw.descriptions ?? raw.notes),
        overviewCards: normalizeOverviewCards(raw.overviewCards ?? raw.kpis ?? raw.cards),
        tasks: normalizeModelTasks(raw.tasks)
    };
}
export function adaptBatchTaskList(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            taskId: getString(row, ['taskId', 'task_id', 'id'], `TASK-${Date.now()}`),
            filename: getString(row, ['filename', 'fileName'], 'unknown.csv'),
            status: normalizeTaskStatus(getString(row, ['status'], '处理中')),
            createdAt: getString(row, ['createdAt', 'created_at'], ''),
            records: getNumber(row, ['records', 'recordCount'], 0)
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
    const profileCode = getString(row, ['profileCategory', 'profile_category'], '');
    const riskLabel = getNumber(row, ['riskLabel', 'risk_label'], 0);
    return {
        studentId: getString(row, ['studentId', 'student_id'], 'unknown'),
        name: getString(row, ['name', 'studentName'], '未知学生'),
        gender: getString(row, ['gender'], '未知'),
        college: getString(row, ['college'], '未知学院'),
        major: getString(row, ['major'], '未知专业'),
        grade: getString(row, ['grade'], ''),
        className: getString(row, ['className', 'class_name'], ''),
        riskLabel,
        riskLevel: normalizeRiskLevel(getString(row, ['riskLevel'], ''), riskLabel),
        performanceLevel: getString(row, ['performanceLevel', 'performance_level'], '中表现'),
        profileCategory: profileCategoryMap[profileCode] ?? getString(row, ['profileCategoryName'], profileCode || '发展过渡型'),
        profileSubtype: getString(row, ['profileSubtype'], ''),
        healthLevel: getString(row, ['healthLevel', 'health_level'], '中'),
        scholarshipProbability: normalizeProbability(getNumber(row, ['scholarshipProbability', 'scholarship_probability'], 0)),
        scorePrediction: getNumber(row, ['scorePrediction', 'score_prediction'], 0),
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
            model: getString(row, ['model'], 'unknown'),
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
            feature: getString(row, ['feature', 'name'], 'unknown'),
            importance: getNumber(row, ['importance', 'value'], 0)
        };
    });
}
function normalizeOverviewCards(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            label: getString(row, ['label'], '指标'),
            value: getString(row, ['value'], ''),
            tone: getString(row, ['tone'], 'primary'),
            note: getString(row, ['note', 'description'], '')
        };
    });
}
function normalizeModelTasks(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            taskKey: getString(row, ['taskKey'], 'unknown'),
            taskName: getString(row, ['taskName'], '任务模型'),
            taskType: getString(row, ['taskType'], 'binary'),
            description: getString(row, ['description'], ''),
            bestModel: getString(row, ['bestModel'], '未提供'),
            primaryMetricKey: getString(row, ['primaryMetricKey'], 'score'),
            primaryMetricLabel: getString(row, ['primaryMetricLabel'], '主指标'),
            primaryMetricValue: getOptionalNumber(row, ['primaryMetricValue']),
            secondaryMetricKey: getString(row, ['secondaryMetricKey'], 'secondary'),
            secondaryMetricLabel: getString(row, ['secondaryMetricLabel'], '辅助指标'),
            secondaryMetricValue: getOptionalNumber(row, ['secondaryMetricValue']),
            rows: normalizeModelTaskRows(row.rows),
            importance: adaptFeatureImportance(row.importance),
            status: getString(row, ['status'], 'offline_evaluation'),
            statusLabel: getString(row, ['statusLabel'], ''),
            onlineAvailable: Boolean(row.onlineAvailable),
            source: getString(row, ['source'], '')
        };
    });
}
function normalizeModelTaskRows(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            model: getString(row, ['model'], 'unknown'),
            values: normalizeModelMetricValues(row.values)
        };
    });
}
function normalizeModelMetricValues(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            key: getString(row, ['key'], 'metric'),
            label: getString(row, ['label'], '指标'),
            value: getNumber(row, ['value'], 0)
        };
    });
}
function normalizeChartArray(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            name: getString(row, ['name', 'label'], '未知'),
            value: getNumber(row, ['value', 'count'], 0)
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
            feature: getString(row, ['feature', 'name'], '未知因素'),
            impact: getNumber(row, ['impact', 'importance', 'value'], 0),
            description: getString(row, ['description', 'desc'], '')
        };
    });
}
function normalizeDetailSnapshotItems(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            label: getString(row, ['label', 'name'], '明细'),
            value: getString(row, ['value'], '暂无原始记录'),
            note: getString(row, ['note', 'description'], '')
        };
    });
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
            value: getString(row, ['value'], '暂无原始记录'),
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
    return rows.map((item) => String(item)).filter(Boolean);
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
function getOptionalNumber(row, keys) {
    for (const key of keys) {
        const value = row[key];
        if (value !== undefined && value !== null && `${value}` !== '') {
            const parsed = Number(value);
            if (!Number.isNaN(parsed)) {
                return parsed;
            }
        }
    }
    return undefined;
}
