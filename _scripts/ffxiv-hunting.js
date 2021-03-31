/*! FFXIV Hunting API Proxy | DSRKafuU (https://dsrkafuu.su) | Copyright (c) Apache-2.0 License */

// 数据来源
const SRC =
  'https://raw.githubusercontent.com/dsrkafuu/dsr-api/main/dsr-tools/ffxiv/index.min.json';
// 允许的 CORS 来源
const ALLOWED_ORIGIN = [/^https?:\/\/.*dsrkafuu\.su$/, /^https?:\/\/localhost/];
// 是否拒绝所有无 Origin 请求
const ALLOW_NO_ORIGIN = true;
// 缓存控制
const CACHE_CONTROL = 'public, no-cache, must-revalidate';

/**
 * 验证 Origin
 * @param {Request} req
 * @return {boolean}
 */
function validateOrigin(req) {
  const origin = req.headers.get('Origin');
  if (origin) {
    for (let i = 0; i < ALLOWED_ORIGIN.length; i++) {
      if (ALLOWED_ORIGIN[i].exec(origin)) {
        return true;
      }
    }
  }
  return ALLOW_NO_ORIGIN; // 是否拒绝所有无 Origin 请求
}

/**
 * 响应 CORS OPTIONS 请求
 * @param {Request} req 源请求
 * @return {Response}
 */
function handleOptions(req) {
  const rawOrigin = req.headers.get('Origin');
  const rawMethod = req.headers.get('Access-Control-Request-Method');
  const rawHeaders = req.headers.get('Access-Control-Request-Headers');

  const res = new Response(null, { status: 200 });
  res.headers.set('Access-Control-Allow-Origin', rawOrigin);
  rawMethod && res.headers.set('Access-Control-Allow-Methods', rawMethod);
  rawHeaders && res.headers.set('Access-Control-Allow-Headers', rawHeaders);
  res.headers.set('Access-Control-Max-Age', 86400);
  // 设置 Vary 头使浏览器正确进行缓存
  res.headers.append('Vary', 'Accept-Encoding');
  res.headers.append('Vary', 'Origin');
  return res;
}

/**
 * 响应 CORS 请求
 * @param {Request} req 源请求
 * @param {FetchEvent}} event CloudFlare fetch event
 * @return {Response}
 */
async function handleRequest(req, event) {
  const rawOrigin = req.headers.get('Origin');

  // 检查 cache
  const cache = caches.default;
  const cacheKey = new Request(new URL(req.url), req);
  let res = await cache.match(cacheKey);
  let cacheStatus = 'HIT';

  // 若未命中 cache
  if (!res) {
    cacheStatus = 'MISS';
    res = await fetch(SRC);
    event.waitUntil(cache.put(cacheKey, res.clone()));
  }

  // 响应
  res = new Response(res.body, res); // 覆盖响应 response 使其 muteable
  // cache 状态
  res.headers.set('X-CF-Cache-Status', cacheStatus);
  // CORS
  res.headers.set('Access-Control-Allow-Origin', rawOrigin || '*');
  res.headers.set('Cache-Control', CACHE_CONTROL);
  // 设置 Vary 头使浏览器正确进行缓存
  const vary = res.headers.get('Vary') || '';
  if (!vary.match(/[aA]ccept-[eE]ncoding/)) {
    res.headers.append('Vary', 'Accept-Encoding');
  }
  if (!vary.match(/[oO]rigin/)) {
    res.headers.append('Vary', 'Origin');
  }
  return res;
}

/**
 * 拒绝请求
 * @return {Response}
 */
async function handleReject() {
  return new Response('[CloudFlare Workers] REQUEST NOT ALLOWED', { status: 403 });
}

addEventListener('fetch', (event) => {
  // 获取请求的信息
  const req = event.request;
  // 验证
  const validOrigin = validateOrigin(req);
  if (validOrigin) {
    if (req.method === 'OPTIONS') {
      event.respondWith(handleOptions(req));
    } else {
      event.respondWith(handleRequest(req, event));
    }
  } else {
    event.respondWith(handleReject());
  }
});
