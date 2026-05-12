const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4200;
const API_TARGET = process.env.API_TARGET || 'http://backend:3000';
const DIST = path.join(__dirname, 'dist', 'gym-frontend', 'browser');

const server = http.createServer((req, res) => {
  // Proxy API calls to backend
  if (req.url.startsWith('/api/') || req.url === '/health') {
    const proxyReq = http.request(
      API_TARGET + req.url,
      { method: req.method, headers: req.headers },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );
    req.pipe(proxyReq);
    proxyReq.on('error', () => {
      res.writeHead(502);
      res.end('Bad Gateway');
    });
    return;
  }

  // Serve static files
  let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const mimeTypes = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback: serve index.html
      fs.readFile(path.join(DIST, 'index.html'), (err2, data2) => {
        if (err2) { res.writeHead(404); res.end('Not Found'); return; }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data2);
      });
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Frontend corriendo en http://localhost:${PORT}`);
  console.log(`   API → ${API_TARGET}`);
});
