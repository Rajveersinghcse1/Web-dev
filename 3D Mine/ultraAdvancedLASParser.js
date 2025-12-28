/**
 * Ultra-Advanced LAS Parser
 * Supports both LiDAR LAS (binary) and Well Log LAS (ASCII) formats
 * Automatically detects format and converts well log data to 3D visualization
 */

class UltraAdvancedLASParser {
    constructor() {
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
     * Parse LAS file from ArrayBuffer - Auto-detects format
     * @param {ArrayBuffer} buffer - The LAS file data
     * @returns {Promise<Object>} Parsed point cloud data
     */
    async parseLAS(buffer) {
        try {
            console.log('🔍 Ultra-Advanced LAS Parser - Auto-detecting format...');
            
            const dataView = new DataView(buffer);
            const uint8Array = new Uint8Array(buffer);
            
            // Auto-detect file format
            this.fileType = this.detectLASFormat(dataView, uint8Array);
            console.log(`📊 Detected format: ${this.fileType}`);
            
            switch (this.fileType) {
                case 'LIDAR':
                    return await this.parseLiDARLAS(dataView);
                case 'WELL_LOG':
        const parsedData = await this.parseWellLogLAS(uint8Array);
        console.log(`📦 Final parsed data object being returned:`, parsedData);
        return parsedData;
                default:
                    throw new Error(`Unsupported LAS format: ${this.fileType}`);
            }
        } catch (error) {
            console.error('❌ Error parsing LAS file:', error);
            throw new Error(`Failed to parse LAS file: ${error.message}`);
        }
    }

    /**
     * Detect LAS file format
     * @param {DataView} dataView 
     * @param {Uint8Array} uint8Array 
     * @returns {string} Format type
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
        
        // Check for Well Log LAS ASCII format
        try {
            const textDecoder = new TextDecoder('utf-8');
            const text = textDecoder.decode(uint8Array.slice(0, Math.min(1000, uint8Array.length)));
            
            // Well log LAS indicators
            if (text.includes('~Version') || text.includes('~VERS') || 
                text.includes('~Well') || text.includes('~WELL') ||
                text.includes('~Curve') || text.includes('~CURV') ||
                text.includes('CWLS') || text.includes('~A')) {
                return 'WELL_LOG';
            }
            
            // Also check for common well log patterns
            if (text.includes('DEPT') && text.includes('GR') && 
                (text.includes('STRT') || text.includes('START'))) {
                return 'WELL_LOG';
            }
        } catch (e) {
            console.warn('Could not decode as text:', e);
        }
        
        return 'UNKNOWN';
    }

    /**
     * Parse LiDAR LAS file (existing functionality)
     */
    async parseLiDARLAS(dataView) {
        console.log('📡 Parsing LiDAR LAS file...');
        
        // Use existing LiDAR parsing logic
        this.header = this.parseLiDARHeader(dataView);
        this.points = this.parseLiDARPoints(dataView);
        this.calculateBounds();
        
        return {
            header: this.header,
            points: this.points,
            bounds: this.bounds,
            pointCount: this.points.length,
            fileType: 'LIDAR'
        };
    }

    /**
     * Parse Well Log LAS file and convert to 3D visualization
     */
    async parseWellLogLAS(uint8Array) {
        console.log('🛢️ Starting Well Log LAS parsing...');
        
        const textDecoder = new TextDecoder('utf-8');
        const text = textDecoder.decode(uint8Array);
        
        this.wellLogData = this.parseWellLogStructure(text);
        
        const points = this.convertWellLogTo3D(this.wellLogData);
        this.points = points; // Also assign to class property for bounds calculation
        
        if (points.length > 0) {
            this.calculateBounds(points);
        } else {
            console.error("Conversion to 3D points failed, no bounds to calculate.");
        }

        const result = {
            header: this.wellLogData.header,
            points: this.points,
            bounds: this.bounds,
            pointCount: this.points.length,
            fileType: 'WELL_LOG',
            wellLogData: this.wellLogData
        };
        
        console.log(`📦 Final well log data object being returned:`, JSON.parse(JSON.stringify(result)));
        return result;
    }

    /**
     * Parse well log LAS structure
     */
    parseWellLogStructure(text) {
        const sections = this.splitIntoSections(text);
        
        // Parse sections in correct order (curves before data)
        const curves = this.parseCurveSection(sections.curves);
        
        const wellLogData = {
            version: this.parseVersionSection(sections.version),
            well: this.parseWellSection(sections.well),
            curves: curves,
            parameters: this.parseParameterSection(sections.parameters),
            data: this.parseDataSection(sections.data, curves),
            header: {},
            rawText: text,
            sections
        };
        
        // Create header for compatibility
        wellLogData.header = {
            wellName: wellLogData.well.WELL || 'Unknown Well',
            location: wellLogData.well.LOC || 'Unknown Location',
            company: wellLogData.well.COMP || 'Unknown Company',
            startDepth: parseFloat(wellLogData.well.STRT) || 0,
            stopDepth: parseFloat(wellLogData.well.STOP) || 1000,
            step: parseFloat(wellLogData.well.STEP) || 1,
            curves: Object.keys(wellLogData.curves),
            dataPoints: wellLogData.data.length
        };
        
        console.log('🔍 Well Log Summary:', {
            well: wellLogData.header.wellName,
            location: wellLogData.header.location,
            depth: `${wellLogData.header.startDepth} - ${wellLogData.header.stopDepth} ft`,
            curves: wellLogData.header.curves.length,
            dataPoints: wellLogData.header.dataPoints
        });

        // Fallback: if no data parsed, attempt a more permissive parse
        if (wellLogData.data.length === 0) {
            console.warn('⚠️ Primary data parsing returned 0 points. Attempting fallback parsing...');
            const fallback = this.fallbackParseData(wellLogData);
            if (fallback && fallback.length) {
                wellLogData.data = fallback;
                wellLogData.header.dataPoints = fallback.length;
                console.log(`✅ Fallback parser recovered ${fallback.length} data points.`);
            } else {
                console.warn('⚠️ Fallback parser also failed to extract data points.');
                console.warn('📋 Available sections lengths:', {
                    version: wellLogData.sections?.version?.length || 0,
                    well: wellLogData.sections?.well?.length || 0,
                    curves: wellLogData.sections?.curves?.length || 0,
                    parameters: wellLogData.sections?.parameters?.length || 0,
                    data: wellLogData.sections?.data?.length || 0
                });
            }
        } else {
            console.log(`✅ Primary parsing successful: ${wellLogData.data.length} data points extracted`);
        }
        
        return wellLogData;
    }

    /**
     * Split text into LAS sections
     */
    splitIntoSections(text) {
        const sections = {
            version: '',
            well: '',
            curves: '',
            parameters: '',
            data: ''
        };
        
        const lines = text.split('\n');
        let currentSection = null;
        let inDataSection = false;
        
        console.log('🔍 Splitting LAS file into sections...');
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Skip completely empty lines at start
            if (!trimmed && !currentSection) continue;
            
            // Detect section headers
            if (trimmed.startsWith('~V') || trimmed.toLowerCase().includes('version')) {
                currentSection = 'version';
                inDataSection = false;
                console.log('📝 Found Version section');
            } else if (trimmed.startsWith('~W') || trimmed.toLowerCase().includes('well')) {
                currentSection = 'well';
                inDataSection = false;
                console.log('🏭 Found Well section');
            } else if (trimmed.startsWith('~C') || trimmed.toLowerCase().includes('curve')) {
                currentSection = 'curves';
                inDataSection = false;
                console.log('📊 Found Curves section');
            } else if (trimmed.startsWith('~P') || trimmed.toLowerCase().includes('parameter')) {
                currentSection = 'parameters';
                inDataSection = false;
                console.log('⚙️ Found Parameters section');
            } else if (trimmed.startsWith('~A')) {
                currentSection = 'data';
                inDataSection = true;
                console.log('📈 Found Data section:', trimmed);
                continue; // Skip the ~A header line
            } else if (currentSection) {
                // Add content to current section
                if (currentSection === 'data' && inDataSection) {
                    // Include all lines in data section (the parseDataSection will filter)
                    sections[currentSection] += line + '\n';
                } else if (!trimmed.startsWith('~')) {
                    // Add to other sections (skip section headers)
                    sections[currentSection] += line + '\n';
                }
            }
        }
        
        console.log('✅ Section parsing complete:', {
            version: sections.version.length > 0,
            well: sections.well.length > 0,
            curves: sections.curves.length > 0,
            parameters: sections.parameters.length > 0,
            data: sections.data.length > 0
        });
        
        return sections;
    }

    /**
     * Parse individual sections
     */
    parseVersionSection(text) {
        const version = {};
        const lines = text.split('\n');
        
        console.log('📝 Parsing version section with', lines.length, 'lines');
        
        for (const line of lines) {
            if (!line.trim() || line.trim().startsWith('#')) continue;
            
            // Handle format: " VERS.   2.0                      :CWLS log ASCII Standard - Version 2.0"
            const versionMatch = line.match(/^\s*(\w+)\s*\.\s*([^\s:]*)\s*:\s*(.*)$/);
            if (versionMatch) {
                const mnem = versionMatch[1].trim();
                const data = versionMatch[2].trim();
                const desc = versionMatch[3].trim();
                
                version[mnem] = data;
                console.log(`📋 Version: ${mnem} = ${data}`);
            }
        }
        
        console.log('✅ Parsed version:', Object.keys(version));
        return version;
    }

    parseWellSection(text) {
        const well = {};
        const lines = text.split('\n');
        
        console.log('🏭 Parsing well section with', lines.length, 'lines');
        
        for (const line of lines) {
            if (!line.trim() || line.trim().startsWith('#')) continue;
            
            // Handle format: " STRT   .F                         10180.0000  :START DEPTH"
            const wellMatch = line.match(/^\s*(\w+)\s*\.\s*([^\s]*)\s+([^\s:]+)\s*:\s*(.*)$/);
            if (wellMatch) {
                const mnem = wellMatch[1].trim();
                const unit = wellMatch[2].trim();
                const data = wellMatch[3].trim();
                const desc = wellMatch[4].trim();
                
                well[mnem] = data;
                console.log(`📝 Well param: ${mnem} = ${data} (${unit})`);
            } else {
                // Try simpler format
                const simpleMatch = line.match(/^\s*(\w+)\s*\.\s*([^:]*)\s*:\s*(.*)$/);
                if (simpleMatch) {
                    well[simpleMatch[1]] = simpleMatch[2].trim();
                    console.log(`📝 Well param (simple): ${simpleMatch[1]} = ${simpleMatch[2].trim()}`);
                }
            }
        }
        
        console.log('✅ Parsed well parameters:', Object.keys(well));
        return well;
    }

    parseCurveSection(text) {
        const curves = {};
        const lines = text.split('\n');
        
        console.log('📊 Parsing curve section with', lines.length, 'lines');
        
        for (const line of lines) {
            if (!line.trim() || line.trim().startsWith('#')) continue;
            
            // Handle format: " DEPT   .F                                     :1 DEPTH"
            const curveMatch = line.match(/^\s*(\w+)\s*\.\s*([^\s]*)\s*:\s*(.*)$/);
            if (curveMatch) {
                const mnem = curveMatch[1].trim();
                const unit = curveMatch[2].trim();
                const desc = curveMatch[3].trim();
                
                curves[mnem] = {
                    unit: unit,
                    description: desc
                };
                console.log(`📈 Curve: ${mnem} (${unit}) - ${desc}`);
            }
        }
        
        console.log('✅ Parsed curves:', Object.keys(curves));
        return curves;
    }

    parseParameterSection(text) {
        const parameters = {};
        const lines = text.split('\n');
        
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

    parseDataSection(text, curvesSection) {
        const data = [];
        const lines = text.split('\n');
        const curveNames = Object.keys(curvesSection);
        
        console.log('🔍 Parsing data section with curves:', curveNames);
        console.log('📝 Data section lines to process:', lines.length);
        console.log('📝 First few lines:', lines.slice(0, 5));
        
        let sampleLogged = 0;
        for (const rawLine of lines) {
            const line = rawLine.replace(/\r/g, '');
            const trimmed = line.trim();
            
            // Skip empty lines
            if (!trimmed) continue;
            
            // Skip comment lines  
            if (trimmed.startsWith('#')) continue;
            
            // Skip section headers
            if (trimmed.startsWith('~')) continue;
            
            // Skip column header lines (lines that contain text like "Depth", "Delta-T", etc.)
            if (trimmed.includes('Depth') || trimmed.includes('Delta-T') || 
                trimmed.includes('Resist') || trimmed.includes('GR') ||
                trimmed.includes('MNEM') || trimmed.match(/^[A-Za-z]/)) {
                console.log('📋 Skipping header line:', trimmed);
                continue;
            }
            
            // Process only lines that start with numbers (data lines)
            if (!/^\s*\d/.test(trimmed)) {
                if (sampleLogged < 3) {
                    console.log('📋 Skipping non-numeric line:', trimmed);
                }
                continue;
            }

            const values = trimmed.split(/\s+/).filter(v => v !== '');
            if (values.length === 0) continue;

            // Map values to curve names
            const dataPoint = {};
            for (let i = 0; i < curveNames.length; i++) {
                const v = values[i];
                if (v === undefined) {
                    dataPoint[curveNames[i]] = null;
                } else {
                    const num = parseFloat(v);
                    dataPoint[curveNames[i]] = isNaN(num) ? null : num;
                }
            }
            data.push(dataPoint);

            if (sampleLogged < 5) {
                console.log('🔎 Sample parsed line ->', { 
                    raw: trimmed, 
                    values: values,
                    mapped: dataPoint 
                });
                sampleLogged++;
            }
        }
        
        console.log('✅ Parsed data points:', data.length);
        if (data.length === 0) {
            console.error('❌ No data points parsed! Raw data section:');
            console.error(text.substring(0, 500));
        }
        return data;
    }

    /**
     * Fallback parser: scans raw text after ~A line and heuristically assigns columns.
     */
    fallbackParseData(wellLogData) {
        if (!wellLogData || !wellLogData.rawText) return [];
        const lines = wellLogData.rawText.split(/\n/);
        const dataLines = [];
        let inData = false;
        for (let i = 0; i < lines.length; i++) {
            const t = lines[i].trim();
            if (t.startsWith('~A')) { inData = true; continue; }
            if (inData) {
                if (t.startsWith('~')) break; // next section (rare in LAS 2.0)
                if (!t || t.startsWith('#')) continue;
                if (!/^[-+]?\d/.test(t)) continue; // must start numeric
                dataLines.push(t);
            }
        }
        if (!dataLines.length) return [];
        console.log(`🆘 Fallback scanning found ${dataLines.length} candidate data lines.`);

        // Determine columns from first numeric line
        const firstVals = dataLines[0].split(/\s+/).filter(v => v);
        // Ensure curve list; if missing, build default order
        let curveNames = Object.keys(wellLogData.curves || {});
        if (!curveNames.length || curveNames.length > firstVals.length) {
            const guessed = ['DEPT','DT','RESD','SP','GR','CALI','NPHI','RHOB'];
            curveNames = guessed.slice(0, firstVals.length);
            console.warn('⚠️ Fallback guessing curve names:', curveNames);
        }

        const data = [];
        for (const dl of dataLines) {
            const vals = dl.split(/\s+/).filter(v => v);
            if (!vals.length) continue;
            const dp = {};
            for (let i = 0; i < curveNames.length; i++) {
                const v = vals[i];
                const num = parseFloat(v);
                dp[curveNames[i]] = (v === undefined || isNaN(num)) ? null : num;
            }
            data.push(dp);
        }
        console.log(`🆘 Fallback produced ${data.length} data rows.`);
        // If original curves empty, inject guessed curves into structure
        if (!Object.keys(wellLogData.curves || {}).length) {
            wellLogData.curves = {};
            for (const c of curveNames) {
                wellLogData.curves[c] = { unit: '', description: 'Guessed' };
            }
        }
        return data;
    }

    /**
     * Convert well log data to 3D point cloud
     */
    convertWellLogTo3D(wellLogData) {
        console.log('🔄 Converting well log to 3D point cloud...');
        console.log('📊 Well log data structure:', {
            hasVersion: !!wellLogData.version,
            hasWell: !!wellLogData.well,
            hasCurves: !!wellLogData.curves,
            hasParameters: !!wellLogData.parameters,
            hasData: !!wellLogData.data,
            dataLength: wellLogData.data ? wellLogData.data.length : 0,
            curvesCount: wellLogData.curves ? Object.keys(wellLogData.curves).length : 0
        });
        
        const points = [];
        let data = wellLogData.data;
        
        if (!data || data.length === 0) {
            console.warn('⚠️ No data points before conversion. Attempting late fallback parse.');
            const recovered = this.fallbackParseData(wellLogData);
            if (recovered.length) {
                data = recovered;
                wellLogData.data = recovered;
                console.log(`✅ Late fallback recovered ${recovered.length} data rows.`);
            }
        }
        if (!data || data.length === 0) {
            console.error('❌ Still no data after fallback. Generating placeholder vertical reference.');
            // Generate simple vertical line as placeholder so viewer does not break
            for (let d = 0; d < 50; d++) {
                points.push({
                    x: 0, y: -d, z: 0,
                    intensity: 1000,
                    returnNumber: 1,
                    numberOfReturns: 1,
                    classification: 2,
                    depth: d,
                    originalData: {}
                });
            }
            return points;
        }
        
        // Extract common curve types
        const depthCurve = this.findCurve(wellLogData.curves, ['DEPT', 'DEPTH', 'MD', 'TVDSS']);
        const grCurve = this.findCurve(wellLogData.curves, ['GR', 'GAMMA', 'GAMMARAY']);
        const resistivityCurve = this.findCurve(wellLogData.curves, ['RESD', 'RES', 'RESIST', 'LLD', 'LLS']);
        const spCurve = this.findCurve(wellLogData.curves, ['SP', 'SPONTANEOUS']);
        const dtCurve = this.findCurve(wellLogData.curves, ['DT', 'SONIC', 'DELTA']);
        
        console.log('📊 Available curves:', {
            allCurves: Object.keys(wellLogData.curves),
            depth: depthCurve,
            gamma: grCurve,
            resistivity: resistivityCurve,
            sp: spCurve,
            sonic: dtCurve
        });
        
        console.log('📊 Sample data points:');
        for (let i = 0; i < Math.min(3, data.length); i++) {
            console.log(`   ${i}: ${JSON.stringify(data[i])}`);
        }
        
        // Convert each data point to 3D coordinates
        console.log(`🔄 Processing ${data.length} data points for 3D conversion...`);
        let processedCount = 0;
        
        for (let i = 0; i < data.length; i++) {
            const dataPoint = data[i];
            
            const depthKey = depthCurve || Object.keys(dataPoint)[0];
            const depthValue = dataPoint[depthKey];
            
            if (!depthKey || depthValue === null || depthValue === undefined || depthValue === -999.25) {
                if (i < 5) console.log(`   Skipping point ${i}: no valid depth (${depthKey}=${depthValue})`);
                continue;
            }
            
            processedCount++;
            
            // Create 3D visualization of well log
            // X: Offset based on curve values (spread laterally)
            // Y: Depth (vertical - inverted)
            // Z: Secondary curve for 3D effect
            
            const depth = dataPoint[depthKey];
            let x = 0;
            let z = 0;
            
            // Use GR for X-axis displacement
            if (grCurve && dataPoint[grCurve] !== null && dataPoint[grCurve] !== -999.25) {
                x = dataPoint[grCurve] * 0.5; // Scale gamma ray
            }
            
            // Use resistivity for Z-axis displacement
            if (resistivityCurve && dataPoint[resistivityCurve] !== null && dataPoint[resistivityCurve] !== -999.25) {
                z = Math.log10(Math.max(1, dataPoint[resistivityCurve])) * 20;
            }
            
            // Create multiple points per depth for visualization richness
            const baseIntensity = grCurve ? (dataPoint[grCurve] || 0) : 1000;
            
            // Main curve visualization - create cylindrical well bore
            for (let angle = 0; angle < 360; angle += 45) {
                const rad = (angle * Math.PI) / 180;
                const radius = 2 + (x / 100); // Variable radius based on GR
                
                points.push({
                    x: radius * Math.cos(rad),
                    y: -depth, // Negative depth for proper visualization
                    z: radius * Math.sin(rad) + z * 0.1,
                    intensity: Math.min(65535, Math.max(0, baseIntensity * 300)),
                    returnNumber: 1,
                    numberOfReturns: 1,
                    classification: this.classifyWellLogPoint(dataPoint, wellLogData.curves),
                    depth: depth,
                    originalData: dataPoint
                });
            }
            
            // Add lateral curve representations
            if (resistivityCurve && dataPoint[resistivityCurve] !== null) {
                const resValue = dataPoint[resistivityCurve];
                if (resValue > 0) {
                    points.push({
                        x: 10 + Math.log10(resValue) * 5,
                        y: -depth,
                        z: 0,
                        intensity: Math.min(65535, resValue * 100),
                        returnNumber: 1,
                        numberOfReturns: 1,
                        classification: 11, // Road surface (resistivity curve)
                        depth: depth,
                        curve: 'RESISTIVITY',
                        originalData: dataPoint
                    });
                }
            }
            
            if (spCurve && dataPoint[spCurve] !== null) {
                points.push({
                    x: -10 + dataPoint[spCurve] * 0.1,
                    y: -depth,
                    z: 0,
                    intensity: Math.min(65535, Math.abs(dataPoint[spCurve]) * 200),
                    returnNumber: 1,
                    numberOfReturns: 1,
                    classification: 9, // Water (SP curve)
                    depth: depth,
                    curve: 'SP',
                    originalData: dataPoint
                });
            }
        }
        
        console.log(`✅ Generated ${points.length} 3D points from ${data.length} well log entries`);
        console.log(`📊 Processed ${processedCount} valid data points, generated ${points.length} 3D points`);
        
        if (points.length === 0) {
            console.error('❌ WARNING: No 3D points generated - this will cause viewer error');
            console.error('📋 Available curves:', Object.keys(wellLogData.curves));
            console.error('📋 Sample data:', data.slice(0, 2));
        }
        
        return points;
    }

    /**
     * Find curve name from common aliases
     */
    findCurve(curves, aliases) {
        for (const alias of aliases) {
            if (curves[alias]) return alias;
        }
        
        // Try case-insensitive search
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
     * Classify well log points based on curve values
     */
    classifyWellLogPoint(dataPoint, curves) {
        // Default classification logic for well logs
        const grValue = dataPoint.GR || dataPoint.GAMMA || 0;
        const resValue = dataPoint.RESD || dataPoint.RES || dataPoint.RESIST || 1;
        
        if (grValue > 100) return 4; // High vegetation (high GR - shale)
        if (grValue < 30 && resValue > 10) return 6; // Building (clean sand)
        if (resValue < 2) return 9; // Water (conductive zone)
        
        return 2; // Ground (default)
    }

    // Existing LiDAR parsing methods (simplified for space)
    parseLiDARHeader(dataView) {
        // Implementation from original LASParser
        const header = {};
        
        // File signature check
        const signature = String.fromCharCode(
            dataView.getUint8(0),
            dataView.getUint8(1),
            dataView.getUint8(2),
            dataView.getUint8(3)
        );
        
        if (signature !== 'LASF') {
            throw new Error('Invalid LiDAR LAS file signature');
        }
        
        // Parse header fields (implementation details from original parser)
        header.versionMajor = dataView.getUint8(24);
        header.versionMinor = dataView.getUint8(25);
        header.offsetToPointData = dataView.getUint32(96, true);
        header.numberOfPointRecords = dataView.getUint32(107, true);
        header.pointDataRecordFormat = dataView.getUint8(104);
        header.pointDataRecordLength = dataView.getUint16(105, true);
        
        // Scale factors and offsets
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
        const numPoints = Math.min(this.header.numberOfPointRecords, 100000); // Limit for performance
        
        let offset = this.header.offsetToPointData;
        
        for (let i = 0; i < numPoints; i++) {
            const point = this.parseLiDARPoint(dataView, offset, this.header.pointDataRecordFormat);
            if (point) {
                points.push(point);
            }
            offset += pointSize;
        }
        
        return points;
    }

    parseLiDARPoint(dataView, offset, format) {
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

    calculateBounds(pointsArray) {
        const points = pointsArray || this.points;
        if (!points || points.length === 0) {
            console.warn("Cannot calculate bounds: no points available.");
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

    /**
     * Calculate bounds for the point cloud
     */
    calculateBounds() {
        this.bounds = {
            minX: Infinity, maxX: -Infinity,
            minY: Infinity, maxY: -Infinity,
            minZ: Infinity, maxZ: -Infinity
        };
        
        for (const point of this.points) {
            this.bounds.minX = Math.min(this.bounds.minX, point.x);
            this.bounds.maxX = Math.max(this.bounds.maxX, point.x);
            this.bounds.minY = Math.min(this.bounds.minY, point.y);
            this.bounds.maxY = Math.max(this.bounds.maxY, point.y);
            this.bounds.minZ = Math.min(this.bounds.minZ, point.z);
            this.bounds.maxZ = Math.max(this.bounds.maxZ, point.z);
        }
    }

    // Color generation methods for both formats
    generateElevationColors(points) {
        if (points.length === 0) return [];
        
        const colors = [];
        const minZ = this.bounds.minZ;
        const maxZ = this.bounds.maxZ;
        const range = maxZ - minZ;
        
        for (const point of points) {
            const normalized = range > 0 ? (point.z - minZ) / range : 0;
            const color = this.getElevationColor(normalized);
            colors.push(color.r / 255, color.g / 255, color.b / 255);
        }
        
        return colors;
    }

    generateIntensityColors(points) {
        if (points.length === 0) return [];
        
        const colors = [];
        let minIntensity = Infinity;
        let maxIntensity = -Infinity;
        
        for (const point of points) {
            minIntensity = Math.min(minIntensity, point.intensity);
            maxIntensity = Math.max(maxIntensity, point.intensity);
        }
        
        const range = maxIntensity - minIntensity;
        
        for (const point of points) {
            const normalized = range > 0 ? (point.intensity - minIntensity) / range : 0;
            colors.push(normalized, normalized, normalized);
        }
        
        return colors;
    }

    generateWellLogColors(points) {
        const colors = [];
        
        for (const point of points) {
            if (point.curve === 'RESISTIVITY') {
                // Red for resistivity
                colors.push(1.0, 0.3, 0.3);
            } else if (point.curve === 'SP') {
                // Blue for SP
                colors.push(0.3, 0.3, 1.0);
            } else {
                // Use classification colors for main bore
                const color = this.getClassificationColor(point.classification);
                colors.push(color.r / 255, color.g / 255, color.b / 255);
            }
        }
        
        return colors;
    }

    generateClassificationColors(points) {
        const colors = [];
        
        for (const point of points) {
            const color = this.getClassificationColor(point.classification);
            colors.push(color.r / 255, color.g / 255, color.b / 255);
        }
        
        return colors;
    }

    getElevationColor(normalized) {
        if (normalized < 0.25) {
            const t = normalized / 0.25;
            return { r: 0, g: Math.floor(t * 255), b: 255 };
        } else if (normalized < 0.5) {
            const t = (normalized - 0.25) / 0.25;
            return { r: 0, g: 255, b: Math.floor((1 - t) * 255) };
        } else if (normalized < 0.75) {
            const t = (normalized - 0.5) / 0.25;
            return { r: Math.floor(t * 255), g: 255, b: 0 };
        } else {
            const t = (normalized - 0.75) / 0.25;
            return { r: 255, g: Math.floor((1 - t) * 255), b: 0 };
        }
    }

    getClassificationColor(classification) {
        const colors = {
            0: { r: 128, g: 128, b: 128 }, // Never classified - gray
            1: { r: 153, g: 102, b: 51 },  // Unclassified - brown
            2: { r: 102, g: 51, b: 0 },    // Ground - dark brown
            3: { r: 0, g: 204, b: 0 },     // Low vegetation - green
            4: { r: 0, g: 153, b: 0 },     // Medium vegetation - dark green
            5: { r: 0, g: 102, b: 0 },     // High vegetation - darker green
            6: { r: 204, g: 51, b: 51 },   // Building - red
            7: { r: 255, g: 255, b: 0 },   // Low point - yellow
            8: { r: 0, g: 0, b: 255 },     // Model key-point - blue
            9: { r: 0, g: 255, b: 255 },   // Water - cyan
            10: { r: 204, g: 0, b: 204 },  // Rail - magenta
            11: { r: 102, g: 102, b: 102 }, // Road surface - gray
            12: { r: 255, g: 128, b: 0 },  // Overlap - orange
        };
        
        return colors[classification] || { r: 255, g: 255, b: 255 };
    }
}

// Export for use in main script
window.UltraAdvancedLASParser = UltraAdvancedLASParser;