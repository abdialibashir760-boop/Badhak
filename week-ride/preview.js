// Zero-dependency static server so the preview works with a double "npm run preview".
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 5173;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
http.createServer((req, res) => {
  const p = path.join(__dirname, decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!p.startsWith(__dirname) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': types[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(PORT, () => console.log(`Preview: http://localhost:${PORT}   (Ctrl+C to stop)`));
