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

function asObject(value) {
  return value && typeof value === 'object' ? value : {};
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

function normalizeRegistrationStatus(status, registeredUsername = '') {
  const raw = normalizeString(status, '');
  const normalized = raw.replace(/\s+/g, '').toLowerCase();
  if (raw.includes('已注册') || normalized.includes('registered')) {
    return '已注册';
  }
  if (raw.includes('未注册') || normalized.includes('unregistered')) {
    return '未注册';
  }
  return registeredUsername ? '已注册' : '未注册';
}

function getString(row, keys, fallback = '') {
  for (const key of keys) {
    if (row && Object.prototype.hasOwnProperty.call(row, key)) {
      const value = normalizeString(row[key], '');
      if (value) {
        return value;
      }
    }
  }
  return fallback;
}

function getNumber(row, keys, fallback = 0) {
  for (const key of keys) {
    if (row && Object.prototype.hasOwnProperty.call(row, key)) {
      const value = normalizeNumber(row[key], Number.NaN);
      if (!Number.isNaN(value)) {
        return value;
      }
    }
  }
  return fallback;
}

function getOptionalNumber(row, keys) {
  for (const key of keys) {
    if (row && Object.prototype.hasOwnProperty.call(row, key)) {
      const value = normalizeNumber(row[key], Number.NaN);
      if (!Number.isNaN(value)) {
        return value;
      }
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

function normalizeNamedValues(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      name: getString(row, ['name', 'label', 'indicator'], '指标'),
      value: getNumber(row, ['value', 'score', 'count', 'importance'], 0)
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
      indicator: getString(row, ['indicator', 'label', 'name'], '指标'),
      value: getNumber(row, ['value', 'score'], 0)
    };
  });
}

function normalizeSummary(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      label: getString(row, ['label', 'name'], '摘要'),
      value: getString(row, ['value', 'text'], '')
    };
  });
}

function normalizeChartStatus(payload) {
  const row = asObject(unwrapPayload(payload));
  return {
    ready: Boolean(row.ready),
    message: getString(row, ['message'], ''),
    missingCount: getNumber(row, ['missingCount'], 0),
    availableCount: getNumber(row, ['availableCount'], 0),
    installHint: getString(row, ['installHint'], '')
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
      id: getString(row, ['id'], ''),
      title: getString(row, ['title', 'name'], '分析图'),
      file: getString(row, ['file'], ''),
      url: getString(row, ['url', 'src'], ''),
      category: getString(row, ['category'], '分析'),
      description: getString(row, ['description'], ''),
      insight: getString(row, ['insight'], '')
    };
  });
}

function normalizeDetailItems(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      label: getString(row, ['label', 'name'], '字段'),
      value: getString(row, ['value'], '暂无原始记录'),
      note: getString(row, ['note', 'description'], '')
    };
  });
}

function normalizeFactors(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      feature: getString(row, ['feature', 'name'], '关键特征'),
      impact: getNumber(row, ['impact', 'importance', 'value'], 0),
      description: getString(row, ['description', 'summary'], '')
    };
  });
}

function normalizeDimensionBasis(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
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
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      title: getString(row, ['title'], '步骤'),
      summary: getString(row, ['summary'], ''),
      items: normalizeStringArray(row.items)
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
      label: getString(row, ['label'], '特征'),
      value: getString(row, ['value'], ''),
      effect: getString(row, ['effect'], ''),
      reason: getString(row, ['reason'], '')
    };
  });
}

function normalizeFeatureTableRows(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
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

function normalizeFeatureTables(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      title: getString(row, ['title'], '特征表'),
      description: getString(row, ['description'], ''),
      rows: normalizeFeatureTableRows(row.rows)
    };
  });
}

function normalizeFeatureFormulas(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      feature: getString(row, ['feature'], '特征'),
      formula: getString(row, ['formula'], ''),
      explanation: getString(row, ['explanation'], ''),
      source: getString(row, ['source'], '')
    };
  });
}

function normalizeCompareMetrics(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      label: getString(row, ['label', 'name'], '指标'),
      selfScore: getNumber(row, ['selfScore', 'self'], 0),
      overallScore: getNumber(row, ['overallScore', 'overall'], 0),
      clusterScore: getNumber(row, ['clusterScore', 'cluster'], 0)
    };
  });
}

function normalizeRankingCards(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      label: getString(row, ['label', 'name'], '排名'),
      value: getNumber(row, ['value', 'score'], 0),
      suffix: getString(row, ['suffix'], '')
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
      id: getString(row, ['id'], `REC-${index + 1}`),
      category: getString(row, ['category', 'title'], '综合'),
      priority: getString(row, ['priority', 'level'], 'medium'),
      title: getString(row, ['title', 'name'], '建议'),
      description: getString(row, ['description', 'summary', 'desc'], ''),
      reason: getString(row, ['reason'], '')
    };
  });
}

function normalizePredictionFields(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
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

function normalizePredictionGroups(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      title: getString(row, ['title'], '分组'),
      description: getString(row, ['description'], ''),
      fields: normalizePredictionFields(row.fields)
    };
  });
}

function normalizePredictionCards(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      label: getString(row, ['label'], '结果'),
      value: getString(row, ['value'], ''),
      description: getString(row, ['description'], ''),
      tone: getString(row, ['tone'], 'primary')
    };
  });
}

function normalizePredictionSectionItems(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      label: getString(row, ['label'], '字段'),
      value: getString(row, ['value'], '')
    };
  });
}

function normalizePredictionSections(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      title: getString(row, ['title'], '结果分组'),
      items: normalizePredictionSectionItems(row.items)
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
      label: getString(row, ['label', 'name'], '指标'),
      score: getNumber(row, ['score', 'value'], 0)
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
      month: getString(row, ['month'], ''),
      value: getNumber(row, ['value'], 0)
    };
  });
}

function normalizeModelMetricValues(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      key: getString(row, ['key'], 'metric'),
      label: getString(row, ['label'], '指标'),
      value: getNumber(row, ['value'], 0)
    };
  });
}

function normalizeModelTaskRows(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      model: getString(row, ['model'], 'unknown'),
      values: normalizeModelMetricValues(row.values)
    };
  });
}

function normalizeOverviewCards(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      label: getString(row, ['label'], '指标'),
      value: getString(row, ['value'], ''),
      tone: getString(row, ['tone'], 'primary'),
      note: getString(row, ['note', 'description'], '')
    };
  });
}

function normalizeModelTasks(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      taskKey: getString(row, ['taskKey'], 'unknown'),
      taskName: getString(row, ['taskName'], '任务'),
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
      importance: normalizeNamedValues(row.importance).map((item) => ({
        feature: item.name,
        importance: item.value
      })),
      status: getString(row, ['status'], 'offline_evaluation'),
      statusLabel: getString(row, ['statusLabel'], ''),
      onlineAvailable: Boolean(row.onlineAvailable),
      source: getString(row, ['source'], '')
    };
  });
}

function profileCategoryName(row) {
  const category = getString(row, ['profileCategoryName', 'profileCategory'], '');
  if (category) {
    return category;
  }
  const categoryCode = getString(row, ['profile_category'], '');
  return {
    '0': '高投入稳健型',
    '1': '低投入风险型',
    '2': '夜间波动型',
    '3': '发展过渡型'
  }[categoryCode] || '发展过渡型';
}

function adaptCurrentUser(payload) {
  const row = asObject(unwrapPayload(payload));
  return {
    id: String(row.id ?? row.userId ?? ''),
    userId: normalizeNumber(row.userId ?? row.id, 0) || undefined,
    username: getString(row, ['username'], ''),
    studentId: getString(row, ['studentId', 'student_id'], ''),
    name: getString(row, ['name', 'username'], ''),
    role: getString(row, ['role'], 'student'),
    college: getString(row, ['college'], ''),
    token: getString(row, ['token'], ''),
    tokenExpiresAt: getString(row, ['tokenExpiresAt'], ''),
    permissions: Array.isArray(row.permissions) ? row.permissions.map((item) => String(item)) : []
  };
}

function adaptStudentMetrics(row = {}) {
  const riskLabel = getNumber(row, ['riskLabel', 'risk_label'], 0);
  const registeredUsername = getString(row, ['registeredUsername', 'username'], '');
  return {
    studentId: getString(row, ['studentId', 'student_id'], 'unknown'),
    name: getString(row, ['name', 'studentName'], '未知学生'),
    gender: getString(row, ['gender'], '未知'),
    college: getString(row, ['college'], '未知学院'),
    major: getString(row, ['major'], '未知专业'),
    grade: getString(row, ['grade'], ''),
    className: getString(row, ['className', 'class_name'], ''),
    riskLabel,
    riskLevel: getString(row, ['riskLevel'], riskLabel === 1 ? '高风险' : '低风险'),
    performanceLevel: getString(row, ['performanceLevel', 'performance_level'], '中表现'),
    profileCategory: profileCategoryName(row),
    profileSubtype: getString(row, ['profileSubtype'], ''),
    healthLevel: getString(row, ['healthLevel', 'health_level'], '中'),
    scholarshipProbability: normalizeProbability(getNumber(row, ['scholarshipProbability', 'scholarship_probability'], 0)),
    scorePrediction: getNumber(row, ['scorePrediction', 'score_prediction'], 0),
    registrationStatus: normalizeRegistrationStatus(getString(row, ['registrationStatus', 'registration_status'], ''), registeredUsername),
    secondaryTags: normalizeStringArray(row.secondaryTags || row.behaviorTags || row.tags),
    registeredUsername
  };
}

function adaptDashboardOverview(payload) {
  const raw = asObject(unwrapPayload(payload));
  return {
    kpis: Array.isArray(raw.kpis) ? raw.kpis : [],
    riskDistribution: normalizeNamedValues(raw.riskDistribution),
    performanceDistribution: normalizeNamedValues(raw.performanceDistribution),
    profileDistribution: normalizeNamedValues(raw.profileDistribution),
    topRisks: Array.isArray(raw.topRisks) ? raw.topRisks.map((item) => adaptStudentMetrics(asObject(item))) : [],
    dataQualitySummary: asObject(raw.dataQualitySummary)
  };
}

function adaptWarnings(payload) {
  const raw = asObject(unwrapPayload(payload));
  const list = Array.isArray(raw.list) ? raw.list : (Array.isArray(raw) ? raw : []);
  return {
    list: list.map((item) => adaptStudentMetrics(asObject(item))),
    page: getNumber(raw, ['page'], 1),
    pageSize: getNumber(raw, ['page_size', 'pageSize'], list.length),
    total: getNumber(raw, ['total'], list.length)
  };
}

function adaptClusterInsights(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      category: getString(row, ['category', 'clusterLabel'], '群体画像'),
      title: getString(row, ['title'], '群体画像'),
      description: getString(row, ['description'], ''),
      radar: normalizeRadar(row.radar),
      averages: normalizeNamedValues(row.averages),
      students: Array.isArray(row.students) ? row.students.map((student) => adaptStudentMetrics(asObject(student))) : []
    };
  });
}

function adaptStudentDetail(payload) {
  const row = asObject(unwrapPayload(payload));
  const base = adaptStudentMetrics(row);
  return {
    ...base,
    radar: normalizeRadar(row.radar),
    factors: normalizeFactors(row.factors || row.featureImportance || row.keyFactors),
    profileExplanation: getString(row, ['profileExplanation'], ''),
    profileHighlights: normalizeStringArray(row.profileHighlights),
    compareMetrics: normalizeCompareMetrics(row.compareMetrics),
    interventions: normalizeStringArray(row.interventions || row.suggestions || row.recommendations),
    scorePredictionLabel: getString(row, ['scorePredictionLabel'], ''),
    reportTitle: getString(row, ['reportTitle', 'title'], '个性化成长报告'),
    reportSummary: getString(row, ['reportSummary', 'summary'], ''),
    reportSections: normalizeStringArray(row.reportSections || row.sections),
    reportEvaluations: normalizeStringArray(row.reportEvaluations || row.evaluations),
    behaviorDetails: normalizeDetailItems(row.behaviorDetails),
    academicDetails: normalizeDetailItems(row.academicDetails),
    dimensionBasis: normalizeDimensionBasis(row.dimensionBasis),
    predictionSteps: normalizePredictionSteps(row.predictionSteps),
    predictionEvidence: normalizePredictionEvidence(row.predictionEvidence),
    featureTables: normalizeFeatureTables(row.featureTables),
    featureFormulas: normalizeFeatureFormulas(row.featureFormulas)
  };
}

function adaptModelSummary(payload) {
  const raw = asObject(unwrapPayload(payload));
  return {
    metrics: Array.isArray(raw.metrics) ? raw.metrics : [],
    importance: normalizeNamedValues(raw.importance).map((item) => ({
      feature: item.name,
      importance: item.value
    })),
    description: normalizeStringArray(raw.description || raw.descriptions || raw.notes),
    overviewCards: normalizeOverviewCards(raw.overviewCards || raw.kpis || raw.cards),
    tasks: normalizeModelTasks(raw.tasks)
  };
}

function adaptBatchTaskList(payload) {
  const rows = unwrapPayload(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => {
    const row = asObject(item);
    return {
      taskId: getString(row, ['taskId', 'task_id', 'id'], `TASK-${Date.now()}`),
      filename: getString(row, ['filename', 'fileName'], 'unknown.csv'),
      status: getString(row, ['status'], '处理中'),
      createdAt: getString(row, ['createdAt', 'created_at'], ''),
      records: getNumber(row, ['records', 'recordCount'], 0)
    };
  });
}

function adaptBatchTask(payload) {
  const list = adaptBatchTaskList([unwrapPayload(payload)]);
  return list[0];
}

function adaptAnalysisResults(payload) {
  const raw = asObject(unwrapPayload(payload));
  return {
    summaryCards: Array.isArray(raw.summaryCards) ? raw.summaryCards.map((item) => {
      const row = asObject(item);
      return {
        label: getString(row, ['label'], '指标'),
        value: getNumber(row, ['value'], 0),
        tone: getString(row, ['tone'], 'primary')
      };
    }) : [],
    chartStatus: normalizeChartStatus(raw.chartStatus),
    charts: normalizeChartCards(raw.charts),
    storyline: normalizeStringArray(raw.storyline)
  };
}

function adaptStudentHome(payload) {
  const row = asObject(unwrapPayload(payload));
  return {
    studentId: getString(row, ['studentId', 'student_id'], ''),
    studentName: getString(row, ['studentName', 'name'], ''),
    profileCategory: profileCategoryName(row),
    profileSubtype: getString(row, ['profileSubtype'], ''),
    secondaryTags: normalizeStringArray(row.secondaryTags || row.behaviorTags || row.tags),
    riskLevel: getString(row, ['riskLevel'], '中风险'),
    performanceLevel: getString(row, ['performanceLevel'], '中表现'),
    scholarshipProbability: normalizeProbability(getNumber(row, ['scholarshipProbability'], 0)),
    healthLevel: getString(row, ['healthLevel'], '中'),
    trendSummary: normalizeSummary(row.trendSummary || row.summaryCards || row.cards),
    insights: normalizeStringArray(row.insights),
    chartStatus: normalizeChartStatus(row.chartStatus),
    analysisCharts: normalizeChartCards(row.analysisCharts || row.charts)
  };
}

function adaptStudentProfile(payload) {
  const row = asObject(unwrapPayload(payload));
  return {
    studentId: getString(row, ['studentId', 'student_id'], ''),
    profileCategory: profileCategoryName(row),
    profileSubtype: getString(row, ['profileSubtype'], ''),
    profileExplanation: getString(row, ['profileExplanation'], ''),
    profileHighlights: normalizeStringArray(row.profileHighlights),
    description: getString(row, ['description'], ''),
    radar: normalizeRadar(row.radar || row.radarData),
    strengths: normalizeStringArray(row.strengths || row.advantages),
    weaknesses: normalizeStringArray(row.weaknesses || row.disadvantages),
    scholarshipProbability: normalizeProbability(getNumber(row, ['scholarshipProbability'], 0)),
    riskLevel: getString(row, ['riskLevel'], '中风险'),
    healthLevel: getString(row, ['healthLevel'], '中'),
    riskDrivers: normalizeRecommendationItems(
      (row.riskDrivers || []).map((item, index) => {
        const driver = asObject(item);
        return {
          id: driver.id || `DRV-${index + 1}`,
          category: driver.category,
          priority: normalizeNumber(driver.impact, 0) >= 0.9 ? 'high' : 'medium',
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
  const row = asObject(unwrapPayload(payload));
  return {
    studyTrend: normalizeTrendList(row.studyTrend),
    riskTrend: normalizeTrendList(row.riskTrend),
    healthTrend: normalizeTrendList(row.healthTrend),
    scoreTrend: normalizeTrendList(row.scoreTrend)
  };
}

function adaptStudentReport(payload) {
  const row = asObject(unwrapPayload(payload));
  return {
    studentId: getString(row, ['studentId', 'student_id'], ''),
    title: getString(row, ['title'], '个性化报告'),
    summary: getString(row, ['summary'], ''),
    reportMeta: row.reportMeta || null,
    sections: normalizeStringArray(row.sections || row.paragraphs),
    evaluations: normalizeStringArray(row.evaluations),
    suggestions: normalizeStringArray(row.suggestions || row.recommendations),
    profileExplanation: getString(row, ['profileExplanation'], ''),
    profileHighlights: normalizeStringArray(row.profileHighlights),
    behaviorDetails: normalizeDetailItems(row.behaviorDetails),
    academicDetails: normalizeDetailItems(row.academicDetails),
    dimensionBasis: normalizeDimensionBasis(row.dimensionBasis),
    predictionSteps: normalizePredictionSteps(row.predictionSteps),
    predictionEvidence: normalizePredictionEvidence(row.predictionEvidence),
    featureTables: normalizeFeatureTables(row.featureTables),
    featureFormulas: normalizeFeatureFormulas(row.featureFormulas),
    scoreCards: normalizeScoreCards(row.scoreCards || row.cards)
  };
}

function adaptRecommendationGroups(payload) {
  const row = asObject(unwrapPayload(payload));
  return {
    studentId: getString(row, ['studentId', 'student_id'], ''),
    recommendations: normalizeRecommendationItems(row.recommendations || row.items || row.list)
  };
}

function adaptStudentCompare(payload) {
  const row = asObject(unwrapPayload(payload));
  return {
    studentId: getString(row, ['studentId', 'student_id'], ''),
    studentName: getString(row, ['studentName', 'name'], ''),
    clusterLabel: getString(row, ['clusterLabel'], '同类群体'),
    overallLabel: getString(row, ['overallLabel'], '全样本'),
    compareMetrics: normalizeCompareMetrics(row.compareMetrics),
    rankingCards: normalizeRankingCards(row.rankingCards),
    clusterTraits: normalizeStringArray(row.clusterTraits),
    explanations: normalizeStringArray(row.explanations)
  };
}

function adaptStudentPredictionSchema(payload) {
  const row = asObject(unwrapPayload(payload));
  return {
    studentId: getString(row, ['studentId', 'student_id'], ''),
    groups: normalizePredictionGroups(row.groups),
    notes: normalizeStringArray(row.notes)
  };
}

function adaptStudentPredictionResult(payload) {
  const row = asObject(unwrapPayload(payload));
  return {
    studentId: getString(row, ['studentId', 'student_id'], ''),
    cards: normalizePredictionCards(row.cards),
    sections: normalizePredictionSections(row.sections),
    notes: normalizeStringArray(row.notes)
  };
}

export {
  adaptAnalysisResults,
  adaptBatchTask,
  adaptBatchTaskList,
  adaptClusterInsights,
  adaptCurrentUser,
  adaptDashboardOverview,
  adaptModelSummary,
  adaptRecommendationGroups,
  adaptStudentCompare,
  adaptStudentDetail,
  adaptStudentHome,
  adaptStudentPredictionResult,
  adaptStudentPredictionSchema,
  adaptStudentProfile,
  adaptStudentReport,
  adaptStudentTrends,
  adaptWarnings,
  normalizeProbability,
  normalizeString,
  unwrapPayload
};
