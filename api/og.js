// api/og.js
'use strict';

const FETCH_TIMEOUT_MS = 5000;
const MAX_BYTES = 1_000_000;
const MAX_REDIRECTS = 3;
const UA = 'Mozilla/5.0 (compatible; jaeggerjose-og-fetch/1.0; +https://www.jaeggerjose.com)';

const PRIVATE_CIDRS = [
  /^10\./, /^127\./, /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./, /^192\.0\.0\./, /^0\./,
];

function isPrivateIp(addr) {
  if (!addr) return true;
  if (PRIVATE_CIDRS.some(re => re.test(addr))) return true;
  if (addr === '::1' || addr === '::') return true;
  if (/^fe80:/i.test(addr) || /^fc[0-9a-f]{2}:/i.test(addr) || /^fd[0-9a-f]{2}:/i.test(addr)) return true;
  if (/^::ffff:/i.test(addr)) {
    const v4 = addr.replace(/^::ffff:/i, '');
    return PRIVATE_CIDRS.some(re => re.test(v4));
  }
  return false;
}

async function isPrivateHost(hostname) {
  const dns = require('dns').promises;
  if (/^localhost$|\.localhost$|\.local$|\.internal$/i.test(hostname)) return true;
  try {
    const addrs = await dns.lookup(hostname, { all: true });
    return addrs.some(a => isPrivateIp(a.address));
  } catch {
    return true;
  }
}

async function fetchWithLimits(url, redirectsLeft = MAX_REDIRECTS) {
  const u = new URL(url);
  if (u.protocol !== 'https:') throw new Error('blocked_protocol');
  if (await isPrivateHost(u.hostname)) throw new Error('blocked_host');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'manual',
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml' },
    });
  } finally {
    clearTimeout(timer);
  }

  if (res.status >= 300 && res.status < 400) {
    if (redirectsLeft <= 0) throw new Error('too_many_redirects');
    const loc = res.headers.get('location');
    if (!loc) throw new Error('redirect_no_location');
    return fetchWithLimits(new URL(loc, url).toString(), redirectsLeft - 1);
  }
  if (!res.ok) throw new Error('fetch_failed_' + res.status);

  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.length;
    if (received > MAX_BYTES) { try { reader.cancel(); } catch {} break; }
    chunks.push(value);
  }
  const buf = Buffer.concat(chunks.map(c => Buffer.from(c)));
  return { url, html: buf.toString('utf-8', 0, Math.min(buf.length, MAX_BYTES)) };
}

function decodeHtml(s) {
  if (!s) return s;
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
}

function metaContent(html, propName) {
  const safeName = propName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // property/name then content
  let re = new RegExp('<meta[^>]+(?:property|name)=["\\\']' + safeName + '["\\\'][^>]+content=["\\\']([^"\\\']+)', 'i');
  let m = html.match(re);
  if (m) return m[1].trim();
  // content then property/name
  re = new RegExp('<meta[^>]+content=["\\\']([^"\\\']+)["\\\'][^>]+(?:property|name)=["\\\']' + safeName, 'i');
  m = html.match(re);
  return m ? m[1].trim() : null;
}

function firstMatch(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function parseMeta(html, finalUrl) {
  const titleTag = firstMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const canonical = firstMatch(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const iconHref  = firstMatch(html, /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i);

  const abs = (u) => { if (!u) return null; try { return new URL(u, finalUrl).toString(); } catch { return null; } };

  return {
    title:       decodeHtml(metaContent(html, 'og:title') || titleTag),
    description: decodeHtml(metaContent(html, 'og:description') || metaContent(html, 'description')),
    image:       abs(metaContent(html, 'og:image') || iconHref),
    site_name:   decodeHtml(metaContent(html, 'og:site_name')) || new URL(finalUrl).host,
    canonical:   abs(canonical) || finalUrl,
  };
}

module.exports = async function handler(req, res) {
  const url = req.query && req.query.url;
  if (!url) return res.status(400).json({ ok: false, error: 'missing_url' });

  let target;
  try { target = new URL(url); }
  catch { return res.status(400).json({ ok: false, error: 'invalid_url' }); }
  if (target.protocol !== 'https:') {
    return res.status(400).json({ ok: false, error: 'blocked_protocol' });
  }

  try {
    if (await isPrivateHost(target.hostname)) {
      return res.status(400).json({ ok: false, error: 'blocked_host' });
    }
    const fetched = await fetchWithLimits(target.toString());
    const meta = parseMeta(fetched.html, fetched.url);
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.json({ ok: true, ...meta });
  } catch (err) {
    return res.status(400).json({ ok: false, error: String(err.message || err) });
  }
};
