/**
 * Lihat daftar API yang tersedia:
 * https://calm-music-api.dicoding.dev/#/
 */

const BASE_URL = window.location.origin;

export const ENDPOINTS = {
  MY_USER_INFO: `${BASE_URL}/my-user-info.json`,
  REPORT_LIST: `${BASE_URL}/list.json`,
  REPORT_DETAIL: (id) => `${BASE_URL}/detail-${id}.json`,
  BOOKMARKED_REPORT_LIST: `${BASE_URL}/list.json`,
  REPORT_DETAIL_COMMENTS: (reportId) => `${BASE_URL}/detail-${reportId}-comments.json`,
};

export async function getMyUserInfo() {
  const fetchResponse = await fetch(ENDPOINTS.MY_USER_INFO);
  return await fetchResponse.json();
}

export async function getAllReports() {
  const fetchResponse = await fetch(ENDPOINTS.REPORT_LIST);
  return await fetchResponse.json();
}

export async function getReportById(id) {
  const fetchResponse = await fetch(ENDPOINTS.REPORT_DETAIL(id));
  return await fetchResponse.json();
}

export async function getAllBookmarkedReports() {
  const fetchResponse = await fetch(ENDPOINTS.BOOKMARKED_REPORT_LIST);
  return await fetchResponse.json();
}

export async function getAllCommentsByReportId(reportId) {
  const fetchResponse = await fetch(ENDPOINTS.REPORT_DETAIL_COMMENTS(reportId));
  return await fetchResponse.json();
}
