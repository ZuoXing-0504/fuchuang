import type { StudentCompareData, StudentHomeData, StudentProfileData, StudentRecommendationsData, StudentReportData } from '../types';
import { adaptRecommendationGroups, adaptStudentCompare, adaptStudentHome, adaptStudentProfile, adaptStudentReport, unwrapPayload } from './adapter';
import { request } from '../utils/request';

export function getStudentHome() {
  return request<StudentHomeData>('/api/student/dashboard', {
    adapter: (raw) => {
      const data = adaptStudentHome(raw);
      const payload = unwrapPayload<Record<string, unknown>>(raw) ?? {};
      return {
        ...data,
        secondaryTags: normalizeSecondaryTags(payload.secondaryTags ?? payload.behaviorTags ?? payload.tags)
      };
    }
  });
}

export function getStudentProfile() {
  return request<StudentProfileData>('/api/student/profile', {
    adapter: (raw) => {
      const data = adaptStudentProfile(raw);
      const payload = unwrapPayload<Record<string, unknown>>(raw) ?? {};
      return {
        ...data,
        secondaryTags: normalizeSecondaryTags(payload.secondaryTags ?? payload.behaviorTags ?? payload.tags)
      };
    }
  });
}

export function getStudentReport() {
  return request<StudentReportData>('/api/student/report', {
    adapter: adaptStudentReport
  });
}

export function getStudentRecommendations() {
  return request<StudentRecommendationsData>('/api/student/recommendations', {
    adapter: adaptRecommendationGroups
  });
}

export function getStudentCompare() {
  return request<StudentCompareData>('/api/student/compare/group', {
    adapter: adaptStudentCompare
  });
}

function normalizeSecondaryTags(payload: unknown): string[] {
  if (!Array.isArray(payload)) {
    return [];
  }
  return payload.map((item) => String(item)).filter(Boolean);
}
