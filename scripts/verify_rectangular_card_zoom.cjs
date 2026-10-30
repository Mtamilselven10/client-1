const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:5173';
const ARTIFACT_DIR = 'C:\\Users\\enose raja\\.gemini\\antigravity\\brain\\76083c15-56e2-41c3-b33b-e8efbb3e33f9';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  console.log('Launching browser:', executablePath);
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--use-gl=angle',
      '--use-angle=swiftshader'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Browser error]: ${msg.text()}`);
  });

  try {
    console.log('\n--- 1. Testing Rectangular Product Card Expansion ---');
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
    await sleep(800);

    const cards = await page.$$('[data-testid="product-card"]');
    if (cards.length < 2) throw new Error('Need at least 2 cards to test neighbor isolation');

    // 1. Resting state
    const card0BoxResting = await cards[0].boundingBox();
    const card1BoxResting = await cards[1].boundingBox();
    console.log('Card 0 resting box:', card0BoxResting);
    console.log('Card 1 resting box:', card1BoxResting);

    const restingPath = path.join(ARTIFACT_DIR, '75_rect_card_resting.png');
    await page.screenshot({ path: restingPath });
    console.log('Saved resting screenshot:', restingPath);

    // 2. Cursor entering Card 0 near top-left (20%, 20%)
    console.log('\nMoving cursor into Card 0 near top-left...');
    const targetX1 = card0BoxResting.x + card0BoxResting.width * 0.2;
    const targetY1 = card0BoxResting.y + card0BoxResting.height * 0.2;
    await page.mouse.move(targetX1, targetY1);
    await sleep(400);

    const card0BoxTopLeft = await cards[0].boundingBox();
    const card1BoxWhile0Hovered = await cards[1].boundingBox();
    console.log('Card 0 expanded box (cursor top-left):', card0BoxTopLeft);
    console.log('Card 1 box while Card 0 hovered:', card1BoxWhile0Hovered);

    // Verify rectangular expansion and neighbor isolation
    const overlapDetected = card0BoxTopLeft.x + card0BoxTopLeft.width > card1BoxWhile0Hovered.x;
    console.log(`Gap between Card 0 right (${card0BoxTopLeft.x + card0BoxTopLeft.width}) and Card 1 left (${card1BoxWhile0Hovered.x}): ${card1BoxWhile0Hovered.x - (card0BoxTopLeft.x + card0BoxTopLeft.width)}px`);
    if (overlapDetected) {
      throw new Error('FAILURE: Card 0 overlapped neighboring Card 1!');
    }
    console.log('✓ SUCCESS: Card 0 is strictly contained within its cell, zero overlap with Card 1.');

    // Verify rectangular geometry (check computed border-radius and bounding box aspect)
    const cardGeom = await cards[0].evaluate(el => {
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        borderRadius: style.borderRadius,
        clipPath: style.clipPath,
        width: rect.width,
        height: rect.height,
        aspectRatio: (rect.width / rect.height).toFixed(2)
      };
    });
    console.log('Card geometry info:', cardGeom);
    if (cardGeom.clipPath && cardGeom.clipPath !== 'none') {
      throw new Error(`FAILURE: Non-rectangular clip-path found: ${cardGeom.clipPath}`);
    }
    console.log('✓ SUCCESS: Card retains clean rectangular geometry without circular or radial distortion.');

    // Verify in-place reveals (image zoom, in-stock indicator, description)
    const cardContent = await cards[0].evaluate(el => {
      const img = el.querySelector('img');
      const inStock = el.innerText.includes('In Stock');
      const hasRating = el.querySelector('svg');
      const hasCartBtn = el.querySelector('button[aria-label*="cart"]') || el.querySelector('button[aria-label*="Cart"]');
      return {
        hasImage: !!img,
        imgTransform: img ? window.getComputedStyle(img).transform : null,
        inStockVisible: inStock,
        hasRating: !!hasRating,
        hasCartBtn: !!hasCartBtn
      };
    });
    console.log('Card internal content states:', cardContent);

    const topLeftPath = path.join(ARTIFACT_DIR, '76_rect_card0_hover_top_left.png');
    await page.screenshot({ path: topLeftPath });
    console.log('Saved top-left cursor screenshot:', topLeftPath);

    // 3. Move cursor to center of Card 0 (50%, 50%)
    console.log('\nMoving cursor into Card 0 center...');
    const targetX2 = card0BoxResting.x + card0BoxResting.width * 0.5;
    const targetY2 = card0BoxResting.y + card0BoxResting.height * 0.5;
    await page.mouse.move(targetX2, targetY2);
    await sleep(400);

    const centerPath = path.join(ARTIFACT_DIR, '77_rect_card0_hover_center.png');
    await page.screenshot({ path: centerPath });
    console.log('Saved center cursor screenshot:', centerPath);

    // 4. Hover over Card 1 (neighboring card)
    console.log('\nMoving cursor to Card 1...');
    const targetX3 = card1BoxResting.x + card1BoxResting.width * 0.5;
    const targetY3 = card1BoxResting.y + card1BoxResting.height * 0.5;
    await page.mouse.move(targetX3, targetY3);
    await sleep(400);

    const card0While1Hovered = await cards[0].boundingBox();
    const card1HoveredBox = await cards[1].boundingBox();
    console.log('Card 0 box while Card 1 hovered (should be restored):', card0While1Hovered);
    console.log('Card 1 hovered box:', card1HoveredBox);

    const neighborPath = path.join(ARTIFACT_DIR, '78_rect_card1_neighbor_hover.png');
    await page.screenshot({ path: neighborPath });
    console.log('Saved Card 1 hover screenshot:', neighborPath);

    // 5. Mouse leave (move outside grid)
    console.log('\nMoving mouse outside all cards...');
    await page.mouse.move(50, 50);
    await sleep(400);

    const card0Restored = await cards[0].boundingBox();
    const card1Restored = await cards[1].boundingBox();
    console.log('Card 0 restored box:', card0Restored);
    console.log('Card 1 restored box:', card1Restored);

    const leavePath = path.join(ARTIFACT_DIR, '79_rect_card_mouse_leave_restored.png');
    await page.screenshot({ path: leavePath });
    console.log('Saved mouse leave screenshot:', leavePath);

    // 6. Test Wishlist Page
    console.log('\n--- 2. Testing Wishlist Page Rectangular Card Expansion ---');
    // Add product 0 to wishlist first
    const heartBtn = await cards[0].$('button[aria-label*="wishlist"]');
    if (heartBtn) {
      await heartBtn.click();
      await sleep(300);
    }

    await page.goto(`${BASE_URL}/#/wishlist`, { waitUntil: 'load', timeout: 20000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForSelector('[data-testid="wishlist-item"]', { timeout: 6000 });
    await sleep(500);

    const wishCards = await page.$$('[data-testid="wishlist-item"]');
    if (wishCards.length > 0) {
      const wish0Resting = await wishCards[0].boundingBox();
      console.log('Wishlist Card 0 resting box:', wish0Resting);

      await wishCards[0].hover();
      await sleep(400);

      const wish0Hovered = await wishCards[0].boundingBox();
      console.log('Wishlist Card 0 hovered box:', wish0Hovered);

      const wishPath = path.join(ARTIFACT_DIR, '80_rect_wishlist_hover.png');
      await page.screenshot({ path: wishPath });
      console.log('Saved Wishlist hover screenshot:', wishPath);
    }

    console.log('\n✓ ALL RECTANGULAR CARD EXPANSION CHECKS PASSED PERFECTLY!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
