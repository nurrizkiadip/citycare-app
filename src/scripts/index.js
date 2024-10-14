import 'leaflet/dist/leaflet.css';
import '../styles/styles.css';

import App from './pages/app';

const content = document.querySelector('#maincontent');
const drawerButton = document.querySelector('#drawerbutton');
const drawerNavigation = document.querySelector('#navlist');

const app = new App({
  content,
  drawerButton,
  drawerNavigation,
});

document.addEventListener('DOMContentLoaded', async () => {
  await app.renderPage();
});

window.addEventListener('hashchange', async () => {
  await app.renderPage();
});
