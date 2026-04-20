import {
  adaptRecommendationGroups,
  adaptStudentCompare,
  adaptStudentHome,
  adaptStudentPredictionResult,
  adaptStudentPredictionSchema,
  adaptStudentProfile,
  adaptStudentReport,
  adaptStudentTrends
} from './adapter';
import { request } from '../common/request';

export async function getStudentHome() {
  const response = await request('/api/student/dashboard');
  return adaptStudentHome(response);
}

export async function getStudentProfile() {
  const response = await request('/api/student/profile');
  return adaptStudentProfile(response);
}

export async function getStudentTrends() {
  const response = await request('/api/student/trends');
  return adaptStudentTrends(response);
}

export async function getStudentReport() {
  const response = await request('/api/student/report');
  return adaptStudentReport(response);
}

export async function getStudentRecommendations() {
  const response = await request('/api/student/recommendations');
  return adaptRecommendationGroups(response);
}

export async function getStudentCompare() {
  const response = await request('/api/student/compare/group');
  return adaptStudentCompare(response);
}

export async function getStudentPredictionSchema() {
  const response = await request('/api/student/predict/schema');
  return adaptStudentPredictionSchema(response);
}

export async function submitStudentManualPredict(values) {
  const response = await request('/api/student/predict/manual', {
    method: 'POST',
    data: { values }
  });
  return adaptStudentPredictionResult(response);
}
