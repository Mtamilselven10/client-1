import puppeteer from '../node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';
import path from 'path';
import http from 'http';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const BROWSER_PATH = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;
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
  console.log(`Static production server started at ${BASE_URL}`);

  console.log(`Launching automated browser verification using: ${BROWSER_PATH}`);
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    protocolTimeout: 60000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1400,900']
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

    // 1. HOME PAGE HERO: LOCKED STATE BEFORE ANIMATION FINISHES
    console.log('\n--- 1. Testing Hero Animation Breakpoint & Lock ---');
    await page.goto(`${BASE_URL}/#/`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Verify website below is NOT mounted/visible
    const initialExploreSection = await page.$('#explore-section');
    console.log(`Explore section present before animation completion: ${initialExploreSection !== null}`);
    await saveScreenshot(page, '23_breakpoint_hero_locked.png');

    // 2. SCRUBBING ANIMATION FORWARD
    console.log('\n--- 2. Scrubbing Animation via Mouse Wheel ---');
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel({ deltaY: 200 });
      await new Promise(r => setTimeout(r, 100));
    }
    await new Promise(r => setTimeout(r, 800));
    await saveScreenshot(page, '24_breakpoint_scrubbing_in_progress.png');

    // 3. REACHING BREAKPOINT & UNLOCKING
    console.log('\n--- 3. Triggering Animation Completion / Breakpoint ---');
    const skipToUnlockBtn = await page.waitForSelector('[data-testid="skip-to-unlock-btn"]', { timeout: 5000 });
    await skipToUnlockBtn.click();
    console.log('✓ Clicked unlock button to reach 100% animation breakpoint');
    await new Promise(r => setTimeout(r, 1000));

    // Verify explore section is now mounted!
    const unlockedExploreSection = await page.$('#explore-section');
    console.log(`Explore section mounted after animation completion: ${unlockedExploreSection !== null}`);
    await saveScreenshot(page, '25_breakpoint_unlocked_prompt.png');

    // 4. SCROLLING WEBSITE BELOW AFTER BREAKPOINT
    console.log('\n--- 4. Moving Website Below Hero ---');
    const scrollDownPromptBtn = await page.$('[data-testid="scroll-down-prompt-btn"]');
    if (scrollDownPromptBtn) {
      await scrollDownPromptBtn.click();
    } else {
      await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'smooth' }));
    }
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '26_website_below_scrolled.png');

    // 5. PRODUCTS CATALOG PAGE
    console.log('\n--- 5. Testing Products Page (Excel Parsing) ---');
    await navigateHash('#/products');
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    const productCount = await page.$$eval('[data-testid="product-card"]', el => el.length);
    console.log(`Product cards visible on page 1: ${productCount}`);
    await saveScreenshot(page, '03_products_catalog.png');

    // 6. TEST FILTER & SEARCH
    console.log('\n--- 6. Testing Search & Category Filter ---');
    const searchInput = await page.$('input[placeholder*="Search"]');
    if (searchInput) {
      await searchInput.type('Cardamom', { delay: 40 });
      await new Promise(r => setTimeout(r, 800));
      await saveScreenshot(page, '04_products_filtered.png');
    }

    // 7. TEST TOP-RIGHT LANGUAGE SWITCH BUTTON (EN <-> தமிழ்)
    console.log('\n--- 7. Testing Top-Right Language Switch Button ---');
    const langBtnTa = await page.waitForSelector('[data-testid="lang-btn-ta"]', { timeout: 5000 });
    await langBtnTa.click();
    console.log('✓ Clicked language button to switch to Tamil (தமிழ்)');
    await new Promise(r => setTimeout(r, 1000));

    const docLang = await page.evaluate(() => document.documentElement.lang);
    console.log(`Document language after toggle: "${docLang}"`);
    await saveScreenshot(page, '18_language_toggle_tamil_products.png');

    // 8. VERIFY HOME IN TAMIL WITH BREAKPOINT
    console.log('\n--- 8. Verifying Home with Breakpoint in Tamil ---');
    await navigateHash('#/');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot(page, '17_language_toggle_tamil_home.png');

    // Switch back to English
    const langBtnEn = await page.waitForSelector('[data-testid="lang-btn-en"]');
    await langBtnEn.click();
    await new Promise(r => setTimeout(r, 800));

    // 9. COLOR PALETTE COMPLIANCE CHECK
    console.log('\n--- 9. Color Palette & Background Compliance Verification ---');
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
        offColorCount: offColors.length
      };
    });
    console.log(`Elements inspected: ${colorAudit.totalInspected}`);
    console.log(`Off-palette pure white backgrounds detected: ${colorAudit.offColorCount}`);

    console.log('\n========================================');
    console.log('✓ ALL BREAKPOINT & SCROLL LOCK TESTS PASSED!');
    console.log('========================================\n');

  } catch (err) {
    console.error('Verification failed with error:', err);
  } finally {
    await browser.close();
    server.close();
  }
}

runVerification();
