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
export function adaptStudentHome(payload) {
    const row = unwrapPayload(payload) ?? {};
    const profileCode = getString(row, ['profileCategory', '学生画像类别'], '');
    return {
        studentId: getString(row, ['studentId', 'student_id', '学号'], ''),
        studentName: getString(row, ['studentName', 'name', '姓名'], ''),
        profileCategory: profileCategoryMap[profileCode] ?? getString(row, ['profileCategoryName', '画像类型'], profileCode || '潜力发展型'),
        profileSubtype: getString(row, ['profileSubtype'], ''),
        riskLevel: getString(row, ['riskLevel', '风险等级'], getNumber(row, ['riskLabel', '风险标签'], 0) === 1 ? '高风险' : '低风险'),
        performanceLevel: getString(row, ['performanceLevel', '表现档次'], '中表现'),
        scholarshipProbability: normalizeProbability(getNumber(row, ['scholarshipProbability', '奖学金概率'], 0)),
        healthLevel: getString(row, ['healthLevel', '健康档次'], '中'),
        trendSummary: normalizeSummary(row.trendSummary ?? row.summaryCards ?? row.cards),
        insights: normalizeStrings(row.insights),
        chartStatus: normalizeChartStatus(row.chartStatus),
        analysisCharts: normalizeChartCards(row.analysisCharts ?? row.charts)
    };
}
export function adaptStudentProfile(payload) {
    const row = unwrapPayload(payload) ?? {};
    const profileCode = getString(row, ['profileCategory', '学生画像类别'], '');
    return {
        studentId: getString(row, ['studentId', 'student_id', '学号'], ''),
        profileCategory: profileCategoryMap[profileCode] ?? getString(row, ['profileCategoryName', '画像类型'], profileCode || '潜力发展型'),
        profileSubtype: getString(row, ['profileSubtype'], ''),
        profileExplanation: getString(row, ['profileExplanation'], ''),
        profileHighlights: normalizeStrings(row.profileHighlights),
        description: getString(row, ['description', '群体说明', '画像说明'], ''),
        radar: normalizeRadar(row.radar ?? row.radarData),
        strengths: normalizeStrings(row.strengths ?? row.advantages ?? row.优势),
        weaknesses: normalizeStrings(row.weaknesses ?? row.disadvantages ?? row.短板),
        scholarshipProbability: normalizeProbability(getNumber(row, ['scholarshipProbability', '奖学金概率'], 0)),
        riskLevel: getString(row, ['riskLevel', '风险等级'], '中风险'),
        healthLevel: getString(row, ['healthLevel', '健康档次'], '中')
    };
}
export function adaptStudentReport(payload) {
    const row = unwrapPayload(payload) ?? {};
    return {
        studentId: getString(row, ['studentId', 'student_id', '学号'], ''),
        title: getString(row, ['title', '标题'], '个性化成长评价报告'),
        summary: getString(row, ['summary', '报告摘要'], ''),
        reportMeta: normalizeReportMeta(row.reportMeta),
        sections: normalizeStrings(row.sections ?? row.paragraphs ?? row.suggestions),
        evaluations: normalizeStrings(row.evaluations ?? row.explanations),
        suggestions: normalizeStrings(row.suggestions ?? row.recommendations),
        profileExplanation: getString(row, ['profileExplanation'], ''),
        profileHighlights: normalizeStrings(row.profileHighlights),
        behaviorDetails: normalizeDetailItems(row.behaviorDetails),
        academicDetails: normalizeDetailItems(row.academicDetails),
        dimensionBasis: normalizeDimensionBasis(row.dimensionBasis),
        predictionSteps: normalizePredictionSteps(row.predictionSteps),
        predictionEvidence: normalizePredictionEvidence(row.predictionEvidence),
        featureTables: normalizeFeatureTables(row.featureTables),
        featureFormulas: normalizeFeatureFormulas(row.featureFormulas),
        scoreCards: normalizeScoreCards(row.scoreCards ?? row.cards)
    };
}
export function adaptRecommendationGroups(payload) {
    const row = unwrapPayload(payload) ?? {};
    return {
        studentId: getString(row, ['studentId', 'student_id', '学号'], ''),
        recommendations: normalizeRecommendationItems(row.recommendations ?? row.items ?? row.list)
    };
}
export function adaptStudentCompare(payload) {
    const row = unwrapPayload(payload) ?? {};
    return {
        studentId: getString(row, ['studentId', 'student_id'], ''),
        studentName: getString(row, ['studentName', 'name'], ''),
        clusterLabel: getString(row, ['clusterLabel'], '群体'),
        overallLabel: getString(row, ['overallLabel'], '全样本均值'),
        compareMetrics: normalizeCompareMetrics(row.compareMetrics),
        rankingCards: normalizeRankingCards(row.rankingCards),
        clusterTraits: normalizeStrings(row.clusterTraits),
        explanations: normalizeStrings(row.explanations),
    };
}
export function adaptStudentPredictionSchema(payload) {
    const row = unwrapPayload(payload) ?? {};
    return {
        studentId: getString(row, ['studentId', 'student_id'], ''),
        groups: normalizePredictionGroups(row.groups),
        notes: normalizeStrings(row.notes)
    };
}
export function adaptStudentPredictionResult(payload) {
    const row = unwrapPayload(payload) ?? {};
    return {
        studentId: getString(row, ['studentId', 'student_id'], ''),
        cards: normalizePredictionCards(row.cards),
        sections: normalizePredictionSections(row.sections),
        notes: normalizeStrings(row.notes)
    };
}
function normalizeSummary(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            label: getString(row, ['label', '名称', 'name'], '摘要'),
            value: getString(row, ['value', '值', 'text'], '')
        };
    });
}
function normalizeRadar(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            indicator: getString(row, ['indicator', 'name', 'label'], '指标'),
            value: getNumber(row, ['value', 'score'], 0)
        };
    });
}
function normalizeChartCards(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            title: getString(row, ['title', 'name', 'label'], '分析图'),
            url: getString(row, ['url', 'src'], ''),
            category: getString(row, ['category'], '分析'),
            description: getString(row, ['description'], ''),
            insight: getString(row, ['insight'], '')
        };
    });
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
function normalizeScoreCards(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            label: getString(row, ['label', 'name'], '指标'),
            score: getNumber(row, ['score', 'value'], 0)
        };
    });
}
function normalizeReportMeta(payload) {
    const row = unwrapPayload(payload) ?? {};
    const studentName = getString(row, ['studentName', 'name'], '');
    if (!studentName) {
        return undefined;
    }
    return {
        studentName,
        college: getString(row, ['college'], ''),
        major: getString(row, ['major'], ''),
        profileCategory: getString(row, ['profileCategory'], ''),
        profileSubtype: getString(row, ['profileSubtype'], ''),
        riskLevel: getString(row, ['riskLevel'], ''),
        reportDate: getString(row, ['reportDate'], '')
    };
}
function normalizeDetailItems(payload) {
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
            items: normalizeStrings(row.items)
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
function normalizeRecommendationItems(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item, index) => {
        const row = item;
        return {
            id: getString(row, ['id'], `REC-${index + 1}`),
            category: getString(row, ['category', '分类', 'title'], '综合'),
            priority: getString(row, ['priority', 'level'], 'medium'),
            title: getString(row, ['title', 'name'], '成长建议'),
            description: getString(row, ['description', 'desc', 'summary'], '')
        };
    });
}
function normalizePredictionGroups(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            title: getString(row, ['title'], '预测字段'),
            description: getString(row, ['description'], ''),
            fields: normalizePredictionFields(row.fields)
        };
    });
}
function normalizePredictionFields(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            key: getString(row, ['key'], ''),
            label: getString(row, ['label'], '字段'),
            type: getString(row, ['type'], 'text'),
            unit: getString(row, ['unit'], ''),
            defaultValue: row.defaultValue,
            placeholder: getString(row, ['placeholder'], '')
        };
    });
}
function normalizePredictionCards(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            label: getString(row, ['label'], '结果'),
            value: getString(row, ['value'], ''),
            description: getString(row, ['description'], ''),
            tone: getString(row, ['tone'], 'primary')
        };
    });
}
function normalizePredictionSections(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            title: getString(row, ['title'], '分组'),
            items: normalizePredictionSectionItems(row.items)
        };
    });
}
function normalizePredictionSectionItems(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            label: getString(row, ['label'], '字段'),
            value: getString(row, ['value'], '')
        };
    });
}
function normalizeCompareMetrics(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            label: getString(row, ['label', 'name'], '指标'),
            selfScore: getNumber(row, ['selfScore', 'self'], 0),
            overallScore: getNumber(row, ['overallScore', 'overall'], 0),
            clusterScore: getNumber(row, ['clusterScore', 'cluster'], 0)
        };
    });
}
function normalizeRankingCards(payload) {
    const rows = unwrapPayload(payload) ?? [];
    return rows.map((item) => {
        const row = item;
        return {
            label: getString(row, ['label', 'name'], '排名'),
            value: getNumber(row, ['value', 'score'], 0),
            suffix: getString(row, ['suffix'], '')
        };
    });
}
function normalizeStrings(payload) {
    const rows = unwrapPayload(payload);
    if (!Array.isArray(rows)) {
        return [];
    }
    return rows.map((item) => String(item));
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
