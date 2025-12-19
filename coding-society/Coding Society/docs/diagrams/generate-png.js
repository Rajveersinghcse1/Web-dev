/**
 * Generate PNG diagrams from Mermaid files
 * Usage: node generate-png.js
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

const DIAGRAMS_DIR = __dirname;
const MERMAID_FILES = [
  'dfd_level_0.mmd',
  'dfd_level_1.mmd'
];

async function checkMermaidCLI() {
  try {
    await execAsync('mmdc --version');
    return true;
  } catch (error) {
    return false;
  }
}

async function convertWithMermaidCLI(inputFile, outputFile) {
  const inputPath = path.join(DIAGRAMS_DIR, inputFile);
  const outputPath = path.join(DIAGRAMS_DIR, outputFile);
  
  console.log(`Converting ${inputFile} to ${outputFile}...`);
  
  try {
    const cmd = `mmdc -i "${inputPath}" -o "${outputPath}" -w 1920 -H 1080 -b transparent`;
    const { stdout, stderr } = await execAsync(cmd);
    
    if (stderr && !stderr.includes('Done')) {
      console.warn('Warning:', stderr);
    }
    
    console.log(`✓ Successfully created ${outputFile}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to convert ${inputFile}:`, error.message);
    return false;
  }
}

async function generateHTMLPreview() {
  const level0Content = fs.readFileSync(path.join(DIAGRAMS_DIR, 'dfd_level_0.mmd'), 'utf8');
  const level1Content = fs.readFileSync(path.join(DIAGRAMS_DIR, 'dfd_level_1.mmd'), 'utf8');
  
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coding Society - Data Flow Diagrams</title>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'base',
      securityLevel: 'loose'
    });
  </script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 40px;
      font-size: 2.5rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .diagram-section {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .diagram-section h2 {
      color: #667eea;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid #667eea;
    }
    .mermaid {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
      overflow-x: auto;
    }
    .note {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin-top: 20px;
      border-radius: 4px;
    }
    .download-btn {
      background: #667eea;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      margin: 10px 10px 0 0;
      font-size: 14px;
    }
    .download-btn:hover {
      background: #5568d3;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎓 Coding Society - Data Flow Diagrams</h1>
    
    <div class="diagram-section">
      <h2>DFD Level 0 - Context Diagram</h2>
      <p>This diagram shows the system boundary and external entities interacting with the Coding Society platform.</p>
      <button class="download-btn" onclick="downloadSVG('diagram1', 'dfd_level_0.svg')">Download SVG</button>
      <button class="download-btn" onclick="downloadPNG('diagram1', 'dfd_level_0.png')">Download PNG</button>
      <div id="diagram1" class="mermaid">
${level0Content}
      </div>
    </div>
    
    <div class="diagram-section">
      <h2>DFD Level 1 - Detailed Process Diagram</h2>
      <p>This diagram shows the internal processes, data flows, and data stores within the system.</p>
      <button class="download-btn" onclick="downloadSVG('diagram2', 'dfd_level_1.svg')">Download SVG</button>
      <button class="download-btn" onclick="downloadPNG('diagram2', 'dfd_level_1.png')">Download PNG</button>
      <div id="diagram2" class="mermaid">
${level1Content}
      </div>
    </div>
    
    <div class="note">
      <strong>Note:</strong> These diagrams represent the actual implementation of the Coding Society platform with React frontend, Express backend, MongoDB database, and MinIO object storage.
    </div>
  </div>
  
  <script>
    function downloadSVG(elementId, filename) {
      const svgElement = document.querySelector('#' + elementId + ' svg');
      if (!svgElement) return;
      
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
    
    function downloadPNG(elementId, filename) {
      const svgElement = document.querySelector('#' + elementId + ' svg');
      if (!svgElement) return;
      
      const canvas = document.createElement('canvas');
      const bbox = svgElement.getBBox();
      canvas.width = bbox.width + 40;
      canvas.height = bbox.height + 40;
      const ctx = canvas.getContext('2d');
      
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      img.onload = function() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        canvas.toBlob(function(blob) {
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(pngUrl);
        });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  </script>
</body>
</html>`;

  const htmlPath = path.join(DIAGRAMS_DIR, 'diagrams-preview.html');
  fs.writeFileSync(htmlPath, htmlContent);
  console.log(`\n✓ Created HTML preview: diagrams-preview.html`);
  console.log(`  Open this file in your browser to view and download the diagrams.`);
}

async function main() {
  console.log('🎨 Coding Society - DFD Diagram Generator\n');
  console.log('━'.repeat(50));
  
  // Check if Mermaid CLI is installed
  const hasMermaidCLI = await checkMermaidCLI();
  
  if (!hasMermaidCLI) {
    console.log('ℹ️  Mermaid CLI not found.');
    console.log('   To install: npm install -g @mermaid-js/mermaid-cli\n');
  }
  
  let successCount = 0;
  
  for (const mmdFile of MERMAID_FILES) {
    const pngFile = mmdFile.replace('.mmd', '.png');
    
    if (hasMermaidCLI) {
      const success = await convertWithMermaidCLI(mmdFile, pngFile);
      if (success) successCount++;
    }
  }
  
  // Always generate HTML preview
  await generateHTMLPreview();
  
  console.log('\n' + '━'.repeat(50));
  
  if (!hasMermaidCLI) {
    console.log('\n✅ Created HTML preview with download buttons!');
    console.log('\n📝 Steps to get PNG files:');
    console.log('1. Open diagrams-preview.html in your browser');
    console.log('2. Click "Download PNG" button for each diagram');
    console.log('3. Or install Mermaid CLI: npm install -g @mermaid-js/mermaid-cli');
    console.log('4. Then run this script again');
  } else {
    console.log(`\n✅ Completed: ${successCount}/${MERMAID_FILES.length} diagrams converted`);
    console.log('\n📁 PNG files created in: docs/diagrams/');
    console.log('   • dfd_level_0.png');
    console.log('   • dfd_level_1.png');
  }
}

main().catch(console.error);
