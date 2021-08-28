import * as https from 'https';

export const fetchContent = (url: string) => {
  return new Promise<string>((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';
      response.on('data', (chunk) => data += chunk);
      response.on('end', () => resolve(data));

    }).on('error', (err) => reject(err));
  });
};
