import HomePage from '../pages/home/home-page';
import ReportDetailPage from '../pages/report-detail/report-detail-page';
import NewPage from '../pages/new/new-page';
import BookmarkPage from '../pages/bookmark/bookmark-page';
import NotFoundPage from '../pages/notfound/not-found-page';

const routes = {
  '/': new HomePage(),
  '/new': new NewPage(),
  '/reports/:id': new ReportDetailPage(),
  '/bookmark': new BookmarkPage(),
  '/404': new NotFoundPage(),
};

export default routes;
