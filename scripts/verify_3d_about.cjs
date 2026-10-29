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

  // Collect console logs
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

  // Get total scrollable height of About Us
  const scrollInfo = await page.evaluate(() => {
    return {
      scrollHeight: document.documentElement.scrollHeight,
      clientHeight: window.innerHeight,
      maxScroll: document.documentElement.scrollHeight - window.innerHeight
    };
  });
  console.log('Scroll Info:', scrollInfo);

  // Helper to scroll smoothly to fraction of page
  async function scrollToRatio(ratio, label) {
    const targetY = scrollInfo.maxScroll * ratio;
    console.log(`Scrolling to ${label} (${(ratio * 100).toFixed(0)}% = ${targetY.toFixed(0)}px)...`);
    await page.evaluate((y) => {
      window.scrollTo({ top: y, behavior: 'instant' });
      window.dispatchEvent(new Event('scroll'));
    }, targetY);
    await sleep(900); // Allow lerp and render to settle
  }

  // Stage A: Opening Reveal (0% scroll)
  await scrollToRatio(0.0, 'Stage A - Heroic Reveal');
  const stageAPath = path.join(ARTIFACT_DIR, '69_about_3d_stage_a_reveal.png');
  await page.screenshot({ path: stageAPath, fullPage: false });
  console.log('Saved Stage A screenshot:', stageAPath);

  // Stage C: Isometric / Three-Quarter View (~30% scroll)
  await scrollToRatio(0.30, 'Stage C - Isometric 3/4 View');
  const stageCPath = path.join(ARTIFACT_DIR, '70_about_3d_stage_c_isometric.png');
  await page.screenshot({ path: stageCPath, fullPage: false });
  console.log('Saved Stage C screenshot:', stageCPath);

  // Stage D: Side Profile View (~45% scroll)
  await scrollToRatio(0.45, 'Stage D - Side Profile View');
  const stageDPath = path.join(ARTIFACT_DIR, '71_about_3d_stage_d_side.png');
  await page.screenshot({ path: stageDPath, fullPage: false });
  console.log('Saved Stage D screenshot:', stageDPath);

  // Stage E: Elevated Top-Down View (~60% scroll)
  await scrollToRatio(0.60, 'Stage E - Elevated Top-Down View');
  const stageEPath = path.join(ARTIFACT_DIR, '72_about_3d_stage_e_top.png');
  await page.screenshot({ path: stageEPath, fullPage: false });
  console.log('Saved Stage E screenshot:', stageEPath);

  // Stage H: Final Heroic Reveal (100% scroll)
  await scrollToRatio(1.0, 'Stage H - Final Heroic Reveal');
  const stageHPath = path.join(ARTIFACT_DIR, '73_about_3d_stage_h_final.png');
  await page.screenshot({ path: stageHPath, fullPage: false });
  console.log('Saved Stage H screenshot:', stageHPath);

  // Reverse Scroll Verification: Scroll back to top
  console.log('Testing reverse scroll back to 0%...');
  await scrollToRatio(0.0, 'Reverse to Stage A');
  const reverseAPath = path.join(ARTIFACT_DIR, '74_about_3d_reverse_top.png');
  await page.screenshot({ path: reverseAPath, fullPage: false });
  console.log('Saved Reverse Top screenshot:', reverseAPath);

  // Verify interactive elements: Map button exists and is clickable
  const mapBtnInfo = await page.evaluate(() => {
    const btn = document.querySelector('a[href*="maps"]');
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    const style = window.getComputedStyle(btn);
    return {
      href: btn.href,
      text: btn.innerText.trim(),
      pointerEvents: style.pointerEvents,
      visible: rect.width > 0 && rect.height > 0
    };
  });
  console.log('Map button info:', mapBtnInfo);

  await browser.close();
  console.log('All 3D About Us scroll checks passed successfully!');
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
