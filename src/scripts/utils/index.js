// This helper function returns a View-Transition-like object, even for browsers that don't support view transitions.
// It won't do the transition in unsupported browsers, it'll act as if the transition is skipped.
// It also makes it easier to add class names to the document element.
export function transitionHelper({ skipTransition = false, classNames = '', updateDOM }) {
  if (skipTransition || !document.startViewTransition) {
    const updateCallbackDone = Promise.resolve(updateDOM()).then(() => undefined);

    return {
      ready: Promise.reject(Error('View transitions unsupported')),
      domUpdated: updateCallbackDone,
      updateCallbackDone,
      finished: updateCallbackDone,
    };
  }

  const classNamesArray = classNames.split(/\s+/g).filter(Boolean);

  document.documentElement.classList.add(...classNamesArray);

  const transition = document.startViewTransition(updateDOM);

  transition.finished.finally(() =>
    document.documentElement.classList.remove(...classNamesArray)
  );

  return transition;
}

export function setupSkipToContent(element, mainContent) {
  element.addEventListener('click', () => mainContent.focus());
}

export const showFormattedDate = (date, locale = 'en-US', options = {}) => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
};

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
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
  })
}
