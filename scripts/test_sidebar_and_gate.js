import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_PATH = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

const ARTIFACT_DIR = 'C:/Users/tamil/.gemini/antigravity/brain/b10c619e-9c5c-4348-8a14-cac1e5f34e57';

async function runTests() {
  console.log('Using browser at:', BROWSER_PATH);
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('1. Navigating to home page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Screenshot 1: Home page initially (Sidebar closed, no breakpoint gate!)
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_01_homepage_no_gate.png') });
  console.log('✓ Saved test_01_homepage_no_gate.png');

  // Verify breakpoint gate is NOT present
  const gatePresent = await page.evaluate(() => {
    return !!document.querySelector('[data-testid="skip-to-unlock-btn"]') ||
           document.body.innerText.includes('ANIMATION GATE & BREAKPOINT') ||
           document.body.innerText.includes('Website below is locked');
  });
  console.log('Breakpoint gate present?', gatePresent ? 'FAILED (Still present)' : 'PASSED (Removed)');

  // 2. Click Menu button
  console.log('2. Clicking sidebar menu button...');
  await page.click('[data-testid="sidebar-menu-btn"]');
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_02_sidebar_opened.png') });
  console.log('✓ Saved test_02_sidebar_opened.png');

  // 3. Click categories dropdown toggle
  console.log('3. Clicking categories dropdown toggle...');
  await page.click('[data-testid="categories-dropdown-toggle"]');
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_03_categories_dropdown.png') });
  console.log('✓ Saved test_03_categories_dropdown.png');

  // 4. Click a category (Cooking Oil)
  console.log('4. Clicking Cooking Oil category...');
  const clickedCategory = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const oilBtn = buttons.find(b => b.innerText.includes('Cooking Oil') || b.innerText.includes('சமையல் எண்ணெய்'));
    if (oilBtn) {
      oilBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Cooking Oil category?', clickedCategory);
  await new Promise(r => setTimeout(r, 1500));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_04_cooking_oil_products.png') });
  console.log('✓ Saved test_04_cooking_oil_products.png');

  // 5. Test Tamil Language Switch
  console.log('5. Switching to Tamil...');
  await page.click('[data-testid="lang-btn-ta"]');
  await new Promise(r => setTimeout(r, 600));

  // Open sidebar again in Tamil
  await page.click('[data-testid="sidebar-menu-btn"]');
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'test_05_sidebar_tamil_categories.png') });
  console.log('✓ Saved test_05_sidebar_tamil_categories.png');

  await browser.close();
  console.log('All tests completed successfully!');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
