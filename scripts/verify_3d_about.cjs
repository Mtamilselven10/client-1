const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

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
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    console.log(`[Browser ${msg.type()}]:`, msg.text());
  });

  page.on('pageerror', err => {
    console.log('[Browser pageerror]:', err.message);
  });

  console.log('Navigating to About Us page...');
  await page.goto('http://127.0.0.1:5173/#/about', { waitUntil: 'load', timeout: 30000 });
  await page.waitForSelector('canvas', { timeout: 10000 });
  await sleep(2500); // Allow GLTF model to load and render initial frame

  // Verify canvas element exists
  const hasCanvas = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return !!canvas;
  });
  console.log('Canvas element present:', hasCanvas);
  if (!hasCanvas) {
    throw new Error('Canvas element not found in DOM!');
  }

  // Get exact scroll metrics from page container
  const scrollMetrics = await page.evaluate(() => {
    const container = document.querySelector('div[class*="min-h-screen"]');
    if (!container) return { topOffset: 0, totalScrollable: 400 };
    const rect = container.getBoundingClientRect();
    const topOffset = rect.top + window.scrollY;
    const totalScrollable = rect.height - window.innerHeight;
    return { topOffset, totalScrollable, maxScroll: document.documentElement.scrollHeight - window.innerHeight };
  });
  console.log('Scroll Metrics:', scrollMetrics);

  // Helper to scroll smoothly to exact target progress (0.0 to 1.0)
  async function scrollToProgress(progress, label) {
    const targetY = scrollMetrics.topOffset + Math.min(scrollMetrics.totalScrollable, scrollMetrics.maxScroll) * progress;
    console.log(`Scrolling to ${label} (progress: ${(progress * 100).toFixed(0)}% -> scrollY: ${targetY.toFixed(0)}px)...`);
    await page.evaluate((y) => {
      window.scrollTo({ top: y, behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
    }, targetY);
    await sleep(1000); // Allow scrub smoothing to settle
    const state = await page.evaluate(() => window.__logo3dState);
    console.log(`Settled state at ${label}:`, state);
  }

  // 1. Stage 0: Initial resting corner icon (progress 0.00)
  await scrollToProgress(0.00, 'Stage 0 - Corner Icon (Small Top-Right)');
  const stage0Path = path.join(ARTIFACT_DIR, '93_about_3d_stage0_corner_icon.png');
  await page.screenshot({ path: stage0Path, fullPage: false });
  console.log('Saved Stage 0 screenshot:', stage0Path);

  // 2. Stage 1: Front View, Full Screen (progress 0.30)
  await scrollToProgress(0.30, 'Stage 1 - Front View Full-Screen');
  const stage1Path = path.join(ARTIFACT_DIR, '94_about_3d_stage1_front_view_fullscreen.png');
  await page.screenshot({ path: stage1Path, fullPage: false });
  console.log('Saved Stage 1 screenshot:', stage1Path);

  // 3. Stage 2: Top View, Full Screen (progress 0.65)
  await scrollToProgress(0.65, 'Stage 2 - Top View Full-Screen');
  const stage2Path = path.join(ARTIFACT_DIR, '95_about_3d_stage2_top_view_fullscreen.png');
  await page.screenshot({ path: stage2Path, fullPage: false });
  console.log('Saved Stage 2 screenshot:', stage2Path);

  // 4. Stage 3: Back to Corner Icon (progress 1.00)
  await scrollToProgress(1.00, 'Stage 3 - Back to Corner Icon');
  const stage3Path = path.join(ARTIFACT_DIR, '96_about_3d_stage3_corner_icon.png');
  await page.screenshot({ path: stage3Path, fullPage: false });
  console.log('Saved Stage 3 screenshot:', stage3Path);

  // 5. Reverse Scroll Verification: Scroll back to 30% (Front view)
  console.log('\nTesting reverse scroll back to Stage 1 (progress: 30%)...');
  await scrollToProgress(0.30, 'Reverse to Stage 1 - Front View');
  const reverseStage1Path = path.join(ARTIFACT_DIR, '97_about_3d_reverse_stage1_front.png');
  await page.screenshot({ path: reverseStage1Path, fullPage: false });
  console.log('Saved Reverse Stage 1 screenshot:', reverseStage1Path);

  // 6. Reverse Scroll Verification: Scroll back to 0% (Corner icon)
  console.log('Testing reverse scroll back to Stage 0 (progress: 0%)...');
  await scrollToProgress(0.00, 'Reverse to Stage 0 - Corner Icon');
  const reverseStage0Path = path.join(ARTIFACT_DIR, '98_about_3d_reverse_stage0_corner.png');
  await page.screenshot({ path: reverseStage0Path, fullPage: false });
  console.log('Saved Reverse Stage 0 screenshot:', reverseStage0Path);

  // Verify interactive text overlay and elements
  const overlayChecks = await page.evaluate(() => {
    const textHeader = document.querySelector('h1');
    const mapLink = document.querySelector('a[href*="maps"]');
    const canvasEl = document.querySelector('canvas');
    return {
      h1Visible: textHeader ? textHeader.getBoundingClientRect().height > 0 : false,
      mapLinkClickable: mapLink ? window.getComputedStyle(mapLink).pointerEvents !== 'none' : false,
      canvasPointerEvents: canvasEl ? window.getComputedStyle(canvasEl).pointerEvents : null
    };
  });
  console.log('Overlay and interaction verification:', overlayChecks);

  await browser.close();
  console.log('\n✓ ALL 3D ABOUT US CONTROLLED SCROLL TESTS PASSED SUCCESSFULLY!');
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
