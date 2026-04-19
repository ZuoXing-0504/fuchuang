import { recommendationGroups, studentHome, trendList } from '../mock/data';

export function getStudentHome() {
  return Promise.resolve(studentHome);
}

export function getStudentTrends() {
  return Promise.resolve(trendList);
}

export function getStudentRecommendations() {
  return Promise.resolve(recommendationGroups);
}
