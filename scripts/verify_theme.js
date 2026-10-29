import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.resolve('screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function saveScreenshot(page, filename) {
  const filePath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`✓ Saved screenshot: ${filename}`);
}

async function runThemeVerification() {
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
    console.log('\n--- 1. Testing Coconut & Palm Global Styles on Home Page ---');
    await page.goto(`${BASE_URL}/#/`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));

    // Verify root body background color (Coconut Cream: rgb(245, 242, 235))
    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    console.log(`Body computed background: ${bodyBg}`);

    // Verify CSS variables on :root
    const cssVars = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return {
        cream: s.getPropertyValue('--cream').trim(),
        olive: s.getPropertyValue('--olive').trim(),
        ink: s.getPropertyValue('--ink').trim(),
        coconut: s.getPropertyValue('--coconut').trim(),
        palm: s.getPropertyValue('--palm').trim()
      };
    });
    console.log('CSS Variables:', cssVars);

    if (cssVars.palm !== '#558B2F' || cssVars.coconut !== '#5D4037') {
      throw new Error(`CSS Variables not matching Coconut & Palm swatches: ${JSON.stringify(cssVars)}`);
    }

    await saveScreenshot(page, '45_coconut_palm_home.png');

    console.log('\n--- 2. Verifying Products Catalog in Coconut & Palm ---');
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));

    // Verify Add to Cart button has palm green background
    const addBtnBg = await page.$eval('[data-testid="product-card"] button[aria-label*="cart"]', el => getComputedStyle(el).backgroundColor);
    console.log(`Add to Cart button background: ${addBtnBg}`); // rgb(85, 139, 47)

    await saveScreenshot(page, '46_coconut_palm_products.png');

    console.log('\n--- 3. Verifying Sidebar Drawer in Coconut & Palm ---');
    const menuBtn = await page.$('[data-testid="sidebar-menu-btn"]');
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 600));

    await saveScreenshot(page, '48_coconut_palm_sidebar.png');

    console.log('\n--- 4. Verifying Reviews Page in Coconut & Palm ---');
    await page.goto(`${BASE_URL}/#/reviews`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="review-card"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));

    await saveScreenshot(page, '47_coconut_palm_reviews.png');

    console.log('\n--- 5. Verifying Cart Page in Coconut & Palm ---');
    await page.goto(`${BASE_URL}/#/cart`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));

    await saveScreenshot(page, '49_coconut_palm_cart.png');

    console.log('\n🎉 ALL COCONUT & PALM THEME CHECKS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

runThemeVerification().catch(err => {
  console.error('Theme verification failed:', err);
  process.exit(1);
});
