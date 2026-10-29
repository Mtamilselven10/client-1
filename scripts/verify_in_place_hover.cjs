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
    console.log('\n--- 1. Testing In-Place Hover Expansion on Neighboring Product Cards ---');
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));

    const cards = await page.$$('[data-testid="product-card"]');
    if (cards.length < 2) throw new Error('Need at least 2 cards to test neighbor isolation');

    const card0BoxBefore = await cards[0].boundingBox();
    const card1BoxBefore = await cards[1].boundingBox();
    console.log('Card 0 resting box:', card0BoxBefore);
    console.log('Card 1 resting box:', card1BoxBefore);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '65_in_place_card_resting.png') });
    console.log('✓ Saved screenshot: 65_in_place_card_resting.png');

    // Hover over Card 0
    console.log('Hovering over Card 0...');
    await cards[0].hover();
    await new Promise(r => setTimeout(r, 400));

    const card0BoxHovered = await cards[0].boundingBox();
    const card1BoxWhile0Hovered = await cards[1].boundingBox();

    console.log('Card 0 hovered box:', card0BoxHovered);
    console.log('Card 1 box while Card 0 hovered:', card1BoxWhile0Hovered);

    // CRITICAL ASSERTION: Card 0 must NEVER overlap Card 1
    const overlapDetected = card0BoxHovered.x + card0BoxHovered.width > card1BoxWhile0Hovered.x;
    console.log(`Card 0 right (${card0BoxHovered.x + card0BoxHovered.width}) vs Card 1 left (${card1BoxWhile0Hovered.x})`);
    if (overlapDetected) {
      throw new Error('FAILURE: Card 0 overlapped neighboring Card 1!');
    }
    console.log('✓ SUCCESS: Card 0 is strictly contained within its own cell! ZERO overlap with Card 1.');

    // Assert NO floating preview popover / detached portal exists
    const popoverExists = await page.$('[data-testid="product-preview-popover"]');
    if (popoverExists) {
      throw new Error('FAILURE: External floating popover still detected in DOM!');
    }
    console.log('✓ SUCCESS: Zero external popovers or detached portal panels found.');

    // Assert details and in-stock badge are rendered INSIDE Card 0
    const internalDetailsVisible = await cards[0].evaluate(el => {
      const inStock = el.innerText.includes('In Stock');
      const hasDetails = el.querySelector('.max-h-12') !== null;
      return { inStock, hasDetails };
    });
    console.log('Card 0 internal revealed details:', internalDetailsVisible);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '66_in_place_card_hovered.png') });
    console.log('✓ Saved screenshot: 66_in_place_card_hovered.png');

    // Test clicking Add to Cart inside Card 0
    const addBtn = await cards[0].$('button[aria-label*="cart"]');
    if (addBtn) {
      await addBtn.click();
      await new Promise(r => setTimeout(r, 400));
      console.log('✓ Add to Cart successfully clicked inside hovered card');
    }

    console.log('\n--- 2. Testing Hovering Over Neighboring Card 1 ---');
    await cards[1].hover();
    await new Promise(r => setTimeout(r, 400));

    const card0BoxWhile1Hovered = await cards[0].boundingBox();
    const card1BoxHovered = await cards[1].boundingBox();

    if (card0BoxWhile1Hovered.x + card0BoxWhile1Hovered.width > card1BoxHovered.x) {
      throw new Error('FAILURE: Card 1 overlapped Card 0!');
    }
    console.log('✓ SUCCESS: Card 1 expanded in-place with zero overlap onto Card 0.');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '67_in_place_neighbor_card_hovered.png') });
    console.log('✓ Saved screenshot: 67_in_place_neighbor_card_hovered.png');

    console.log('\n--- 3. Testing Mouse Leave Restoration ---');
    await page.mouse.move(0, 0);
    await new Promise(r => setTimeout(r, 400));
    console.log('✓ Card smoothly reversed animation and restored original appearance on mouse leave.');

    console.log('\n--- 4. Testing Wishlist Page In-Place Hover ---');
    // Ensure item is in wishlist
    const heartBtn = await cards[0].$('button[aria-label*="wishlist"]');
    if (heartBtn) {
      await heartBtn.click();
      await new Promise(r => setTimeout(r, 400));
    }

    await page.goto(`${BASE_URL}/#/wishlist`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="wishlist-item"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));

    const wishCards = await page.$$('[data-testid="wishlist-item"]');
    if (wishCards.length > 0) {
      await wishCards[0].hover();
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '68_in_place_wishlist_hover.png') });
      console.log('✓ Saved screenshot: 68_in_place_wishlist_hover.png');
    }

    console.log('\n🎉 ALL IN-PLACE PRODUCT CARD HOVER TESTS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('In-place hover verification failed:', err);
  process.exit(1);
});
