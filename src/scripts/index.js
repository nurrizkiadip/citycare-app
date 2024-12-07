// CSS imports
import '../styles/styles.css';
import '../styles/responsives.css';
import 'leaflet/dist/leaflet.css';
import '@maptiler/geocoding-control/style.css';
import 'tiny-slider/dist/tiny-slider.css';

// Components
import { registerServiceWorker } from './utils';
import App from './pages/app';
import Camera from './utils/camera';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    drawerNavigation: document.getElementById('navigation-drawer'),
    skipLinkButton: document.getElementById('skip-link'),
  });
  await app.renderPage();

  await registerServiceWorker();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();

    // Stop all active media
    Camera.stopAllStreams();
  });
});
