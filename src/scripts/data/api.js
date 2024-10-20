import { getAccessToken } from '../utils/auth';

const BASE_URL = window.location.origin;

export const ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/register.json`,
  LOGIN: `${BASE_URL}/login.json`,
  MY_USER_INFO: `${BASE_URL}/my-user-info.json`,

  // Report
  REPORT_LIST: `${BASE_URL}/list.json`,
  REPORT_DETAIL: (id) => `${BASE_URL}/detail-${id}.json`,
  STORE_NEW_REPORT: `${BASE_URL}/new-report.json`,

  // Report Comment
  REPORT_COMMENTS_LIST: (reportId) => `${BASE_URL}/detail-${reportId}-comments.json`,
  STORE_NEW_REPORT_COMMENT: (reportId) => `${BASE_URL}/detail-${reportId}-new-comment.json`,
};

export async function getRegistered({ name, email, password}) {
  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    // method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // body: JSON.stringify({ name, email, password }),
  });
  return await fetchResponse.json();
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    // method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // body: data,
  });
  return await fetchResponse.json();
}

export async function getMyUserInfo() {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.MY_USER_INFO, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  return await fetchResponse.json();
}

export async function getAllReports() {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.REPORT_LIST, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  return await fetchResponse.json();
}

export async function getReportById(id) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.REPORT_DETAIL(id), {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  return await fetchResponse.json();
}

export async function storeNewReport({ title, damageLevel, description, evidenceImages, location }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({ title, damageLevel, description, evidenceImages, location });

  const fetchResponse = await fetch(ENDPOINTS.STORE_NEW_REPORT, {
    // method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    // body: data,
  });
  return await fetchResponse.json();
}

export async function getAllCommentsByReportId(reportId) {
  const accessToken = getAccessToken();

  const fetchResponse = await fetch(ENDPOINTS.REPORT_COMMENTS_LIST(reportId), {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  return await fetchResponse.json();
}

export async function storeNewCommentByReportId(reportId, { body }) {
  const accessToken = getAccessToken();
  const data = JSON.stringify({ body });

  const fetchResponse = await fetch(ENDPOINTS.STORE_NEW_REPORT_COMMENT(reportId), {
    // method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    // body: data,
  });
  return await fetchResponse.json();
}
