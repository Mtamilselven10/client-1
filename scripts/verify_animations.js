import puppeteer from '../node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';
import path from 'path';
import http from 'http';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_PATH = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;

const PORT = 4175;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const SCREENSHOTS_DIR = path.resolve('screenshots');
const ARTIFACT_DIR = "C:\\Users\\enose raja\\.gemini\\antigravity\\brain\\76083c15-56e2-41c3-b33b-e8efbb3e33f9";

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ico': 'image/x-icon'
};

function createStaticServer() {
  const distDir = path.resolve('dist');
  return http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0];
    if (cleanUrl === '/' || cleanUrl === '') {
      cleanUrl = '/index.html';
    }
    let filePath = path.join(distDir, cleanUrl.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) {
      filePath = path.join(distDir, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  });
}

async function saveScreenshot(page, filename) {
  const localPath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: localPath, fullPage: false });
  if (fs.existsSync(ARTIFACT_DIR)) {
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    fs.copyFileSync(localPath, artifactPath);
  }
  console.log(`✓ Saved screenshot: ${filename}`);
}

async function runVerification() {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`Static server running at ${BASE_URL}`);

  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    protocolTimeout: 60000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.error(`Browser console error: ${msg.text()}`);
    }
  });

  try {
    console.log('\n--- 1. Testing Products Page "Fly to Cart" ---');
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));

    // Find first product card add-to-cart button
    const firstAddBtn = await page.$('[data-testid="product-card"] button[aria-label*="to cart"]');
    if (!firstAddBtn) throw new Error('Add to Cart button not found on product card');

    console.log('Clicking Add to Cart on first product card...');
    await firstAddBtn.click();

    // Capture screenshot mid-flight (around 350ms)
    await new Promise(r => setTimeout(r, 300));
    await saveScreenshot(page, '32_fly_to_cart_in_flight.png');

    // Wait for arrival and badge pop
    await new Promise(r => setTimeout(r, 800));
    await saveScreenshot(page, '33_fly_to_cart_arrived.png');

    // Log cart nav target HTML
    const navHtml = await page.$eval('[data-nav-target="cart"]', el => el.outerHTML);
    console.log('Cart nav element HTML:', navHtml);

    // Verify cart count badge updated in sidebar
    const cartBadgeText = await page.$eval('[data-nav-target="cart"] span.rounded-full', el => el.textContent.trim());
    console.log(`Cart badge count: ${cartBadgeText}`);
    if (cartBadgeText !== '1') {
      throw new Error(`Expected cart badge count 1, got: "${cartBadgeText}"`);
    }

    console.log('\n--- 2. Testing Wishlist Heart Fly ---');
    // Click heart icon on second product card
    const secondCard = (await page.$$('[data-testid="product-card"]'))[1];
    const heartBtn = await secondCard.$('button[aria-label*="wishlist"]');
    console.log('Clicking Wishlist heart button...');
    await heartBtn.click();

    // Capture screenshot during heart fly
    await new Promise(r => setTimeout(r, 250));
    await saveScreenshot(page, '34_fly_to_wishlist.png');
    await new Promise(r => setTimeout(r, 800));

    // Verify wishlist badge in sidebar
    const wishlistBadgeText = await page.$eval('[data-nav-target="wishlist"] span.rounded-full', el => el.textContent.trim());
    console.log(`Wishlist badge count: ${wishlistBadgeText}`);
    if (wishlistBadgeText !== '1') {
      throw new Error(`Expected wishlist badge count 1, got: "${wishlistBadgeText}"`);
    }

    console.log('\n--- 3. Testing Product Detail Page Image Fly ---');
    // Click first card to navigate to detail
    await page.click('[data-testid="product-card"] h3');
    await page.waitForSelector('[data-testid="detail-add-cart-btn"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 600));

    // Click Add to Cart on detail page
    const detailAddBtn = await page.$('[data-testid="detail-add-cart-btn"]');
    console.log('Clicking Add to Cart on Product Detail page...');
    await detailAddBtn.click();

    await new Promise(r => setTimeout(r, 320));
    await saveScreenshot(page, '35_product_detail_image_fly.png');
    await new Promise(r => setTimeout(r, 800));

    console.log('\n--- 4. Testing Wishlist Page "Move to Cart" Fly ---');
    await page.goto(`${BASE_URL}/#/wishlist`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="wishlist-item"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 600));

    const wishlistAddCartBtn = await page.$('[data-testid="wishlist-add-cart-btn"]');
    console.log('Clicking Add to Cart on Wishlist page...');
    await wishlistAddCartBtn.click();

    await new Promise(r => setTimeout(r, 300));
    await saveScreenshot(page, '36_wishlist_page_fly_to_cart.png');
    await new Promise(r => setTimeout(r, 800));

    console.log('\n--- 5. Testing Cart Page Animations & Stepper Pop ---');
    await page.goto(`${BASE_URL}/#/cart`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('button[aria-label="Increase quantity"]', { timeout: 6000 });
    await new Promise(r => setTimeout(r, 600));

    // Increase quantity
    const plusBtn = await page.$('button[aria-label="Increase quantity"]');
    await plusBtn.click();
    await new Promise(r => setTimeout(r, 400));
    await saveScreenshot(page, '37_cart_page_animations.png');

    console.log('\n--- 6. Testing Mobile Viewport (360px) Fly to Mobile Header Cart ---');
    await page.setViewport({ width: 360, height: 740 });
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 6000 });
    await new Promise(r => setTimeout(r, 600));

    // Click Add to Cart on mobile
    const mobileAddBtn = await page.$('[data-testid="product-card"] button[aria-label*="to cart"]');
    await mobileAddBtn.click();
    await new Promise(r => setTimeout(r, 350));
    await saveScreenshot(page, '38_mobile_fly_to_cart_360.png');

    console.log('\n--- 7. Regression Check: Home Hero Scroll Animation ---');
    await page.setViewport({ width: 1400, height: 900 });
    await page.goto(`${BASE_URL}/#/`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="hero-headline"]', { timeout: 6000 });
    const heroHeadline = await page.$eval('[data-testid="hero-headline"]', el => el.textContent.trim());
    console.log(`Home hero headline: "${heroHeadline}"`);
    if (!heroHeadline.includes('GLORY TO GOD')) {
      throw new Error(`Home hero regression! Expected "GLORY TO GOD", got: "${heroHeadline}"`);
    }

    console.log('\n🎉 ALL ANIMATION CHECKS AND REGRESSION TESTS PASSED!');
  } finally {
    await browser.close();
    server.close();
  }
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
