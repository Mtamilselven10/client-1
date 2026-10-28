import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_PATH = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const BASE_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = path.resolve('screenshots');
const ARTIFACT_DIR = "C:\\Users\\tamil\\.gemini\\antigravity\\brain\\b10c619e-9c5c-4348-8a14-cac1e5f34e57";

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function saveScreenshot(page, filename) {
  const localPath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: localPath });
  if (fs.existsSync(ARTIFACT_DIR)) {
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    fs.copyFileSync(localPath, artifactPath);
  }
  console.log(`✓ Saved screenshot: ${filename}`);
}

async function runTest() {
  console.log('Launching browser with:', BROWSER_PATH);
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // 1. Products Page
    console.log('Navigating to Products Page...');
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot(page, '01_products_page.png');

    // Check count of product cards
    const cardCount = await page.$$eval('[data-testid="product-card"]', cards => cards.length);
    console.log(`Rendered product cards on page 1: ${cardCount}`);

    // Check first card product title and image src
    const firstProduct = await page.$eval('[data-testid="product-card"]', card => ({
      title: card.querySelector('h3')?.innerText,
      imgSrc: card.querySelector('img')?.src,
      price: card.querySelector('.text-olive')?.innerText,
    }));
    console.log('First product card info:', firstProduct);

    // 2. Click category "Aachi Masala & Podi"
    console.log('Testing category filter for Aachi Masala...');
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text && text.includes('Aachi Masala')) {
        await btn.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, '02_aachi_category_filter.png');

    // 3. Click Add to Cart on the first item
    console.log('Adding first item to cart...');
    const addBtn = await page.$('[data-testid="product-card"] button:last-child');
    if (addBtn) {
      await addBtn.click();
      await new Promise(r => setTimeout(r, 800));
    }
    await saveScreenshot(page, '03_added_to_cart.png');

    // 4. Navigate to Product Details
    console.log('Navigating to Product Detail page...');
    const firstCard = await page.$('[data-testid="product-card"]');
    if (firstCard) {
      await firstCard.click();
      await new Promise(r => setTimeout(r, 1500));
      await saveScreenshot(page, '04_product_detail.png');
    }

    // 5. Navigate to Cart Page
    console.log('Navigating to Cart Page...');
    await page.goto(`${BASE_URL}/#/cart`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot(page, '05_cart_page.png');

    console.log('All browser verification tests completed successfully!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

runTest();
