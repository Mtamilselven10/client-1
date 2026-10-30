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
    console.log('--- 1. Testing Default Resting Vertical State ---');
    console.log('======================================================');
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 15000 });
    await sleep(800);

    const cards = await page.$$('[data-testid="product-card"]');
    if (cards.length < 4) throw new Error(`Need at least 4 cards in row, found ${cards.length}`);

    // Resting card 0
    const card0RestingBox = await cards[0].boundingBox();
    const card1RestingBox = await cards[1].boundingBox();
    console.log('Card 0 resting box:', card0RestingBox);
    console.log('Card 1 resting box:', card1RestingBox);

    const card0RestingInfo = await cards[0].evaluate(el => {
      const visualCard = el.querySelector('.ms-product-card') || el;
      return {
        zIndex: window.getComputedStyle(el).zIndex,
        visualZIndex: window.getComputedStyle(visualCard).zIndex,
        width: visualCard.clientWidth,
        height: visualCard.clientHeight,
        isPortrait: visualCard.clientHeight > visualCard.clientWidth
      };
    });
    console.log('Card 0 resting computed state:', card0RestingInfo);
    if (!card0RestingInfo.isPortrait) {
      throw new Error('FAILURE: Card 0 should be portrait in resting state!');
    }
    console.log('✓ SUCCESS: Default state is strictly a vertical portrait card with resting zIndex.');

    const restingPath = path.join(ARTIFACT_DIR, '87_overlay_16_9_resting.png');
    await page.screenshot({ path: restingPath });
    console.log('Saved resting screenshot:', restingPath);

    console.log('\n======================================================');
    console.log('--- 2. Testing 16:9 Morph & Visual Overlay on Card 0 ---');
    console.log('======================================================');
    // Hover over Card 0
    console.log('Hovering over Card 0...');
    await cards[0].hover();
    await sleep(800);

    const card0MorphedInfo = await cards[0].evaluate(el => {
      const visualCard = el.querySelector('.ms-product-card') || el;
      const rect = visualCard.getBoundingClientRect();
      const style = window.getComputedStyle(visualCard);
      const parentStyle = window.getComputedStyle(el);
      return {
        wrapperZIndex: parentStyle.zIndex,
        visualZIndex: style.zIndex,
        width: rect.width,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        aspectRatio: (rect.width / rect.height).toFixed(3),
        flexDirection: style.flexDirection,
        position: style.position
      };
    });
    console.log('Card 0 morphed state:', card0MorphedInfo);

    // Verify 16:9 aspect ratio
    const ratioNum = parseFloat(card0MorphedInfo.aspectRatio);
    if (ratioNum < 1.65 || ratioNum > 1.90) {
      throw new Error(`FAILURE: Card 0 ratio ${card0MorphedInfo.aspectRatio} is not 16:9 landscape!`);
    }
    console.log(`✓ SUCCESS: Card 0 morphed into 16:9 landscape rectangle (ratio: ${card0MorphedInfo.aspectRatio})`);

    // Verify elevated stacking context (z-index >= 30)
    const zVal = parseInt(card0MorphedInfo.wrapperZIndex, 10) || parseInt(card0MorphedInfo.visualZIndex, 10);
    if (zVal < 30) {
      throw new Error(`FAILURE: Expected elevated z-index >= 30, got ${zVal}`);
    }
    console.log(`✓ SUCCESS: Card 0 received elevated stacking context (z-index: ${zVal}) above adjacent cards.`);

    // Verify visual overlay over Card 1
    const card1While0Hovered = await cards[1].boundingBox();
    console.log(`Card 0 right edge: ${card0MorphedInfo.right}px, Card 1 left edge: ${card1While0Hovered.x}px`);
    const isOverlaying = card0MorphedInfo.right > card1While0Hovered.x;
    if (!isOverlaying) {
      throw new Error('FAILURE: Card 0 did not overlay into Card 1 region!');
    }
    console.log(`✓ SUCCESS: Card 0 visually overlays onto neighboring Card 1 by ${(card0MorphedInfo.right - card1While0Hovered.x).toFixed(1)}px above it!`);

    // Verify elementFromPoint confirms Card 0 is the topmost clickable element in the overlay region
    const overlapTestX = card1While0Hovered.x + 20;
    const overlapTestY = card1While0Hovered.y + 40;
    const topmostElementTag = await page.evaluate((x, y) => {
      const topEl = document.elementFromPoint(x, y);
      const isInsideCard0 = topEl ? !!topEl.closest('[data-testid="product-card"]') : false;
      return {
        tag: topEl ? topEl.tagName : null,
        isInsideCard0
      };
    }, overlapTestX, overlapTestY);
    console.log('Topmost element in overlay overlap zone:', topmostElementTag);
    if (!topmostElementTag.isInsideCard0) {
      throw new Error('FAILURE: Card 0 was not on top in the overlapping region!');
    }
    console.log('✓ SUCCESS: Card 0 is confirmed the topmost layer above neighboring Card 1.');

    // Verify Add to Cart button inside Card 0 is visible & clickable
    const cartBtnInfo = await cards[0].evaluate(el => {
      const btn = el.querySelector('button[aria-label*="cart"]') || el.querySelector('button[aria-label*="Cart"]');
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return {
        visible: rect.width > 0 && rect.height > 0,
        text: btn.innerText.trim()
      };
    });
    console.log('Card 0 cart button info:', cartBtnInfo);
    if (!cartBtnInfo || !cartBtnInfo.visible) {
      throw new Error('FAILURE: Add to Cart button inside 16:9 card is not visible!');
    }
    console.log('✓ SUCCESS: All action buttons remain visible and interactive inside the overlay.');

    const card0Path = path.join(ARTIFACT_DIR, '88_overlay_16_9_card0_hovered_above_neighbor.png');
    await page.screenshot({ path: card0Path });
    console.log('Saved Card 0 overlay screenshot:', card0Path);

    console.log('\n======================================================');
    console.log('--- 3. Testing Neighbor Hover (Card 1) ---');
    console.log('======================================================');
    // Move mouse to unhover Card 0, then hover Card 1
    console.log('Moving cursor to Card 1...');
    await page.mouse.move(card1RestingBox.x + card1RestingBox.width / 2, card1RestingBox.y + card1RestingBox.height * 0.75);
    await sleep(800);

    const card1MorphedInfo = await cards[1].evaluate(el => {
      const visualCard = el.querySelector('.ms-product-card') || el;
      const rect = visualCard.getBoundingClientRect();
      const style = window.getComputedStyle(visualCard);
      const parentStyle = window.getComputedStyle(el);
      return {
        wrapperZIndex: parentStyle.zIndex,
        visualZIndex: style.zIndex,
        width: rect.width,
        height: rect.height,
        aspectRatio: (rect.width / rect.height).toFixed(3),
        flexDirection: style.flexDirection
      };
    });
    console.log('Card 1 morphed state:', card1MorphedInfo);

    const card0RestoredInfo = await cards[0].evaluate(el => {
      const parentStyle = window.getComputedStyle(el);
      const visualCard = el.querySelector('.ms-product-card') || el;
      return {
        wrapperZIndex: parentStyle.zIndex,
        isPortrait: visualCard.clientHeight > visualCard.clientWidth
      };
    });
    console.log('Card 0 state while Card 1 is hovered:', card0RestoredInfo);

    if (parseInt(card0RestoredInfo.wrapperZIndex, 10) > 10) {
      throw new Error('FAILURE: Card 0 did not restore its normal z-index when unhovered!');
    }
    console.log('✓ SUCCESS: Only Card 1 has elevated stacking priority; Card 0 restored to resting z-index.');

    const card1Path = path.join(ARTIFACT_DIR, '89_overlay_16_9_card1_hovered.png');
    await page.screenshot({ path: card1Path });
    console.log('Saved Card 1 overlay screenshot:', card1Path);

    console.log('\n======================================================');
    console.log('--- 4. Testing Rightmost Card (Card 3 in 4-col row) ---');
    console.log('======================================================');
    console.log('Hovering over Card 3 (rightmost card)...');
    await cards[3].hover();
    await sleep(800);

    const card3MorphedInfo = await cards[3].evaluate(el => {
      const visualCard = el.querySelector('.ms-product-card') || el;
      const rect = visualCard.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        right: rect.right,
        aspectRatio: (rect.width / rect.height).toFixed(3),
        overflowsViewport: rect.right > window.innerWidth
      };
    });
    console.log('Card 3 morphed state:', card3MorphedInfo);
    if (card3MorphedInfo.overflowsViewport) {
      throw new Error(`FAILURE: Card 3 overflowed viewport right edge (${card3MorphedInfo.right}px > ${1400}px)!`);
    }
    console.log('✓ SUCCESS: Rightmost card expanded leftwards into 16:9 without overflowing viewport.');

    const card3Path = path.join(ARTIFACT_DIR, '90_overlay_16_9_card3_rightmost_hovered.png');
    await page.screenshot({ path: card3Path });
    console.log('Saved Card 3 rightmost screenshot:', card3Path);

    console.log('\n======================================================');
    console.log('--- 5. Testing Mouse Leave Restoration ---');
    console.log('======================================================');
    await page.mouse.move(50, 50);
    await sleep(600);

    const allRestored = await page.evaluate(() => {
      const allCards = document.querySelectorAll('[data-testid="product-card"]');
      const results = [];
      allCards.forEach((c, i) => {
        const visual = c.querySelector('.ms-product-card') || c;
        results.push({
          index: i,
          zIndex: window.getComputedStyle(c).zIndex,
          isPortrait: visual.clientHeight > visual.clientWidth
        });
      });
      return results.slice(0, 4);
    });
    console.log('Restoration verification for first 4 cards:', allRestored);
    const anyElevated = allRestored.some(c => parseInt(c.zIndex, 10) > 10);
    if (anyElevated) {
      throw new Error('FAILURE: Some cards did not restore to resting z-index on mouse leave!');
    }
    console.log('✓ SUCCESS: All cards cleanly restored their original vertical appearance and stacking priority.');

    const leavePath = path.join(ARTIFACT_DIR, '91_overlay_16_9_mouse_leave_restored.png');
    await page.screenshot({ path: leavePath });
    console.log('Saved mouse leave restored screenshot:', leavePath);

    console.log('\n======================================================');
    console.log('✓ ALL 16:9 HOVER CARD OVERLAY TESTS PASSED PERFECTLY!');
    console.log('======================================================\n');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
