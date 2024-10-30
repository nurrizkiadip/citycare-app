export function checkAvailability() {
  return 'Notification' in window;
}

export function checkPermission() {
  return Notification.permission === 'granted';
}

export async function isNotificationReady() {
  if (!checkAvailability()) {
    console.log('Notification API tidak didukung oleh browser ini.');
    return false;
  }

  if (checkPermission()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === 'denied') {
    window.alert('Tidak bisa menerima notifikasi karena perizinan notification ditolak.');
    return false;
  }

  if (status === 'default') {
    window.alert('Tidak bisa menerima notifikasi karena perizinan notification diabaikan.');
    return false;
  }

  return true;
}

export async function showNotification({ title, options }) {
  const serviceWorkerRegistration = await navigator.serviceWorker.getRegistration();
  await serviceWorkerRegistration.showNotification(title, options);
}

export async function sendNotification({ title, options }) {
  try {
    if (!await isNotificationReady()) {
      console.log('Notification permission belum disetujui pengguna.');
      return;
    }

    await showNotification({ title, options });
  } catch (error) {
    console.error('sendNotification: error:', error);
  }
}
