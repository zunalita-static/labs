(() => {
  'use strict';

  const SELF = document.currentScript;

  const LOCK = Symbol();
  if (window[LOCK]) return;
  Object.defineProperty(window, LOCK, { value: 1 });

  const HOST = location.hostname;
  const STORAGE_KEY = HOST + '_streak';
  const CACHE_NAME = HOST + '-streak-cache';
  const CACHE_REQ = new Request('https://' + HOST + '/__streak__');

  const NOW = Date.now();
  const DAY_MS = 86400000;
  const TODAY = new Date(NOW).toISOString().slice(0, 10);

  const FINGERPRINT =
    navigator.userAgent + '|' +
    navigator.language + '|' +
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const hash = (s) => {
    let h = 0;
    for (let i = 0; i < s.length; i++)
      h = (h << 5) - h + s.charCodeAt(i) | 0;
    return h;
  };

  const SECRET = String(hash(HOST + '|' + FINGERPRINT));

  const xor = (s, k) => {
    let o = '', kl = k.length;
    for (let i = 0; i < s.length; i++)
      o += String.fromCharCode(
        s.charCodeAt(i) ^ k.charCodeAt(i % kl)
      );
    return o;
  };

  const sign = (a, b) =>
    hash(a + '|' + b + '|' + FINGERPRINT);

  const encode = (o) =>
    btoa(btoa(xor(JSON.stringify(o), SECRET)));

  const decode = (s) =>
    JSON.parse(xor(atob(atob(s)), SECRET));

  const normalize = (d) => {
    if (!d || d.a <= 0 || d.a > 10000 || d.c !== sign(d.a, d.b))
      return { a: 1, b: TODAY, c: sign(1, TODAY) };

    if (d.b !== TODAY) {
      const diff = ((NOW - new Date(d.b)) / DAY_MS) | 0;
      d.a = diff === 1 ? d.a + 1 : 1;
      d.b = TODAY;
      d.c = sign(d.a, TODAY);
    }
    return d;
  };

  const expose = (data) => {
    Object.freeze(data);
    Object.defineProperty(window, 'dailyStreak', {
      get: () => data.a,
      enumerable: false,
      configurable: false
    });

    if (SELF && SELF.parentNode)
      SELF.parentNode.removeChild(SELF);
  };

  (async () => {
    let data;

    try {
      const cache = await caches.open(CACHE_NAME);
      const res = await cache.match(CACHE_REQ);
      data = normalize(res ? decode(await res.text()) : null);

      await cache.put(
        CACHE_REQ,
        new Response(encode(data), { headers: { 'Content-Type': 'text/plain' } })
      );

      expose(data);
      return;
    } catch {}

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) data = normalize(decode(raw));
    } catch {}

    data = normalize(data);
    localStorage.setItem(STORAGE_KEY, encode(data));
    expose(data);
  })();
})();
