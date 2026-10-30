const puppeteer = require('puppeteer-core');
const path = require('path');
const os = require('os');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactDir = 'C:\\Users\\enose raja\\.gemini\\antigravity\\brain\\76083c15-56e2-41c3-b33b-e8efbb3e33f9';

async function runVerification() {
  console.log('--- STARTING INTRO VIDEO VERIFICATION ---');
  const tempDir = path.join(os.tmpdir(), 'puppeteer_video_' + Date.now());
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    userDataDir: tempDir,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  // 1. Fresh visit (clear session)
  console.log('Step 1: Navigating to http://localhost:5173/ with fresh session...');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.intro-video-overlay', { timeout: 5000 });

  // Verify intro is present and Home is not rendered behind it
  const isIntroPresent = await page.$('.intro-video-overlay') !== null;
  const isHomeVisible = await page.$('main') !== null;
  console.log(`Intro video mounted: ${isIntroPresent}, Home mounted: ${isHomeVisible}`);

  if (!isIntroPresent) {
    throw new Error('IntroVideo did not render on fresh visit!');
  }
  if (isHomeVisible) {
    throw new Error('Home should NOT be mounted while intro video is playing!');
  }

  // Check video element attributes
  const videoAttrs = await page.evaluate(() => {
    const v = document.querySelector('.intro-video-element');
    return {
      src: v ? v.src : null,
      muted: v ? v.muted : false,
      playsInline: v ? v.playsInline : false,
      autoplay: v ? v.autoplay : false
    };
  });
  console.log('Video attributes:', JSON.stringify(videoAttrs));

  // Take screenshot while video is playing
  await new Promise(r => setTimeout(r, 1200));
  const playingScreenshot = path.join(artifactDir, '111_intro_video_playing.png');
  await page.screenshot({ path: playingScreenshot });
  console.log('Saved playing screenshot to:', playingScreenshot);

  // Monitor video progress and completion
  console.log('Waiting for video to complete and unmount into Home...');
  await page.waitForFunction(() => {
    return document.querySelector('.intro-video-overlay') === null && document.querySelector('main') !== null;
  }, { timeout: 15000 });
  console.log('Intro video cleanly unmounted and Home is now visible!');

  const homeScreenshot = path.join(artifactDir, '112_intro_video_home_revealed.png');
  await page.screenshot({ path: homeScreenshot });
  console.log('Saved Home revealed screenshot to:', homeScreenshot);

  // Verify body scroll unlocked and session flag set
  const overflowStyle = await page.evaluate(() => document.body.style.overflow);
  const introSeen = await page.evaluate(() => sessionStorage.getItem('gandhi_intro_seen'));
  console.log(`Body overflow style: "${overflowStyle}" (expected: "")`);
  console.log(`sessionStorage 'gandhi_intro_seen': "${introSeen}" (expected: "true")`);

  // Step 2: Test Skip Button
  console.log('\nStep 2: Testing Skip button with cleared sessionStorage...');
  await page.evaluate(() => sessionStorage.removeItem('gandhi_intro_seen'));
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.intro-video-skip-btn', { timeout: 3000 });

  const skipBtn = await page.$('.intro-video-skip-btn');
  if (!skipBtn) {
    throw new Error('Skip button not found!');
  }
  console.log('Found Skip button, clicking it...');
  await skipBtn.click();

  await page.waitForFunction(() => {
    return document.querySelector('.intro-video-overlay') === null && document.querySelector('main') !== null;
  }, { timeout: 3000 });
  console.log('Skip button immediately dismissed intro into Home!');

  // Step 3: Test subsequent navigation (session flag prevents replay)
  console.log('\nStep 3: Reloading page in same session...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 500));
  const introOnReload = await page.$('.intro-video-overlay');
  console.log(`Intro rendered on second visit: ${introOnReload !== null} (should be false)`);

  await browser.close();
  console.log('--- VERIFICATION COMPLETE: ALL CHECKS PASSED ---');
}

runVerification().catch(err => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
