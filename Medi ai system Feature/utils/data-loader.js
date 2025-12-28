// Data Loader - Automatically loads medical images from DATA folder

class DataLoader {
    constructor() {
        this.dataFolder = './DATA/';
        this.availableFiles = [
            'ID_0000_AGE_0060_CONTRAST_1_CT.dcm',
            'ID_0004_AGE_0056_CONTRAST_1_CT.dcm',
            'ID_0004_AGE_0056_CONTRAST_1_CT.tif',
            '0171021638f9272a34a41feb84ed47a0.png'
        ];
    }

    async loadAllFiles() {
        const files = [];
        
        for (const fileName of this.availableFiles) {
            try {
                const file = await this.fetchFile(fileName);
                if (file) {
                    files.push(file);
                }
            } catch (error) {
                console.warn(`Could not load ${fileName}:`, error);
            }
        }

        return files;
    }

    async fetchFile(fileName) {
        try {
            console.log(`Fetching file: ${this.dataFolder}${fileName}`);
            
            const response = await fetch(this.dataFolder + fileName);
            
            if (!response.ok) {
                console.error(`HTTP error for ${fileName}:`, response.status, response.statusText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            
            console.log(`Fetched ${fileName}: ${blob.size} bytes`);
            
            // Create File object from blob
            const file = new File([blob], fileName, {
                type: this.getMimeType(fileName)
            });

            return file;
        } catch (error) {
            console.error(`Error fetching ${fileName}:`, error);
            return null;
        }
    }

    getMimeType(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        
        const mimeTypes = {
            'dcm': 'application/dicom',
            'tif': 'image/tiff',
            'tiff': 'image/tiff',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg'
        };

        return mimeTypes[ext] || 'application/octet-stream';
    }

    getDICOMFiles() {
        return this.availableFiles.filter(f => f.endsWith('.dcm'));
    }

    getTIFFFiles() {
        return this.availableFiles.filter(f => f.match(/\.(tif|tiff)$/i));
    }

    getImageFiles() {
        return this.availableFiles.filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    }

    async loadFilesByType(type) {
        let fileNames = [];
        
        switch(type) {
            case 'dicom':
                fileNames = this.getDICOMFiles();
                break;
            case 'tiff':
                fileNames = this.getTIFFFiles();
                break;
            case 'image':
                fileNames = this.getImageFiles();
                break;
            default:
                fileNames = this.availableFiles;
        }

        const files = [];
        for (const fileName of fileNames) {
            const file = await this.fetchFile(fileName);
            if (file) files.push(file);
        }

        return files;
    }
}
