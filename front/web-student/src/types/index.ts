export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  studentId: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface StudentUser {
  id: string;
  userId?: number;
  username?: string;
  studentId?: string;
  name: string;
  role: 'student';
  token: string;
  tokenExpiresAt?: string;
}

export interface ChartStatus {
  ready: boolean;
  message: string;
  missingCount: number;
  availableCount: number;
  installHint?: string;
}

export interface AnalysisChartCard {
  title: string;
  url: string;
  category: string;
  description: string;
  insight: string;
}

export interface StudentCompareMetric {
  label: string;
  selfScore: number;
  overallScore: number;
  clusterScore: number;
}

export interface StudentHomeData {
  studentId?: string;
  studentName?: string;
  profileCategory: string;
  profileSubtype?: string;
  secondaryTags?: string[];
  riskLevel: string;
  performanceLevel: string;
  scholarshipProbability: number;
  healthLevel: string;
  trendSummary: Array<{ label: string; value: string }>;
  insights: string[];
  chartStatus: ChartStatus;
  analysisCharts: AnalysisChartCard[];
}

export interface StudentCompareData {
  studentId: string;
  studentName: string;
  clusterLabel: string;
  overallLabel: string;
  compareMetrics: StudentCompareMetric[];
  rankingCards: Array<{ label: string; value: number; suffix: string }>;
  clusterTraits: string[];
  explanations: string[];
}

export interface StudentProfileData {
  studentId?: string;
  profileCategory: string;
  profileSubtype?: string;
  profileExplanation?: string;
  profileHighlights?: string[];
  secondaryTags?: string[];
  description: string;
  radar: Array<{ indicator: string; value: number }>;
  strengths: string[];
  weaknesses: string[];
  scholarshipProbability: number;
  riskLevel: string;
  healthLevel: string;
}

export interface ReportDetailItem {
  label: string;
  value: string;
  note?: string;
}

export interface ReportDimensionBasisItem {
  dimension: string;
  selfScore: number;
  overallScore: number;
  clusterScore: number;
  judgement: string;
  summary: string;
}

export interface ReportPredictionStepItem {
  title: string;
  summary: string;
  items: string[];
}

export interface ReportPredictionEvidenceItem {
  label: string;
  value: string;
  effect: string;
  reason: string;
}

export interface ReportFeatureTableRow {
  label: string;
  key: string;
  value: string;
  unit?: string;
  source?: string;
  usedInPrediction: boolean;
  description?: string;
}

export interface ReportFeatureTableSection {
  title: string;
  description: string;
  rows: ReportFeatureTableRow[];
}

export interface ReportFeatureFormulaItem {
  feature: string;
  formula: string;
  explanation: string;
  source: string;
}

export interface StudentReportData {
  studentId?: string;
  title: string;
  summary: string;
  reportMeta?: {
    studentName: string;
    college: string;
    major: string;
    profileCategory: string;
    profileSubtype?: string;
    riskLevel: string;
    reportDate: string;
  };
  sections: string[];
  evaluations: string[];
  suggestions: string[];
  profileExplanation?: string;
  profileHighlights?: string[];
  behaviorDetails: ReportDetailItem[];
  academicDetails: ReportDetailItem[];
  dimensionBasis: ReportDimensionBasisItem[];
  predictionSteps: ReportPredictionStepItem[];
  predictionEvidence: ReportPredictionEvidenceItem[];
  featureTables: ReportFeatureTableSection[];
  featureFormulas: ReportFeatureFormulaItem[];
  scoreCards: Array<{ label: string; score: number }>;
}

export interface RecommendationGroup {
  category: string;
  items: string[];
}

export interface RecommendationItem {
  id: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
}

export interface StudentRecommendationsData {
  studentId?: string;
  recommendations: RecommendationItem[];
}

export interface StudentPredictionField {
  key: string;
  label: string;
  type: 'text' | 'number' | string;
  unit?: string;
  defaultValue?: string | number | null;
  placeholder?: string;
}

export interface StudentPredictionGroup {
  title: string;
  description: string;
  fields: StudentPredictionField[];
}

export interface StudentPredictionSchema {
  studentId?: string;
  groups: StudentPredictionGroup[];
  notes: string[];
}

export interface StudentPredictionCard {
  label: string;
  value: string;
  description: string;
  tone: 'primary' | 'success' | 'warning' | 'danger' | string;
}

export interface StudentPredictionSectionItem {
  label: string;
  value: string;
}

export interface StudentPredictionSection {
  title: string;
  items: StudentPredictionSectionItem[];
}

export interface StudentPredictionResult {
  studentId?: string;
  cards: StudentPredictionCard[];
  sections: StudentPredictionSection[];
  notes: string[];
}
