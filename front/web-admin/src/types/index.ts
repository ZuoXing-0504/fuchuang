export type RoleType = 'admin' | 'student' | 'school_admin' | 'college_admin' | 'counselor';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  userId?: number;
  username?: string;
  studentId?: string;
  name: string;
  role: RoleType;
  college?: string;
  token: string;
  tokenExpiresAt?: string;
  permissions?: string[];
}

export interface StudentBaseInfo {
  studentId: string;
  name: string;
  gender: string;
  college: string;
  major: string;
  grade: string;
  className: string;
}

export interface StudentMetrics extends StudentBaseInfo {
  riskLabel: number;
  riskLevel: '高风险' | '中风险' | '低风险';
  performanceLevel: '高表现' | '中表现' | '低表现' | string;
  profileCategory: string;
  profileSubtype?: string;
  secondaryTags?: string[];
  healthLevel: '优' | '良' | '中' | '预警' | string;
  scholarshipProbability: number;
  scorePrediction: number;
  registrationStatus?: string;
  registeredUsername?: string;
}

export interface DashboardOverview {
  kpis: Array<{ label: string; value: string; delta: string; note?: string; tone: 'danger' | 'warning' | 'success' | 'primary' }>;
  riskDistribution: Array<{ name: string; value: number }>;
  performanceDistribution: Array<{ name: string; value: number }>;
  profileDistribution: Array<{ name: string; value: number }>;
  topRisks: StudentMetrics[];
}

export interface ClusterInsight {
  category: string;
  title: string;
  description: string;
  radar: Array<{ indicator: string; value: number }>;
  averages: Array<{ name: string; value: number }>;
  students: StudentMetrics[];
}

export interface StudentFactor {
  feature: string;
  impact?: number;
  description: string;
}

export interface DetailSnapshotItem {
  label: string;
  value: string;
  note?: string;
}

export interface DimensionBasisItem {
  dimension: string;
  selfScore: number;
  overallScore: number;
  clusterScore: number;
  judgement: string;
  summary: string;
}

export interface PredictionStepItem {
  title: string;
  summary: string;
  items: string[];
}

export interface PredictionEvidenceItem {
  label: string;
  value: string;
  effect: string;
  reason: string;
}

export interface FeatureTableRow {
  label: string;
  key: string;
  value: string;
  unit?: string;
  source?: string;
  usedInPrediction: boolean;
  description?: string;
}

export interface FeatureTableSection {
  title: string;
  description: string;
  rows: FeatureTableRow[];
}

export interface FeatureFormulaItem {
  feature: string;
  formula: string;
  explanation: string;
  source: string;
}

export interface StudentDetail extends StudentMetrics {
  radar: Array<{ indicator: string; value: number }>;
  factors: StudentFactor[];
  profileExplanation?: string;
  profileHighlights?: string[];
  compareMetrics?: Array<{ label: string; selfScore: number; overallScore: number; clusterScore: number }>;
  interventions: string[];
  scorePredictionLabel?: string;
  reportTitle?: string;
  reportSummary: string;
  reportSections?: string[];
  reportEvaluations?: string[];
  behaviorDetails?: DetailSnapshotItem[];
  academicDetails?: DetailSnapshotItem[];
  dimensionBasis?: DimensionBasisItem[];
  predictionSteps?: PredictionStepItem[];
  predictionEvidence?: PredictionEvidenceItem[];
  featureTables?: FeatureTableSection[];
  featureFormulas?: FeatureFormulaItem[];
}

export interface ModelMetric {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  auc: number;
  cvAuc: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface ModelOverviewCard {
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning' | 'danger' | string;
  note?: string;
}

export interface ModelMetricValue {
  key: string;
  label: string;
  value: number;
}

export interface ModelTaskRow {
  model: string;
  values: ModelMetricValue[];
}

export interface ModelTaskSummary {
  taskKey: string;
  taskName: string;
  taskType: 'binary' | 'multiclass' | 'regression' | string;
  description: string;
  bestModel: string;
  primaryMetricKey: string;
  primaryMetricLabel: string;
  primaryMetricValue?: number;
  secondaryMetricKey: string;
  secondaryMetricLabel: string;
  secondaryMetricValue?: number;
  rows: ModelTaskRow[];
  importance: FeatureImportance[];
  status: 'online' | 'offline_evaluation' | string;
  statusLabel: string;
  onlineAvailable: boolean;
  source: string;
}

export interface ModelSummary {
  metrics: ModelMetric[];
  importance: FeatureImportance[];
  description: string[];
  overviewCards?: ModelOverviewCard[];
  tasks?: ModelTaskSummary[];
}

export interface BatchTask {
  taskId: string;
  filename: string;
  status: '已完成' | '处理中' | '失败';
  createdAt: string;
  records: number;
}

export interface AnalysisResultChart {
  id: string;
  title: string;
  file: string;
  url: string;
  category: string;
  description: string;
  insight: string;
}

export interface AnalysisResultsData {
  summaryCards: Array<{ label: string; value: number; tone: 'danger' | 'warning' | 'success' | 'primary' }>;
  chartStatus: { ready: boolean; message: string; missingCount: number; availableCount: number; installHint?: string };
  charts: AnalysisResultChart[];
  storyline: string[];
}
