// TIFF Parser - Handles multi-layer TIFF medical image parsing

class TIFFParser {
    constructor() {
        this.littleEndian = true;
    }

    async parseFile(file) {
        const arrayBuffer = await this.readFileAsArrayBuffer(file);
        return this.parseTIFF(arrayBuffer);
    }

    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    parseTIFF(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        
        // Read byte order
        const byteOrder = view.getUint16(0, true);
        
        if (byteOrder === 0x4949) {
            this.littleEndian = true;  // Intel (little-endian)
        } else if (byteOrder === 0x4D4D) {
            this.littleEndian = false; // Motorola (big-endian)
        } else {
            throw new Error('Invalid TIFF file - bad byte order marker');
        }

        // Check TIFF version (should be 42)
        const version = this.readUint16(view, 2);
        if (version !== 42 && version !== 43) {
            throw new Error('Unsupported TIFF version');
        }

        // Get first IFD offset
        let ifdOffset = this.readUint32(view, 4);
        
        const layers = [];
        let layerIndex = 0;

        // Parse all IFDs (Image File Directories)
        while (ifdOffset !== 0) {
            const ifd = this.parseIFD(view, ifdOffset);
            const layer = this.extractImageFromIFD(view, ifd, layerIndex);
            
            if (layer) {
                layers.push(layer);
            }

            ifdOffset = ifd.nextIFDOffset;
            layerIndex++;
        }

        if (layers.length === 0) {
            throw new Error('No valid image data found in TIFF file');
        }

        return layers;
    }

    parseIFD(view, offset) {
        const numEntries = this.readUint16(view, offset);
        const entries = {};

        let entryOffset = offset + 2;

        for (let i = 0; i < numEntries; i++) {
            const tag = this.readUint16(view, entryOffset);
            const type = this.readUint16(view, entryOffset + 2);
            const count = this.readUint32(view, entryOffset + 4);
            const valueOffset = entryOffset + 8;

            entries[tag] = {
                tag,
                type,
                count,
                value: this.readTagValue(view, type, count, valueOffset)
            };

            entryOffset += 12;
        }

        const nextIFDOffset = this.readUint32(view, entryOffset);

        return { entries, nextIFDOffset };
    }

    readTagValue(view, type, count, offset) {
        const dataSize = this.getTypeSize(type) * count;
        
        let actualOffset = offset;
        
        // If data is larger than 4 bytes, the offset field contains pointer to data
        if (dataSize > 4) {
            actualOffset = this.readUint32(view, offset);
        }

        switch (type) {
            case 1: // BYTE
            case 7: // UNDEFINED
                return this.readBytes(view, actualOffset, count);
            case 2: // ASCII
                return this.readString(view, actualOffset, count);
            case 3: // SHORT
                return this.readShorts(view, actualOffset, count);
            case 4: // LONG
                return this.readLongs(view, actualOffset, count);
            case 5: // RATIONAL
                return this.readRationals(view, actualOffset, count);
            case 6: // SBYTE
                return this.readSBytes(view, actualOffset, count);
            case 8: // SSHORT
                return this.readSShorts(view, actualOffset, count);
            case 9: // SLONG
                return this.readSLongs(view, actualOffset, count);
            case 10: // SRATIONAL
                return this.readSRationals(view, actualOffset, count);
            case 11: // FLOAT
                return this.readFloats(view, actualOffset, count);
            case 12: // DOUBLE
                return this.readDoubles(view, actualOffset, count);
            default:
                return null;
        }
    }

    getTypeSize(type) {
        const sizes = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8];
        return sizes[type] || 0;
    }

    extractImageFromIFD(view, ifd, layerIndex) {
        const entries = ifd.entries;

        // Required tags
        const width = this.getTagValue(entries, 256); // ImageWidth
        const height = this.getTagValue(entries, 257); // ImageLength
        const bitsPerSample = this.getTagValue(entries, 258) || 8; // BitsPerSample
        const compression = this.getTagValue(entries, 259) || 1; // Compression
        const photometric = this.getTagValue(entries, 262); // PhotometricInterpretation
        const stripOffsets = this.getTagValue(entries, 273); // StripOffsets
        const samplesPerPixel = this.getTagValue(entries, 277) || 1; // SamplesPerPixel
        const rowsPerStrip = this.getTagValue(entries, 278) || height; // RowsPerStrip
        const stripByteCounts = this.getTagValue(entries, 279); // StripByteCounts

        if (!width || !height) {
            console.warn('Missing required TIFF tags');
            return null;
        }

        // Only support uncompressed for now
        if (compression !== 1) {
            throw new Error(`Unsupported TIFF compression: ${compression}. Only uncompressed (1) is supported.`);
        }

        // Read pixel data
        const pixelData = this.readStrips(
            view, 
            stripOffsets, 
            stripByteCounts, 
            width, 
            height, 
            bitsPerSample,
            samplesPerPixel
        );

        // Convert to RGBA
        const imageData = this.convertToRGBA(
            pixelData, 
            width, 
            height, 
            bitsPerSample,
            samplesPerPixel,
            photometric
        );

        return {
            layerIndex,
            width,
            height,
            bitsPerSample,
            samplesPerPixel,
            imageData
        };
    }

    getTagValue(entries, tag) {
        const entry = entries[tag];
        if (!entry) return null;
        
        if (Array.isArray(entry.value)) {
            return entry.value.length === 1 ? entry.value[0] : entry.value;
        }
        return entry.value;
    }

    readStrips(view, offsets, byteCounts, width, height, bitsPerSample, samplesPerPixel) {
        if (!Array.isArray(offsets)) {
            offsets = [offsets];
        }
        if (!Array.isArray(byteCounts)) {
            byteCounts = [byteCounts];
        }

        const bytesPerPixel = (bitsPerSample / 8) * samplesPerPixel;
        const totalBytes = width * height * bytesPerPixel;
        
        const pixelData = new Uint8Array(totalBytes);
        let destOffset = 0;

        for (let i = 0; i < offsets.length; i++) {
            const stripOffset = offsets[i];
            const stripByteCount = byteCounts[i];

            for (let j = 0; j < stripByteCount; j++) {
                pixelData[destOffset++] = view.getUint8(stripOffset + j);
            }
        }

        return pixelData;
    }

    convertToRGBA(pixelData, width, height, bitsPerSample, samplesPerPixel, photometric) {
        const length = width * height;
        const output = new Uint8ClampedArray(length * 4);

        if (bitsPerSample === 8 && samplesPerPixel === 1) {
            // Grayscale 8-bit
            for (let i = 0; i < length; i++) {
                let gray = pixelData[i];
                
                // Handle photometric interpretation
                if (photometric === 0) { // WhiteIsZero
                    gray = 255 - gray;
                }
                
                const idx = i * 4;
                output[idx] = gray;
                output[idx + 1] = gray;
                output[idx + 2] = gray;
                output[idx + 3] = 255;
            }
        } else if (bitsPerSample === 16 && samplesPerPixel === 1) {
            // Grayscale 16-bit
            const view = new Uint16Array(
                pixelData.buffer,
                pixelData.byteOffset,
                length
            );

            // Find min/max for normalization
            let min = Infinity;
            let max = -Infinity;
            
            for (let i = 0; i < length; i++) {
                const value = view[i];
                if (value < min) min = value;
                if (value > max) max = value;
            }

            const range = max - min || 1;

            for (let i = 0; i < length; i++) {
                let value = view[i];
                
                if (photometric === 0) { // WhiteIsZero
                    value = max - value + min;
                }
                
                const normalized = ((value - min) / range) * 255;
                const gray = Math.round(normalized);
                
                const idx = i * 4;
                output[idx] = gray;
                output[idx + 1] = gray;
                output[idx + 2] = gray;
                output[idx + 3] = 255;
            }
        } else if (bitsPerSample === 8 && samplesPerPixel === 3) {
            // RGB 8-bit
            for (let i = 0; i < length; i++) {
                const srcIdx = i * 3;
                const dstIdx = i * 4;
                
                output[dstIdx] = pixelData[srcIdx];
                output[dstIdx + 1] = pixelData[srcIdx + 1];
                output[dstIdx + 2] = pixelData[srcIdx + 2];
                output[dstIdx + 3] = 255;
            }
        } else {
            throw new Error(`Unsupported TIFF format: ${bitsPerSample} bits, ${samplesPerPixel} samples`);
        }

        return output;
    }

    // Helper read methods
    readUint16(view, offset) {
        return view.getUint16(offset, this.littleEndian);
    }

    readUint32(view, offset) {
        return view.getUint32(offset, this.littleEndian);
    }

    readBytes(view, offset, count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(view.getUint8(offset + i));
        }
        return count === 1 ? result[0] : result;
    }

    readString(view, offset, count) {
        let str = '';
        for (let i = 0; i < count; i++) {
            const char = view.getUint8(offset + i);
            if (char === 0) break; // Null terminator
            str += String.fromCharCode(char);
        }
        return str;
    }

    readShorts(view, offset, count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(this.readUint16(view, offset + i * 2));
        }
        return count === 1 ? result[0] : result;
    }

    readLongs(view, offset, count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(this.readUint32(view, offset + i * 4));
        }
        return count === 1 ? result[0] : result;
    }

    readRationals(view, offset, count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            const numerator = this.readUint32(view, offset + i * 8);
            const denominator = this.readUint32(view, offset + i * 8 + 4);
            result.push(numerator / denominator);
        }
        return count === 1 ? result[0] : result;
    }

    readSBytes(view, offset, count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(view.getInt8(offset + i));
        }
        return count === 1 ? result[0] : result;
    }

    readSShorts(view, offset, count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(view.getInt16(offset + i * 2, this.littleEndian));
        }
        return count === 1 ? result[0] : result;
    }

    readSLongs(view, offset, count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(view.getInt32(offset + i * 4, this.littleEndian));
        }
        return count === 1 ? result[0] : result;
    }

    readSRationals(view, offset, count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            const numerator = view.getInt32(offset + i * 8, this.littleEndian);
            const denominator = view.getInt32(offset + i * 8 + 4, this.littleEndian);
            result.push(numerator / denominator);
        }
        return count === 1 ? result[0] : result;
    }

    readFloats(view, offset, count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(view.getFloat32(offset + i * 4, this.littleEndian));
        }
        return count === 1 ? result[0] : result;
    }

    readDoubles(view, offset, count) {
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(view.getFloat64(offset + i * 8, this.littleEndian));
        }
        return count === 1 ? result[0] : result;
    }
}
