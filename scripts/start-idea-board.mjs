import { createServer, request as proxyRequest } from 'node:http';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ideaBoardDirectory = resolve(root, 'apps/idea-board');
const upstreamPort = 3000;
const publicPort = 5000;
let shuttingDown = false;

const ideaBoardProcess = spawn(process.execPath, ['server.js'], {
  cwd: ideaBoardDirectory,
  stdio: 'inherit',
});

const proxy = createServer((incoming, outgoing) => {
  const upstream = proxyRequest({
    hostname: '127.0.0.1',
    port: upstreamPort,
    path: incoming.url,
    method: incoming.method,
    headers: { ...incoming.headers, host: `127.0.0.1:${upstreamPort}` },
  }, (response) => {
    outgoing.writeHead(response.statusCode ?? 502, response.headers);
    response.pipe(outgoing);
  });

  upstream.on('error', (error) => {
    if (!outgoing.headersSent) outgoing.writeHead(502, { 'content-type': 'text/plain' });
    outgoing.end(`Idea-Board upstream unavailable: ${error.message}`);
  });

  incoming.pipe(upstream);
});

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  proxy.close(() => {
    if (!ideaBoardProcess.killed) ideaBoardProcess.kill('SIGTERM');
    process.exit(exitCode);
  });
}

ideaBoardProcess.on('error', (error) => {
  console.error(`Unable to start Idea-Board: ${error.message}`);
  shutdown(1);
});

ideaBoardProcess.on('exit', (code) => {
  if (!shuttingDown) shutdown(code ?? 1);
});

proxy.listen(publicPort, '0.0.0.0', () => {
  console.log(`Idea-Board public proxy listening on port ${publicPort}; upstream remains on port ${upstreamPort}`);
});

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
