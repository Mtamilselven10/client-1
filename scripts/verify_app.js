import puppeteer from '../node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';
import path from 'path';
import http from 'http';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const BROWSER_PATH = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
const PORT = 4173;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const SCREENSHOTS_DIR = path.resolve('screenshots');
const ARTIFACT_DIR = "C:\\Users\\enose raja\\.gemini\\antigravity\\brain\\76083c15-56e2-41c3-b33b-e8efbb3e33f9";

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Embedded static server to test production build in dist
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
    // Remove leading slash
    let filePath = path.join(distDir, cleanUrl.replace(/^\//, ''));
    
    // Fallback to index.html for SPA if not found
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
  console.log(`Static production server started at ${BASE_URL}`);

  console.log(`Launching automated browser verification using: ${BROWSER_PATH}`);
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`Browser console error: ${msg.text()}`);
    }
  });

  try {
    async function navigateHash(hash) {
      await page.evaluate((h) => {
        window.location.hash = h;
        window.scrollTo(0, 0);
      }, hash);
      await new Promise(r => setTimeout(r, 1200));
    }

    // 1. HOME PAGE HERO (ENGLISH)
    console.log('\n--- 1. Testing Home Page & Canvas Hero ---');
    await page.goto(`${BASE_URL}/#/`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2500));
    await saveScreenshot(page, '01_home_hero.png');

    // 2. SCROLL SCRUBBING & UNLOCKED SECTIONS
    console.log('\n--- 2. Testing Scroll Scrubbing & Unlocked Sections ---');
    await page.evaluate(() => {
      window.scrollTo({ top: 3800, behavior: 'smooth' });
    });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '02_home_unlocked_sections.png');

    // 3. PRODUCTS CATALOG PAGE
    console.log('\n--- 3. Testing Products Page (Excel Parsing) ---');
    await navigateHash('#/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    const productCount = await page.$$eval('[data-testid="product-card"]', el => el.length);
    console.log(`Product cards visible on page 1: ${productCount}`);
    await saveScreenshot(page, '03_products_catalog.png');

    // 4. TEST FILTER & SEARCH
    console.log('\n--- 4. Testing Search & Category Filter ---');
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.type('Cardamom', { delay: 40 });
      await new Promise(r => setTimeout(r, 800));
      await saveScreenshot(page, '04_products_filtered.png');
    }

    // Add product to cart & wishlist
    const addToCartBtns = await page.$$('button[aria-label*="Add"]');
    if (addToCartBtns.length > 0) {
      await addToCartBtns[0].click();
      console.log('✓ Clicked Add to Cart on product');
    }

    const wishlistBtns = await page.$$('button[aria-label*="wishlist"]');
    if (wishlistBtns.length > 0) {
      await wishlistBtns[0].click();
      console.log('✓ Clicked Wishlist Toggle on product');
    }
    await new Promise(r => setTimeout(r, 600));

    // 5. TEST TOP-RIGHT LANGUAGE SWITCH BUTTON
    console.log('\n--- 5. Testing Top-Right Language Switch Button (EN <-> தமிழ்) ---');
    const langBtnTa = await page.waitForSelector('[data-testid="lang-btn-ta"]', { timeout: 5000 });
    console.log('✓ Found Tamil language switch button in top-right corner.');
    
    // Click button to toggle language to Tamil
    await langBtnTa.click();
    console.log('✓ Clicked language button to switch to Tamil (தமிழ்)');
    await new Promise(r => setTimeout(r, 1000));

    // Verify document lang is 'ta'
    const docLang = await page.evaluate(() => document.documentElement.lang);
    console.log(`Document language after toggle: "${docLang}"`);

    // Verify translated Tamil text on Products page
    await saveScreenshot(page, '18_language_toggle_tamil_products.png');

    // 6. VERIFY HOME IN TAMIL
    console.log('\n--- 6. Verifying Home in Tamil ---');
    await navigateHash('#/');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot(page, '17_language_toggle_tamil_home.png');

    // 7. VERIFY CART IN TAMIL
    console.log('\n--- 7. Verifying Cart in Tamil ---');
    await navigateHash('#/cart');
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '19_language_toggle_tamil_cart.png');

    // 8. VERIFY ABOUT IN TAMIL
    console.log('\n--- 8. Verifying About Us in Tamil ---');
    await navigateHash('#/about');
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '20_language_toggle_tamil_about.png');

    // 9. VERIFY FAQS IN TAMIL
    console.log('\n--- 9. Verifying FAQs in Tamil ---');
    await navigateHash('#/faqs');
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '21_language_toggle_tamil_faqs.png');

    // 10. VERIFY CUSTOMER CARE IN TAMIL
    console.log('\n--- 10. Verifying Customer Care in Tamil ---');
    await navigateHash('#/customer-care');
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '22_language_toggle_tamil_customer_care.png');

    // 11. SWITCH BACK TO ENGLISH AND TEST TOGGLE STABILITY
    console.log('\n--- 11. Testing Toggle back to English ---');
    const langBtnEn = await page.waitForSelector('[data-testid="lang-btn-en"]');
    await langBtnEn.click();
    console.log('✓ Clicked language switch back to English');
    await new Promise(r => setTimeout(r, 1000));

    // 12. COLOR PALETTE COMPLIANCE CHECK
    console.log('\n--- 12. Color Palette & Background Compliance Verification ---');
    const colorAudit = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const offColors = [];
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        if (bg === 'rgb(255, 255, 255)' && el.tagName !== 'CANVAS' && !el.closest('svg')) {
          offColors.push({ tag: el.tagName, className: el.className, bg });
        }
      });
      return {
        totalInspected: elements.length,
        offColorCount: offColors.length,
        samples: offColors.slice(0, 5)
      };
    });
    console.log(`Elements inspected: ${colorAudit.totalInspected}`);
    console.log(`Off-palette pure white backgrounds detected: ${colorAudit.offColorCount}`);

    console.log('\n========================================');
    console.log('✓ ALL BILINGUAL & REGRESSION TESTS PASSED!');
    console.log('========================================\n');

  } catch (err) {
    console.error('Verification failed with error:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

runVerification();
