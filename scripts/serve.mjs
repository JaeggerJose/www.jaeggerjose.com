// Static server that reproduces the vercel.json headers, redirects and rewrites, plus the
// /api/og function. SITE_ROOT points to the published files in production; the repository
// root is the default for local runs and tests.
// Usage: node scripts/serve.mjs [port]      default 4175
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFile, stat } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE_ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const ROOT = (process.env.SITE_ROOT ?? SOURCE_ROOT).replace(/[\\/]$/, '');
const DEFAULT_PORT = 4175;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};
const DEFAULT_CACHE = 'public, max-age=0, must-revalidate';

// Vercel source patterns: "(.*)" is a regex group, ":name" matches one path segment.
const toPattern = (source) =>
  new RegExp('^' + source.replace(/\.(?!\*)/g, '\\.').replace(/:\w+/g, '[^/]+') + '$');

function loadRules(vercel) {
  return {
    headers: vercel.headers.map((rule) => ({
      pattern: toPattern(rule.source),
      headers: Object.fromEntries(rule.headers.map((h) => [h.key, h.value])),
    })),
    redirects: vercel.redirects.map((r) => ({ ...r, pattern: toPattern(r.source) })),
    rewrites: vercel.rewrites.map((r) => ({ ...r, pattern: toPattern(r.source) })),
  };
}

// Supports the "host" condition of Vercel's `has` field, the only one vercel.json uses.
const hostMatches = (rule, host) =>
  (rule.has ?? []).every((cond) => cond.type === 'host' && cond.value === host);

function findRedirect(rules, pathname, host) {
  for (const rule of rules.redirects) {
    const match = rule.pattern.exec(pathname);
    if (match && hostMatches(rule, host)) {
      return { ...rule, location: rule.destination.replace(/\$(\d)/g, (_, i) => match[Number(i)] ?? '') };
    }
  }
  return null;
}

const headersFor = (rules, pathname) =>
  rules.headers
    .filter((rule) => rule.pattern.test(pathname))
    .reduce((acc, rule) => ({ ...acc, ...rule.headers }), {});

async function resolveFile(urlPath) {
  const file = normalize(join(ROOT, decodeURIComponent(urlPath)));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return null; // no ../ escapes
  const info = await stat(file).catch(() => null);
  if (info?.isDirectory()) return resolveFile(join(urlPath, 'index.html'));
  return info ? file : null;
}

// Adapts Node's response to the subset of the Vercel/Express API that api/og.js uses.
function vercelResponse(res, baseHeaders) {
  const api = {
    setHeader: (key, value) => (res.setHeader(key, value), api),
    status: (code) => ((res.statusCode = code), api),
    json: (body) => {
      res.writeHead(res.statusCode, { ...baseHeaders, 'Content-Type': TYPES['.json'] });
      res.end(JSON.stringify(body));
      return api;
    },
  };
  return api;
}

export async function createHandler() {
  const rules = loadRules(JSON.parse(await readFile(join(SOURCE_ROOT, 'vercel.json'), 'utf8')));
  const ogHandler = createRequire(import.meta.url)('../api/og.js');

  return async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const { pathname } = url;
    const headers = headersFor(rules, pathname);
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405, { ...headers, Allow: 'GET, HEAD' }).end();
        return;
      }
      const host = (req.headers.host ?? '').replace(/:\d+$/, '');
      const redirect = findRedirect(rules, pathname, host);
      if (redirect) {
        res.writeHead(redirect.permanent ? 308 : 307, { ...headers, Location: redirect.location + url.search }).end();
        return;
      }
      if (pathname === '/api/og') {
        await ogHandler({ query: Object.fromEntries(url.searchParams) }, vercelResponse(res, headers));
        return;
      }
      const rewrite = rules.rewrites.find((r) => r.pattern.test(pathname));
      const file = await resolveFile(rewrite ? rewrite.destination : pathname);
      if (!file) {
        res.writeHead(404, { ...headers, 'Content-Type': 'text/plain' }).end('not found');
        return;
      }
      const body = await readFile(file);
      res.writeHead(200, {
        'Cache-Control': DEFAULT_CACHE,
        ...headers,
        'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream',
      }).end(body);
    } catch (err) {
      console.error(`[serve] ${pathname}:`, err.message);
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('server error');
    }
  };
}

const isMain = process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const port = Number(process.argv[2] ?? process.env.PORT ?? DEFAULT_PORT);
  const handler = await createHandler();
  for (const host of (process.env.SITE_HOSTS ?? '127.0.0.1').split(',')) {
    createServer(handler).listen(port, host, () => console.log(`serving ${ROOT} at http://${host}:${port}/`));
  }
}
