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
    console.log('\n--- 1. Testing Hover-Triggered Preview Popover on Products Page ---');
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));

    // Hover over the first product card
    const firstCard = await page.$('[data-testid="product-card"]');
    const firstCardTitle = await firstCard.$eval('h3', el => el.textContent.trim());
    console.log(`Hovering over card for: "${firstCardTitle}"...`);

    await firstCard.hover();
    // Wait 350ms for 220ms hover intent delay + 100ms fade/scale
    await new Promise(r => setTimeout(r, 450));

    // Assert popover is rendered and visible
    const popover = await page.waitForSelector('[data-testid="product-preview-popover"]', { timeout: 4000 });
    if (!popover) throw new Error('Preview popover did not appear on hover!');

    const popoverTitle = await page.$eval('[data-testid="product-preview-popover"] h3', el => el.textContent.trim());
    console.log(`Popover opened with title: "${popoverTitle}"`);
    if (popoverTitle !== firstCardTitle) {
      throw new Error(`Popover title "${popoverTitle}" does not match card title "${firstCardTitle}"`);
    }

    // Check availability indicator
    const hasInStock = await page.evaluate(() => {
      const p = document.querySelector('[data-testid="product-preview-popover"]');
      return p ? p.innerText.includes('In Stock') : false;
    });
    console.log(`In Stock indicator present: ${hasInStock}`);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '60_ms_store_popover_open.png') });
    console.log('✓ Saved screenshot: 60_ms_store_popover_open.png');

    console.log('\n--- 2. Testing Moving Pointer from Card into Preview Popover ---');
    await popover.hover();
    // Wait 350ms - should remain open and interactive
    await new Promise(r => setTimeout(r, 400));

    const isStillOpen = await page.$('[data-testid="product-preview-popover"]');
    if (!isStillOpen) throw new Error('Popover closed when mouse moved into it!');
    console.log('✓ Popover remained open and fully interactive when mouse entered!');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '61_ms_store_popover_hover_inside.png') });
    console.log('✓ Saved screenshot: 61_ms_store_popover_hover_inside.png');

    console.log('\n--- 3. Testing "Add to Cart" Action Inside Popover ---');
    const addBtn = await page.$('[data-testid="preview-popover-add-cart-btn"]');
    await addBtn.click();
    await new Promise(r => setTimeout(r, 500));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '62_ms_store_popover_added_to_cart.png') });
    console.log('✓ Saved screenshot: 62_ms_store_popover_added_to_cart.png');

    console.log('\n--- 4. Testing Dismiss on Mouse Leave ---');
    await page.mouse.move(0, 0);
    // Wait for popover to dismiss and unmount from DOM
    await page.waitForSelector('[data-testid="product-preview-popover"]', { hidden: true, timeout: 3000 });
    console.log('✓ Popover dismissed smoothly when mouse left both areas!');

    console.log('\n--- 5. Testing Viewport Boundary / Right-Edge Card Positioning ---');
    // Find right-most card on first row
    const cards = await page.$$('[data-testid="product-card"]');
    if (cards.length >= 4) {
      const rightCard = cards[3]; // 4th column
      await rightCard.hover();
      await new Promise(r => setTimeout(r, 450));

      const popoverBox = await page.evaluate(() => {
        const p = document.querySelector('[data-testid="product-preview-popover"]');
        if (!p) return null;
        const r = p.getBoundingClientRect();
        return {
          right: r.right,
          left: r.left,
          viewportWidth: window.innerWidth,
          overflows: r.right > window.innerWidth
        };
      });
      console.log('Right-edge card popover position:', popoverBox);
      if (popoverBox && popoverBox.overflows) {
        throw new Error(`Popover overflowed viewport! right: ${popoverBox.right}, viewport: ${popoverBox.viewportWidth}`);
      }
      console.log('✓ Intelligent positioning kept popover completely inside viewport!');
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '64_ms_store_popover_boundary_check.png') });
      console.log('✓ Saved screenshot: 64_ms_store_popover_boundary_check.png');
      await page.mouse.move(0, 0);
      await new Promise(r => setTimeout(r, 400));
    }

    console.log('\n--- 6. Testing Wishlist Page Hover Preview Popover ---');
    // Ensure an item is in the wishlist
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 600));

    const heartBtn = await page.$('[data-testid="product-card"] button[aria-label*="wishlist"]');
    if (heartBtn) {
      await heartBtn.click();
      await new Promise(r => setTimeout(r, 500));
    }

    await page.goto(`${BASE_URL}/#/wishlist`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="wishlist-item"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));

    const wishCard = await page.$('[data-testid="wishlist-item"]');
    await wishCard.hover();
    await new Promise(r => setTimeout(r, 450));

    const wishPopover = await page.waitForSelector('[data-testid="product-preview-popover"]', { timeout: 4000 });
    if (!wishPopover) throw new Error('Wishlist popover did not appear!');
    console.log('✓ Wishlist popover rendered successfully!');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '63_ms_store_wishlist_popover.png') });
    console.log('✓ Saved screenshot: 63_ms_store_wishlist_popover.png');

    console.log('\n🎉 ALL MICROSOFT STORE PREVIEW POPOVER TESTS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error('Popover verification failed:', err);
  process.exit(1);
});
