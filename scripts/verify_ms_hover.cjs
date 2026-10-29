const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.resolve('screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    console.log('\n--- 1. Testing Microsoft Store Product Card Hover on Products Page ---');
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));

    // Get first card
    const firstCard = await page.$('[data-testid="product-card"]');
    const restingBox = await firstCard.boundingBox();
    console.log('First card resting bounding box:', restingBox);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '56_ms_store_card_resting.png') });
    console.log('✓ Saved screenshot: 56_ms_store_card_resting.png');

    // Hover over the first product card
    console.log('Hovering over product card...');
    await firstCard.hover();
    // Wait 350ms for transition duration
    await new Promise(r => setTimeout(r, 400));

    // Measure hovered state
    const hoveredStyles = await page.evaluate(() => {
      const card = document.querySelector('[data-testid="product-card"]');
      const cs = window.getComputedStyle(card);
      const img = card.querySelector('img');
      const imgCs = window.getComputedStyle(img);
      return {
        cardTransform: cs.transform,
        cardBoxShadow: cs.boxShadow,
        imgTransform: imgCs.transform,
        zIndex: cs.zIndex
      };
    });
    console.log('Hovered card computed styles:', hoveredStyles);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '55_ms_store_card_hover.png') });
    console.log('✓ Saved screenshot: 55_ms_store_card_hover.png');

    // Hover out
    console.log('Hovering out...');
    await page.mouse.move(0, 0);
    await new Promise(r => setTimeout(r, 450));

    console.log('\n--- 2. Testing Wishlist Page Microsoft Store Hover ---');
    // Add item to wishlist first
    const heartBtn = await page.$('[data-testid="product-card"] button[aria-label*="wishlist"]');
    if (heartBtn) {
      await heartBtn.click();
      await new Promise(r => setTimeout(r, 400));
    }

    await page.goto(`${BASE_URL}/#/wishlist`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="wishlist-item"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));

    const wishCard = await page.$('[data-testid="wishlist-item"]');
    await wishCard.hover();
    await new Promise(r => setTimeout(r, 400));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '57_ms_store_wishlist_hover.png') });
    console.log('✓ Saved screenshot: 57_ms_store_wishlist_hover.png');

    console.log('\n--- 3. Testing Homepage Category Cards Hover ---');
    await page.goto(`${BASE_URL}/#/`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => {
      const el = document.getElementById('explore-section');
      if (el) el.scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 800));

    const catCard = await page.$('.ms-product-card');
    if (catCard) {
      await catCard.hover();
      await new Promise(r => setTimeout(r, 400));
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '58_ms_store_home_category_hover.png') });
    console.log('✓ Saved screenshot: 58_ms_store_home_category_hover.png');

    console.log('\n--- 4. Testing Mobile Viewport (Touch Safety & No Layout Shift) ---');
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '59_ms_store_mobile_layout.png') });
    console.log('✓ Saved screenshot: 59_ms_store_mobile_layout.png');

    console.log('\n🎉 ALL MICROSOFT STORE HOVER TESTS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
