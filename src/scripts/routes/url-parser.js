function extractUrlSegments(url) {
  const splitUrl = url.split('/');

  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
  };
}

function combineUrlSegments(urlSegments) {
  let url = '';

  if (urlSegments.resource) {
    url = url.concat(`/${urlSegments.resource}`);
  }

  if (urlSegments.id) {
    url = url.concat('/:id');
  }

  return url || '/';
}

export function parseAndCombineActiveUrl() {
  const url = window.location.hash.slice(1).toLowerCase();
  const urlSegments = extractUrlSegments(url);
  return combineUrlSegments(urlSegments);
}

export function parseActiveUrl() {
  const url = window.location.hash.slice(1).toLowerCase();
  return extractUrlSegments(url);
}
