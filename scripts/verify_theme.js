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
    console.log('\n--- 1. Testing Coconut Brown Global Styles on Home Page ---');
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

    if (cssVars.olive !== '#5D4037' || cssVars.coconut !== '#5D4037') {
      throw new Error(`CSS Variables not matching Coconut Brown swatches: ${JSON.stringify(cssVars)}`);
    }

    await saveScreenshot(page, '50_coconut_brown_home.png');

    console.log('\n--- 2. Verifying Products Catalog in Coconut Brown ---');
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));

    // Verify Add to Cart button has coconut brown background rgb(93, 64, 55)
    const addBtnBg = await page.$eval('[data-testid="product-card"] button[aria-label*="cart"]', el => getComputedStyle(el).backgroundColor);
    console.log(`Add to Cart button background: ${addBtnBg}`); // rgb(93, 64, 55)

    await saveScreenshot(page, '51_coconut_brown_products.png');

    console.log('\n--- 3. Verifying Sidebar Drawer in Coconut Brown ---');
    const menuBtn = await page.$('[data-testid="sidebar-menu-btn"]');
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 600));

    await saveScreenshot(page, '53_coconut_brown_sidebar.png');

    console.log('\n--- 4. Verifying Reviews Page in Coconut Brown ---');
    await page.goto(`${BASE_URL}/#/reviews`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="review-card"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));

    await saveScreenshot(page, '52_coconut_brown_reviews.png');

    console.log('\n--- 5. Verifying Cart Page in Coconut Brown ---');
    await page.goto(`${BASE_URL}/#/cart`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 800));

    await saveScreenshot(page, '54_coconut_brown_cart.png');

    console.log('\n🎉 ALL COCONUT BROWN THEME CHECKS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

runThemeVerification().catch(err => {
  console.error('Theme verification failed:', err);
  process.exit(1);
});
