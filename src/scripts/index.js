import '../styles/styles.css';
import '../styles/responsives.css';
import 'leaflet/dist/leaflet.css';

import App from './pages/app';
import { setupSkipToContent } from './utils';

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

  setupSkipToContent(skipLinkButton, content);
});

window.addEventListener('hashchange', async () => {
  await app.renderPage();
});
