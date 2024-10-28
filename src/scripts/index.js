// CSS imports
import '../styles/styles.css';
import '../styles/responsives.css';
import 'leaflet/dist/leaflet.css';
import '@maptiler/geocoding-control/style.css';
import 'tiny-slider/dist/tiny-slider.css';

// Components
import { registerServiceWorker, setupSkipToContent } from './utils';
import App from './pages/app';
import Camera from './utils/camera';

const skipLinkButton = document.querySelector('#skip-link');
const content = document.querySelector('#maincontent');
const drawerButton = document.querySelector('#drawer-button');
const drawerNavigation = document.querySelector('#navigation-drawer');

const app = new App({
  content,
  drawerButton,
  drawerNavigation,
});

document.addEventListener('DOMContentLoaded', async () => {
  await app.renderPage();

  window.currentStreams = [];

  setupSkipToContent(skipLinkButton, content);
  await registerServiceWorker();
});

window.addEventListener('hashchange', async () => {
  await app.renderPage();

  // Stop all active media
  Camera.stopAllStreams();
});
