import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const zipPath = 'C:\\Users\\enose raja\\.gemini\\antigravity\\brain\\76083c15-56e2-41c3-b33b-e8efbb3e33f9\\.user_uploaded\\media_1793198769520_ae5f0b83.zip';

// We can use powershell with an external ps1 script or tar if available
const tempPs1 = path.resolve('scripts/temp_inspect.ps1');
fs.writeFileSync(tempPs1, `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('${zipPath.replace(/'/g, "''")}')
Write-Host "Total entries: $($zip.Entries.Count)"
$first5 = $zip.Entries | Select-Object -First 5
$last5 = $zip.Entries | Select-Object -Last 5
Write-Host "--- First 5 entries ---"
foreach ($e in $first5) {
    Write-Host "$($e.FullName) ($($e.Length) bytes)"
}
Write-Host "--- Last 5 entries ---"
foreach ($e in $last5) {
    Write-Host "$($e.FullName) ($($e.Length) bytes)"
}
$zip.Dispose()
`);

try {
  const output = execSync(`powershell -ExecutionPolicy Bypass -File "${tempPs1}"`, { encoding: 'utf-8' });
  console.log(output);
} finally {
  if (fs.existsSync(tempPs1)) fs.unlinkSync(tempPs1);
}
