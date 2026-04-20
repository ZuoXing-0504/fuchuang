import {
  adaptDashboardOverview,
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

export async function getStudentDetail(studentId) {
  const response = await request(`/api/admin/student/${encodeURIComponent(studentId)}`);
  return adaptStudentDetail(response);
}
