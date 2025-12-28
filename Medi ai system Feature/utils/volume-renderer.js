// Volume Renderer - Handles 3D volume rendering using WebGL

class VolumeRenderer {
    constructor() {
        this.gl = null;
        this.program = null;
        this.texture3D = null;
        this.isInitialized = false;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
    }

    async render3D(series, canvas) {
        if (series.imageCount < 3) {
            throw new Error('At least 3 slices required for 3D rendering');
        }

        // Initialize WebGL if not already done
        if (!this.isInitialized) {
            this.initWebGL(canvas);
        }

        if (!this.gl) {
            throw new Error('WebGL not available');
        }

        // Create 3D texture from series
        await this.create3DTexture(series);

        // Setup rendering loop
        this.startRenderLoop(canvas);
    }

    initWebGL(canvas) {
        try {
            this.gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            
            if (!this.gl) {
                throw new Error('WebGL not supported');
            }

            // Check for 3D texture support
            const ext = this.gl.getExtension('OES_texture_3D');
            if (!ext && !this.gl.texImage3D) {
                throw new Error('3D textures not supported');
            }

            this.setupShaders();
            this.isInitialized = true;
        } catch (error) {
            console.error('WebGL initialization failed:', error);
            this.gl = null;
        }
    }

    setupShaders() {
        const vsSource = `
            attribute vec3 aPosition;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            varying vec3 vTexCoord;
            
            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
                vTexCoord = aPosition * 0.5 + 0.5; // Map to [0, 1]
            }
        `;

        const fsSource = `
            precision mediump float;
            precision mediump sampler3D;
            
            varying vec3 vTexCoord;
            uniform sampler3D uVolume;
            uniform float uWindowLevel;
            uniform float uWindowWidth;
            uniform float uDensity;
            
            vec4 sampleVolume(vec3 coord) {
                if (coord.x < 0.0 || coord.x > 1.0 ||
                    coord.y < 0.0 || coord.y > 1.0 ||
                    coord.z < 0.0 || coord.z > 1.0) {
                    return vec4(0.0);
                }
                return texture(uVolume, coord);
            }
            
            void main() {
                vec3 rayDir = normalize(vTexCoord - vec3(0.5));
                vec3 rayPos = vTexCoord;
                
                vec4 color = vec4(0.0);
                float stepSize = 0.01;
                int maxSteps = 100;
                
                // Ray marching
                for (int i = 0; i < maxSteps; i++) {
                    vec4 sample = sampleVolume(rayPos);
                    
                    // Apply window level
                    float value = sample.r;
                    float min = uWindowLevel - uWindowWidth / 2.0;
                    float max = uWindowLevel + uWindowWidth / 2.0;
                    value = (value - min) / (max - min);
                    value = clamp(value, 0.0, 1.0);
                    
                    // Accumulate color
                    float alpha = value * uDensity;
                    color.rgb += value * alpha * (1.0 - color.a);
                    color.a += alpha * (1.0 - color.a);
                    
                    if (color.a > 0.95) break;
                    
                    rayPos += rayDir * stepSize;
                }
                
                gl_FragColor = vec4(color.rgb, 1.0);
            }
        `;

        // Compile shaders
        const vertexShader = this.compileShader(vsSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(fsSource, this.gl.FRAGMENT_SHADER);

        // Create program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            throw new Error('Shader program failed to link: ' + 
                this.gl.getProgramInfoLog(this.program));
        }

        // Setup cube geometry for volume bounds
        this.setupCubeGeometry();
    }

    compileShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const error = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error('Shader compilation failed: ' + error);
        }

        return shader;
    }

    setupCubeGeometry() {
        // Cube vertices
        const vertices = new Float32Array([
            -1, -1, -1,  1, -1, -1,  1,  1, -1, -1,  1, -1, // Front
            -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1,  1, // Back
            -1, -1, -1, -1,  1, -1, -1,  1,  1, -1, -1,  1, // Left
             1, -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1, // Right
            -1,  1, -1,  1,  1, -1,  1,  1,  1, -1,  1,  1, // Top
            -1, -1, -1,  1, -1, -1,  1, -1,  1, -1, -1,  1  // Bottom
        ]);

        const indices = new Uint16Array([
            0,  1,  2,   0,  2,  3,  // Front
            4,  5,  6,   4,  6,  7,  // Back
            8,  9, 10,   8, 10, 11,  // Left
            12, 13, 14,  12, 14, 15,  // Right
            16, 17, 18,  16, 18, 19,  // Top
            20, 21, 22,  20, 22, 23   // Bottom
        ]);

        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);

        this.indexCount = indices.length;
    }

    async create3DTexture(series) {
        const width = series.images[0].width;
        const height = series.images[0].height;
        const depth = series.imageCount;

        // Pack all slices into 3D texture
        const volumeData = new Uint8Array(width * height * depth);

        for (let z = 0; z < depth; z++) {
            const image = series.images[z];
            const sliceOffset = z * width * height;

            for (let i = 0; i < width * height; i++) {
                // Take red channel (grayscale)
                volumeData[sliceOffset + i] = image.imageData[i * 4];
            }
        }

        // Create 3D texture
        this.texture3D = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_3D || 0x806F, this.texture3D);

        // Set texture parameters
        this.gl.texParameteri(this.gl.TEXTURE_3D || 0x806F, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_3D || 0x806F, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_3D || 0x806F, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D || 0x806F, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D || 0x806F, this.gl.TEXTURE_WRAP_R, this.gl.CLAMP_TO_EDGE);

        // Upload texture data
        if (this.gl.texImage3D) {
            this.gl.texImage3D(
                this.gl.TEXTURE_3D,
                0,
                this.gl.LUMINANCE,
                width,
                height,
                depth,
                0,
                this.gl.LUMINANCE,
                this.gl.UNSIGNED_BYTE,
                volumeData
            );
        }
    }

    startRenderLoop(canvas) {
        let lastTime = 0;
        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        // Mouse interaction
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - lastX;
                const deltaY = e.clientY - lastY;
                
                this.rotationY += deltaX * 0.01;
                this.rotationX += deltaY * 0.01;
                
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });

        canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });

        const render = (time) => {
            const deltaTime = time - lastTime;
            lastTime = time;

            // Auto-rotate if not dragging
            if (!isDragging) {
                this.rotationY += deltaTime * 0.0001;
            }

            this.renderFrame(canvas);
            
            requestAnimationFrame(render);
        };

        requestAnimationFrame(render);
    }

    renderFrame(canvas) {
        if (!this.gl || !this.program) return;

        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST);

        this.gl.useProgram(this.program);

        // Setup matrices
        const projectionMatrix = this.createPerspectiveMatrix(
            45 * Math.PI / 180,
            canvas.width / canvas.height,
            0.1,
            100
        );

        const modelViewMatrix = this.createModelViewMatrix();

        // Set uniforms
        const projLoc = this.gl.getUniformLocation(this.program, 'uProjectionMatrix');
        const mvLoc = this.gl.getUniformLocation(this.program, 'uModelViewMatrix');
        
        this.gl.uniformMatrix4fv(projLoc, false, projectionMatrix);
        this.gl.uniformMatrix4fv(mvLoc, false, modelViewMatrix);

        // Bind texture
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_3D || 0x806F, this.texture3D);
        this.gl.uniform1i(this.gl.getUniformLocation(this.program, 'uVolume'), 0);

        // Set rendering parameters
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'uWindowLevel'), 0.5);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'uWindowWidth'), 0.5);
        this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'uDensity'), 0.1);

        // Draw cube
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        
        const posLoc = this.gl.getAttribLocation(this.program, 'aPosition');
        this.gl.enableVertexAttribArray(posLoc);
        this.gl.vertexAttribPointer(posLoc, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.indexCount, this.gl.UNSIGNED_SHORT, 0);
    }

    createPerspectiveMatrix(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        const rangeInv = 1 / (near - far);

        return new Float32Array([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ]);
    }

    createModelViewMatrix() {
        const mat = new Float32Array(16);
        
        // Identity matrix
        mat[0] = mat[5] = mat[10] = mat[15] = 1;

        // Translation
        mat[14] = -5;

        // Apply rotations
        const cosX = Math.cos(this.rotationX);
        const sinX = Math.sin(this.rotationX);
        const cosY = Math.cos(this.rotationY);
        const sinY = Math.sin(this.rotationY);

        // Combined rotation matrix (simplified)
        mat[0] = cosY;
        mat[2] = sinY;
        mat[5] = cosX;
        mat[6] = -sinX;
        mat[8] = -sinY;
        mat[9] = sinX;
        mat[10] = cosX * cosY;

        return mat;
    }
}
