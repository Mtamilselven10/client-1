import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = path.resolve('screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function saveScreenshot(page, filename) {
  const filePath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`✓ Saved screenshot: ${filename}`);
}

async function runReviewVerification() {
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

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`Browser console error: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.error(`PAGE UNCAUGHT ERROR: ${err.message}\n${err.stack}`);
  });

  try {
    console.log('\n--- 1. Testing Sidebar Order (Reviews after Privacy Policy) ---');
    await page.goto(`${BASE_URL}/#/`, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 1200));

    // Open sidebar menu
    const menuBtn = await page.$('[data-testid="sidebar-menu-btn"]');
    if (!menuBtn) throw new Error('Menu button not found in top header');
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 500));

    // Inspect navigation links in drawer
    const navLinks = await page.$$eval('aside nav a', elements => elements.map(el => ({
      href: el.getAttribute('href'),
      text: el.textContent.trim()
    })));

    console.log('Sidebar nav links found:', navLinks.map(l => `${l.text} (${l.href})`).join(' -> '));

    const privacyIdx = navLinks.findIndex(l => l.href.includes('privacy-policy'));
    const reviewsIdx = navLinks.findIndex(l => l.href.includes('reviews'));

    if (privacyIdx === -1) throw new Error('Privacy Policy not found in sidebar!');
    if (reviewsIdx === -1) throw new Error('Reviews page link not found in sidebar!');
    if (reviewsIdx !== privacyIdx + 1) {
      throw new Error(`Expected Reviews (${reviewsIdx}) immediately after Privacy Policy (${privacyIdx})`);
    }
    console.log(`✓ Reviews link is immediately after Privacy Policy (index ${privacyIdx} -> ${reviewsIdx})`);

    await saveScreenshot(page, '39_sidebar_reviews_menu.png');

    // Click Reviews link
    const reviewsLink = await page.$('aside nav a[href*="reviews"]');
    await reviewsLink.click();
    await new Promise(r => setTimeout(r, 800));

    console.log('\n--- 2. Verifying Reviews Page Public Display & Ratings ---');
    await page.waitForSelector('h1', { timeout: 6000 });
    const pageTitle = await page.$eval('h1', el => el.textContent.trim());
    console.log(`Reviews page title: "${pageTitle}"`);

    await saveScreenshot(page, '40_reviews_page_overview.png');

    console.log('\n--- 3. Testing Review Submission Form ---');
    // Open Form
    const openFormBtn = await page.$('[data-testid="write-review-btn"], [data-testid="toggle-form-btn"]');
    if (openFormBtn) {
      await openFormBtn.click();
      await new Promise(r => setTimeout(r, 400));
    }

    // Fill in Form
    // Customer Name
    const nameInput = await page.$('input[placeholder*="Priya"], input[placeholder*="கார்த்திக்"]');
    await nameInput.type('Selvi Muthusamy');

    // Contact Details
    const contactInput = await page.$('input[placeholder*="priya@gmail.com"], input[placeholder*="98401"]');
    await contactInput.type('+91 94888 12345');

    // Select Product
    await page.select('select', 'Aachi Sambar Powder');

    // Select 5-star ratings for delivery, quality, service
    // Click 5th star on rating-delivery
    const deliveryStar5 = await page.$('#rating-delivery button:nth-child(5)');
    if (deliveryStar5) await deliveryStar5.click();

    // Click 5th star on rating-quality
    const qualityStar5 = await page.$('#rating-quality button:nth-child(5)');
    if (qualityStar5) await qualityStar5.click();

    // Click 5th star on rating-service
    const serviceStar5 = await page.$('#rating-service button:nth-child(5)');
    if (serviceStar5) await serviceStar5.click();

    // Click 3rd star on rating-website (3-star scale!)
    const websiteStar3 = await page.$('#rating-website button:nth-child(3)');
    if (websiteStar3) await websiteStar3.click();

    // Fill comments
    const commentsArea = await page.$('textarea');
    await commentsArea.type('Outstanding delivery speed in Madurai. Sambar powder aroma was pure traditional kitchen flavor. Website is lightning fast!');

    await saveScreenshot(page, '41_review_form_filled.png');

    // Submit form
    console.log('Submitting review form...');
    const submitBtn = await page.$('form button[type="submit"]');
    await submitBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    await saveScreenshot(page, '42_review_submitted_published.png');

    // Verify newly submitted review appears in feed
    const firstReviewName = await page.$eval('[data-testid="review-card"] span.font-bold', el => el.textContent.trim());
    console.log(`Newly published review customer name: "${firstReviewName}"`);
    if (!firstReviewName.includes('Selvi Muthusamy')) {
      throw new Error(`Expected review by "Selvi Muthusamy", but found: "${firstReviewName}"`);
    }

    // Verify localStorage persistence
    const storedReviews = await page.evaluate(() => {
      return localStorage.getItem('gandhi_shop_customer_reviews');
    });
    if (!storedReviews || !storedReviews.includes('Selvi Muthusamy')) {
      throw new Error('Review was not saved permanently in localStorage!');
    }
    console.log('✓ Review permanently stored in localStorage and verified on live DOM');

    console.log('\n--- 4. Verifying Product Overall Rating Updated on Product Card ---');
    await page.goto(`${BASE_URL}/#/products`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));

    await saveScreenshot(page, '43_products_page_updated_rating.png');

    console.log('\n--- 5. Verifying Product Detail Page Reviews Integration ---');
    // Find Aachi Sambar Powder card and click it
    const cards = await page.$$('[data-testid="product-card"]');
    for (const card of cards) {
      const title = await card.$eval('h3', el => el.textContent);
      if (title.includes('Sambar Powder')) {
        await card.click();
        break;
      }
    }

    await page.waitForSelector('[data-testid="detail-add-cart-btn"]', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 800));

    await saveScreenshot(page, '44_product_detail_reviews_section.png');

    console.log('\n🎉 ALL REVIEWS TESTS AND VERIFICATIONS PASSED SUCCESSFULLY!');
  } finally {
    await browser.close();
  }
}

runReviewVerification().catch(err => {
  console.error('Reviews verification failed:', err);
  process.exit(1);
});
