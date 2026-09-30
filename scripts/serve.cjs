const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = http.createServer((request, response) => {
  let file;
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(root + path.sep)) throw new Error('Outside root');
  } catch {
    response.writeHead(400); response.end('Invalid path'); return;
  }
  fs.readFile(file, (error, contents) => {
    if (error) { response.writeHead(404); response.end('Not found'); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(contents);
  });
});
server.on('error', error => { console.error(`Could not start the server: ${error.message}`); process.exitCode = 1; });
server.listen(4173, '127.0.0.1', () => console.log('The Invention Lab: http://127.0.0.1:4173 — press Ctrl+C to stop.'));
