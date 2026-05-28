const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const root = __dirname;
const workspaceRoot = path.resolve(root, '..');

function loadEnvFile() {
  try {
    const envPath = fs.existsSync(path.join(root, '.env'))
      ? path.join(root, '.env')
      : path.join(workspaceRoot, '.env');
    const env = fs.readFileSync(envPath, 'utf8');
    for (const line of env.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const index = trimmed.indexOf('=');
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // Local configuration is optional.
  }
}

loadEnvFile();

const port = Number(process.env.PORT || 3000);
const anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
]);

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function handleConfig(res) {
  sendJson(res, 200, {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  });
}

async function readBody(req) {
  return (await readRawBody(req)).toString('utf8');
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function handleChat(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    sendJson(res, 503, {
      error: 'Set ANTHROPIC_API_KEY in your environment to enable EatMap AI.',
    });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON request.' });
    return;
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: anthropicModel,
        max_tokens: 1000,
        system: payload.system,
        messages: payload.messages,
      }),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      sendJson(res, upstream.status, {
        error: data.error?.message || 'EatMap AI could not answer right now.',
      });
      return;
    }

    sendJson(res, 200, data);
  } catch {
    sendJson(res, 502, { error: 'EatMap AI is temporarily unreachable.' });
  }
}

async function proxyBackend(req, res) {
  const target = new URL(req.url, backendUrl);
  try {
    const headers = { ...req.headers, host: target.host };
    delete headers['content-length'];
    const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : await readRawBody(req);
    const upstream = await fetch(target, { method: req.method, headers, body });
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.writeHead(upstream.status, Object.fromEntries(upstream.headers.entries()));
    res.end(buffer);
  } catch {
    sendJson(res, 502, { error: 'EatMap backend is not reachable. Start FastAPI on port 8000.' });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const requested = url.pathname === '/' ? '/eatmap.html' : decodeURIComponent(url.pathname);
  const filePath = path.resolve(root, `.${requested}`);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const body = await fsp.readFile(filePath);
    res.writeHead(200, {
      'Content-Type': contentTypes.get(path.extname(filePath)) || 'application/octet-stream',
    });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer((req, res) => {
  if (req.url?.startsWith('/api/chat')) {
    handleChat(req, res);
    return;
  }
  if (req.url?.startsWith('/api/config')) {
    handleConfig(res);
    return;
  }
  if (req.url?.startsWith('/api/v1/')) {
    proxyBackend(req, res);
    return;
  }

  serveStatic(req, res);
});

server.listen(port, () => {
  console.log(`EatMap is running at http://localhost:${port}`);
});
