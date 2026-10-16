// Checks that scripts/serve.mjs reproduces the vercel.json behaviour the site relies on.
// Run with: node --test tests/*.test.mjs
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHandler } from '../scripts/serve.mjs';

let server;
let base;

before(async () => {
  server = createServer(await createHandler());
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

const get = (path, init) => fetch(base + path, { redirect: 'manual', ...init });

test('serves index with site-wide security headers', async () => {
  const res = await get('/');
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
});

test('applies path-specific Cache-Control rules', async () => {
  const css = await get('/css/style.css');
  assert.equal(css.status, 200);
  assert.equal(css.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  const icon = await get('/favicon.svg');
  assert.equal(icon.headers.get('cache-control'), 'public, max-age=86400');
});

test('redirects retired journal URLs permanently', async () => {
  const res = await get('/journal');
  assert.equal(res.status, 308);
  assert.equal(res.headers.get('location'), '/');
});

test('rewrites garden routes', async () => {
  const garden = await get('/garden');
  assert.equal(garden.status, 200);
  assert.equal(await garden.text(), await (await get('/garden.html')).text());
  const channel = await get('/garden/some-slug/');
  assert.equal(channel.status, 200);
  assert.equal(await channel.text(), await (await get('/garden/_channel.html')).text());
});

test('rejects path traversal and unknown files', async () => {
  assert.equal((await get('/%2e%2e/%2e%2e/etc/passwd')).status, 404);
  assert.equal((await get('/does-not-exist.html')).status, 404);
});

test('rejects methods other than GET and HEAD', async () => {
  assert.equal((await get('/', { method: 'POST' })).status, 405);
  assert.equal((await get('/', { method: 'HEAD' })).status, 200);
});

test('/api/og validates input and blocks private hosts', async () => {
  const missing = await get('/api/og');
  assert.equal(missing.status, 400);
  assert.deepEqual(await missing.json(), { ok: false, error: 'missing_url' });
  for (const target of ['https://localhost/', 'https://10.6.0.5/', 'https://127.0.0.1:8080/']) {
    const res = await get(`/api/og?url=${encodeURIComponent(target)}`);
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'blocked_host');
  }
  const http = await get(`/api/og?url=${encodeURIComponent('http://example.com/')}`);
  assert.equal((await http.json()).error, 'blocked_protocol');
});
