export const jsonContentTypes = [
  'application/json',
  'application/vnd.api+json'
];

export const noop = () => {};

export const apiRequest = (url, accessToken, options = {}) => {
  const allOptions = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/vnd.api+json'
    },
    ...options
  };

  return fetch(url, allOptions)
    .then(res => {
      if (res.status >= 200 && res.status < 300) {
        if (jsonContentTypes.indexOf(res.headers.get('Content-Type')) > -1) {
          return res.json();
        }

        return res;
      }

      const e = new Error(res.statusText);
      e.response = res;
      throw e;
    });
};