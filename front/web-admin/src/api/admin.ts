import type { AnalysisResultsData, BatchTask, ClusterInsight, DashboardOverview, ModelSummary, StudentDetail, StudentMetrics } from '../types';
import { adaptAnalysisResults, adaptBatchTask, adaptBatchTaskList, adaptClusterInsights, adaptDashboardOverview, adaptModelSummary, adaptStudentDetail, adaptStudentMetricsList, unwrapPayload } from './adapter';
import { request } from '../utils/request';

export function getDashboardOverview() {
  return request<DashboardOverview>('/api/admin/dashboard/overview', {
    adapter: adaptDashboardOverview
  });
}

export function getWarnings() {
  return request<StudentMetrics[]>('/api/admin/risk/list', {
    adapter: (raw) => {
      const rows = adaptStudentMetricsList(raw);
      const payload = unwrapPayload<Record<string, unknown>>(raw) ?? {};
      const list = Array.isArray(payload) ? payload : ((payload.list as Array<Record<string, unknown>>) ?? []);
      return rows.map((item, index) => ({
        ...item,
        secondaryTags: normalizeSecondaryTags(list[index]?.secondaryTags ?? list[index]?.behaviorTags ?? list[index]?.tags)
      }));
    }
  });
}

export function getClusterInsights() {
  return request<ClusterInsight[]>('/api/admin/cluster/profile', {
    adapter: adaptClusterInsights
  });
}

export function getStudentDetail(studentId: string) {
  return request<StudentDetail>(`/api/admin/student/${studentId}`, {
    adapter: (raw) => {
      const detail = adaptStudentDetail(raw);
      const payload = unwrapPayload<Record<string, unknown>>(raw) ?? {};
      return {
        ...detail,
        secondaryTags: normalizeSecondaryTags(payload.secondaryTags ?? payload.behaviorTags ?? payload.tags)
      };
    }
  });
}

export function getModelSummary() {
  return request<ModelSummary>('/api/admin/model/metrics', {
    adapter: adaptModelSummary
  });
}

export function getTaskHistory() {
  return request<BatchTask[]>('/api/admin/tasks/history', {
    adapter: adaptBatchTaskList
  });
}

export function submitBatchPredict(fileName: string) {
  return request<BatchTask>('/api/admin/tasks/batch-predict', {
    options: { method: 'POST', body: JSON.stringify({ fileName }) },
    adapter: adaptBatchTask
  });
}

export function getModelImportance() {
  return request<ModelSummary>('/api/admin/model/importance', {
    adapter: adaptModelSummary
  });
}

export function getAnalysisResults() {
  return request<AnalysisResultsData>('/api/admin/analysis/results', {
    adapter: adaptAnalysisResults
  });
}

function normalizeSecondaryTags(payload: unknown): string[] {
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map((item) => String(item)).filter(Boolean);
}
