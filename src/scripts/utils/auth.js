import { parseAndCombineActiveUrl } from '../routes/url-parser';
import CONFIG from '../config';

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
    return accessToken === 'null' || accessToken === 'undefined'
      ? null
      : accessToken;
  } catch (error) {
    console.error('getAccessToken: error:', error);
    return null;
  }
}

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

export function putAccessToken(token) {
  try {
    localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('putAccessToken: error:', error);
    return false;
  }
}

export function getLogout() {
  try {
    localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('getLogout: error:', error);
    return false;
  }
}
