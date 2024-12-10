import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BASE_URL } from './config';

// Do precaching
const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

registerRoute(
  ({ request }) => {
    return request.destination === 'font';
  },
  new CacheFirst({
    cacheName: 'fonts',
  }),
);

registerRoute(
  ({ url }) => {
    return url.href.startsWith(BASE_URL);
  },
  new NetworkFirst({
    cacheName: 'api',
  }),
);

registerRoute(
  ({ request, url }) => {
    return request.destination === 'image' && url.href.startsWith(BASE_URL);
  },
  new StaleWhileRevalidate({
    cacheName: 'images',
  }),
);

self.addEventListener('push', (event) => {
  const chainPromise = async () => {
    const data = event.data.text();
    try {
      const json = JSON.parse(data);
      await self.registration.showNotification(json.title, {
        body: json.options.body,
      });
    } catch {
      await self.registration.showNotification('CityCare App', {
        body: data,
      });
    }
  };

  event.waitUntil(chainPromise());
});

self.addEventListener('notificationclick', (event) => {
  const chainPromise = async () => {
    console.log('Notification has been clicked');

    event.notification.close();

    await self.clients.openWindow('https://www.dicoding.com/');
  };

  event.waitUntil(chainPromise());
});
