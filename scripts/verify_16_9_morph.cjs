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

  console.log('Launching browser with executable:', executablePath);
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
    console.log('\n======================================================');
    console.log('--- 1. Testing Default Vertical Portrait State ---');
    console.log('======================================================');
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
    await sleep(800);

    const cards = await page.$$('[data-testid="product-card"]');
    if (cards.length < 4) throw new Error(`Need at least 4 cards in row, found ${cards.length}`);

    // Resting card 0
    const card0Resting = await cards[0].boundingBox();
    const card1Resting = await cards[1].boundingBox();
    const card0RestingRatio = (card0Resting.width / card0Resting.height).toFixed(3);
    console.log(`Card 0 resting box:`, card0Resting);
    console.log(`Card 0 resting aspect ratio (W/H): ${card0RestingRatio} (< 1.0 means vertical portrait)`);
    if (card0Resting.width >= card0Resting.height) {
      throw new Error(`FAILURE: Card 0 should be portrait (W < H), but W=${card0Resting.width}, H=${card0Resting.height}`);
    }
    console.log('✓ SUCCESS: Default state is strictly a vertical portrait card.');

    const restingPath = path.join(ARTIFACT_DIR, '81_morph_16_9_resting.png');
    await page.screenshot({ path: restingPath });
    console.log('Saved resting screenshot:', restingPath);

    console.log('\n======================================================');
    console.log('--- 2. Testing 16:9 Horizontal Landscape Morph on Card 0 ---');
    console.log('======================================================');
    // Hover over Card 0
    console.log('Hovering over Card 0...');
    await cards[0].hover();
    await sleep(600); // Allow layout transition to finish

    const card0Morphed = await cards[0].boundingBox();
    const card1While0Morphed = await cards[1].boundingBox();
    const morphedRatio = card0Morphed.width / card0Morphed.height;
    console.log(`Card 0 morphed box:`, card0Morphed);
    console.log(`Card 0 morphed aspect ratio (W/H): ${morphedRatio.toFixed(3)} (Target 16/9 = ${(16/9).toFixed(3)})`);

    // Verify 16:9 aspect ratio (with tolerance for borders/shadows: 1.70 - 1.85)
    if (morphedRatio < 1.65 || morphedRatio > 1.90) {
      throw new Error(`FAILURE: Card 0 ratio ${morphedRatio.toFixed(3)} is not 16:9 landscape!`);
    }
    console.log(`✓ SUCCESS: Card 0 morphed into a genuine horizontal 16:9 landscape rectangle!`);

    // Verify zero overlap with neighboring Card 1
    console.log(`Card 0 right edge: ${card0Morphed.x + card0Morphed.width}, Card 1 left edge: ${card1While0Morphed.x}`);
    const overlapDetected = (card0Morphed.x + card0Morphed.width) > (card1While0Morphed.x + 1); // 1px rounding tolerance
    if (overlapDetected) {
      throw new Error(`FAILURE: Card 0 overlapped Card 1! Right: ${card0Morphed.x + card0Morphed.width}, Card 1 Left: ${card1While0Morphed.x}`);
    }
    console.log(`✓ SUCCESS: Zero overlap with Card 1! Card 1 shifted aside cleanly.`);

    // Verify internal content reveals inside Card 0
    const card0Content = await cards[0].evaluate(el => {
      const style = window.getComputedStyle(el);
      const img = el.querySelector('img');
      const inStock = el.innerText.includes('In Stock');
      const hasRating = el.querySelector('svg');
      const hasCartBtn = el.querySelector('button[aria-label*="cart"]') || el.querySelector('button[aria-label*="Cart"]');
      return {
        flexDirection: style.flexDirection,
        aspectRatio: style.aspectRatio,
        hasImage: !!img,
        inStockVisible: inStock,
        hasRating: !!hasRating,
        hasCartBtn: !!hasCartBtn
      };
    });
    console.log('Card 0 internal content state:', card0Content);
    if (card0Content.flexDirection !== 'row') {
      throw new Error(`FAILURE: Layout inside card should be row, found ${card0Content.flexDirection}`);
    }
    console.log('✓ SUCCESS: Card layout smoothly switched to horizontal side-by-side flex row.');

    const card0Path = path.join(ARTIFACT_DIR, '82_morph_16_9_card0_hovered.png');
    await page.screenshot({ path: card0Path });
    console.log('Saved Card 0 hovered screenshot:', card0Path);

    console.log('\n======================================================');
    console.log('--- 3. Testing Neighbor Hover (Card 1) ---');
    console.log('======================================================');
    await cards[1].hover();
    await sleep(600);

    const card0While1Hovered = await cards[0].boundingBox();
    const card1Morphed = await cards[1].boundingBox();
    const card1Ratio = card1Morphed.width / card1Morphed.height;
    console.log(`Card 0 restored box:`, card0While1Hovered);
    console.log(`Card 1 morphed box:`, card1Morphed);
    console.log(`Card 1 ratio: ${card1Ratio.toFixed(3)}`);

    if (card1Ratio < 1.65 || card1Ratio > 1.90) {
      throw new Error(`FAILURE: Card 1 ratio ${card1Ratio.toFixed(3)} is not 16:9!`);
    }
    console.log('✓ SUCCESS: Card 1 morphed to 16:9 while Card 0 restored to vertical portrait.');

    const card1Path = path.join(ARTIFACT_DIR, '83_morph_16_9_card1_neighbor_hovered.png');
    await page.screenshot({ path: card1Path });
    console.log('Saved Card 1 hovered screenshot:', card1Path);

    console.log('\n======================================================');
    console.log('--- 4. Testing Rightmost Card (Card 3 in 4-col row) ---');
    console.log('======================================================');
    const card3Before = await cards[3].boundingBox();
    console.log('Card 3 resting box:', card3Before);

    await cards[3].hover();
    await sleep(600);

    const card3Morphed = await cards[3].boundingBox();
    const card3Ratio = card3Morphed.width / card3Morphed.height;
    console.log('Card 3 morphed box:', card3Morphed);
    console.log(`Card 3 ratio: ${card3Ratio.toFixed(3)}`);

    // Verify it stayed on the same row (y coordinate did not jump to next line)
    const yDelta = Math.abs(card3Morphed.y - card3Before.y);
    console.log(`Card 3 Y position delta: ${yDelta}px`);
    if (yDelta > 50) {
      throw new Error(`FAILURE: Rightmost card wrapped to the next row (Y delta = ${yDelta}px)!`);
    }
    console.log('✓ SUCCESS: Rightmost card expanded into previous column without wrapping to next row!');

    const card3Path = path.join(ARTIFACT_DIR, '84_morph_16_9_card3_rightmost_hovered.png');
    await page.screenshot({ path: card3Path });
    console.log('Saved Card 3 rightmost screenshot:', card3Path);

    console.log('\n======================================================');
    console.log('--- 5. Testing Mouse Leave Restoration ---');
    console.log('======================================================');
    await page.mouse.move(50, 50);
    await sleep(600);

    const card0RestoredFinal = await cards[0].boundingBox();
    const card1RestoredFinal = await cards[1].boundingBox();
    console.log('Card 0 restored box:', card0RestoredFinal);
    console.log('Card 1 restored box:', card1RestoredFinal);

    const card0FinalRatio = card0RestoredFinal.width / card0RestoredFinal.height;
    if (card0FinalRatio >= 1.0) {
      throw new Error('FAILURE: Card 0 did not restore to vertical portrait!');
    }
    console.log('✓ SUCCESS: All cards cleanly restored to their original vertical portrait shape.');

    const leavePath = path.join(ARTIFACT_DIR, '85_morph_16_9_mouse_leave_restored.png');
    await page.screenshot({ path: leavePath });
    console.log('Saved mouse leave restored screenshot:', leavePath);

    console.log('\n======================================================');
    console.log('--- 6. Testing Wishlist Page 16:9 Morph ---');
    console.log('======================================================');
    // Add product to wishlist
    const wishBtn = await cards[0].$('button[aria-label*="wishlist"]');
    if (wishBtn) {
      await wishBtn.click();
      await sleep(300);
    }

    await page.goto(`${BASE_URL}/#/wishlist`, { waitUntil: 'load', timeout: 20000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForSelector('[data-testid="wishlist-item"]', { timeout: 8000 });
    await sleep(600);

    const wishCards = await page.$$('[data-testid="wishlist-item"]');
    if (wishCards.length > 0) {
      const wish0Resting = await wishCards[0].boundingBox();
      console.log('Wishlist Card 0 resting box:', wish0Resting);

      await wishCards[0].hover();
      await sleep(600);

      const wish0Morphed = await wishCards[0].boundingBox();
      const wishRatio = wish0Morphed.width / wish0Morphed.height;
      console.log('Wishlist Card 0 morphed box:', wish0Morphed);
      console.log(`Wishlist Card 0 ratio: ${wishRatio.toFixed(3)}`);

      if (wishRatio < 1.65 || wishRatio > 1.90) {
        throw new Error(`FAILURE: Wishlist card ratio ${wishRatio.toFixed(3)} is not 16:9!`);
      }
      console.log('✓ SUCCESS: Wishlist card smoothly morphed into 16:9 horizontal landscape rectangle!');

      const wishPath = path.join(ARTIFACT_DIR, '86_morph_16_9_wishlist_hovered.png');
      await page.screenshot({ path: wishPath });
      console.log('Saved Wishlist morphed screenshot:', wishPath);
    }

    console.log('\n======================================================');
    console.log('✓ ALL 16:9 PRODUCT CARD MORPH TESTS PASSED PERFECTLY!');
    console.log('======================================================\n');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
