import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute, Route } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

// Do precaching
const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

registerRoute(new Route(
  ({ request }) => {
    return request.destination === 'font';
  },
  new CacheFirst({
    cacheName: 'fonts',
  }),
));

registerRoute(new Route(
  ({ url }) => {
    return url.href.endsWith('.json');
  },
  new StaleWhileRevalidate({
    cacheName: 'json',
  }),
));

const BASE_URL = 'https://citycare-api.dicoding.dev/v1';
registerRoute(new Route(
  ({ url }) => {
    return url.href.startsWith(BASE_URL);
  },
  new StaleWhileRevalidate({
    cacheName: 'api',
  }),
));

registerRoute(new Route(
  ({ request, url }) => {
    return request.destination === 'image' && !url.href.startsWith('https://tile.openstreetmap.org');
  },
  new StaleWhileRevalidate({
    cacheName: 'images',
  }),
));

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
