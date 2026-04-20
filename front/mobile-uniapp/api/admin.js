import {
  adaptAnalysisResults,
  adaptBatchTask,
  adaptBatchTaskList,
  adaptClusterInsights,
  adaptDashboardOverview,
  adaptModelSummary,
  adaptStudentDetail,
  adaptWarnings
} from './adapter';
import { request } from '../common/request';

export async function getDashboardOverview() {
  const response = await request('/api/admin/dashboard/overview');
  return adaptDashboardOverview(response);
}

export async function getWarnings(params = {}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 500;
  const response = await request(`/api/admin/risk/list?page=${page}&page_size=${pageSize}`);
  return adaptWarnings(response);
}

export async function getClusterInsights() {
  const response = await request('/api/admin/cluster/profile');
  return adaptClusterInsights(response);
}

export async function getStudentDetail(studentId) {
  const response = await request(`/api/admin/student/${encodeURIComponent(studentId)}`);
  return adaptStudentDetail(response);
}

export async function getModelSummary() {
  const response = await request('/api/admin/model/metrics');
  return adaptModelSummary(response);
}

export async function getTaskHistory() {
  const response = await request('/api/admin/tasks/history');
  return adaptBatchTaskList(response);
}

export async function submitBatchPredict(fileName) {
  const response = await request('/api/admin/tasks/batch-predict', {
    method: 'POST',
    data: { fileName }
  });
  return adaptBatchTask(response);
}

export async function getAnalysisResults() {
  const response = await request('/api/admin/analysis/results');
  return adaptAnalysisResults(response);
}
