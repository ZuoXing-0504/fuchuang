function unwrapPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && typeof payload === 'object') {
    for (const key of ['data', 'result', 'records', 'list']) {
      if (key in payload) {
        return payload[key];
      }
    }
  }
  return payload;
}

function normalizeString(value, fallback = '') {
  if (value === null || value === undefined) {
    return fallback;
  }
  const text = String(value).trim();
  if (!text || ['nan', 'null', 'none', 'undefined'].includes(text.toLowerCase())) {
    return fallback;
  }
  return text;
}

function normalizeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeProbability(value) {
  const parsed = normalizeNumber(value, 0);
  return parsed > 1 ? Number((parsed / 100).toFixed(4)) : parsed;
}

function asObject(value) {
  return value && typeof value === 'object' ? value : {};
}

function firstDefined() {
  for (let index = 0; index < arguments.length; index += 1) {
    const value = arguments[index];
    if (value !== null && value !== undefined) {
      return value;
    }
  }
  return undefined;
}

function normalizeStringArray(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => normalizeString(item)).filter(Boolean);
}

function normalizeSummary(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      label: normalizeString(row.label || row.name, '摘要'),
      value: normalizeString(row.value || row.text, '')
    };
  });
}

function normalizeChartStatus(payload) {
  const row = unwrapPayload(payload) || {};
  return {
    ready: Boolean(row.ready),
    message: normalizeString(row.message),
    missingCount: normalizeNumber(row.missingCount, 0),
    availableCount: normalizeNumber(row.availableCount, 0),
    installHint: normalizeString(row.installHint)
  };
}

function normalizeChartCards(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      title: normalizeString(row.title || row.name, '分析图表'),
      url: normalizeString(row.url || row.src),
      category: normalizeString(row.category, '分析'),
      description: normalizeString(row.description),
      insight: normalizeString(row.insight)
    };
  });
}

function normalizeRadar(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      indicator: normalizeString(row.indicator || row.name || row.label, '指标'),
      value: normalizeNumber(firstDefined(row.value, row.score), 0)
    };
  });
}

function normalizeDetailItems(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows
    .map((item) => {
      const row = asObject(item);
      return {
        label: normalizeString(row.label || row.name, '明细'),
        value: normalizeString(row.value, ''),
        note: normalizeString(row.note || row.description)
      };
    })
    .filter((item) => item.value);
}

function normalizeDimensionBasis(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      dimension: normalizeString(row.dimension, '维度'),
      selfScore: normalizeNumber(row.selfScore, 0),
      overallScore: normalizeNumber(row.overallScore, 0),
      clusterScore: normalizeNumber(row.clusterScore, 0),
      judgement: normalizeString(row.judgement),
      summary: normalizeString(row.summary)
    };
  });
}

function normalizePredictionEvidence(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      label: normalizeString(row.label, '特征'),
      value: normalizeString(row.value),
      effect: normalizeString(row.effect),
      reason: normalizeString(row.reason)
    };
  });
}

function normalizePredictionSteps(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      title: normalizeString(row.title, '步骤'),
      summary: normalizeString(row.summary),
      items: normalizeStringArray(row.items)
    };
  });
}

function normalizeRecommendationItems(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item, index) => {
    const row = asObject(item);
    return {
      id: normalizeString(row.id, `REC-${index + 1}`),
      category: normalizeString(row.category, '综合'),
      priority: normalizeString(row.priority || row.level, 'medium'),
      title: normalizeString(row.title || row.name, '成长建议'),
      description: normalizeString(row.description || row.summary),
      reason: normalizeString(row.reason)
    };
  });
}

function normalizeScoreCards(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      label: normalizeString(row.label || row.name, '指标'),
      score: normalizeNumber(firstDefined(row.score, row.value), 0)
    };
  });
}

function normalizeTrendList(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      month: normalizeString(row.month, ''),
      value: normalizeNumber(row.value, 0)
    };
  });
}

function normalizeStudentMetrics(row = {}) {
  return {
    studentId: normalizeString(row.studentId || row.student_id, 'unknown'),
    name: normalizeString(row.name || row.studentName, '未知学生'),
    college: normalizeString(row.college, '未知学院'),
    major: normalizeString(row.major, '未知专业'),
    riskLevel: normalizeString(row.riskLevel, row.riskLabel === 1 ? '高风险' : '低风险'),
    performanceLevel: normalizeString(row.performanceLevel, '中表现'),
    profileCategory: normalizeString(row.profileCategory || row.profileCategoryName, '发展过渡型'),
    profileSubtype: normalizeString(row.profileSubtype),
    secondaryTags: normalizeStringArray(row.secondaryTags || row.behaviorTags || row.tags),
    healthLevel: normalizeString(row.healthLevel, '中'),
    scholarshipProbability: normalizeProbability(row.scholarshipProbability),
    scorePrediction: normalizeNumber(row.scorePrediction, 0),
    registrationStatus: normalizeString(row.registrationStatus, '未注册'),
    registeredUsername: normalizeString(row.registeredUsername || row.username)
  };
}

function adaptStudentHome(payload) {
  const row = unwrapPayload(payload) || {};
  return {
    studentId: normalizeString(row.studentId || row.student_id),
    studentName: normalizeString(row.studentName || row.name),
    profileCategory: normalizeString(row.profileCategory || row.profileCategoryName, '发展过渡型'),
    profileSubtype: normalizeString(row.profileSubtype),
    secondaryTags: normalizeStringArray(row.secondaryTags || row.behaviorTags || row.tags),
    riskLevel: normalizeString(row.riskLevel, '中风险'),
    performanceLevel: normalizeString(row.performanceLevel, '中表现'),
    scholarshipProbability: normalizeProbability(row.scholarshipProbability),
    healthLevel: normalizeString(row.healthLevel, '中'),
    trendSummary: normalizeSummary(row.trendSummary || row.summaryCards || row.cards),
    insights: normalizeStringArray(row.insights),
    chartStatus: normalizeChartStatus(row.chartStatus),
    analysisCharts: normalizeChartCards(row.analysisCharts || row.charts)
  };
}

function adaptStudentProfile(payload) {
  const row = unwrapPayload(payload) || {};
  return {
    studentId: normalizeString(row.studentId || row.student_id),
    profileCategory: normalizeString(row.profileCategory || row.profileCategoryName, '发展过渡型'),
    profileSubtype: normalizeString(row.profileSubtype),
    profileExplanation: normalizeString(row.profileExplanation || row.description),
    profileHighlights: normalizeStringArray(row.profileHighlights),
    description: normalizeString(row.description),
    radar: normalizeRadar(row.radar || row.radarData),
    strengths: normalizeStringArray(row.strengths || row.advantages),
    weaknesses: normalizeStringArray(row.weaknesses || row.disadvantages),
    scholarshipProbability: normalizeProbability(row.scholarshipProbability),
    riskLevel: normalizeString(row.riskLevel, '中风险'),
    healthLevel: normalizeString(row.healthLevel, '中'),
    riskDrivers: normalizeRecommendationItems(
      (row.riskDrivers || []).map((item, index) => {
        const driver = asObject(item);
        return {
          id: driver.id || `DRV-${index + 1}`,
          category: driver.category,
          priority: Number(driver.impact) >= 0.9 ? 'high' : 'medium',
          title: driver.feature,
          description: driver.action,
          reason: driver.description
        };
      })
    ),
    dataQualityAlerts: unwrapPayload(row.dataQualityAlerts) || []
  };
}

function adaptStudentTrends(payload) {
  const row = unwrapPayload(payload) || {};
  return {
    studyTrend: normalizeTrendList(row.studyTrend),
    riskTrend: normalizeTrendList(row.riskTrend),
    healthTrend: normalizeTrendList(row.healthTrend),
    scoreTrend: normalizeTrendList(row.scoreTrend)
  };
}

function adaptStudentReport(payload) {
  const row = unwrapPayload(payload) || {};
  return {
    studentId: normalizeString(row.studentId || row.student_id),
    title: normalizeString(row.title, '个性化成长评估报告'),
    summary: normalizeString(row.summary),
    reportMeta: row.reportMeta || null,
    sections: normalizeStringArray(row.sections || row.paragraphs),
    evaluations: normalizeStringArray(row.evaluations),
    suggestions: normalizeStringArray(row.suggestions || row.recommendations),
    profileExplanation: normalizeString(row.profileExplanation),
    profileHighlights: normalizeStringArray(row.profileHighlights),
    behaviorDetails: normalizeDetailItems(row.behaviorDetails),
    academicDetails: normalizeDetailItems(row.academicDetails),
    dimensionBasis: normalizeDimensionBasis(row.dimensionBasis),
    predictionSteps: normalizePredictionSteps(row.predictionSteps),
    predictionEvidence: normalizePredictionEvidence(row.predictionEvidence),
    featureTables: unwrapPayload(row.featureTables) || [],
    featureFormulas: unwrapPayload(row.featureFormulas) || [],
    scoreCards: normalizeScoreCards(row.scoreCards || row.cards)
  };
}

function adaptStudentCompare(payload) {
  const row = unwrapPayload(payload) || {};
  return {
    studentId: normalizeString(row.studentId || row.student_id),
    studentName: normalizeString(row.studentName || row.name),
    clusterLabel: normalizeString(row.clusterLabel, '群体'),
    overallLabel: normalizeString(row.overallLabel, '全样本均值'),
    compareMetrics: unwrapPayload(row.compareMetrics) || [],
    rankingCards: unwrapPayload(row.rankingCards) || [],
    clusterTraits: normalizeStringArray(row.clusterTraits),
    explanations: normalizeStringArray(row.explanations)
  };
}

function adaptCurrentUser(payload) {
  const row = unwrapPayload(payload) || {};
  return {
    id: normalizeString(row.id || row.userId),
    userId: normalizeNumber(row.userId || row.id, 0),
    username: normalizeString(row.username),
    studentId: normalizeString(row.studentId || row.student_id),
    name: normalizeString(row.name || row.username, '当前用户'),
    role: normalizeString(row.role, 'student'),
    token: normalizeString(row.token),
    tokenExpiresAt: normalizeString(row.tokenExpiresAt),
    permissions: Array.isArray(row.permissions) ? row.permissions.map((item) => String(item)) : []
  };
}

function adaptDashboardOverview(payload) {
  const row = unwrapPayload(payload) || {};
  return {
    kpis: Array.isArray(row.kpis) ? row.kpis : [],
    riskDistribution: Array.isArray(row.riskDistribution) ? row.riskDistribution : [],
    performanceDistribution: Array.isArray(row.performanceDistribution) ? row.performanceDistribution : [],
    profileDistribution: Array.isArray(row.profileDistribution) ? row.profileDistribution : [],
    topRisks: Array.isArray(row.topRisks) ? row.topRisks.map(normalizeStudentMetrics) : [],
    dataQualitySummary: row.dataQualitySummary || {}
  };
}

function adaptWarnings(payload) {
  const row = unwrapPayload(payload) || {};
  const list = Array.isArray(row.list) ? row.list : (Array.isArray(row) ? row : []);
  return {
    list: list.map(normalizeStudentMetrics),
    page: normalizeNumber(row.page, 1),
    pageSize: normalizeNumber(row.page_size || row.pageSize, list.length),
    total: normalizeNumber(row.total, list.length)
  };
}

function adaptStudentDetail(payload) {
  const row = unwrapPayload(payload) || {};
  return {
    ...normalizeStudentMetrics(row),
    reportSummary: normalizeString(row.reportSummary || row.summary),
    profileExplanation: normalizeString(row.profileExplanation),
    profileHighlights: normalizeStringArray(row.profileHighlights),
    interventions: normalizeStringArray(row.interventions || row.suggestions || row.recommendations),
    factors: Array.isArray(row.factors) ? row.factors : [],
    radar: normalizeRadar(row.radar),
    compareMetrics: unwrapPayload(row.compareMetrics) || [],
    behaviorDetails: normalizeDetailItems(row.behaviorDetails),
    academicDetails: normalizeDetailItems(row.academicDetails),
    dimensionBasis: normalizeDimensionBasis(row.dimensionBasis),
    predictionSteps: normalizePredictionSteps(row.predictionSteps),
    predictionEvidence: normalizePredictionEvidence(row.predictionEvidence),
    featureTables: unwrapPayload(row.featureTables) || [],
    featureFormulas: unwrapPayload(row.featureFormulas) || [],
    reportTitle: normalizeString(row.reportTitle || row.title, '个性化成长评估报告'),
    reportSections: normalizeStringArray(row.reportSections || row.sections),
    reportEvaluations: normalizeStringArray(row.reportEvaluations || row.evaluations)
  };
}

export {
  adaptCurrentUser,
  adaptDashboardOverview,
  adaptStudentCompare,
  adaptStudentDetail,
  adaptStudentHome,
  adaptStudentProfile,
  adaptStudentReport,
  adaptStudentTrends,
  adaptWarnings,
  normalizeProbability,
  normalizeString,
  unwrapPayload
};
