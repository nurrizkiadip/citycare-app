import { getActiveRoute } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateUnsubscribeButtonTemplate,
} from '../templates';
import {
  convertBase64ToUint8Array,
  isServiceWorkerAvailable,
  setupSkipToContent,
  transitionHelper,
} from '../utils';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';
import { getAccessToken, getLogout } from '../utils/auth';
import { isNotificationReady } from '../utils/notification-helper';
import { routes } from '../routes/routes';
import { VAPID_PUBLIC_KEY } from '../config';

export default class App {
  #content;
  #drawerButton;
  #drawerNavigation;
  #skipLinkButton;

  constructor({ content, drawerNavigation, drawerButton, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#drawerNavigation.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      const isTargetInsideDrawer = this.#drawerNavigation.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

      if (!(isTargetInsideDrawer || isTargetInsideButton)) {
        this.#drawerNavigation.classList.remove('open');
      }

      this.#drawerNavigation.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#drawerNavigation.classList.remove('open');
        }
      });
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navListMain = this.#drawerNavigation.children.namedItem('navlist-main');
    const navList = this.#drawerNavigation.children.namedItem('navlist');

    // User not log in
    if (!isLogin) {
      navListMain.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();

      getLogout();

      location.hash = '/login';
    });
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    const isSubscribed = await this.#isCurrentSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      document.getElementById('unsubscribe-button').addEventListener('click', () => {
        this.#unsubscribe();
      });
      return;
    }

    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
    document.getElementById('subscribe-button').addEventListener('click', () => {
      this.#subscribe();
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url] ?? null;

    // Check if route available
    if (!route) {
      location.hash = '/404';
      return;
    }

    // Get page instance
    const page = route();

    if (page) {
      const transition = transitionHelper({
        updateDOM: async () => {
          this.#content.innerHTML = await page.render();
          page.afterRender();
        },
      });

      transition.ready.catch(console.error);
      transition.updateCallbackDone.then(() => {
        scrollTo({ top: 0, behavior: 'instant' });
        this.#setupNavigationList();

        if (isServiceWorkerAvailable()) {
          this.#setupPushNotification();
        }
      });
    }
  }

  async #subscribe() {
    if (await this.#isCurrentSubscriptionAvailable()) {
      alert('Telah terdaftar untuk menerima notifikasi.');
      return;
    }

    if (!(await isNotificationReady())) {
      alert('Notification belum tersedia.');
      return;
    }

    console.log('Sedang mendaftar push notification...');

    const registrations = await navigator.serviceWorker.getRegistration();
    const pushSubscription = await registrations?.pushManager.subscribe(
      this.#generateSubscribeOptions(),
    );

    if (!pushSubscription) {
      console.error('#subscribe: pushSubscription:', pushSubscription);
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
        console.error('#subscribe: response:', response);
        alert('Gagal mendaftar push notification ke server.');

        // Undo to subscribing push notification
        await pushSubscription.unsubscribe();
        return;
      }

      console.log('Berhasil mendaftar push notification ke server.');
    } catch (error) {
      console.error('#subscribe: error:', error);
      alert('Gagal mendaftar push notification ke server.');

      // Undo to subscribing push notification
      await pushSubscription.unsubscribe();
    } finally {
      this.#setupPushNotification();
    }
  }

  async #unsubscribe() {
    const registrations = await navigator.serviceWorker.getRegistration();
    const pushSubscription = await registrations?.pushManager.getSubscription();

    if (!pushSubscription) {
      console.error('Gagal memutus langganan karena belum berlangganan push notification.');
      return;
    }

    try {
      const { endpoint, expirationTime, keys } = pushSubscription.toJSON();
      const response = await unsubscribePushNotification({ endpoint });

      if (!response.ok) {
        console.error('#unsubscribe: response:', response);
        alert('Gagal memutus langganan push notification dari server.');
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
      console.error('#unsubscribe: error:', error);
      alert('Gagal memutus langganan push notification dari server');
    } finally {
      this.#setupPushNotification();
    }
  }

  async #isCurrentSubscriptionAvailable() {
    const registrations = await navigator.serviceWorker.getRegistration();
    return !!(await registrations?.pushManager.getSubscription());
  }

  #generateSubscribeOptions() {
    return {
      userVisibleOnly: true,
      applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
    };
  }
}
