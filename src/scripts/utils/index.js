import { Workbox } from 'workbox-window';
import {
  generateDamageLevelMinorTemplate,
  generateDamageLevelModerateTemplate,
  generateDamageLevelSevereTemplate
} from './templates';
import { tns } from 'tiny-slider';

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

export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
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

export function isGeolocationAvailable() {
  return 'geolocation' in navigator;
}

export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!isGeolocationAvailable()) {
      reject('Geolocation API tidak didukung oleh browser ini.');
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/**
 * Ref: https://stackoverflow.com/questions/18650168/convert-blob-to-base64
 */
export function convertBlobToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Ref: https://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 */
export function convertBase64ToBlob(base64Data, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

export function convertBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
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
