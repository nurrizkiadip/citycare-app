import { parseActiveUrl, parseAndCombineActiveUrl, parseAndCombineUrl, parseUrl } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationList,
  generateMainNavigationList,
  generateUnauthenticatedNavigationList
} from '../../templates';
import { getAccessToken, getLogout } from '../utils/auth';
import { transitionHelper } from '../utils';
import routes from '../routes/routes';
import feather from 'feather-icons';

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
    });
  }

  _setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navListMain = this._drawerNavigation.children['navlist-main'];
    const navList = this._drawerNavigation.children['navlist'];

    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationList();
      return;
    }

    navListMain.innerHTML = generateMainNavigationList();
    navList.innerHTML = generateAuthenticatedNavigationList();

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
        const extractUrl = parseActiveUrl();
        targetThumbnail = document.querySelector(`[data-reportid="${extractUrl.id}"]`);
        if (targetThumbnail) {
          targetThumbnail.querySelector('img').style.viewTransitionName = 'report-img';
        }
      }

      const transition = transitionHelper({
        updateDOM: async () => {
          this._content.innerHTML = page.render();
          await page.afterRender();

          if (navigationType === 'detail-to-list') {
            const extractUrl = parseUrl(this._currentPath);
            targetThumbnail = document.querySelector(`[data-reportid="${extractUrl.id}"]`);
            if (targetThumbnail) {
              targetThumbnail.querySelector('img').style.viewTransitionName = 'report-img';
            }
          }
        },
      });

      transition.updateCallbackDone.then(() => {
        this._setupNavigationList();
        feather.replace();
      });
      transition.finished.then(() => {
        // Clear the temporary tag
        if (targetThumbnail) {
          targetThumbnail.style.viewTransitionName = '';
        }

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
}

export default App;
