import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const BROWSER_PATH = fs.existsSync(CHROME_PATH) ? CHROME_PATH : EDGE_PATH;

async function testBanner() {
  const browser = await puppeteer.launch({
    executablePath: BROWSER_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Screenshot 1: Desktop Hero Banner
  await page.screenshot({ path: path.resolve('screenshots/55_flipkart_banner_hero.png') });
  console.log('✓ Saved 55_flipkart_banner_hero.png');

  // Scroll down to test sticky header follow and marquee
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
  await new Promise(r => setTimeout(r, 900));
  await page.screenshot({ path: path.resolve('screenshots/56_scroll_follow_marquee.png') });
  console.log('✓ Saved 56_scroll_follow_marquee.png');

  // Next slide click test
  await page.click('button[aria-label="Next Slide"]');
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.resolve('screenshots/57_banner_slide_2.png') });
  console.log('✓ Saved 57_banner_slide_2.png');

  // Mobile viewport
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: path.resolve('screenshots/58_flipkart_banner_mobile.png') });
  console.log('✓ Saved 58_flipkart_banner_mobile.png');

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

testBanner().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
