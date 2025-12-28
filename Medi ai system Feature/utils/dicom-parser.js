// DICOM Parser - Handles DICOM file parsing and series reconstruction

class DICOMParser {
    constructor() {
        this.worker = null;
        this.initializeWorker();
    }

    initializeWorker() {
        // Initialize Web Worker for background processing
        const workerCode = `
            self.addEventListener('message', function(e) {
                const { files, fileData } = e.data;
                // Process in worker
                self.postMessage({ status: 'complete', data: fileData });
            });
        `;
        
        try {
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            this.worker = new Worker(URL.createObjectURL(blob));
        } catch (error) {
            console.warn('Web Worker not available, using main thread');
        }
    }

    async parseFiles(files) {
        const parsedImages = [];

        for (const file of files) {
            try {
                const arrayBuffer = await this.readFileAsArrayBuffer(file);
                const dataSet = await this.parseDICOM(arrayBuffer);
                
                if (dataSet) {
                    parsedImages.push({
                        fileName: file.name,
                        dataSet: dataSet,
                        metadata: this.extractMetadata(dataSet)
                    });
                }
            } catch (error) {
                console.error(`Error parsing ${file.name}:`, error);
                // Continue with other files
            }
        }

        // Organize into series
        const series = this.organizeSeries(parsedImages);
        
        // Sort each series by instance number
        series.forEach(s => this.sortSeries(s));

        return series;
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    async parseDICOM(arrayBuffer) {
        try {
            // Always use basic parsing for better control
            return this.basicDICOMParse(arrayBuffer);
        } catch (error) {
            console.error('DICOM parsing error:', error);
            
            // Try dicom-parser library as fallback
            try {
                if (typeof dicomParser !== 'undefined') {
                    const byteArray = new Uint8Array(arrayBuffer);
                    const dataSet = dicomParser.parseDicom(byteArray);
                    return dataSet;
                }
            } catch (fallbackError) {
                console.error('Fallback parsing also failed:', fallbackError);
            }
            
            throw new Error('Unsupported DICOM transfer syntax or corrupted file');
        }
    }

    basicDICOMParse(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        
        // Check for DICOM prefix
        const prefix = String.fromCharCode(
            view.getUint8(128), view.getUint8(129), 
            view.getUint8(130), view.getUint8(131)
        );
        
        if (prefix !== 'DICM') {
            throw new Error('Not a valid DICOM file');
        }

        // Create pseudo-dataset for basic parsing
        return {
            byteArray: new Uint8Array(arrayBuffer),
            elements: this.parseElements(view)
        };
    }

    parseElements(view) {
        const elements = {};
        let offset = 132; // Start after DICM prefix

        // First, try to determine if this is explicit or implicit VR
        let isExplicitVR = this.detectVRType(view);
        console.log('DICOM VR type detected:', isExplicitVR ? 'Explicit' : 'Implicit');

        try {
            let tagCount = 0;
            while (offset < view.byteLength - 8 && tagCount < 1000) {
                const group = view.getUint16(offset, true);
                const element = view.getUint16(offset + 2, true);
                const tag = this.formatTag(group, element);
                
                let vr = '';
                let length = 0;
                let dataOffset = 0;
                
                if (isExplicitVR) {
                    // Explicit VR
                    vr = String.fromCharCode(view.getUint8(offset + 4), view.getUint8(offset + 5));
                    
                    if (this.isValidVR(vr)) {
                        if (vr === 'OB' || vr === 'OW' || vr === 'SQ' || vr === 'UN') {
                            length = view.getUint32(offset + 8, true);
                            dataOffset = offset + 12;
                        } else {
                            length = view.getUint16(offset + 6, true);
                            dataOffset = offset + 8;
                        }
                    } else {
                        // Invalid VR, fall back to implicit
                        length = view.getUint32(offset + 4, true);
                        dataOffset = offset + 8;
                        vr = 'IMPLICIT';
                        isExplicitVR = false; // Switch to implicit for rest of file
                    }
                } else {
                    // Implicit VR
                    length = view.getUint32(offset + 4, true);
                    dataOffset = offset + 8;
                    vr = 'IMPLICIT';
                }

                if (length === 0xFFFFFFFF || length > view.byteLength) {
                    // Undefined length or invalid - usually end of data or pixel data
                    break;
                }

                elements[tag] = {
                    tag,
                    vr,
                    length,
                    dataOffset
                };

                // Debug key tags
                if (tag === 'x00280010' || tag === 'x00280011' || tag === 'x00280100' || tag === 'x7fe00010') {
                    console.log(`Found key tag ${tag}: VR=${vr}, length=${length}, offset=${offset}`);
                }

                offset = dataOffset + length;
                tagCount++;
            }
            
            console.log(`Parsed ${tagCount} DICOM elements, found ${Object.keys(elements).length} valid tags`);
            
        } catch (error) {
            console.warn('Element parsing incomplete:', error);
        }

        return elements;
    }

    detectVRType(view) {
        // Look for transfer syntax UID in the file meta information
        let offset = 132;
        try {
            while (offset < Math.min(view.byteLength - 16, 1024)) {
                const group = view.getUint16(offset, true);
                const element = view.getUint16(offset + 2, true);
                
                if (group === 0x0002 && element === 0x0010) {
                    // Found transfer syntax tag
                    const vr = String.fromCharCode(view.getUint8(offset + 4), view.getUint8(offset + 5));
                    let uid = '';
                    
                    if (this.isValidVR(vr) && vr === 'UI') {
                        // Explicit VR
                        const length = view.getUint16(offset + 6, true);
                        const dataStart = offset + 8;
                        for (let i = 0; i < Math.min(length, 64); i++) {
                            const byte = view.getUint8(dataStart + i);
                            if (byte === 0) break;
                            uid += String.fromCharCode(byte);
                        }
                    } else {
                        // Implicit VR
                        const length = view.getUint32(offset + 4, true);
                        const dataStart = offset + 8;
                        for (let i = 0; i < Math.min(length, 64); i++) {
                            const byte = view.getUint8(dataStart + i);
                            if (byte === 0) break;
                            uid += String.fromCharCode(byte);
                        }
                    }
                    
                    console.log('Transfer syntax UID:', uid);
                    
                    // Check for implicit VR
                    if (uid === '1.2.840.10008.1.2') {
                        return false; // Implicit VR
                    } else if (uid === '1.2.840.10008.1.2.1') {
                        return true; // Explicit VR
                    }
                    // Default to explicit for unknown
                    return true;
                }
                
                // Skip to next potential tag
                offset += 16;
            }
        } catch (e) {
            console.warn('VR detection failed:', e);
        }
        
        // Default to explicit VR if can't determine
        return true;
    }

    formatTag(group, element) {
        return 'x' + 
            group.toString(16).padStart(4, '0') + 
            element.toString(16).padStart(4, '0');
    }

    isValidVR(vr) {
        const validVRs = ['AE', 'AS', 'AT', 'CS', 'DA', 'DS', 'DT', 'FL', 'FD', 'IS', 
                         'LO', 'LT', 'OB', 'OD', 'OF', 'OW', 'PN', 'SH', 'SL', 'SQ', 
                         'SS', 'ST', 'TM', 'UI', 'UL', 'UN', 'US', 'UT'];
        return validVRs.includes(vr);
    }

    extractMetadata(dataSet) {
        const getString = (tag) => {
            try {
                return dataSet.string(tag) || '';
            } catch {
                return this.getStringFallback(dataSet, tag);
            }
        };

        const getInt = (tag) => {
            try {
                return dataSet.intString(tag);
            } catch {
                return this.getIntFallback(dataSet, tag);
            }
        };

        const getFloat = (tag) => {
            try {
                return dataSet.floatString(tag);
            } catch {
                return this.getFloatFallback(dataSet, tag);
            }
        };

        const metadata = {
            // Patient information
            patientName: getString('x00100010'),
            patientId: getString('x00100020'),
            patientBirthDate: getString('x00100030'),
            patientSex: getString('x00100040'),
            
            // Study information
            studyDate: getString('x00080020'),
            studyTime: getString('x00080030'),
            studyDescription: getString('x00081030'),
            studyInstanceUID: getString('x0020000d'),
            
            // Series information
            modality: getString('x00080060'),
            seriesNumber: getInt('x00200011'),
            seriesDescription: getString('x0008103e'),
            seriesInstanceUID: getString('x0020000e'),
            
            // Image information
            instanceNumber: getInt('x00200013'),
            sliceLocation: getFloat('x00201041'),
            imagePosition: this.getImagePosition(dataSet),
            
            // Image properties
            rows: getInt('x00280010'),
            columns: getInt('x00280011'),
            bitsAllocated: getInt('x00280100'),
            bitsStored: getInt('x00280101'),
            pixelRepresentation: getInt('x00280103'),
            samplesPerPixel: getInt('x00280002'),
            photometricInterpretation: getString('x00280004'),
            
            // Pixel spacing
            pixelSpacing: getString('x00280030'),
            sliceThickness: getFloat('x00180050'),
            
            // Window level
            windowCenter: getFloat('x00281050'),
            windowWidth: getFloat('x00281051'),
            
            // Rescale
            rescaleIntercept: getFloat('x00281052') || 0,
            rescaleSlope: getFloat('x00281053') || 1
        };

        // Debug logging for dimensions
        console.log('DICOM metadata extracted:', {
            rows: metadata.rows,
            columns: metadata.columns,
            bitsAllocated: metadata.bitsAllocated,
            pixelDataTag: dataSet.elements ? !!dataSet.elements['x7fe00010'] : 'no elements',
            availableTags: dataSet.elements ? Object.keys(dataSet.elements).slice(0, 10) : 'no elements'
        });

        return metadata;
    }

    getStringFallback(dataSet, tag) {
        try {
            if (dataSet.elements && dataSet.elements[tag]) {
                const element = dataSet.elements[tag];
                const bytes = new Uint8Array(
                    dataSet.byteArray.buffer,
                    element.dataOffset,
                    element.length
                );
                return String.fromCharCode.apply(null, bytes).trim();
            }
        } catch (error) {
            // Silent fail
        }
        return '';
    }

    getIntFallback(dataSet, tag) {
        try {
            if (dataSet.elements && dataSet.elements[tag]) {
                const element = dataSet.elements[tag];
                const view = new DataView(
                    dataSet.byteArray.buffer,
                    element.dataOffset,
                    element.length
                );
                
                // Parse based on VR and length
                const vr = element.vr;
                if (vr === 'US' && element.length >= 2) {
                    return view.getUint16(0, true); // Little endian
                } else if (vr === 'UL' && element.length >= 4) {
                    return view.getUint32(0, true); // Little endian
                } else if (vr === 'SS' && element.length >= 2) {
                    return view.getInt16(0, true); // Little endian
                } else if (vr === 'SL' && element.length >= 4) {
                    return view.getInt32(0, true); // Little endian
                } else if (element.length === 2) {
                    // Assume unsigned short
                    return view.getUint16(0, true);
                } else if (element.length === 4) {
                    // Assume unsigned long
                    return view.getUint32(0, true);
                }
            }
        } catch (error) {
            console.warn('Int fallback failed for tag', tag, error);
        }
        return null;
    }

    getFloatFallback(dataSet, tag) {
        try {
            if (dataSet.elements && dataSet.elements[tag]) {
                const element = dataSet.elements[tag];
                const view = new DataView(
                    dataSet.byteArray.buffer,
                    element.dataOffset,
                    element.length
                );
                
                // Parse based on VR
                const vr = element.vr;
                if (vr === 'FL' && element.length >= 4) {
                    return view.getFloat32(0, true); // Little endian
                } else if (vr === 'FD' && element.length >= 8) {
                    return view.getFloat64(0, true); // Little endian
                } else if (vr === 'DS' && element.length > 0) {
                    // Decimal string - parse as float
                    const bytes = new Uint8Array(
                        dataSet.byteArray.buffer,
                        element.dataOffset,
                        element.length
                    );
                    const str = String.fromCharCode.apply(null, bytes).trim();
                    return parseFloat(str);
                }
            }
        } catch (error) {
            console.warn('Float fallback failed for tag', tag, error);
        }
        return null;
    }

    getImagePosition(dataSet) {
        try {
            const posStr = dataSet.string('x00200032');
            if (posStr) {
                return posStr.split('\\').map(parseFloat);
            }
        } catch (error) {
            // Silent fail
        }
        return null;
    }

    organizeSeries(parsedImages) {
        const seriesMap = new Map();

        for (const image of parsedImages) {
            const seriesUID = image.metadata.seriesInstanceUID || 'unknown';
            
            if (!seriesMap.has(seriesUID)) {
                seriesMap.set(seriesUID, {
                    id: seriesUID,
                    description: image.metadata.seriesDescription || 'Unnamed Series',
                    modality: image.metadata.modality,
                    seriesNumber: image.metadata.seriesNumber,
                    images: []
                });
            }

            const series = seriesMap.get(seriesUID);
            
            // Extract pixel data
            const pixelData = this.extractPixelData(image.dataSet, image.metadata);
            
            series.images.push({
                fileName: image.fileName,
                metadata: image.metadata,
                imageData: pixelData,
                width: image.metadata.columns,
                height: image.metadata.rows,
                sliceNumber: image.metadata.instanceNumber || 0,
                sliceLocation: image.metadata.sliceLocation || 0
            });
        }

        return Array.from(seriesMap.values()).map(series => ({
            ...series,
            imageCount: series.images.length
        }));
    }

    extractPixelData(dataSet, metadata) {
        try {
            // Try to get pixel data
            const pixelDataElement = dataSet.elements['x7fe00010'];
            
            if (!pixelDataElement) {
                console.error('No pixel data element found in DICOM');
                throw new Error('No pixel data found');
            }

            const pixelData = new Uint8Array(
                dataSet.byteArray.buffer,
                pixelDataElement.dataOffset,
                pixelDataElement.length
            );

            console.log('Pixel data extracted:', {
                length: pixelData.length,
                width: metadata.columns,
                height: metadata.rows,
                bitsAllocated: metadata.bitsAllocated
            });

            // Convert to appropriate format based on bits allocated
            const bitsAllocated = metadata.bitsAllocated || 8;
            const width = metadata.columns;
            const height = metadata.rows;
            const rescaleSlope = metadata.rescaleSlope || 1;
            const rescaleIntercept = metadata.rescaleIntercept || 0;

            if (!width || !height) {
                throw new Error('Invalid image dimensions');
            }

            if (bitsAllocated === 16) {
                return this.process16BitPixelData(
                    pixelData, 
                    width, 
                    height, 
                    rescaleSlope, 
                    rescaleIntercept,
                    metadata.pixelRepresentation === 1
                );
            } else if (bitsAllocated === 8) {
                return this.process8BitPixelData(pixelData, width, height);
            } else {
                console.warn(`Unsupported bits allocated: ${bitsAllocated}, attempting 16-bit processing`);
                return this.process16BitPixelData(
                    pixelData, 
                    width, 
                    height, 
                    rescaleSlope, 
                    rescaleIntercept,
                    false
                );
            }
        } catch (error) {
            console.error('Pixel data extraction error:', error);
            console.error('Metadata:', metadata);
            
            // Return gray checkerboard pattern to show something went wrong
            const width = metadata.columns || 512;
            const height = metadata.rows || 512;
            const result = new Uint8ClampedArray(width * height * 4);
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    const checker = ((x / 32 | 0) + (y / 32 | 0)) % 2;
                    const gray = checker ? 80 : 120;
                    result[idx] = gray;
                    result[idx + 1] = gray;
                    result[idx + 2] = gray;
                    result[idx + 3] = 255;
                }
            }
            
            return result;
        }
    }

    process16BitPixelData(pixelData, width, height, slope, intercept, signed) {
        const length = width * height;
        const output = new Uint8ClampedArray(length * 4);
        
        // Create 16-bit view
        const view = signed ? 
            new Int16Array(pixelData.buffer, pixelData.byteOffset, length) :
            new Uint16Array(pixelData.buffer, pixelData.byteOffset, length);

        // Find min/max for normalization
        let min = Infinity;
        let max = -Infinity;
        
        for (let i = 0; i < length; i++) {
            const value = view[i] * slope + intercept;
            if (value < min) min = value;
            if (value > max) max = value;
        }

        const range = max - min || 1;

        // Normalize to 8-bit RGBA
        for (let i = 0; i < length; i++) {
            const value = view[i] * slope + intercept;
            const normalized = ((value - min) / range) * 255;
            const gray = Math.round(normalized);
            
            const idx = i * 4;
            output[idx] = gray;     // R
            output[idx + 1] = gray; // G
            output[idx + 2] = gray; // B
            output[idx + 3] = 255;  // A
        }

        return output;
    }

    process8BitPixelData(pixelData, width, height) {
        const length = width * height;
        const output = new Uint8ClampedArray(length * 4);

        for (let i = 0; i < length; i++) {
            const gray = pixelData[i];
            const idx = i * 4;
            output[idx] = gray;
            output[idx + 1] = gray;
            output[idx + 2] = gray;
            output[idx + 3] = 255;
        }

        return output;
    }

    sortSeries(series) {
        series.images.sort((a, b) => {
            // Sort by instance number first
            if (a.sliceNumber !== b.sliceNumber) {
                return a.sliceNumber - b.sliceNumber;
            }
            // Then by slice location
            if (a.sliceLocation !== b.sliceLocation) {
                return a.sliceLocation - b.sliceLocation;
            }
            // Finally by filename
            return a.fileName.localeCompare(b.fileName);
        });
    }
}
