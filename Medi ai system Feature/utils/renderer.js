// Image Renderer - Handles 2D image rendering with window leveling and transforms

class ImageRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { willReadFrequently: true });
        
        // Rendering state
        this.currentImage = null;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.windowLevel = 0;
        this.windowWidth = 400;
        this.invert = false;
        
        // Canvas rendering buffer
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    }

    render(image) {
        if (!image) return;
        
        this.currentImage = image;
        
        // Resize canvas to match container
        this.resizeCanvas();
        
        // Apply transforms and render
        this.drawImage();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    drawImage() {
        if (!this.currentImage) return;

        const { width, height, imageData } = this.currentImage;

        // Update offscreen canvas size
        this.offscreenCanvas.width = width;
        this.offscreenCanvas.height = height;

        // Apply window level adjustment
        const adjustedData = this.applyWindowLevel(imageData, width, height);
        
        // Put image data on offscreen canvas
        const imageDataObj = new ImageData(adjustedData, width, height);
        this.offscreenCtx.putImageData(imageDataObj, 0, 0);

        // Clear main canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate scaling to fit image in canvas
        const scale = Math.min(
            this.canvas.width / width,
            this.canvas.height / height
        ) * this.zoom;

        const scaledWidth = width * scale;
        const scaledHeight = height * scale;

        // Center image with pan offset
        const x = (this.canvas.width - scaledWidth) / 2 + this.panX;
        const y = (this.canvas.height - scaledHeight) / 2 + this.panY;

        // Apply smooth rendering
        this.ctx.imageSmoothingEnabled = this.zoom > 1;
        this.ctx.imageSmoothingQuality = 'high';

        // Draw image
        this.ctx.drawImage(
            this.offscreenCanvas,
            0, 0, width, height,
            x, y, scaledWidth, scaledHeight
        );
    }

    applyWindowLevel(imageData, width, height) {
        const length = width * height * 4;
        const output = new Uint8ClampedArray(length);

        const center = this.windowLevel;
        const windowWidth = Math.max(1, this.windowWidth);
        
        const min = center - windowWidth / 2;
        const max = center + windowWidth / 2;
        const range = max - min;

        for (let i = 0; i < length; i += 4) {
            // Get grayscale value (assume R=G=B for grayscale)
            const gray = imageData[i];
            
            // Apply window level
            let value = ((gray - min) / range) * 255;
            value = Math.max(0, Math.min(255, value));
            
            // Apply invert if enabled
            if (this.invert) {
                value = 255 - value;
            }

            output[i] = value;     // R
            output[i + 1] = value; // G
            output[i + 2] = value; // B
            output[i + 3] = 255;   // A
        }

        return output;
    }

    setWindowLevel(level) {
        this.windowLevel = level;
    }

    setWindowWidth(width) {
        this.windowWidth = Math.max(1, width);
    }

    pan(deltaX, deltaY) {
        this.panX += deltaX;
        this.panY += deltaY;
    }

    reset() {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.invert = false;
    }

    // Advanced rendering with WebGL (if available)
    setupWebGL() {
        try {
            const gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
            
            if (!gl) {
                console.warn('WebGL not available');
                return null;
            }

            // Vertex shader
            const vsSource = `
                attribute vec2 aPosition;
                attribute vec2 aTexCoord;
                varying vec2 vTexCoord;
                
                void main() {
                    gl_Position = vec4(aPosition, 0.0, 1.0);
                    vTexCoord = aTexCoord;
                }
            `;

            // Fragment shader with window leveling
            const fsSource = `
                precision mediump float;
                varying vec2 vTexCoord;
                uniform sampler2D uTexture;
                uniform float uWindowLevel;
                uniform float uWindowWidth;
                uniform bool uInvert;
                
                void main() {
                    vec4 texColor = texture2D(uTexture, vTexCoord);
                    float gray = texColor.r;
                    
                    // Apply window level
                    float min = uWindowLevel - uWindowWidth / 2.0;
                    float max = uWindowLevel + uWindowWidth / 2.0;
                    float value = (gray * 255.0 - min) / (max - min);
                    value = clamp(value, 0.0, 1.0);
                    
                    // Apply invert
                    if (uInvert) {
                        value = 1.0 - value;
                    }
                    
                    gl_FragColor = vec4(value, value, value, 1.0);
                }
            `;

            // Compile shaders
            const vertexShader = this.compileShader(gl, vsSource, gl.VERTEX_SHADER);
            const fragmentShader = this.compileShader(gl, fsSource, gl.FRAGMENT_SHADER);

            // Create program
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error('Shader program failed to link:', gl.getProgramInfoLog(program));
                return null;
            }

            return { gl, program };
        } catch (error) {
            console.error('WebGL setup failed:', error);
            return null;
        }
    }

    compileShader(gl, source, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
}
