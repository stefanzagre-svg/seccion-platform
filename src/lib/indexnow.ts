import https from 'https';

const KEY = '3494ecd5e6206c859de1ef5dbd62f452';
const HOST = 'seccion.ai';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

export async function submitToIndexNow(urls: string[]): Promise<{ status: number; message: string }> {
  const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      'https://api.indexnow.org/indexnow',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(payload)
        }
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode || 200,
            message: data || (res.statusCode === 200 || res.statusCode === 202 ? 'URLs submitted successfully to IndexNow' : 'Submission error')
          });
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
}
