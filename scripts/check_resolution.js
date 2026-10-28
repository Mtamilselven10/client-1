import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const zipPath = 'C:\\Users\\enose raja\\.gemini\\antigravity\\brain\\76083c15-56e2-41c3-b33b-e8efbb3e33f9\\.user_uploaded\\media_1793198769520_ae5f0b83.zip';
const testDir = path.resolve('scripts/test_frame');
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

const tempPs1 = path.resolve('scripts/temp_extract_one.ps1');
fs.writeFileSync(tempPs1, `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('${zipPath.replace(/'/g, "''")}')
$entry = $zip.Entries[0]
[System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, '${path.join(testDir, 'frame1.jpg').replace(/\\/g, '\\\\')}', $true)
$zip.Dispose()
`);

try {
  execSync(`powershell -ExecutionPolicy Bypass -File "${tempPs1}"`);
  // Read JPEG header dimensions
  const buf = fs.readFileSync(path.join(testDir, 'frame1.jpg'));
  let i = 0;
  if (buf[0] === 0xFF && buf[1] === 0xD8) {
    i += 2;
    while (i < buf.length) {
      if (buf[i] === 0xFF) {
        const marker = buf[i + 1];
        if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2) {
          const height = buf.readUInt16BE(i + 5);
          const width = buf.readUInt16BE(i + 7);
          console.log(`Resolution: ${width}x${height}`);
          break;
        } else {
          const len = buf.readUInt16BE(i + 2);
          i += 2 + len;
        }
      } else {
        i++;
      }
    }
  }
} finally {
  if (fs.existsSync(tempPs1)) fs.unlinkSync(tempPs1);
  if (fs.existsSync(path.join(testDir, 'frame1.jpg'))) fs.unlinkSync(path.join(testDir, 'frame1.jpg'));
  if (fs.existsSync(testDir)) fs.rmdirSync(testDir);
}
