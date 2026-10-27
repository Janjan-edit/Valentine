const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
let version = 0;
fs.watch(root, () => version++);
http.createServer((req, res) => {
  if (req.url === '/__version') return res.end(String(version));
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0])); }
  catch { res.writeHead(400); return res.end(); }
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(file);
    res.setHeader('Content-Type', ({'.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.jpg':'image/jpeg', '.png':'image/png'})[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    if (ext === '.html') data = data.toString() + `<script>let v;setInterval(async()=>{try{let n=await(await fetch('/__version')).text();if(v!==undefined&&n!==v)location.reload();v=n}catch{}},700)</script>`;
    res.end(data);
  });
}).listen(5500, '127.0.0.1', () => console.log('Live server: http://localhost:5500'));
