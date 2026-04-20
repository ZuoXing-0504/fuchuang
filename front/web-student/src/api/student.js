import { adaptRecommendationGroups, adaptStudentCompare, adaptStudentHome, adaptStudentPredictionResult, adaptStudentPredictionSchema, adaptStudentProfile, adaptStudentReport, unwrapPayload } from './adapter';
import { request } from '../utils/request';
export function getStudentHome() {
    return request('/api/student/dashboard', {
        adapter: (raw) => {
            const data = adaptStudentHome(raw);
            const payload = unwrapPayload(raw) ?? {};
            return {
                ...data,
                secondaryTags: normalizeSecondaryTags(payload.secondaryTags ?? payload.behaviorTags ?? payload.tags)
            };
        }
    });
}
export function getStudentProfile() {
    return request('/api/student/profile', {
        adapter: (raw) => {
            const data = adaptStudentProfile(raw);
            const payload = unwrapPayload(raw) ?? {};
            return {
                ...data,
                secondaryTags: normalizeSecondaryTags(payload.secondaryTags ?? payload.behaviorTags ?? payload.tags)
            };
        }
    });
}
export function getStudentReport() {
    return request('/api/student/report', {
        adapter: adaptStudentReport
    });
}
export function getStudentRecommendations() {
    return request('/api/student/recommendations', {
        adapter: adaptRecommendationGroups
    });
}
export function getStudentCompare() {
    return request('/api/student/compare/group', {
        adapter: adaptStudentCompare
    });
}
export function getStudentPredictionSchema() {
    return request('/api/student/predict/schema', {
        adapter: adaptStudentPredictionSchema
    });
}
export function submitStudentManualPredict(values) {
    return request('/api/student/predict/manual', {
        options: { method: 'POST', body: JSON.stringify({ values }) },
        adapter: adaptStudentPredictionResult
    });
}
function normalizeSecondaryTags(payload) {
    if (!Array.isArray(payload)) {
        return [];
    }
    return payload.map((item) => String(item)).filter(Boolean);
}
