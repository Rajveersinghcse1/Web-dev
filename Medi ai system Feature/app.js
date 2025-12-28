// Medical Imaging Viewer - Main Application

class MedicalImageViewer {
    constructor() {
        this.currentSeries = null;
        this.allSeries = [];
        this.currentSliceIndex = 0;
        this.renderer = null;
        this.volumeRenderer = null;
        this.isProcessing = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.checkWebGLSupport();
    }

    initializeElements() {
        // UI Elements
        this.loadSampleBtn = document.getElementById('loadSampleBtn');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.fileInput = document.getElementById('fileInput');
        this.dropZone = document.getElementById('dropZone');
        this.canvasContainer = document.getElementById('canvasContainer');
        this.mainCanvas = document.getElementById('mainCanvas');
        this.heatmapCanvas = document.getElementById('heatmapCanvas');
        this.viewerControls = document.getElementById('viewerControls');
        this.filmStrip = document.getElementById('filmStrip');
        this.thumbnailContainer = document.getElementById('thumbnailContainer');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.errorToast = document.getElementById('errorToast');
        this.seriesList = document.getElementById('seriesList');

        // Info displays
        this.infoElements = {
            patientId: document.getElementById('patientId'),
            modality: document.getElementById('modality'),
            studyDate: document.getElementById('studyDate'),
            seriesNumber: document.getElementById('seriesNumber'),
            dimensions: document.getElementById('dimensions'),
            sliceCount: document.getElementById('sliceCount'),
            pixelSpacing: document.getElementById('pixelSpacing'),
            bitsAllocated: document.getElementById('bitsAllocated'),
            windowLevel: document.getElementById('windowLevel'),
            windowWidth: document.getElementById('windowWidth'),
            zoomLevel: document.getElementById('zoomLevel'),
            currentSlice: document.getElementById('currentSlice')
        };

        // Controls
        this.controls = {
            reset: document.getElementById('resetBtn'),
            zoomIn: document.getElementById('zoomInBtn'),
            zoomOut: document.getElementById('zoomOutBtn'),
            invert: document.getElementById('invertBtn'),
            toggleHeatmap: document.getElementById('toggleHeatmapBtn'),
            view3D: document.getElementById('view3DBtn'),
            sliceSlider: document.getElementById('sliceSlider'),
            brightnessSlider: document.getElementById('brightnessSlider'),
            contrastSlider: document.getElementById('contrastSlider')
        };

        // Initialize renderer
        this.renderer = new ImageRenderer(this.mainCanvas);
        this.volumeRenderer = new VolumeRenderer();
        
        // Initialize data loader
        this.dataLoader = new DataLoader();
    }

    attachEventListeners() {
        // File upload
        this.loadSampleBtn.addEventListener('click', () => this.loadSampleData());
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFiles(e.target.files));

        // Drag and drop
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', () => {
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Control buttons
        this.controls.reset.addEventListener('click', () => this.resetView());
        this.controls.zoomIn.addEventListener('click', () => this.zoom(1.2));
        this.controls.zoomOut.addEventListener('click', () => this.zoom(0.8));
        this.controls.invert.addEventListener('click', () => this.toggleInvert());
        this.controls.toggleHeatmap.addEventListener('click', () => this.toggleHeatmap());
        this.controls.view3D.addEventListener('click', () => this.toggle3DView());

        // Sliders
        this.controls.sliceSlider.addEventListener('input', (e) => {
            this.currentSliceIndex = parseInt(e.target.value);
            this.renderCurrentSlice();
        });

        this.controls.brightnessSlider.addEventListener('input', (e) => {
            this.renderer.setWindowLevel(parseInt(e.target.value));
            this.updateOverlayInfo();
            this.renderCurrentSlice();
        });

        this.controls.contrastSlider.addEventListener('input', (e) => {
            this.renderer.setWindowWidth(parseInt(e.target.value));
            this.updateOverlayInfo();
            this.renderCurrentSlice();
        });

        // Canvas interactions
        this.setupCanvasInteractions();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    setupCanvasInteractions() {
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;
        let isWindowLeveling = false;

        this.mainCanvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            
            // Right click or Ctrl+Click for window leveling
            isWindowLeveling = e.button === 2 || e.ctrlKey;
            if (isWindowLeveling) {
                e.preventDefault();
            }
        });

        this.mainCanvas.addEventListener('contextmenu', (e) => e.preventDefault());

        this.mainCanvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            if (isWindowLeveling) {
                // Window level adjustment
                const currentWL = this.renderer.windowLevel;
                const currentWW = this.renderer.windowWidth;
                
                this.renderer.setWindowLevel(currentWL + deltaX);
                this.renderer.setWindowWidth(Math.max(1, currentWW + deltaY));
                
                this.controls.brightnessSlider.value = this.renderer.windowLevel;
                this.controls.contrastSlider.value = this.renderer.windowWidth;
                
                this.updateOverlayInfo();
                this.renderCurrentSlice();
            } else {
                // Pan
                this.renderer.pan(deltaX, deltaY);
                this.renderCurrentSlice();
            }

            lastX = e.clientX;
            lastY = e.clientY;
        });

        this.mainCanvas.addEventListener('mouseup', () => {
            isDragging = false;
            isWindowLeveling = false;
        });

        this.mainCanvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            if (e.ctrlKey) {
                // Zoom with Ctrl+Wheel
                const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
                this.zoom(zoomFactor);
            } else {
                // Slice navigation with Wheel
                const delta = e.deltaY > 0 ? 1 : -1;
                this.navigateSlice(delta);
            }
        });
    }

    handleKeyboard(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
                this.navigateSlice(-1);
                break;
            case 'ArrowDown':
            case 's':
                this.navigateSlice(1);
                break;
            case 'r':
                this.resetView();
                break;
            case 'i':
                this.toggleInvert();
                break;
            case '+':
            case '=':
                this.zoom(1.2);
                break;
            case '-':
            case '_':
                this.zoom(0.8);
                break;
        }
    }

    async handleFiles(files) {
        if (this.isProcessing) return;
        
        this.showLoading(true);
        this.isProcessing = true;

        try {
            const fileArray = Array.from(files);
            const dicomFiles = fileArray.filter(f => f.name.toLowerCase().endsWith('.dcm'));
            const tiffFiles = fileArray.filter(f => f.name.toLowerCase().match(/\.(tif|tiff)$/));
            const imageFiles = fileArray.filter(f => f.name.toLowerCase().match(/\.(png|jpg|jpeg)$/));

            if (dicomFiles.length > 0) {
                await this.processDICOMFiles(dicomFiles);
            } else if (tiffFiles.length > 0) {
                await this.processTIFFFiles(tiffFiles);
            } else if (imageFiles.length > 0) {
                await this.processImageFiles(imageFiles);
            } else {
                throw new Error('No supported image files found. Please upload .dcm, .tif, or image files.');
            }

            this.showDropZone(false);
            this.showViewer(true);
            
        } catch (error) {
            console.error('Error processing files:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
            this.isProcessing = false;
        }
    }

    async loadSampleData() {
        if (this.isProcessing) return;
        
        this.showLoading(true);
        this.isProcessing = true;

        try {
            const files = await this.dataLoader.loadAllFiles();
            
            if (files.length === 0) {
                throw new Error('No sample files found in DATA folder. Please ensure files are accessible.');
            }

            await this.handleFiles(files);
            
        } catch (error) {
            console.error('Error loading sample data:', error);
            this.showError('Could not load sample data: ' + error.message);
            this.showLoading(false);
            this.isProcessing = false;
        }
    }

    async processDICOMFiles(files) {
        const parser = new DICOMParser();
        
        console.log(`Processing ${files.length} DICOM file(s)...`);
        
        const series = await parser.parseFiles(files);
        
        console.log(`Parsed ${series.length} series:`, series);
        
        if (series.length === 0) {
            throw new Error('No valid DICOM series found. Files may be corrupted or use unsupported transfer syntax.');
        }

        this.allSeries = series;
        this.displaySeriesList();
        this.loadSeries(series[0]);
        
        console.log('DICOM processing complete');
    }

    async processTIFFFiles(files) {
        const parser = new TIFFParser();
        
        console.log(`Processing ${files.length} TIFF file(s)...`);
        
        for (const file of files) {
            try {
                console.log(`Parsing TIFF: ${file.name}`);
                const layers = await parser.parseFile(file);
                
                console.log(`Found ${layers.length} layer(s) in ${file.name}`);
                
                const series = {
                    id: file.name,
                    description: file.name,
                    modality: 'TIFF',
                    imageCount: layers.length,
                    images: layers.map((layer, index) => ({
                        imageData: layer.imageData,
                        width: layer.width,
                        height: layer.height,
                        sliceNumber: index,
                        metadata: {
                            modality: 'TIFF',
                            description: `${file.name} - Layer ${index + 1}`
                        }
                    }))
                };
                
                this.allSeries.push(series);
            } catch (error) {
                console.error(`Error parsing TIFF ${file.name}:`, error);
                this.showError(`Could not parse ${file.name}: ${error.message}`);
            }
        }

        if (this.allSeries.length === 0) {
            throw new Error('No valid TIFF images found');
        }

        console.log('TIFF processing complete');
        this.displaySeriesList();
        this.loadSeries(this.allSeries[0]);
    }

    async processImageFiles(files) {
        console.log(`Processing ${files.length} image file(s)...`);
        
        for (const file of files) {
            try {
                console.log(`Loading image: ${file.name}`);
                const imageData = await this.loadImageFile(file);
                
                console.log(`Image loaded: ${imageData.width}x${imageData.height}`);
                
                const series = {
                    id: file.name,
                    description: file.name,
                    modality: 'Image',
                    imageCount: 1,
                    images: [{
                        imageData: imageData.data,
                        width: imageData.width,
                        height: imageData.height,
                        sliceNumber: 0,
                        metadata: {
                            modality: file.type.split('/')[1].toUpperCase(),
                            description: file.name
                        }
                    }]
                };
                
                this.allSeries.push(series);
            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
                this.showError(`Could not load ${file.name}: ${error.message}`);
            }
        }

        if (this.allSeries.length === 0) {
            throw new Error('No valid image files found');
        }

        console.log('Image processing complete');
        this.displaySeriesList();
        this.loadSeries(this.allSeries[0]);
    }

    loadImageFile(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                // Create canvas to extract pixel data
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                
                URL.revokeObjectURL(url);
                
                resolve({
                    data: imageData.data,
                    width: img.width,
                    height: img.height
                });
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };

            img.src = url;
        });
    }

    displaySeriesList() {
        if (this.allSeries.length === 0) {
            this.seriesList.innerHTML = '<p class="empty-state">No series loaded</p>';
            return;
        }

        this.seriesList.innerHTML = '';
        
        this.allSeries.forEach((series, index) => {
            const item = document.createElement('div');
            item.className = 'series-item';
            if (index === 0) item.classList.add('active');
            
            item.innerHTML = `
                <div class="series-item-header">${series.description || 'Series ' + (index + 1)}</div>
                <div class="series-item-info">${series.modality} • ${series.imageCount} images</div>
            `;
            
            item.addEventListener('click', () => {
                document.querySelectorAll('.series-item').forEach(el => el.classList.remove('active'));
                item.classList.add('active');
                this.loadSeries(series);
            });
            
            this.seriesList.appendChild(item);
        });
    }

    loadSeries(series) {
        this.currentSeries = series;
        this.currentSliceIndex = 0;

        // Update UI
        this.updateMetadataDisplay(series);
        this.setupSliceControls(series.imageCount);
        this.generateThumbnails(series);
        this.renderCurrentSlice();

        // Auto-adjust window level for DICOM
        if (series.images[0].metadata) {
            this.autoAdjustWindowLevel(series.images[0]);
        }
    }

    updateMetadataDisplay(series) {
        const firstImage = series.images[0];
        const metadata = firstImage.metadata || {};

        // Apply privacy filter
        const safeMetadata = PrivacyFilter.sanitizeMetadata(metadata);

        this.infoElements.patientId.textContent = safeMetadata.patientId || '-';
        this.infoElements.modality.textContent = safeMetadata.modality || '-';
        this.infoElements.studyDate.textContent = safeMetadata.studyDate || '-';
        this.infoElements.seriesNumber.textContent = safeMetadata.seriesNumber || '-';
        this.infoElements.dimensions.textContent = `${firstImage.width} × ${firstImage.height}`;
        this.infoElements.sliceCount.textContent = series.imageCount;
        this.infoElements.pixelSpacing.textContent = safeMetadata.pixelSpacing || '-';
        this.infoElements.bitsAllocated.textContent = safeMetadata.bitsAllocated || '-';
    }

    setupSliceControls(imageCount) {
        this.controls.sliceSlider.max = imageCount - 1;
        this.controls.sliceSlider.value = 0;
        
        if (imageCount > 1) {
            this.filmStrip.style.display = 'block';
        } else {
            this.filmStrip.style.display = 'none';
        }
    }

    async generateThumbnails(series) {
        this.thumbnailContainer.innerHTML = '';

        const step = Math.max(1, Math.floor(series.imageCount / 20)); // Max 20 thumbnails

        for (let i = 0; i < series.imageCount; i += step) {
            const thumb = document.createElement('div');
            thumb.className = 'thumbnail';
            if (i === 0) thumb.classList.add('active');

            const canvas = document.createElement('canvas');
            canvas.width = 80;
            canvas.height = 80;
            
            const ctx = canvas.getContext('2d');
            const image = series.images[i];
            
            // Render thumbnail
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = image.width;
            tempCanvas.height = image.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            const imageDataObj = new ImageData(
                new Uint8ClampedArray(image.imageData.buffer),
                image.width,
                image.height
            );
            tempCtx.putImageData(imageDataObj, 0, 0);
            
            ctx.drawImage(tempCanvas, 0, 0, 80, 80);

            const label = document.createElement('div');
            label.className = 'thumbnail-label';
            label.textContent = i + 1;

            thumb.appendChild(canvas);
            thumb.appendChild(label);

            thumb.addEventListener('click', () => {
                document.querySelectorAll('.thumbnail').forEach(el => el.classList.remove('active'));
                thumb.classList.add('active');
                this.currentSliceIndex = i;
                this.controls.sliceSlider.value = i;
                this.renderCurrentSlice();
            });

            this.thumbnailContainer.appendChild(thumb);
        }
    }

    renderCurrentSlice() {
        if (!this.currentSeries) return;

        const image = this.currentSeries.images[this.currentSliceIndex];
        this.renderer.render(image);
        this.updateOverlayInfo();
    }

    autoAdjustWindowLevel(image) {
        const metadata = image.metadata || {};
        
        if (metadata.windowCenter && metadata.windowWidth) {
            this.renderer.setWindowLevel(metadata.windowCenter);
            this.renderer.setWindowWidth(metadata.windowWidth);
        } else {
            // Auto-calculate from pixel data
            const stats = this.calculateImageStats(image.imageData);
            this.renderer.setWindowLevel(stats.mean);
            this.renderer.setWindowWidth(stats.stdDev * 4);
        }

        this.controls.brightnessSlider.value = this.renderer.windowLevel;
        this.controls.contrastSlider.value = this.renderer.windowWidth;
    }

    calculateImageStats(imageData) {
        let sum = 0;
        let sumSq = 0;
        const length = imageData.length;

        for (let i = 0; i < length; i++) {
            sum += imageData[i];
            sumSq += imageData[i] * imageData[i];
        }

        const mean = sum / length;
        const variance = (sumSq / length) - (mean * mean);
        const stdDev = Math.sqrt(variance);

        return { mean, stdDev };
    }

    updateOverlayInfo() {
        this.infoElements.windowLevel.textContent = Math.round(this.renderer.windowLevel);
        this.infoElements.windowWidth.textContent = Math.round(this.renderer.windowWidth);
        this.infoElements.zoomLevel.textContent = Math.round(this.renderer.zoom * 100) + '%';
        
        if (this.currentSeries) {
            this.infoElements.currentSlice.textContent = 
                `${this.currentSliceIndex + 1}/${this.currentSeries.imageCount}`;
        }
    }

    navigateSlice(delta) {
        if (!this.currentSeries) return;

        const newIndex = this.currentSliceIndex + delta;
        
        if (newIndex >= 0 && newIndex < this.currentSeries.imageCount) {
            this.currentSliceIndex = newIndex;
            this.controls.sliceSlider.value = newIndex;
            this.renderCurrentSlice();

            // Update thumbnail selection
            const thumbnails = this.thumbnailContainer.querySelectorAll('.thumbnail');
            thumbnails.forEach((thumb, index) => {
                thumb.classList.toggle('active', index === newIndex);
            });
        }
    }

    zoom(factor) {
        this.renderer.zoom *= factor;
        this.updateOverlayInfo();
        this.renderCurrentSlice();
    }

    resetView() {
        this.renderer.reset();
        this.autoAdjustWindowLevel(this.currentSeries.images[this.currentSliceIndex]);
        this.updateOverlayInfo();
        this.renderCurrentSlice();
    }

    toggleInvert() {
        this.renderer.invert = !this.renderer.invert;
        this.renderCurrentSlice();
    }

    toggleHeatmap() {
        const heatmap = document.getElementById('heatmapCanvas');
        if (heatmap.style.display === 'none') {
            heatmap.style.display = 'block';
            this.generateDemoHeatmap();
        } else {
            heatmap.style.display = 'none';
        }
    }

    generateDemoHeatmap() {
        const canvas = this.heatmapCanvas;
        const ctx = canvas.getContext('2d');
        
        canvas.width = this.mainCanvas.width;
        canvas.height = this.mainCanvas.height;

        const gradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width / 3
        );
        
        gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    async toggle3DView() {
        if (!this.currentSeries || this.currentSeries.imageCount < 3) {
            this.showError('3D rendering requires at least 3 slices');
            return;
        }

        this.showLoading(true);

        try {
            await this.volumeRenderer.render3D(this.currentSeries, this.mainCanvas);
        } catch (error) {
            console.error('3D rendering error:', error);
            this.showError('3D rendering failed: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    checkWebGLSupport() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            console.warn('WebGL not supported - falling back to 2D rendering');
        }
    }

    showDropZone(show) {
        this.dropZone.style.display = show ? 'flex' : 'none';
    }

    showViewer(show) {
        this.canvasContainer.style.display = show ? 'block' : 'none';
        this.viewerControls.style.display = show ? 'flex' : 'none';
    }

    showLoading(show) {
        this.loadingIndicator.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        this.errorToast.querySelector('#errorMessage').textContent = message;
        this.errorToast.style.display = 'flex';
        
        setTimeout(() => {
            this.errorToast.style.display = 'none';
        }, 5000);
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.medicalViewer = new MedicalImageViewer();
});
