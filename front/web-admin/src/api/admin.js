import { adaptAnalysisResults, adaptBatchTask, adaptBatchTaskList, adaptClusterInsights, adaptDashboardOverview, adaptModelSummary, adaptStudentDetail, adaptStudentMetricsList, unwrapPayload } from './adapter';
import { request } from '../utils/request';
export function getDashboardOverview() {
    return request('/api/admin/dashboard/overview', {
        adapter: adaptDashboardOverview
    });
}
export function getWarnings() {
    return request('/api/admin/risk/list', {
        adapter: (raw) => {
            const rows = adaptStudentMetricsList(raw);
            const payload = unwrapPayload(raw) ?? {};
            const list = Array.isArray(payload) ? payload : (payload.list ?? []);
            return rows.map((item, index) => ({
                ...item,
                secondaryTags: normalizeSecondaryTags(list[index]?.secondaryTags ?? list[index]?.behaviorTags ?? list[index]?.tags)
            }));
        }
    });
}
export function getClusterInsights() {
    return request('/api/admin/cluster/profile', {
        adapter: adaptClusterInsights
    });
}
export function getStudentDetail(studentId) {
    return request(`/api/admin/student/${studentId}`, {
        adapter: (raw) => {
            const detail = adaptStudentDetail(raw);
            const payload = unwrapPayload(raw) ?? {};
            return {
                ...detail,
                secondaryTags: normalizeSecondaryTags(payload.secondaryTags ?? payload.behaviorTags ?? payload.tags)
            };
        }
    });
}
export function getModelSummary() {
    return request('/api/admin/model/metrics', {
        adapter: adaptModelSummary
    });
}
export function getTaskHistory() {
    return request('/api/admin/tasks/history', {
        adapter: adaptBatchTaskList
    });
}
export function submitBatchPredict(fileName) {
    return request('/api/admin/tasks/batch-predict', {
        options: { method: 'POST', body: JSON.stringify({ fileName }) },
        adapter: adaptBatchTask
    });
}
export function getModelImportance() {
    return request('/api/admin/model/importance', {
        adapter: adaptModelSummary
    });
}
export function getAnalysisResults() {
    return request('/api/admin/analysis/results', {
        adapter: adaptAnalysisResults
    });
}
function normalizeSecondaryTags(payload) {
    if (!Array.isArray(payload)) {
        return [];
    }
    return payload.map((item) => String(item)).filter(Boolean);
}
