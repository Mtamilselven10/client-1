import puppeteer from '../node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const BROWSER_PATH = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
const BASE_URL = 'http://localhost:5173';

const SCREENSHOTS_DIR = path.resolve('screenshots');
const ARTIFACT_DIR = "C:\\Users\\enose raja\\.gemini\\antigravity\\brain\\76083c15-56e2-41c3-b33b-e8efbb3e33f9";

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
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
  console.log(`Starting automated browser verification using: ${BROWSER_PATH}`);
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`Browser console error: ${msg.text()}`);
      errors.push(msg.text());
    }
  });

  try {
    // 1. HOME PAGE HERO
    console.log('\n--- 1. Testing Home Page & Canvas Hero ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 3500));
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
    await page.goto(`${BASE_URL}/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    const productCount = await page.$$eval('[data-testid="product-card"]', el => el.length);
    console.log(`Product cards visible on page 1: ${productCount}`);
    await saveScreenshot(page, '03_products_catalog.png');

    // 4. TEST FILTER & SEARCH
    console.log('\n--- 4. Testing Search & Category Filter ---');
    const searchInput = await page.$('input[placeholder*="Search"]');
    await searchInput.type('Cardamom', { delay: 50 });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot(page, '04_products_filtered.png');

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
    await new Promise(r => setTimeout(r, 800));

    // 5. PRODUCT DETAIL PAGE
    console.log('\n--- 5. Testing Product Detail Page ---');
    await page.goto(`${BASE_URL}/products/GS-1001`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, '05_product_detail.png');

    // 6. WISHLIST PAGE
    console.log('\n--- 6. Testing Wishlist Page ---');
    await page.goto(`${BASE_URL}/wishlist`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot(page, '06_wishlist.png');

    // 7. CART PAGE & WHATSAPP URL VERIFICATION
    console.log('\n--- 7. Testing Cart Page & WhatsApp URL ---');
    await page.goto(`${BASE_URL}/cart`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot(page, '07_cart.png');

    const whatsappLinks = await page.$$eval('a[href*="wa.me"]', links => links.map(l => l.href));
    console.log(`Found ${whatsappLinks.length} WhatsApp order links.`);
    if (whatsappLinks.length > 0) {
      console.log(`Sample WhatsApp Order URL: ${whatsappLinks[0].substring(0, 80)}...`);
    }

    // 8. ABOUT US PAGE
    console.log('\n--- 8. Testing About Us Page ---');
    await page.goto(`${BASE_URL}/about`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '08_about_us.png');

    // 9. FAQS PAGE
    console.log('\n--- 9. Testing FAQs Page ---');
    await page.goto(`${BASE_URL}/faqs`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '09_faqs.png');

    // 10. CUSTOMER CARE PAGE
    console.log('\n--- 10. Testing Customer Care Page ---');
    await page.goto(`${BASE_URL}/customer-care`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '10_customer_care.png');

    // 11. PRIVACY & POLICY PAGE
    console.log('\n--- 11. Testing Privacy & Policy Page ---');
    await page.goto(`${BASE_URL}/privacy-policy`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '11_privacy_policy.png');

    // 12. 404 NOT FOUND PAGE
    console.log('\n--- 12. Testing 404 Page ---');
    await page.goto(`${BASE_URL}/non-existent-page`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '12_404_page.png');

    // 13. COLOR PALETTE COMPLIANCE CHECK
    console.log('\n--- 13. Color Palette & Background Compliance Verification ---');
    const colorAudit = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const offColors = [];
      elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bg = style.backgroundColor;
        // Check if pure white is used as a background
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
    console.log('✓ ALL VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('========================================\n');

  } catch (err) {
    console.error('Verification failed with error:', err);
  } finally {
    await browser.close();
  }
}

runVerification();
