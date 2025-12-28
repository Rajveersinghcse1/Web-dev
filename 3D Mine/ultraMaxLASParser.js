/**
 * Ultra-Max LAS Parser
 * Handles ANY real-world LAS file format with multiple fallback strategies
 * Designed to work with Las Dataset files and any other LAS format
 */

class UltraMaxLASParser {
    constructor() {
        this.reset();
    }

    reset() {
        this.header = null;
        this.points = [];
        this.bounds = {
            minX: Infinity, maxX: -Infinity,
            minY: Infinity, maxY: -Infinity,
            minZ: Infinity, maxZ: -Infinity
        };
        this.fileType = null;
        this.wellLogData = null;
    }

    /**
     * Parse LAS file from ArrayBuffer - Auto-detects format with multiple strategies
     */
    async parseLAS(buffer) {
        console.log('🚀 Ultra-Max LAS Parser - Starting with multiple detection strategies...');
        
        try {
            this.reset(); // Clear any previous state
            
            const dataView = new DataView(buffer);
            const uint8Array = new Uint8Array(buffer);
            
            // Strategy 1: Check for binary LiDAR signature
            this.fileType = this.detectLASFormat(dataView, uint8Array);
            console.log(`📊 Detected format: ${this.fileType}`);
            
            if (this.fileType === 'LIDAR') {
                return await this.parseLiDARLAS(dataView);
            } else if (this.fileType === 'WELL_LOG') {
                return await this.parseWellLogLAS(uint8Array);
            } else {
                // Strategy 2: Force attempt as well log if format unclear
                console.log('🔄 Format unclear, attempting well log parsing...');
                return await this.parseWellLogLAS(uint8Array);
            }
        } catch (error) {
            console.error('❌ Error in Ultra-Max LAS Parser:', error);
            throw new Error(`Failed to parse LAS file: ${error.message}`);
        }
    }

    /**
     * Detect LAS file format with enhanced detection
     */
    detectLASFormat(dataView, uint8Array) {
        // Check for LiDAR LAS binary signature
        if (dataView.byteLength >= 4) {
            const signature = String.fromCharCode(
                dataView.getUint8(0),
                dataView.getUint8(1),
                dataView.getUint8(2),
                dataView.getUint8(3)
            );
            
            if (signature === 'LASF') {
                return 'LIDAR';
            }
        }
        
        // Enhanced well log detection
        try {
            const textDecoder = new TextDecoder('utf-8');
            const text = textDecoder.decode(uint8Array.slice(0, Math.min(2000, uint8Array.length)));
            
            // Multiple detection patterns for well logs
            const wellLogIndicators = [
                '~Version', '~VERS', '~Well', '~WELL', '~Curve', '~CURV',
                'CWLS', '~A', 'DEPT', 'STRT', 'STOP', 'STEP',
                '#MNEM', '.F', '.US/F', '.OHMM', '.MV', '.GAPI'
            ];
            
            let indicators = 0;
            for (const indicator of wellLogIndicators) {
                if (text.includes(indicator)) {
                    indicators++;
                }
            }
            
            console.log(`🔍 Found ${indicators} well log indicators`);
            
            if (indicators >= 3) {
                return 'WELL_LOG';
            }
        } catch (e) {
            console.warn('Could not decode as text:', e);
        }
        
        return 'UNKNOWN';
    }

    /**
     * Parse Well Log LAS file with ultra-robust logic
     */
    async parseWellLogLAS(uint8Array) {
        console.log('🛢️ Ultra-Max Well Log parsing started...');
        
        const textDecoder = new TextDecoder('utf-8');
        const text = textDecoder.decode(uint8Array);
        
        console.log(`📄 File size: ${text.length} characters`);
        console.log(`📄 Sample content: ${text.substring(0, 300)}`);
        
        // Parse with multiple strategies
        const wellLogData = this.parseWellLogStructureUltraMax(text);
        
        // Convert to 3D with robust conversion
        const points = this.convertWellLogTo3DUltraMax(wellLogData);
        
        if (points.length > 0) {
            this.points = points;
            this.calculateBoundsRobust(points);
        } else {
            throw new Error('Failed to generate any 3D points from well log data');
        }

        const result = {
            header: wellLogData.header,
            points: points,
            bounds: this.bounds,
            pointCount: points.length,
            fileType: 'WELL_LOG',
            wellLogData: wellLogData
        };
        
        console.log(`✅ Ultra-Max parsing complete: ${points.length} points generated`);
        return result;
    }

    /**
     * Ultra-robust well log structure parsing
     */
    parseWellLogStructureUltraMax(text) {
        console.log('🔧 Ultra-Max structure parsing...');
        
        const sections = this.splitIntoSectionsUltraMax(text);
        console.log('📋 Sections found:', Object.keys(sections).filter(k => sections[k].length > 0));
        
        // Parse each section with robust error handling
        const curves = this.parseCurveSectionUltraMax(sections.curves);
        const well = this.parseWellSectionUltraMax(sections.well);
        const data = this.parseDataSectionUltraMax(sections.data, curves);
        
        console.log(`📊 Parsed: ${Object.keys(curves).length} curves, ${data.length} data points`);
        
        const wellLogData = {
            version: this.parseVersionSectionUltraMax(sections.version),
            well: well,
            curves: curves,
            parameters: this.parseParameterSectionUltraMax(sections.parameters),
            data: data,
            sections: sections
        };
        
        // Create comprehensive header
        wellLogData.header = {
            wellName: well.WELL || 'Unknown Well',
            location: well.LOC || 'Unknown Location',
            company: well.COMP || 'Unknown Company',
            startDepth: parseFloat(well.STRT) || 0,
            stopDepth: parseFloat(well.STOP) || 1000,
            step: parseFloat(well.STEP) || 1,
            curves: Object.keys(curves),
            dataPoints: data.length,
            api: well.API || 'Unknown'
        };
        
        return wellLogData;
    }

    /**
     * Ultra-robust section splitting
     */
    splitIntoSectionsUltraMax(text) {
        const sections = {
            version: '',
            well: '',
            curves: '',
            parameters: '',
            data: ''
        };
        
        const lines = text.split(/\r?\n/);
        let currentSection = null;
        
        console.log(`📝 Processing ${lines.length} lines...`);
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Skip comments and empty lines at start
            if (!trimmed || trimmed.startsWith('#')) {
                if (currentSection) {
                    sections[currentSection] += line + '\n';
                }
                continue;
            }
            
            // Detect section headers with multiple patterns
            if (trimmed.match(/^~V/i) || trimmed.toLowerCase().includes('version')) {
                currentSection = 'version';
                console.log(`📝 Found Version section at line ${i + 1}`);
            } else if (trimmed.match(/^~W/i) || trimmed.toLowerCase().includes('well')) {
                currentSection = 'well';
                console.log(`🏭 Found Well section at line ${i + 1}`);
            } else if (trimmed.match(/^~C/i) || trimmed.toLowerCase().includes('curve')) {
                currentSection = 'curves';
                console.log(`📊 Found Curves section at line ${i + 1}`);
            } else if (trimmed.match(/^~P/i) || trimmed.toLowerCase().includes('parameter')) {
                currentSection = 'parameters';
                console.log(`⚙️ Found Parameters section at line ${i + 1}`);
            } else if (trimmed.match(/^~A/i)) {
                currentSection = 'data';
                console.log(`📈 Found Data section at line ${i + 1}: ${trimmed}`);
                continue; // Skip the ~A header line
            } else if (currentSection) {
                sections[currentSection] += line + '\n';
            }
        }
        
        return sections;
    }

    /**
     * Ultra-robust data section parsing
     */
    parseDataSectionUltraMax(text, curves) {
        const data = [];
        const lines = text.split(/\r?\n/);
        const curveNames = Object.keys(curves);
        
        console.log(`📊 Parsing data section: ${lines.length} lines, ${curveNames.length} curves`);
        console.log(`📋 Expected curves: ${curveNames.join(', ')}`);
        
        let validLines = 0;
        let skippedLines = 0;
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Skip empty lines and comments
            if (!trimmed || trimmed.startsWith('#')) {
                continue;
            }
            
            // Check if this looks like a data line (starts with number)
            if (!trimmed.match(/^\s*[\d\-+\.]/)) {
                skippedLines++;
                continue;
            }
            
            // Split by whitespace and parse numbers
            const values = trimmed.split(/\s+/).map(v => {
                const num = parseFloat(v);
                return isNaN(num) ? null : num;
            });
            
            if (values.length >= curveNames.length) {
                const dataPoint = {};
                for (let i = 0; i < curveNames.length; i++) {
                    dataPoint[curveNames[i]] = values[i];
                }
                data.push(dataPoint);
                validLines++;
            } else {
                skippedLines++;
            }
        }
        
        console.log(`✅ Parsed ${validLines} valid data lines, skipped ${skippedLines}`);
        console.log(`📊 Sample data point:`, data[0]);
        
        return data;
    }

    /**
     * Ultra-robust curve section parsing
     */
    parseCurveSectionUltraMax(text) {
        const curves = {};
        const lines = text.split(/\r?\n/);
        
        console.log(`📊 Parsing curves from ${lines.length} lines`);
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            // Multiple parsing patterns
            let match = trimmed.match(/^\s*(\w+)\s*\.\s*([^\s]*)\s*:\s*(.*)$/);
            if (!match) {
                match = trimmed.match(/^\s*(\w+)\s*\.\s*([^:]*)\s*:\s*(.*)$/);
            }
            
            if (match) {
                const mnem = match[1].trim();
                const unit = match[2].trim();
                const desc = match[3].trim();
                
                curves[mnem] = {
                    unit: unit,
                    description: desc
                };
                console.log(`📈 Curve: ${mnem} (${unit}) - ${desc}`);
            }
        }
        
        console.log(`✅ Parsed ${Object.keys(curves).length} curves`);
        return curves;
    }

    /**
     * Ultra-robust well section parsing
     */
    parseWellSectionUltraMax(text) {
        const well = {};
        const lines = text.split(/\r?\n/);
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            // Multiple parsing patterns for well parameters
            let match = trimmed.match(/^\s*(\w+)\s*\.\s*([^\s]*)\s+([^\s:]+)\s*:\s*(.*)$/);
            if (!match) {
                match = trimmed.match(/^\s*(\w+)\s*\.\s*([^:]*)\s*:\s*(.*)$/);
                if (match) {
                    well[match[1].trim()] = match[2].trim();
                    continue;
                }
            }
            
            if (match) {
                const mnem = match[1].trim();
                const data = match[3].trim();
                well[mnem] = data;
            }
        }
        
        return well;
    }

    /**
     * Parse version and parameter sections
     */
    parseVersionSectionUltraMax(text) {
        const version = {};
        const lines = text.split(/\r?\n/);
        
        for (const line of lines) {
            const match = line.match(/^\s*(\w+)\s*\.\s*([^\s:]*)\s*:\s*(.*)$/);
            if (match) {
                version[match[1]] = match[2].trim();
            }
        }
        
        return version;
    }

    parseParameterSectionUltraMax(text) {
        const parameters = {};
        const lines = text.split(/\r?\n/);
        
        for (const line of lines) {
            const match = line.match(/^\s*(\w+)\s*\.\s*([^:]*)\s*:\s*(.*)$/);
            if (match) {
                parameters[match[1]] = {
                    value: match[2].trim(),
                    description: match[3].trim()
                };
            }
        }
        
        return parameters;
    }

    /**
     * Ultra-robust 3D conversion
     */
    convertWellLogTo3DUltraMax(wellLogData) {
        const points = [];
        const data = wellLogData.data;
        const curves = wellLogData.curves;
        
        console.log(`🔄 Converting ${data.length} data points to 3D...`);
        
        if (!data || data.length === 0) {
            console.error('❌ No data to convert');
            return points;
        }
        
        // Find key curves with multiple aliases
        const depthCurve = this.findCurveUltraMax(curves, ['DEPT', 'DEPTH', 'MD', 'TVDSS']);
        const grCurve = this.findCurveUltraMax(curves, ['GR', 'GAMMA', 'SGR', 'CGR']);
        const resCurve = this.findCurveUltraMax(curves, ['RESD', 'RES', 'RESIST', 'ILD', 'RILD']);
        const spCurve = this.findCurveUltraMax(curves, ['SP', 'SPO', 'SSP']);
        const dtCurve = this.findCurveUltraMax(curves, ['DT', 'SONIC', 'DTC', 'DTCO']);
        
        console.log(`🔍 Key curves found: DEPT=${depthCurve}, GR=${grCurve}, RES=${resCurve}, SP=${spCurve}, DT=${dtCurve}`);
        
        if (!depthCurve) {
            console.error('❌ No depth curve found');
            return points;
        }
        
        let validPoints = 0;
        
        for (const dataPoint of data) {
            const depth = dataPoint[depthCurve];
            
            if (depth == null || depth === -999.25) continue;
            
            // Create rich 3D visualization
            const grValue = dataPoint[grCurve] || 0;
            const resValue = dataPoint[resCurve] || 1;
            const spValue = dataPoint[spCurve] || 0;
            const dtValue = dataPoint[dtCurve] || 60;
            
            // Create multiple visualization strategies
            
            // Strategy 1: Cylindrical wellbore with curve-based radius
            const baseRadius = 2;
            const grRadius = baseRadius + (grValue / 50); // GR affects radius
            
            for (let angle = 0; angle < 360; angle += 30) {
                const rad = (angle * Math.PI) / 180;
                
                points.push({
                    x: grRadius * Math.cos(rad),
                    y: -depth, // Negative for proper depth visualization
                    z: grRadius * Math.sin(rad),
                    intensity: Math.min(65535, grValue * 300),
                    returnNumber: 1,
                    numberOfReturns: 1,
                    classification: this.classifyWellPoint(grValue, resValue, spValue),
                    depth: depth,
                    grValue: grValue,
                    resValue: resValue
                });
            }
            
            // Strategy 2: Lateral curve displays
            if (resValue > 0) {
                points.push({
                    x: 15 + Math.log10(Math.max(1, resValue)) * 3,
                    y: -depth,
                    z: 0,
                    intensity: Math.min(65535, resValue * 50),
                    returnNumber: 1,
                    numberOfReturns: 1,
                    classification: 11,
                    depth: depth,
                    curve: 'RESISTIVITY'
                });
            }
            
            if (spValue !== 0) {
                points.push({
                    x: -15 + spValue * 0.2,
                    y: -depth,
                    z: 0,
                    intensity: Math.min(65535, Math.abs(spValue) * 100),
                    returnNumber: 1,
                    numberOfReturns: 1,
                    classification: 9,
                    depth: depth,
                    curve: 'SP'
                });
            }
            
            validPoints++;
        }
        
        console.log(`✅ Generated ${points.length} 3D points from ${validPoints} valid data entries`);
        
        return points;
    }

    /**
     * Find curve with multiple aliases
     */
    findCurveUltraMax(curves, aliases) {
        for (const alias of aliases) {
            if (curves[alias]) return alias;
        }
        
        // Case-insensitive search
        const curveNames = Object.keys(curves);
        for (const alias of aliases) {
            const found = curveNames.find(name => 
                name.toUpperCase() === alias.toUpperCase()
            );
            if (found) return found;
        }
        
        return null;
    }

    /**
     * Classify well log points
     */
    classifyWellPoint(gr, res, sp) {
        if (gr > 100) return 4; // High GR - shale
        if (gr < 30 && res > 10) return 6; // Clean sand
        if (res < 2) return 9; // Conductive zone
        return 2; // Default ground
    }

    /**
     * Calculate bounds robustly
     */
    calculateBoundsRobust(points) {
        if (!points || points.length === 0) {
            this.bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 };
            return;
        }

        this.bounds = {
            minX: Infinity, maxX: -Infinity,
            minY: Infinity, maxY: -Infinity,
            minZ: Infinity, maxZ: -Infinity
        };
        
        for (const p of points) {
            if (p.x < this.bounds.minX) this.bounds.minX = p.x;
            if (p.x > this.bounds.maxX) this.bounds.maxX = p.x;
            if (p.y < this.bounds.minY) this.bounds.minY = p.y;
            if (p.y > this.bounds.maxY) this.bounds.maxY = p.y;
            if (p.z < this.bounds.minZ) this.bounds.minZ = p.z;
            if (p.z > this.bounds.maxZ) this.bounds.maxZ = p.z;
        }
        
        console.log('📊 Calculated bounds:', this.bounds);
    }

    // LiDAR parsing methods (keeping existing functionality)
    async parseLiDARLAS(dataView) {
        console.log('📡 Parsing LiDAR LAS file...');
        
        this.header = this.parseLiDARHeader(dataView);
        this.points = this.parseLiDARPoints(dataView);
        this.calculateBoundsRobust(this.points);
        
        return {
            header: this.header,
            points: this.points,
            bounds: this.bounds,
            pointCount: this.points.length,
            fileType: 'LIDAR'
        };
    }

    parseLiDARHeader(dataView) {
        const header = {};
        
        const signature = String.fromCharCode(
            dataView.getUint8(0),
            dataView.getUint8(1),
            dataView.getUint8(2),
            dataView.getUint8(3)
        );
        
        if (signature !== 'LASF') {
            throw new Error('Invalid LiDAR LAS file signature');
        }
        
        header.versionMajor = dataView.getUint8(24);
        header.versionMinor = dataView.getUint8(25);
        header.offsetToPointData = dataView.getUint32(96, true);
        header.numberOfPointRecords = dataView.getUint32(107, true);
        header.pointDataRecordFormat = dataView.getUint8(104);
        header.pointDataRecordLength = dataView.getUint16(105, true);
        header.xScaleFactor = dataView.getFloat64(131, true);
        header.yScaleFactor = dataView.getFloat64(139, true);
        header.zScaleFactor = dataView.getFloat64(147, true);
        header.xOffset = dataView.getFloat64(155, true);
        header.yOffset = dataView.getFloat64(163, true);
        header.zOffset = dataView.getFloat64(171, true);
        
        return header;
    }

    parseLiDARPoints(dataView) {
        const points = [];
        const pointSize = this.header.pointDataRecordLength;
        const numPoints = Math.min(this.header.numberOfPointRecords, 100000);
        
        let offset = this.header.offsetToPointData;
        
        for (let i = 0; i < numPoints; i++) {
            const point = this.parseLiDARPoint(dataView, offset);
            if (point) points.push(point);
            offset += pointSize;
        }
        
        return points;
    }

    parseLiDARPoint(dataView, offset) {
        try {
            const x = dataView.getInt32(offset, true) * this.header.xScaleFactor + this.header.xOffset;
            const y = dataView.getInt32(offset + 4, true) * this.header.yScaleFactor + this.header.yOffset;
            const z = dataView.getInt32(offset + 8, true) * this.header.zScaleFactor + this.header.zOffset;
            
            const intensity = dataView.getUint16(offset + 12, true);
            const returnInfo = dataView.getUint8(offset + 14);
            const classification = dataView.getUint8(offset + 15);
            
            return {
                x, y, z,
                intensity,
                returnNumber: returnInfo & 0x07,
                numberOfReturns: (returnInfo & 0x38) >> 3,
                classification
            };
        } catch (error) {
            return null;
        }
    }

    // Color generation methods
    generateElevationColors(points) {
        const colors = [];
        if (!points || points.length === 0) return colors;

        const minZ = Math.min(...points.map(p => p.z));
        const maxZ = Math.max(...points.map(p => p.z));
        const range = maxZ - minZ || 1;

        for (const point of points) {
            const normalized = (point.z - minZ) / range;
            colors.push(
                normalized * 0.8 + 0.2,  // R
                1.0 - normalized * 0.5,  // G
                0.5 + normalized * 0.5   // B
            );
        }
        return colors;
    }

    generateIntensityColors(points) {
        const colors = [];
        if (!points || points.length === 0) return colors;

        for (const point of points) {
            const intensity = (point.intensity || 0) / 65535;
            colors.push(intensity, intensity, intensity);
        }
        return colors;
    }

    generateClassificationColors(points) {
        const colors = [];
        const classColors = {
            1: [0.8, 0.4, 0.2], // Unclassified - brown
            2: [0.6, 0.4, 0.2], // Ground - dark brown
            3: [0.2, 0.8, 0.2], // Low vegetation - green
            4: [0.0, 0.6, 0.0], // Medium vegetation - dark green
            5: [0.0, 0.4, 0.0], // High vegetation - very dark green
            6: [0.8, 0.8, 0.8], // Building - light gray
            9: [0.0, 0.0, 0.8], // Water - blue
            11: [0.5, 0.5, 0.5] // Road surface - gray
        };

        for (const point of points) {
            const color = classColors[point.classification] || [1.0, 1.0, 1.0];
            colors.push(...color);
        }
        return colors;
    }

    generateWellLogColors(points) {
        const colors = [];
        
        for (const point of points) {
            if (point.curve === 'RESISTIVITY') {
                colors.push(1.0, 0.5, 0.0); // Orange for resistivity
            } else if (point.curve === 'SP') {
                colors.push(0.0, 0.5, 1.0); // Blue for SP
            } else {
                // GR-based coloring for main wellbore
                const gr = point.grValue || 0;
                const normalized = Math.min(gr / 150, 1.0);
                colors.push(
                    1.0 - normalized * 0.5,  // R
                    0.8 * (1.0 - normalized), // G
                    normalized * 0.3         // B
                );
            }
        }
        return colors;
    }
}