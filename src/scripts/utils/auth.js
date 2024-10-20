import routes from '../routes/routes';
import { parseAndCombineActiveUrl } from '../routes/url-parser';

const ACCESS_TOKEN_KEY = 'accessToken';

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
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  return accessToken === 'null' || accessToken === 'undefined' ? null : accessToken;
}

export function putAccessToken(token) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

export function getLogout() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.log('Error:', error);
    return false;
  }
}
