import type {
  AnalysisResultChart,
  AnalysisResultsData,
  BatchTask,
  ClusterInsight,
  DashboardOverview,
  FeatureImportance,
  ModelMetric,
  ModelSummary,
  StudentDetail,
  StudentMetrics
} from '../types';

type UnknownRecord = Record<string, unknown>;

const profileCategoryMap: Record<string, string> = {
  '0': '高投入稳健型',
  '1': '低投入风险型',
  '2': '夜间波动型',
  '3': '发展过渡型'
};

export function unwrapPayload<T>(payload: unknown): T {
  if (Array.isArray(payload)) {
    return payload as T;
  }
  if (payload && typeof payload === 'object') {
    const record = payload as UnknownRecord;
    for (const key of ['data', 'result', 'records']) {
      if (key in record) {
        return record[key] as T;
      }
    }
  }
  return payload as T;
}

export function adaptStudentMetricsList(payload: unknown): StudentMetrics[] {
  const raw = unwrapPayload<unknown>(payload);
  let rows: unknown[] = [];
  if (Array.isArray(raw)) {
    rows = raw;
  } else if (raw && typeof raw === 'object') {
    const record = raw as UnknownRecord;
    rows = Array.isArray(record.list) ? record.list : [];
  }
  return rows.map(adaptStudentMetrics);
}

export function adaptDashboardOverview(payload: unknown): DashboardOverview {
  const raw = unwrapPayload<UnknownRecord>(payload) ?? {};
  return {
    kpis: (raw.kpis as DashboardOverview['kpis']) ?? [],
    riskDistribution: normalizeChartArray(raw.riskDistribution),
    performanceDistribution: normalizeChartArray(raw.performanceDistribution),
    profileDistribution: normalizeChartArray(raw.profileDistribution),
    topRisks: adaptStudentMetricsList(raw.topRisks ?? raw.topRiskStudents ?? [])
  };
}

export function adaptClusterInsights(payload: unknown): ClusterInsight[] {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
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

export function adaptStudentDetail(payload: unknown): StudentDetail {
  const row = unwrapPayload<UnknownRecord>(payload) ?? {};
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

export function adaptModelSummary(payload: unknown): ModelSummary {
  const raw = unwrapPayload<UnknownRecord>(payload) ?? {};
  return {
    metrics: adaptModelMetrics(raw.metrics ?? raw.metricList ?? raw.models ?? []),
    importance: adaptFeatureImportance(raw.importance ?? raw.featureImportance ?? raw.features ?? []),
    description: normalizeStringArray(raw.description ?? raw.descriptions ?? raw.notes)
  };
}

export function adaptBatchTaskList(payload: unknown): BatchTask[] {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
    return {
      taskId: getString(row, ['taskId', 'task_id', 'id'], `TASK-${Date.now()}`),
      filename: getString(row, ['filename', 'fileName'], 'unknown.csv'),
      status: normalizeTaskStatus(getString(row, ['status'], '处理中')),
      createdAt: getString(row, ['createdAt', 'created_at'], ''),
      records: getNumber(row, ['records', 'recordCount'], 0)
    };
  });
}

export function adaptBatchTask(payload: unknown): BatchTask {
  return adaptBatchTaskList([unwrapPayload(payload)])[0];
}

export function adaptAnalysisResults(payload: unknown): AnalysisResultsData {
  const raw = unwrapPayload<UnknownRecord>(payload) ?? {};
  const summaryRows = unwrapPayload<unknown[]>(raw.summaryCards) ?? [];
  const chartRows = unwrapPayload<unknown[]>(raw.charts) ?? [];
  return {
    summaryCards: summaryRows.map((item) => {
      const row = item as UnknownRecord;
      return {
        label: getString(row, ['label'], '指标'),
        value: getNumber(row, ['value'], 0),
        tone: getString(row, ['tone'], 'primary') as AnalysisResultsData['summaryCards'][number]['tone']
      };
    }),
    chartStatus: normalizeChartStatus(raw.chartStatus),
    charts: chartRows.map((item) => {
      const row = item as UnknownRecord;
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

function normalizeChartStatus(payload: unknown): AnalysisResultsData['chartStatus'] {
  const row = unwrapPayload<UnknownRecord>(payload) ?? {};
  return {
    ready: Boolean(row.ready),
    message: getString(row, ['message'], ''),
    missingCount: getNumber(row, ['missingCount'], 0),
    availableCount: getNumber(row, ['availableCount'], 0),
    installHint: getString(row, ['installHint'], '')
  };
}

function normalizeCompareMetrics(payload: unknown): NonNullable<StudentDetail['compareMetrics']> {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
    return {
      label: getString(row, ['label'], '指标'),
      selfScore: getNumber(row, ['selfScore', 'self'], 0),
      overallScore: getNumber(row, ['overallScore', 'overall'], 0),
      clusterScore: getNumber(row, ['clusterScore', 'cluster'], 0)
    };
  });
}

function adaptStudentMetrics(item: unknown): StudentMetrics {
  const row = item as UnknownRecord;
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

function adaptModelMetrics(payload: unknown): ModelMetric[] {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
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

function adaptFeatureImportance(payload: unknown): FeatureImportance[] {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
    return {
      feature: getString(row, ['feature', 'name'], 'unknown'),
      importance: getNumber(row, ['importance', 'value'], 0)
    };
  });
}

function normalizeChartArray(payload: unknown): Array<{ name: string; value: number }> {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
    return {
      name: getString(row, ['name', 'label'], '未知'),
      value: getNumber(row, ['value', 'count'], 0)
    };
  });
}

function normalizeNamedValueArray(payload: unknown, nameKey = 'name'): Array<{ name: string; value: number }> {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
    return {
      name: getString(row, [nameKey, 'indicator', 'label', 'name'], '指标'),
      value: getNumber(row, ['value', 'score', 'importance'], 0)
    };
  });
}

function normalizeRadarArray(payload: unknown): Array<{ indicator: string; value: number }> {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
    return {
      indicator: getString(row, ['indicator', 'name', 'label'], '指标'),
      value: getNumber(row, ['value', 'score', 'importance'], 0)
    };
  });
}

function normalizeFactors(payload: unknown): StudentDetail['factors'] {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
    return {
      feature: getString(row, ['feature', 'name'], '未知因素'),
      impact: getNumber(row, ['impact', 'importance', 'value'], 0),
      description: getString(row, ['description', 'desc'], '')
    };
  });
}

function normalizeDetailSnapshotItems(payload: unknown): NonNullable<StudentDetail['behaviorDetails']> {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
    return {
      label: getString(row, ['label', 'name'], '明细'),
      value: getString(row, ['value'], ''),
      note: getString(row, ['note', 'description'], '')
    };
  }).filter((item) => item.value);
}

function normalizeDimensionBasis(payload: unknown): NonNullable<StudentDetail['dimensionBasis']> {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
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

function normalizePredictionSteps(payload: unknown): NonNullable<StudentDetail['predictionSteps']> {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
    return {
      title: getString(row, ['title'], '步骤'),
      summary: getString(row, ['summary'], ''),
      items: normalizeStringArray(row.items)
    };
  });
}

function normalizePredictionEvidence(payload: unknown): NonNullable<StudentDetail['predictionEvidence']> {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
    return {
      label: getString(row, ['label'], '特征'),
      value: getString(row, ['value'], ''),
      effect: getString(row, ['effect'], ''),
      reason: getString(row, ['reason'], '')
    };
  });
}

function normalizeFeatureTables(payload: unknown): NonNullable<StudentDetail['featureTables']> {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
    return {
      title: getString(row, ['title'], '特征表'),
      description: getString(row, ['description'], ''),
      rows: normalizeFeatureTableRows(row.rows)
    };
  });
}

function normalizeFeatureTableRows(payload: unknown) {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
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

function normalizeFeatureFormulas(payload: unknown): NonNullable<StudentDetail['featureFormulas']> {
  const rows = unwrapPayload<unknown[]>(payload) ?? [];
  return rows.map((item) => {
    const row = item as UnknownRecord;
    return {
      feature: getString(row, ['feature'], '特征'),
      formula: getString(row, ['formula'], ''),
      explanation: getString(row, ['explanation'], ''),
      source: getString(row, ['source'], '')
    };
  });
}

function normalizeStringArray(payload: unknown): string[] {
  const rows = unwrapPayload<unknown[]>(payload);
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.map((item) => String(item)).filter(Boolean);
}

function normalizeRiskLevel(source: string, riskLabel: number): StudentMetrics['riskLevel'] {
  if (source === '高风险' || source === '中风险' || source === '低风险') {
    return source;
  }
  return riskLabel === 1 ? '高风险' : '低风险';
}

function normalizeTaskStatus(status: string): BatchTask['status'] {
  if (status.includes('完成')) {
    return '已完成';
  }
  if (status.includes('失败')) {
    return '失败';
  }
  return '处理中';
}

function normalizeProbability(value: number): number {
  if (value > 1) {
    return Number((value / 100).toFixed(4));
  }
  return value;
}

function getString(row: UnknownRecord, keys: string[], fallback = '') {
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

function getNumber(row: UnknownRecord, keys: string[], fallback = 0) {
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
