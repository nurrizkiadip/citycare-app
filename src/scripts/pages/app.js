import {
  parseActiveUrl,
  parseAndCombineActiveUrl,
  parseAndCombineUrl,
  parseUrl,
} from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate, generateSubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate, generateUnsubscribeButtonTemplate,
} from '../utils/templates';
import {
  convertBase64ToUint8Array,
  isServiceWorkerAvailable,
  setupSkipToContent,
  transitionHelper,
} from '../utils';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';
import { getAccessToken, getLogout } from '../utils/auth';
import { isNotificationReady } from '../utils/notification-helper';
import routes from '../routes/routes';
import CONFIG from '../config';

export default class App {
  constructor({ drawerNavigation, drawerButton, content }) {
    this._content = content;
    this._drawerButton = drawerButton;
    this._drawerNavigation = drawerNavigation;

    this._currentPath = window.location.hash.slice(1);

    setupSkipToContent(document.querySelector('#skip-link'), content);
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
      });
    });
  }

  _setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navListMain = this._drawerNavigation.children.namedItem('navlist-main');
    const navList = this._drawerNavigation.children.namedItem('navlist');

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

  async _setupPushNotification() {
    const pushNotificationTools = document.querySelector('#push-notification-tools');

    const isSubscribed = await this._isCurrentSubscriptionAvailable();
    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document.querySelector('#unsubscribe-button').addEventListener('click', () => {
        this._unsubscribe();
      });

      return;
    }

    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
    document.querySelector('#subscribe-button').addEventListener('click', () => {
      this._subscribe();
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
        window.scrollTo({ top: 0, behavior: 'instant' });
        this._setupNavigationList();

        if (isServiceWorkerAvailable()) {
          this._setupPushNotification();
        }
      });
      transition.finished.then(() => {
        // Clear the temporary tag
        this._cleanTransitionName(targetThumbnail);

        // Update current path after transition has been finished
        this._currentPath = window.location.hash.slice(1);
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

  async _subscribe() {
    if (await this._isCurrentSubscriptionAvailable()) {
      window.alert('Telah terdaftar untuk menerima notifikasi.');
      return;
    }

    if (!(await isNotificationReady())) {
      window.alert('Notification belum tersedia.');
      return;
    }

    console.log('Sedang mendaftar push notification...');
    const registrations = await navigator.serviceWorker.getRegistration();
    const pushSubscription = await registrations?.pushManager.subscribe(
      this._generateSubscribeOptions(),
    );

    if (!pushSubscription) {
      console.error('_subscribe: pushSubscription:', pushSubscription);
      return;
    }

    try {
      const { endpoint, expirationTime, keys } = pushSubscription.toJSON();
      const response = await subscribePushNotification({
        endpoint: endpoint,
        expirationTime: expirationTime,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      });

      if (!response.ok) {
        console.error('_subscribe: response:', response);
        window.alert('Gagal mendaftar push notification ke server.');

        // Undo to subscribing push notification
        await pushSubscription.unsubscribe();
        return;
      }

      console.log('Berhasil mendaftar push notification ke server.');
    } catch (error) {
      console.error('_subscribe: error:', error);
      window.alert('Gagal mendaftar push notification ke server.');

      // Undo to subscribing push notification
      await pushSubscription.unsubscribe();
    } finally {
      this._setupPushNotification();
    }
  }

  async _unsubscribe() {
    const registrations = await navigator.serviceWorker.getRegistration();
    const pushSubscription = await registrations?.pushManager.getSubscription();
    if (!pushSubscription) {
      console.error('Gagal memutus langganan karena belum berlangganan push notification.');
      return;
    }

    try {
      const { endpoint, expirationTime, keys } = pushSubscription.toJSON();
      const response = await unsubscribePushNotification({
        endpoint,
      });

      if (!response.ok) {
        console.error('_unsubscribe: response:', response);
        window.alert('Gagal memutus langganan push notification dari server.');
        return;
      }

      const isSuccessToUnsubscribe = await pushSubscription.unsubscribe();
      if (!isSuccessToUnsubscribe) {
        console.log('Gagal membatalkan langganan push message.');

        await subscribePushNotification({
          endpoint,
          expirationTime,
          keys: {
            p256dh: keys.p256dh,
            auth: keys.auth,
          },
        });
        return;
      }

      console.log('Berhasil memutus langganan push notification dari server.');
    } catch (error) {
      console.error('_unsubscribe: error:', error);
      window.alert('Gagal memutus langganan push notification dari server');
    } finally {
      this._setupPushNotification();
    }
  }

  async _isCurrentSubscriptionAvailable() {
    const registrations = await navigator.serviceWorker.getRegistration();
    return !!(await registrations?.pushManager.getSubscription());
  }

  _generateSubscribeOptions() {
    return {
      userVisibleOnly: true,
      applicationServerKey: convertBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
    };
  }
}
