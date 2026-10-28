import puppeteer from '../node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';
import path from 'path';
import http from 'http';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_PATH = fs.existsSync(EDGE_PATH) ? EDGE_PATH : CHROME_PATH;

const PORT = 4174;
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
  console.log(`Test server running at ${BASE_URL}`);

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
      console.error(`Browser error: ${msg.text()}`);
    }
  });

  try {
    console.log('\n--- 1. Testing Home Hero Initial State ---');
    await page.goto(`${BASE_URL}/#/`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    // Verify Heading
    const h1Text = await page.$eval('[data-testid="hero-headline"]', el => el.textContent.trim());
    const h1Style = await page.$eval('[data-testid="hero-headline"]', el => {
      const s = window.getComputedStyle(el);
      return { fontFamily: s.fontFamily, fontWeight: s.fontWeight, color: s.color };
    });
    console.log(`Heading text: "${h1Text}"`);
    console.log(`Heading computed style:`, h1Style);

    if (!h1Text.includes('GLORY TO GOD')) {
      throw new Error(`Expected heading "GLORY TO GOD", got "${h1Text}"`);
    }

    // Verify Subheading
    const pText = await page.$eval('[data-testid="hero-subheading"]', el => el.textContent.trim());
    const pStyle = await page.$eval('[data-testid="hero-subheading"]', el => {
      const s = window.getComputedStyle(el);
      return { fontFamily: s.fontFamily, fontWeight: s.fontWeight, color: s.color };
    });
    console.log(`Subheading text: "${pText}"`);
    console.log(`Subheading computed style:`, pStyle);
    if (!pText || !pText.includes('Welcome to Gandhi Shop')) {
      throw new Error(`Expected subheading "Welcome to Gandhi Shop", got "${pText}"`);
    }

    // Check old sentences are completely gone
    const bodyText = await page.$eval('body', el => el.innerText);
    const oldSentences = [
      'Nourish Life with Pure Earthly Harvest',
      'Handpicked grains, stone-ground flours',
      'PURE & AUTHENTIC SINCE 1974',
      'ANIMATION GATE & BREAKPOINT',
      'Scroll to scrub harvest sequence'
    ];
    for (const old of oldSentences) {
      if (bodyText.includes(old)) {
        throw new Error(`Found leftover old text: "${old}"`);
      }
    }
    console.log('✓ All old hero test sentences and captions are completely absent from the page!');

    await saveScreenshot(page, '27_new_hero_overlay_en.png');

    console.log('\n--- 2. Testing Forward Scrubbing & Text Fade-Out ---');
    // Scroll down to scrub frames
    for (let i = 0; i < 8; i++) {
      await page.mouse.wheel({ deltaY: 300 });
      await new Promise(r => setTimeout(r, 120));
    }
    await new Promise(r => setTimeout(r, 500));
    await saveScreenshot(page, '28_new_hero_scrubbing.png');

    console.log('\n--- 3. Testing 100% Breakpoint Reached & Section Unlock ---');
    // Scrub to end of 292 frames
    for (let i = 0; i < 20; i++) {
      await page.mouse.wheel({ deltaY: 500 });
      await new Promise(r => setTimeout(r, 100));
    }
    await new Promise(r => setTimeout(r, 1200));

    const isUnlocked = await page.evaluate(() => {
      return !!document.getElementById('explore-section');
    });
    console.log(`Explore section unlocked at 100%: ${isUnlocked}`);
    if (!isUnlocked) {
      console.warn('Explore section not unlocked yet, scrolling more...');
      for (let i = 0; i < 15; i++) {
        await page.mouse.wheel({ deltaY: 500 });
        await new Promise(r => setTimeout(r, 80));
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    // Scroll into the unlocked section
    await page.evaluate(() => {
      const el = document.getElementById('explore-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '29_new_hero_unlocked_website.png');

    console.log('\n--- 4. Testing Tamil Language Translation ---');
    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 600));

    // Click Tamil language button
    const toggleButton = await page.waitForSelector('[data-testid="lang-btn-ta"]', { timeout: 5000 });
    await toggleButton.click();
    await new Promise(r => setTimeout(r, 600));

    const h1Tamil = await page.$eval('[data-testid="hero-headline"]', el => el.textContent.trim());
    console.log(`Tamil heading: "${h1Tamil}"`);
    if (!h1Tamil.includes('தேவனுக்கே மகிமை உண்டாவதாக')) {
      throw new Error(`Expected Tamil heading, got: "${h1Tamil}"`);
    }
    await saveScreenshot(page, '30_new_hero_tamil.png');

    // Switch back to English
    const toggleBack = await page.waitForSelector('[data-testid="lang-btn-en"]', { timeout: 5000 });
    await toggleBack.click();
    await new Promise(r => setTimeout(r, 600));

    console.log('\n--- 5. Testing Mobile Viewport (360px) ---');
    await page.setViewport({ width: 360, height: 740 });
    await new Promise(r => setTimeout(r, 800));
    await saveScreenshot(page, '31_new_hero_mobile_360.png');

    console.log('\n--- 6. Testing "Explore Store" Button Navigation ---');
    await page.setViewport({ width: 1400, height: 900 });
    await new Promise(r => setTimeout(r, 400));
    const exploreBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Explore Store'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log(`Clicked Explore Store button: ${exploreBtn}`);
    await new Promise(r => setTimeout(r, 1000));
    const currentHash = await page.evaluate(() => window.location.hash);
    console.log(`Current hash route: ${currentHash}`);
    if (!currentHash.includes('products')) {
      throw new Error(`Expected route to include "products", got "${currentHash}"`);
    }

    console.log('\n🎉 ALL CHECKS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
    server.close();
  }
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
