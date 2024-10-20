import HomePage from '../pages/home/home-page';
import ReportDetailPage from '../pages/report-detail/report-detail-page';
import NewPage from '../pages/new/new-page';
import BookmarkPage from '../pages/bookmark/bookmark-page';
import NotFoundPage from '../pages/notfound/not-found-page';
import RegisterPage from '../pages/auth/register/register-page';
import LoginPage from '../pages/auth/login/login-page';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';

const routes = {
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),

  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/new': () => checkAuthenticatedRoute(new NewPage()),
  '/reports/:id': () => checkAuthenticatedRoute(new ReportDetailPage()),
  '/bookmark': () => checkAuthenticatedRoute(new BookmarkPage()),
  '/404': () => new NotFoundPage(),
};

export default routes;
