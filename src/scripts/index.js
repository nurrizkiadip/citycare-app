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

const app = new App({
  content: document.querySelector('#main-content'),
  drawerButton: document.querySelector('#drawer-button'),
  drawerNavigation: document.querySelector('#navigation-drawer'),
});

document.addEventListener('DOMContentLoaded', async () => {
  await registerServiceWorker();

  await app.renderPage();
});

window.addEventListener('hashchange', async () => {
  await app.renderPage();

  // Stop all active media
  Camera.stopAllStreams();
});
