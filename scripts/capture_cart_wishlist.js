import puppeteer from '../node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_PATH = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;
const BASE_URL = 'http://localhost:5173';

const SCREENSHOTS_DIR = path.resolve('screenshots');
const ARTIFACT_DIR = "C:\\Users\\enose raja\\.gemini\\antigravity\\brain\\76083c15-56e2-41c3-b33b-e8efbb3e33f9";

async function saveScreenshot(page, filename) {
  const localPath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: localPath, fullPage: false });
  if (fs.existsSync(ARTIFACT_DIR)) {
    const artifactPath = path.join(ARTIFACT_DIR, filename);
    fs.copyFileSync(localPath, artifactPath);
  }
  console.log(`✓ Saved screenshot: ${filename}`);
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  await page.goto(`${BASE_URL}/products`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

  // Prepopulate cart and wishlist in localStorage
  await page.evaluate(() => {
    const sampleItems = [
      {
        id: "GS-1001",
        name: "Royal Aged Basmati Rice (XXL Long Grain)",
        category: "Grains, Rice & Millets",
        price: 185,
        mrp: 230,
        unit: "1 kg",
        rating: 4.9,
        reviewsCount: 342,
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
        description: "2-year aged Himalayan foothill Basmati with delicate fragrant aroma and elongated fluffy grains.",
        quantity: 2
      },
      {
        id: "GS-1014",
        name: "Pure Vedic A2 Desi Gir Cow Cultured Bilona Ghee",
        category: "Cold-Pressed Oils & Pure Ghee",
        price: 1450,
        mrp: 1750,
        unit: "500 ml",
        rating: 5.0,
        reviewsCount: 615,
        image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80",
        description: "Crafted through the ancient 5-step Bilona method from curd of grass-fed native Gir cows.",
        quantity: 1
      },
      {
        id: "GS-1021",
        name: "Alleppey Extra Bold Green Cardamom (8mm+)",
        category: "Spices, Masalas & Seasonings",
        price: 490,
        mrp: 580,
        unit: "100 g",
        rating: 5.0,
        reviewsCount: 320,
        image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
        description: "The Queen of Spices: massive emerald green pods packed with essential-oil-dense seeds.",
        quantity: 1
      }
    ];

    localStorage.setItem('gandhi_shop_cart_items', JSON.stringify(sampleItems));
    localStorage.setItem('gandhi_shop_wishlist_items', JSON.stringify([sampleItems[0], sampleItems[1]]));
  });

  // Capture populated wishlist
  await page.goto(`${BASE_URL}/wishlist`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));
  await saveScreenshot(page, '06_wishlist_populated.png');

  // Capture populated cart
  await page.goto(`${BASE_URL}/cart`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));
  await saveScreenshot(page, '07_cart_populated.png');

  await browser.close();
  console.log('✓ Populated screenshots saved successfully!');
}

run();
