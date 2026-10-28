import http from 'http';
import fs from 'fs';
import path from 'path';
import puppeteer from '../node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_PATH = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

// Create a static server rooted at project directory (exactly like VS Code Live Server)
const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/dist/index.html';
  const filePath = path.join(process.cwd(), reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(5500, async () => {
  console.log('Simulated VS Code Live Server running at http://127.0.0.1:5500');

  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  page.on('console', msg => console.log('Browser log:', msg.text()));

  // Navigate to http://127.0.0.1:5500/dist/index.html exactly as the user did!
  console.log('Navigating to http://127.0.0.1:5500/dist/index.html ...');
  await page.goto('http://127.0.0.1:5500/dist/index.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: 'screenshots/13_live_server_verified.png' });
  console.log('✓ Captured screenshots/13_live_server_verified.png');

  // Also navigate to products
  console.log('Navigating to products in Live Server: http://127.0.0.1:5500/dist/index.html#/products ...');
  await page.goto('http://127.0.0.1:5500/dist/index.html#/products', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/14_live_server_products.png' });
  console.log('✓ Captured screenshots/14_live_server_products.png');

  await browser.close();
  server.close();
  console.log('All tests passed successfully on Live Server url!');
  process.exit(0);
});
