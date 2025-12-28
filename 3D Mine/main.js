/**
 * Open Pit Mine 3D Viewer - Main Application
 * Uses Three.js for 3D visualization of LAS point cloud data
 */

class OpenPitMineViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.pointCloud = null;
        this.lasParser = new UltraMaxLASParser();
        this.currentData = null;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
        
        // UI state
        this.panelsVisible = {
            info: true,
            controls: true,
            stats: true
        };
        
        this.init();
    }

    /**
     * Initialize the 3D viewer
     */
    init() {
        this.setupScene();
        this.setupRenderer();
        this.setupCamera();
        this.setupControls();
        this.setupLights();
        this.setupEventListeners();
        this.hideLoadingScreen();
        this.animate();
        
        // Auto-load the default LAS file
        this.loadDefaultFile();
    }

    /**
     * Setup Three.js scene
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x001122);
        
        // Add fog for depth perception
        this.scene.fog = new THREE.Fog(0x001122, 1000, 5000);
    }

    /**
     * Setup Three.js renderer
     */
    setupRenderer() {
        const canvas = document.getElementById('three-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight - 100);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.sortObjects = false;
        this.renderer.capabilities.logarithmicDepthBuffer = true;
    }

    /**
     * Setup camera
     */
    setupCamera() {
        const aspect = (window.innerWidth) / (window.innerHeight - 100);
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 10000);
        this.camera.position.set(500, 500, 500);
        this.camera.lookAt(0, 0, 0);
    }

    /**
     * Setup camera controls
     */
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 5000;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
    }

    /**
     * Setup scene lighting
     */
    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1000, 1000, 500);
        directionalLight.castShadow = false; // Disable shadows for performance
        this.scene.add(directionalLight);
        
        // Additional fill light
        const fillLight = new THREE.DirectionalLight(0x88aaff, 0.3);
        fillLight.position.set(-500, 200, -500);
        this.scene.add(fillLight);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // File input
        const fileInput = document.getElementById('fileInput');
        const loadFileBtn = document.getElementById('loadFileBtn');
        
        loadFileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (event) => this.handleFileSelect(event));
        
        // Quick load buttons
        document.getElementById('loadJietCampus').addEventListener('click', () => {
            this.loadSpecificFile('JIET_University_Campus.las');
        });
        
        document.getElementById('loadRealMine').addEventListener('click', () => {
            this.loadSpecificFile('RealWorld_OpenPit_Mine.las');
        });
        
        document.getElementById('loadSyntheticMine').addEventListener('click', () => {
            this.loadSpecificFile('JIET_OpenPit_Mine.las');
        });
        
        document.getElementById('loadWellLog').addEventListener('click', () => {
            console.log('🔬 Testing well log file with detailed debugging...');
            this.loadSpecificFile('Las Dataset/49-005-30258.las');
        });
        
        // Control panel events
        this.setupControlPanelEvents();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => this.handleKeyboardShortcuts(event));
        
        // Panel toggle buttons
        this.setupPanelToggles();
        
        // Help overlay
        this.setupHelpOverlay();
    }

    /**
     * Setup control panel event listeners
     */
    setupControlPanelEvents() {
        // Point size control
        const pointSizeSlider = document.getElementById('point-size');
        const pointSizeValue = document.getElementById('point-size-value');
        
        pointSizeSlider.addEventListener('input', (e) => {
            const size = parseFloat(e.target.value);
            pointSizeValue.textContent = size.toFixed(1);
            this.updatePointSize(size);
        });
        
        // Opacity control
        const opacitySlider = document.getElementById('opacity');
        const opacityValue = document.getElementById('opacity-value');
        
        opacitySlider.addEventListener('input', (e) => {
            const opacity = parseFloat(e.target.value);
            opacityValue.textContent = opacity.toFixed(1);
            this.updateOpacity(opacity);
        });
        
        // Color mode control
        const colorModeSelect = document.getElementById('color-mode');
        colorModeSelect.addEventListener('change', (e) => {
            this.updateColorMode(e.target.value);
        });
        
        // Control buttons
        document.getElementById('reset-view').addEventListener('click', () => this.resetView());
        document.getElementById('center-view').addEventListener('click', () => this.centerView());
        document.getElementById('wireframe-toggle').addEventListener('click', () => this.toggleWireframe());
        document.getElementById('background-toggle').addEventListener('click', () => this.toggleBackground());
    }

    /**
     * Setup panel toggle functionality
     */
    setupPanelToggles() {
        const panels = ['info', 'controls', 'stats'];
        
        panels.forEach(panelName => {
            const toggleBtn = document.getElementById(`toggle-${panelName}`);
            const content = document.querySelector(`#${panelName}-panel .panel-content`);
            
            toggleBtn.addEventListener('click', () => {
                this.panelsVisible[panelName] = !this.panelsVisible[panelName];
                content.classList.toggle('collapsed', !this.panelsVisible[panelName]);
                toggleBtn.textContent = this.panelsVisible[panelName] ? '−' : '+';
            });
        });
    }

    /**
     * Setup help overlay
     */
    setupHelpOverlay() {
        const helpBtn = document.getElementById('help-btn');
        const helpOverlay = document.getElementById('help-overlay');
        const closeHelpBtn = document.getElementById('close-help');
        
        helpBtn.addEventListener('click', () => {
            helpOverlay.style.display = 'flex';
        });
        
        closeHelpBtn.addEventListener('click', () => {
            helpOverlay.style.display = 'none';
        });
        
        // Close on escape or outside click
        helpOverlay.addEventListener('click', (e) => {
            if (e.target === helpOverlay) {
                helpOverlay.style.display = 'none';
            }
        });
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        switch(event.key.toLowerCase()) {
            case 'r':
                this.resetView();
                break;
            case 'c':
                this.centerView();
                break;
            case 'h':
                const helpOverlay = document.getElementById('help-overlay');
                helpOverlay.style.display = helpOverlay.style.display === 'flex' ? 'none' : 'flex';
                break;
            case 'f':
                this.toggleFullscreen();
                break;
        }
    }

    /**
     * Handle file selection
     */
    async handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.name.toLowerCase().endsWith('.las')) {
            alert('Please select a .las file');
            return;
        }
        
        this.showLoadingScreen();
        
        try {
            console.log(`Loading user-selected file: ${file.name}`);
            const arrayBuffer = await file.arrayBuffer();
            await this.loadPointCloudData(arrayBuffer);
        } catch (error) {
            console.error('Error loading file:', error);
            alert(`Error loading file: ${error.message}`);
        } finally {
            this.hideLoadingScreen();
        }
    }

    /**
     * Load a specific file by name
     */
    async loadSpecificFile(filename) {
        this.showLoadingScreen();
        
        try {
            console.log(`Loading specific file: ${filename}`);
            const response = await fetch(filename);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch ${filename}: ${response.status} ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            await this.loadPointCloudData(arrayBuffer);
            
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            alert(`Error loading ${filename}: ${error.message}`);
        } finally {
            this.hideLoadingScreen();
        }
    }

    /**
     * Load default LAS file (disabled - let user choose different files)
     */
    async loadDefaultFile() {
        // Don't auto-load any file - let user choose to see different models
        console.log('Welcome! Available LAS files to test:');
        console.log('1. JIET_University_Campus.las - University campus with buildings');
        console.log('2. RealWorld_OpenPit_Mine.las - Large open pit mine with terraces');
        console.log('3. JIET_OpenPit_Mine.las - Original synthetic mine');
        console.log('Click "Load LAS File" button to select and load different 3D models.');
        
        this.hideLoadingScreen();
        this.showWelcomeMessage();
    }

    /**
     * Show welcome message when no file is loaded
     */
    showWelcomeMessage() {
        // Update info panel
        document.getElementById('point-count').textContent = '0';
        document.getElementById('bounds-x').textContent = 'No file loaded';
        document.getElementById('bounds-y').textContent = 'No file loaded';
        document.getElementById('bounds-z').textContent = 'No file loaded';
        document.getElementById('elevation-range').textContent = '0m';
        
        // Show welcome message on canvas
        this.showCanvasMessage();
    }

    /**
     * Show message on the 3D canvas
     */
    showCanvasMessage() {
        const canvas = document.getElementById('three-canvas');
        const existingMessage = document.getElementById('canvas-message');
        
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.id = 'canvas-message';
        messageDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: white;
            background: rgba(0, 0, 0, 0.8);
            padding: 30px;
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            z-index: 50;
            backdrop-filter: blur(10px);
            max-width: 400px;
        `;
        
        messageDiv.innerHTML = `
            <h2 style="margin: 0 0 15px 0; font-size: 1.5rem;">🏗️ Ultra-Advanced LAS Viewer</h2>
            <p style="margin: 0 0 15px 0; opacity: 0.9;">Supports both LiDAR and Well Log LAS files:</p>
            <ul style="text-align: left; margin: 10px 0; padding-left: 20px; opacity: 0.8;">
                <li><strong>JIET Campus</strong> - University campus (LiDAR)</li>
                <li><strong>Real Mine</strong> - Open pit mine (LiDAR)</li>
                <li><strong>Synthetic Mine</strong> - Generated mine (LiDAR)</li>
                <li><strong>Well Log</strong> - Oil/gas well data (ASCII)</li>
            </ul>
            <p style="margin: 15px 0 0 0; opacity: 0.7; font-size: 0.9rem;">Click "Load LAS File" button above to start</p>
        `;
        
        canvas.parentElement.appendChild(messageDiv);
    }

    /**
     * Hide canvas message
     */
    hideCanvasMessage() {
        const existingMessage = document.getElementById('canvas-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    /**
     * Load and visualize point cloud data
     */
    async loadPointCloudData(arrayBuffer) {
        try {
            console.log('🔄 Loading new point cloud data...');
            console.log('📊 ArrayBuffer size:', arrayBuffer.byteLength, 'bytes');
            
            // Hide welcome message
            this.hideCanvasMessage();
            
            // Clear previous data completely
            this.clearPreviousData();
            
            // Parse LAS file with detailed logging
            console.log('🔬 Starting LAS parsing...');
            this.currentData = await this.lasParser.parseLAS(arrayBuffer);
            
            console.log('📦 Received parsed data in main.js:', JSON.parse(JSON.stringify(this.currentData)));
            console.log(`🔬 Verifying points array:`, this.currentData ? this.currentData.points : 'parsedData is null');

            if (!this.currentData || !this.currentData.points || this.currentData.points.length === 0) {
                throw new Error('No valid 3D points found in the parsed data. This may be a well log file that needs special processing.');
            }

            console.log('✅ Parsed data successfully:', {
                points: this.currentData.pointCount,
                bounds: this.currentData.bounds,
                header: this.currentData.header?.systemId || 'Unknown',
                format: this.currentData.format || 'Unknown'
            });
            
            // Validate that we have points
            console.log('🔍 Checking parsed data structure:', {
                hasPoints: !!this.currentData.points,
                pointsLength: this.currentData.points ? this.currentData.points.length : 'N/A',
                pointCount: this.currentData.pointCount,
                fileType: this.currentData.fileType,
                allKeys: Object.keys(this.currentData)
            });
            
            if (!this.currentData.points || this.currentData.points.length === 0) {
                console.error('❌ No points found in parsed data');
                console.error('📋 Full parsed data structure:', this.currentData);
                throw new Error('No valid 3D points found in the parsed data. This may be a well log file that needs special processing.');
            }
            
            // Create point cloud geometry
            this.createPointCloud();
            
            // Update UI
            this.updateInfoPanel();
            
            // Center view on new data
            this.centerView();
            
            console.log(`🎉 Point cloud loaded successfully - New 3D model created!`);
            console.log(`📊 Loaded: ${this.currentData.pointCount} points`);
            console.log(`📍 Bounds: X(${this.currentData.bounds.minX.toFixed(1)}-${this.currentData.bounds.maxX.toFixed(1)}) Y(${this.currentData.bounds.minY.toFixed(1)}-${this.currentData.bounds.maxY.toFixed(1)}) Z(${this.currentData.bounds.minZ.toFixed(1)}-${this.currentData.bounds.maxZ.toFixed(1)})`);
        } catch (error) {
            console.error('❌ Error loading point cloud:', error);
            console.error('❌ Full error details:', error.stack);
            
            // Show more helpful error message
            if (error.message.includes('No data points found')) {
                console.error('💡 This appears to be a well log parsing issue. Checking data sections...');
            }
            
            throw error;
        }
    }

    /**
     * Clear all previous point cloud data and geometry
     */
    clearPreviousData() {
        // Remove existing point cloud from scene
        if (this.pointCloud) {
            console.log('Removing previous point cloud...');
            this.scene.remove(this.pointCloud);
            
            // Dispose of geometry and material to free memory
            if (this.pointCloud.geometry) {
                this.pointCloud.geometry.dispose();
            }
            if (this.pointCloud.material) {
                this.pointCloud.material.dispose();
            }
            
            this.pointCloud = null;
        }
        
        // Clear previous data
        this.currentData = null;
        
        // Reset parser
        this.lasParser = new UltraMaxLASParser();
        
        console.log('Previous data cleared');
    }

    /**
     * Create Three.js point cloud from parsed data
     */
    createPointCloud() {
        const points = this.currentData.points;
        const geometry = new THREE.BufferGeometry();
        
        // Position data
        const positions = new Float32Array(points.length * 3);
        for (let i = 0; i < points.length; i++) {
            positions[i * 3] = points[i].x;
            positions[i * 3 + 1] = points[i].z; // Z-up to Y-up conversion
            positions[i * 3 + 2] = -points[i].y; // Flip Y axis
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Color data (elevation-based by default)
        const colors = this.lasParser.generateElevationColors(points);
        geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        
        // Create material
        const material = new THREE.PointsMaterial({
            size: 1.0,
            vertexColors: true,
            transparent: true,
            opacity: 1.0
        });
        
        // Create point cloud
        this.pointCloud = new THREE.Points(geometry, material);
        this.scene.add(this.pointCloud);
    }

    /**
     * Update point size
     */
    updatePointSize(size) {
        if (this.pointCloud && this.pointCloud.material) {
            this.pointCloud.material.size = size;
        }
    }

    /**
     * Update opacity
     */
    updateOpacity(opacity) {
        if (this.pointCloud && this.pointCloud.material) {
            this.pointCloud.material.opacity = opacity;
        }
    }

    /**
     * Update color mode
     */
    updateColorMode(mode) {
        if (!this.currentData || !this.pointCloud) return;
        
        let colors;
        switch (mode) {
            case 'elevation':
                colors = this.lasParser.generateElevationColors(this.currentData.points);
                break;
            case 'intensity':
                colors = this.lasParser.generateIntensityColors(this.currentData.points);
                break;
            case 'classification':
                colors = this.lasParser.generateClassificationColors(this.currentData.points);
                break;
            case 'welllog':
                if (this.currentData.fileType === 'WELL_LOG') {
                    colors = this.lasParser.generateWellLogColors(this.currentData.points);
                } else {
                    colors = this.lasParser.generateClassificationColors(this.currentData.points);
                }
                break;
            case 'uniform':
                colors = new Array(this.currentData.points.length * 3).fill(1.0);
                break;
        }
        
        this.pointCloud.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        this.pointCloud.geometry.attributes.color.needsUpdate = true;
    }

    /**
     * Reset camera view
     */
    resetView() {
        if (this.currentData) {
            const bounds = this.currentData.bounds;
            const center = {
                x: (bounds.minX + bounds.maxX) / 2,
                y: (bounds.minY + bounds.maxY) / 2,
                z: (bounds.minZ + bounds.maxZ) / 2
            };
            const size = Math.max(
                bounds.maxX - bounds.minX,
                bounds.maxY - bounds.minY,
                bounds.maxZ - bounds.minZ
            );
            
            this.camera.position.set(
                center.x + size * 0.8,
                center.z + size * 0.8,
                -center.y + size * 0.8
            );
            this.controls.target.set(center.x, center.z, -center.y);
        } else {
            this.camera.position.set(500, 500, 500);
            this.controls.target.set(0, 0, 0);
        }
        this.controls.update();
    }

    /**
     * Center view on point cloud
     */
    centerView() {
        this.resetView();
    }

    /**
     * Toggle wireframe mode
     */
    toggleWireframe() {
        if (this.pointCloud && this.pointCloud.material) {
            // For point cloud, we can toggle between points and small spheres
            const currentSize = this.pointCloud.material.size;
            this.pointCloud.material.size = currentSize < 0.5 ? 2.0 : 0.1;
        }
    }

    /**
     * Toggle background color
     */
    toggleBackground() {
        const currentColor = this.scene.background.getHex();
        this.scene.background.setHex(currentColor === 0x001122 ? 0x222222 : 0x001122);
        
        const fogColor = this.scene.background.getHex();
        this.scene.fog.color.setHex(fogColor);
    }

    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * Update info panel with current data
     */
    updateInfoPanel() {
        if (!this.currentData) return;
        
        const bounds = this.currentData.bounds;
        
        document.getElementById('point-count').textContent = this.currentData.pointCount.toLocaleString();
        document.getElementById('bounds-x').textContent = `${bounds.minX.toFixed(2)} - ${bounds.maxX.toFixed(2)}`;
        document.getElementById('bounds-y').textContent = `${bounds.minY.toFixed(2)} - ${bounds.maxY.toFixed(2)}`;
        document.getElementById('bounds-z').textContent = `${bounds.minZ.toFixed(2)} - ${bounds.maxZ.toFixed(2)}`;
        
        if (this.currentData.fileType === 'WELL_LOG') {
            const wellData = this.currentData.wellLogData;
            document.getElementById('elevation-range').textContent = 
                `${wellData.header.startDepth.toFixed(0)}-${wellData.header.stopDepth.toFixed(0)}ft (Well Log)`;
        } else {
            document.getElementById('elevation-range').textContent = `${(bounds.maxZ - bounds.minZ).toFixed(2)}m`;
        }
    }

    /**
     * Update performance statistics
     */
    updateStats() {
        this.frameCount++;
        const now = performance.now();
        
        if (now - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
            
            document.getElementById('fps').textContent = this.fps;
            document.getElementById('rendered-points').textContent = 
                this.currentData ? this.currentData.pointCount.toLocaleString() : '0';
            
            // Rough memory usage estimate
            const memoryMB = this.currentData ? 
                Math.round((this.currentData.pointCount * 24) / (1024 * 1024)) : 0;
            document.getElementById('memory-usage').textContent = `${memoryMB} MB`;
        }
    }

    /**
     * Show loading screen
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'flex';
    }

    /**
     * Hide loading screen
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.style.display = 'none';
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight - 100;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }

    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Update stats
        this.updateStats();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OpenPitMineViewer();
});