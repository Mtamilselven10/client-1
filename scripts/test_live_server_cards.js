import puppeteer from '../node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new'
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  page.on('console', msg => console.log('Page:', msg.text()));

  await page.goto('http://127.0.0.1:5500/dist/index.html#/products', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
  const count = await page.$$eval('[data-testid="product-card"]', els => els.length);
  console.log('Successfully rendered product cards on Live Server:', count);

  await page.screenshot({ path: 'screenshots/16_live_server_products_fully_rendered.png' });
  console.log('Saved screenshots/16_live_server_products_fully_rendered.png');

  await browser.close();
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
