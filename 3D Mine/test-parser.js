// Direct Node.js test of the well log parser
const fs = require('fs');

// Read the ultraAdvancedLASParser.js file
const parserCode = fs.readFileSync('ultraAdvancedLASParser.js', 'utf8');

// Remove the class declaration wrapper and export it for Node.js
const modifiedCode = parserCode.replace('class UltraAdvancedLASParser', 'class UltraAdvancedLASParser') + '\nmodule.exports = UltraAdvancedLASParser;';
fs.writeFileSync('temp-parser.js', modifiedCode);

// Test the parser
const UltraAdvancedLASParser = require('./temp-parser.js');

async function testWellLog() {
    try {
        console.log('🧪 Starting direct Node.js test of well log parser...');
        
        // Read the Las Dataset file
        const filePath = 'Las Dataset/49-005-30258.las';
        const fileBuffer = fs.readFileSync(filePath);
        const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
        
        console.log(`📂 Loaded file: ${arrayBuffer.byteLength} bytes`);
        
        // Create parser and test
        const parser = new UltraAdvancedLASParser();
        const result = await parser.parseLAS(arrayBuffer);
        
        console.log('✅ Parse result:');
        console.log('  - File Type:', result.fileType);
        console.log('  - Point Count:', result.pointCount);
        console.log('  - Points Array Length:', result.points ? result.points.length : 'N/A');
        console.log('  - Well Name:', result.header?.wellName);
        console.log('  - Curves:', result.header?.curves);
        console.log('  - Data Points:', result.header?.dataPoints);
        
        if (result.points && result.points.length > 0) {
            console.log('🎯 First 3 points:');
            console.log(JSON.stringify(result.points.slice(0, 3), null, 2));
        } else {
            console.log('❌ No points generated!');
        }
        
        // Clean up
        fs.unlinkSync('temp-parser.js');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
        
        // Clean up
        try { fs.unlinkSync('temp-parser.js'); } catch (e) {}
    }
}

testWellLog();