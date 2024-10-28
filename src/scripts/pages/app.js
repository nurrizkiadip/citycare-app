import {
  parseActiveUrl,
  parseAndCombineActiveUrl,
  parseAndCombineUrl,
  parseUrl,
} from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate
} from '../utils/templates';
import { getAccessToken, getLogout } from '../utils/auth';
import { transitionHelper } from '../utils';
import routes from '../routes/routes';

class App {
  _currentPath = null;

  constructor({ drawerNavigation, drawerButton, content }) {
    this._currentPath = window.location.hash.slice(1).toLowerCase();
    this._content = content;
    this._drawerButton = drawerButton;
    this._drawerNavigation = drawerNavigation;

    this._setupDrawer();
  }

  _setupDrawer() {
    this._drawerButton.addEventListener('click', () => {
      this._drawerNavigation.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this._drawerNavigation.contains(event.target) && !this._drawerButton.contains(event.target)) {
        this._drawerNavigation.classList.remove('open');
      }

      this._drawerNavigation.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this._drawerNavigation.classList.remove('open');
        }
      })
    });
  }

  _setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navListMain = this._drawerNavigation.children['navlist-main'];
    const navList = this._drawerNavigation.children['navlist'];

    // User not log in
    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.querySelector('#logout-button');
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();

      getLogout();

      window.location.hash = '/login';
    });
  }

  async renderPage() {
    const url = parseAndCombineActiveUrl();
    const route = routes[url] ?? null;

    // Check if route available
    if (!route) {
      window.location.hash = '/404';
      return;
    }

    // Get page instance
    const page = route();
    if (page) {
      const navigationType = this._getNavigationType();
      let targetThumbnail = null;

      if (navigationType === 'list-to-detail') {
        targetThumbnail = this._applyListToDetailNavigation();
      }

      const transition = transitionHelper({
        updateDOM: async () => {
          this._content.innerHTML = page.render();
          await page.afterRender();

          if (navigationType === 'detail-to-list') {
            targetThumbnail = this._applyDetailToListNavigation();
          }
        },
      });

      transition.updateCallbackDone.then(() => {
        window.scrollTo({ top: 0,behavior: 'instant' });
        this._setupNavigationList();
      });
      transition.finished.then(() => {
        // Clear the temporary tag
        this._cleanTransitionName(targetThumbnail);

        // Update current path after transition has been finished
        this._currentPath = window.location.hash.slice(1).toLowerCase();
      });
    }
  }

  _getNavigationType() {
    const fromPath = parseAndCombineUrl(this._currentPath);
    const toPath = parseAndCombineActiveUrl();

    const reportListPath = ['/', '/bookmark'];
    const reportDetailPath = ['/reports/:id'];

    if (reportListPath.includes(fromPath) && reportDetailPath.includes(toPath)) {
      return 'list-to-detail';
    }

    if (reportDetailPath.includes(fromPath) && reportListPath.includes(toPath)) {
      return 'detail-to-list';
    }

    return null;
  }

  _applyListToDetailNavigation() {
    const extractUrl = parseActiveUrl();

    const target = document.querySelector(`[data-reportid="${extractUrl.id}"]`);

    if (!target) {
      return null;
    }

    target.querySelector('.report-item__image').style.viewTransitionName = 'report-img';
    target.querySelector('.report-item__title').style.viewTransitionName = 'report-title';
    target.querySelector('.report-item__createdat').style.viewTransitionName = 'report-createdat';
    target.querySelector('.report-item__description').style.viewTransitionName = 'report-description';
    target.querySelector('.report-item__author').style.viewTransitionName = 'report-reporter';

    return target;
  }

  _applyDetailToListNavigation() {
    const extractUrl = parseUrl(this._currentPath);

    const target = document.querySelector(`[data-reportid="${extractUrl.id}"]`);

    if (!target) {
      return null;
    }

    target.querySelector('.report-item__image').style.viewTransitionName = 'report-img';
    target.querySelector('.report-item__title').style.viewTransitionName = 'report-title';
    target.querySelector('.report-item__createdat').style.viewTransitionName = 'report-createdat';
    target.querySelector('.report-item__description').style.viewTransitionName = 'report-description';
    target.querySelector('.report-item__author').style.viewTransitionName = 'report-reporter';

    return target;
  }

  _cleanTransitionName(targetThumbnail) {
    if (targetThumbnail) {
      targetThumbnail.querySelector('.report-item__image').style.viewTransitionName = '';
      targetThumbnail.querySelector('.report-item__title').style.viewTransitionName = '';
      targetThumbnail.querySelector('.report-item__createdat').style.viewTransitionName = '';
      targetThumbnail.querySelector('.report-item__description').style.viewTransitionName = '';
      targetThumbnail.querySelector('.report-item__author').style.viewTransitionName = '';
    }
  }
}

export default App;
