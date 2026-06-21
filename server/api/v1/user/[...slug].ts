export default defineEventHandler((event) => {
  const url = getRequestURL(event);

  const req = toWebRequest(event);
  const headers = new Headers(req.headers);
  for (const key of Array.from(headers.keys())) {
    const lower = key.toLowerCase();
    if (
      lower.startsWith('cf-') ||
      lower.startsWith('x-forwarded-') ||
      [
        'forwarded',
        'host',
        'x-real-ip',
        'true-client-ip',
        'x-client-ip',
        'fastly-client-ip',
        'content-length'
      ].includes(lower)
    ) {
      headers.delete(key);
    }
  }
  headers.set('origin', 'https://mypikpak.com');
  headers.set('referer', 'https://mypikpak.com/');
  headers.set('user-agent', 'ANDROID-com.pikcloud.pikpak/1.21.0');

  const pathname = url.pathname.slice('/api'.length);

  return fetch(`https://user.mypikpak.com${pathname}${url.search}`, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body
  });
});
