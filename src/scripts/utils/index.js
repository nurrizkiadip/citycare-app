export const showFormattedDate = (date, locale = 'en-US') => {
  return new Date(date).toLocaleDateString(locale, {
    // weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export function diffDate(laterDate, earlierDate = new Date()) {
  return earlierDate.getTime() - new Date(laterDate).getTime();
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function getPosition(options = null) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  })
}
