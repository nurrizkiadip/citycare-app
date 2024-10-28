import { parseAndCombineActiveUrl } from '../routes/url-parser';
import CONFIG from '../config';

const unauthenticatedRoutesOnly = [
  '/login',
  '/register',
];

export function checkUnauthenticatedRouteOnly(callback) {
  const url = parseAndCombineActiveUrl();
  const isLogin = !!getAccessToken();

  if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
    window.location.hash = '/';
    return null;
  }

  return callback;
}

export function checkAuthenticatedRoute(callback) {
  const isLogin = !!getAccessToken();

  if (!isLogin) {
    window.location.hash = '/login';
    return null;
  }

  return callback;
}

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
    return accessToken === 'null' || accessToken === 'undefined'
      ? null
      : accessToken;
  } catch {
    console.error('Gagal mendapatkan access token');
    return null;
  }
}

export function putAccessToken(token) {
  try {
    localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, token);
    return true;
  } catch {
    console.error('Gagal menyimpan access token');
    return false;
  }
}

export function getLogout() {
  try {
    localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
    return true;
  } catch {
    console.error('Gagal menyimpan menghapus access token');
    return false;
  }
}
