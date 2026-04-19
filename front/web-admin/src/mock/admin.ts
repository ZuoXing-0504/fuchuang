import type { AuthUser, BatchTask, ClusterInsight, DashboardOverview, ModelSummary, StudentDetail, StudentMetrics } from '../types';

export const adminUser: AuthUser = {
  id: 'admin-demo',
  name: '管理员',
  role: 'admin',
  college: '示例学院',
  token: 'admin-demo-token'
};

export const studentPool: StudentMetrics[] = [];

export const dashboardOverview: DashboardOverview = {
  kpis: [],
  riskDistribution: [],
  performanceDistribution: [],
  profileDistribution: [],
  topRisks: []
};

export const clusterInsights: ClusterInsight[] = [];

export const studentDetail: StudentDetail = {
  studentId: 'demo',
  name: '示例学生',
  gender: '未知',
  college: '示例学院',
  major: '示例专业',
  grade: '',
  className: '',
  riskLabel: 0,
  riskLevel: '低风险',
  performanceLevel: '中表现',
  profileCategory: '示例画像',
  healthLevel: '良',
  scholarshipProbability: 0.5,
  scorePrediction: 68,
  registrationStatus: '未注册',
  registeredUsername: '',
  radar: [],
  factors: [],
  compareMetrics: [],
  interventions: [],
  reportSummary: ''
};

export const modelSummary: ModelSummary = {
  metrics: [],
  importance: [],
  description: []
};

export const batchTasks: BatchTask[] = [];
