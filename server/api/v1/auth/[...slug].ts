export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const req = toWebRequest(event);
  req.headers.set('origin', 'https://mypikpak.com');
  req.headers.set('referer', 'https://mypikpak.com/');
  const pathname = url.pathname.slice('/api'.length);
  return fetch(`https://user.mypikpak.com${pathname}${url.search}`, req);
});
