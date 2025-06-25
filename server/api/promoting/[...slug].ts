export default defineEventHandler((event) => {
  const url = getRequestURL(event);

  const req = toWebRequest(event);
  req.headers.set('origin', 'https://mypikpak.com');
  req.headers.set('referer', 'https://mypikpak.com/');
  req.headers.set('user-agent', 'ANDROID-com.pikcloud.pikpak/1.21.0');

  const pathname = url.pathname.slice('/api'.length);
  return fetch(`https://api-drive.mypikpak.com${pathname}${url.search}`, req);
});
