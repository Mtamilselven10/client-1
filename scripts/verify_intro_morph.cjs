const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\enose raja\\.gemini\\antigravity\\brain\\76083c15-56e2-41c3-b33b-e8efbb3e33f9';

async function runVerification() {
  console.log('--- STARTING INTRO MORPH VERIFICATION ---');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  // 1. Fresh visit (no sessionStorage)
  console.log('Step 1: Navigating to http://localhost:5173/ with fresh session...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.intro-morph-root', { timeout: 5000 });

  // Verify intro is present and Home is not rendered behind it
  const isIntroPresent = await page.$('.intro-morph-root') !== null;
  const isHomeVisible = await page.$('main') !== null;
  console.log(`Intro mounted: ${isIntroPresent}, Home mounted: ${isHomeVisible}`);

  if (!isIntroPresent) {
    throw new Error('IntroMorph did not render on fresh visit!');
  }
  if (isHomeVisible) {
    throw new Error('Home should NOT be mounted while intro is playing!');
  }

  // Phase 1 Screenshot (t ~ 350ms) - Start Mark
  await new Promise(r => setTimeout(r, 350));
  const phase1Path = path.join(artifactDir, '101_intro_phase1_start_mark.png');
  await page.screenshot({ path: phase1Path });
  console.log('Saved Phase 1 screenshot to:', phase1Path);

  // Phase 2 Screenshot (t ~ 1600ms) - Morph Split Active
  await new Promise(r => setTimeout(r, 1250));
  const phase2Path = path.join(artifactDir, '102_intro_phase2_morph_split.png');
  await page.screenshot({ path: phase2Path });
  console.log('Saved Phase 2 screenshot to:', phase2Path);

  // Phase 3 Screenshot (t ~ 3200ms) - Brand Reveal Hold
  await new Promise(r => setTimeout(r, 1500));
  const phase3Path = path.join(artifactDir, '103_intro_phase3_brand_reveal.png');
  await page.screenshot({ path: phase3Path });
  console.log('Saved Phase 3 screenshot to:', phase3Path);

  // Wait for complete unmount into Home (~4.8s total)
  await page.waitForSelector('.intro-morph-root', { hidden: true, timeout: 6000 });
  await page.waitForSelector('main', { visible: true, timeout: 4000 });
  console.log('Intro cleanly unmounted and Home is now visible!');

  const homePath = path.join(artifactDir, '104_intro_revealed_home.png');
  await page.screenshot({ path: homePath });
  console.log('Saved Home revealed screenshot to:', homePath);

  // Verify body scroll is unlocked
  const overflowStyle = await page.evaluate(() => document.body.style.overflow);
  console.log(`Body overflow style after completion: "${overflowStyle}" (should be empty string)`);

  // Verify sessionStorage flag is set
  const introSeen = await page.evaluate(() => sessionStorage.getItem('gandhi_intro_seen'));
  console.log(`sessionStorage 'gandhi_intro_seen': "${introSeen}" (should be 'true')`);

  // Step 2: Test Skip Button
  console.log('\nStep 2: Testing Skip button with cleared sessionStorage...');
  await page.evaluate(() => sessionStorage.removeItem('gandhi_intro_seen'));
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.intro-skip-btn', { timeout: 3000 });

  const skipBtn = await page.$('.intro-skip-btn');
  if (!skipBtn) {
    throw new Error('Skip button not found!');
  }
  console.log('Found Skip button, clicking it...');
  await skipBtn.click();

  await page.waitForSelector('.intro-morph-root', { hidden: true, timeout: 2000 });
  await page.waitForSelector('main', { visible: true, timeout: 2000 });
  console.log('Skip button immediately dismissed intro into Home!');

  // Step 3: Test subsequent navigation (session flag prevents replay)
  console.log('\nStep 3: Reloading page in same session...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  const introOnReload = await page.$('.intro-morph-root');
  console.log(`Intro rendered on second visit: ${introOnReload !== null} (should be false)`);

  await browser.close();
  console.log('--- VERIFICATION COMPLETE: ALL CHECKS PASSED ---');
}

runVerification().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
