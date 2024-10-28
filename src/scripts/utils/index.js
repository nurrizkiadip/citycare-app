import { Workbox } from 'workbox-window';
import {
  generateDamageLevelMinorTemplate,
  generateDamageLevelModerateTemplate,
  generateDamageLevelSevereTemplate
} from './templates';
import { tns } from 'tiny-slider';
import CONFIG from "../config";

export function transitionHelper({ skipTransition = false, updateDOM }) {
  if (typeof updateDOM !== 'function') {
    throw new Error('updateDOM must be a function');
  }

  if (skipTransition || !('startViewTransition' in window.document)) {
    const updateCallbackDone = Promise
      .resolve(updateDOM())
      .then(() => undefined);

    return {
      ready: Promise.reject(Error('Browser ini tidak mendukung View transitions API.')),
      updateCallbackDone,
      finished: updateCallbackDone,
    };
  }

  return window.document.startViewTransition(updateDOM);
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('Browser ini tidak mendukung Service Worker API.');
    return;
  }

  try {
    const wb = new Workbox('/sw.bundle.js');
    const registrations = await wb.register();
    console.log('Service worker telah terpasang');

    registrations.onupdatefound = () => {
      console.log('Ada service worker baru yang sedang dipasang:', registrations.installing);
    };
  } catch (error) {
    console.log('Gagal memasang service worker', error);
  }
}

export function setupSkipToContent(element, mainContent) {
  element.addEventListener('click', () => mainContent.focus());
}

export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function generateDamageLevelBadge(damageLevel) {
  if (damageLevel === 'minor') {
    return generateDamageLevelMinorTemplate();
  }

  if (damageLevel === 'moderate') {
    return generateDamageLevelModerateTemplate();
  }

  if (damageLevel === 'severe') {
    return generateDamageLevelSevereTemplate();
  }

  return '';
}

export function diffDate(laterDate, earlierDate = new Date()) {
  return earlierDate.getTime() - new Date(laterDate).getTime();
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  })
}

export function createCarousel(containerElement, options = {}) {
  return tns({
    container: containerElement,
    mouseDrag: true,
    swipeAngle: false,
    speed: 600,

    nav: true,
    navPosition: 'bottom',

    autoplay: false,
    controls: false,

    ...options,
  });
}

export async function getPlaceNameByCoordinate(latitude, longitude) {
  const url = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${CONFIG.MAP_SERVICE_API_KEY}`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    const place = json.features[0].place_name_id.split(', ');
    return [place.at(-2), place.at(-1)].map((name) => name).join(', ');
  } catch {
    console.error('Gagal mendapatkan nama lokasi');
    return `${latitude},${longitude}`;
  }
}
