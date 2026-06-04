// Global handler to mark internal navigations to bypass preloader intro
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href && link.target !== '_blank') {
        const href = link.getAttribute('href');
        if (href && (href.includes('.html') || href.startsWith('.') || href.startsWith('/') || !href.includes(':'))) {
            sessionStorage.setItem('hillhexo_navigated_internally', 'true');
        }
    }
});

(function() {
    let scene, camera, renderer, controls, clock, composer, bloomPass;
    let particlesGeometry, particlesMaterial, particleSystem;
    let currentPositions, sourcePositions, targetPositions, swarmPositions;
    let particleSizes, particleOpacities, particleEffectStrengths;
    let noise3D, noise4D;
    let morphTimeline = null;
    let isInitialized = false;
    let isMorphing = false;
    let autoMorphInterval = null;

    const CONFIG = {
        particleCount: 12000,
        shapeSize: 12,
        swarmDistanceFactor: 1.4,
        swirlFactor: 3.5,
        noiseFrequency: 0.08,
        noiseTimeScale: 0.03,
        noiseMaxStrength: 2.5,
        colorScheme: 'fire',
        morphDuration: 3500,
        particleSizeRange: [0.06, 0.2],
        starCount: 6000,
        bloomStrength: 1.2,
        bloomRadius: 0.4,
        bloomThreshold: 0.1,
        idleFlowStrength: 0.2,
        idleFlowSpeed: 0.06,
        idleRotationSpeed: 0.015,
        morphSizeFactor: 0.4,
        morphBrightnessFactor: 0.5
    };

    const SHAPES = [
        { name: 'Tornado', generator: generateTornado },
        { name: 'Globe', generator: generateGlobe },
        { name: 'Clock', generator: generateClock },
        { name: 'Location', generator: generateLocation }
    ];
    let currentShapeIndex = 0;

    const morphState = { progress: 0.0 };

    const COLOR_SCHEMES = {
        fire: { startHue: 200, endHue: 228, saturation: 0.8, lightness: 0.5 }, // Silky Navy Blue (Hillhexo theme)
        neon: { startHue: 290, endHue: 190, saturation: 1.0, lightness: 0.7 },
        nature: { startHue: 85, endHue: 165, saturation: 0.8, lightness: 0.6 },
        rainbow: { startHue: 0, endHue: 360, saturation: 0.85, lightness: 0.65 }
    };

    const tempVec = new THREE.Vector3();
    const sourceVec = new THREE.Vector3();
    const targetVec = new THREE.Vector3();
    const swarmVec = new THREE.Vector3();
    const noiseOffset = new THREE.Vector3();
    const flowVec = new THREE.Vector3();
    const bezPos = new THREE.Vector3();
    const swirlAxis = new THREE.Vector3();
    const currentVec = new THREE.Vector3();

    // Generator functions
    function generateTornado(count, size) {
        const points = new Float32Array(count * 3);
        let index = 0;
        const scale = size / 12;

        for (let i = 0; i < count; i++) {
            // y goes from bottom to top: e.g., from -7 * scale to 7 * scale
            const t = Math.random();
            const y = (t - 0.5) * 14 * scale;

            // Tornado funnel shape: narrow bottom, wide top
            const heightFactor = (y + 7 * scale) / (14 * scale); // 0 to 1
            const baseR = 0.6 * scale;
            const topR = 5.5 * scale;
            
            // Curved funnel: using Math.pow to create exponential expansion at the top
            const r = (baseR + (topR - baseR) * Math.pow(heightFactor, 2.0)) * (0.8 + Math.random() * 0.4);

            // Angle spirals up the tornado
            const spiralTurns = 4.0; // number of spiral loops
            const angle = heightFactor * spiralTurns * Math.PI * 2 + Math.random() * Math.PI * 2;

            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;

            points[index++] = x;
            points[index++] = y;
            points[index++] = z;
        }

        return points;
    }

    function generateGlobe(count, size) {
        const points = new Float32Array(count * 3);
        let index = 0;
        const radius = size * 0.65;
        
        const shellCount = Math.floor(count * 0.50);
        const gridCount = Math.floor(count * 0.35);
        const orbitCount = count - shellCount - gridCount;

        // 1. Sphere Shell
        for (let i = 0; i < shellCount; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * Math.PI * 2;
            const phi = Math.acos(2 * v - 1);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            points[index++] = x;
            points[index++] = y;
            points[index++] = z;
        }

        // 2. Latitude/Longitude Grid Lines
        const latCount = 6;
        const lonCount = 8;
        for (let i = 0; i < gridCount; i++) {
            if (Math.random() < 0.4) {
                const latIdx = Math.floor(Math.random() * latCount);
                const latY = radius * Math.sin(((latIdx + 0.5) / latCount - 0.5) * Math.PI);
                const latRad = Math.sqrt(radius * radius - latY * latY);
                const angle = Math.random() * Math.PI * 2;
                
                points[index++] = latRad * Math.cos(angle);
                points[index++] = latY;
                points[index++] = latRad * Math.sin(angle);
            } else {
                const lonIdx = Math.floor(Math.random() * lonCount);
                const theta = (lonIdx / lonCount) * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                
                points[index++] = radius * Math.sin(phi) * Math.cos(theta);
                points[index++] = radius * Math.cos(phi);
                points[index++] = radius * Math.sin(phi) * Math.sin(theta);
            }
        }

        // 3. Inclined Orbit Ring
        const tiltX = 0.5;
        const tiltZ = 0.3;
        const cosX = Math.cos(tiltX), sinX = Math.sin(tiltX);
        const cosZ = Math.cos(tiltZ), sinZ = Math.sin(tiltZ);

        for (let i = 0; i < orbitCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = radius * 1.35;
            let lx = r * Math.cos(angle);
            let ly = 0;
            let lz = r * Math.sin(angle);

            // Rotate around Z axis (roll)
            let x1 = lx * cosZ - ly * sinZ;
            let y1 = lx * sinZ + ly * cosZ;
            let z1 = lz;

            // Rotate around X axis (pitch)
            let x2 = x1;
            let y2 = y1 * cosX - z1 * sinX;
            let z2 = y1 * sinX + z1 * cosX;

            points[index++] = x2;
            points[index++] = y2;
            points[index++] = z2;
        }

        return points;
    }

    function generateClock(count, size) {
        const points = new Float32Array(count * 3);
        let index = 0;
        const radius = size * 0.65;

        const bezelCount = Math.floor(count * 0.45);
        const tickCount = Math.floor(count * 0.15);
        const minHandCount = Math.floor(count * 0.15);
        const hourHandCount = Math.floor(count * 0.15);
        const faceCount = count - bezelCount - tickCount - minHandCount - hourHandCount;

        const pitch = 0.3;
        const yaw = 0.4;
        const roll = -0.2;
        const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
        const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
        const cosR = Math.cos(roll), sinR = Math.sin(roll);

        function rotate(lx, ly, lz) {
            let x1 = lx * cosR - ly * sinR;
            let y1 = lx * sinR + ly * cosR;
            let z1 = lz;
            let x2 = x1;
            let y2 = y1 * cosP - z1 * sinP;
            let z2 = y1 * sinP + z1 * cosP;
            let rx = x2 * cosY + z2 * sinY;
            let ry = y2;
            let rz = -x2 * sinY + z2 * cosY;
            return [rx, ry, rz];
        }

        // 1. Bezel outer ring
        for (let i = 0; i < bezelCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = radius * (0.96 + Math.random() * 0.04);
            const lz = (Math.random() - 0.5) * 0.8;
            const lx = r * Math.cos(angle);
            const ly = r * Math.sin(angle);

            const rot = rotate(lx, ly, lz);
            points[index++] = rot[0];
            points[index++] = rot[1];
            points[index++] = rot[2];
        }

        // 2. Ticks
        for (let i = 0; i < tickCount; i++) {
            const tickIndex = Math.floor(Math.random() * 12);
            const angle = (tickIndex / 12) * Math.PI * 2;
            const t = Math.random();
            const r = radius * (0.82 + t * 0.10);
            const lz = (Math.random() - 0.5) * 0.5;
            const lx = r * Math.cos(angle);
            const ly = r * Math.sin(angle);

            const rot = rotate(lx, ly, lz);
            points[index++] = rot[0];
            points[index++] = rot[1];
            points[index++] = rot[2];
        }

        // 3. Minute hand
        const minAngle = Math.PI / 2 - (10 / 60) * Math.PI * 2;
        for (let i = 0; i < minHandCount; i++) {
            const t = Math.random();
            const r = radius * 0.75 * t;
            const lz = 0.5 + (Math.random() - 0.5) * 0.3;
            const sideOffset = (Math.random() - 0.5) * 0.15;
            const lx = r * Math.cos(minAngle) - sideOffset * Math.sin(minAngle);
            const ly = r * Math.sin(minAngle) + sideOffset * Math.cos(minAngle);

            const rot = rotate(lx, ly, lz);
            points[index++] = rot[0];
            points[index++] = rot[1];
            points[index++] = rot[2];
        }

        // 4. Hour hand
        const hourAngle = Math.PI / 2 - (10 / 12) * Math.PI * 2;
        for (let i = 0; i < hourHandCount; i++) {
            const t = Math.random();
            const r = radius * 0.50 * t;
            const lz = 0.9 + (Math.random() - 0.5) * 0.3;
            const sideOffset = (Math.random() - 0.5) * 0.22;
            const lx = r * Math.cos(hourAngle) - sideOffset * Math.sin(hourAngle);
            const ly = r * Math.sin(hourAngle) + sideOffset * Math.cos(hourAngle);

            const rot = rotate(lx, ly, lz);
            points[index++] = rot[0];
            points[index++] = rot[1];
            points[index++] = rot[2];
        }

        // 5. Dial plate backing
        for (let i = 0; i < faceCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = radius * 0.8 * Math.sqrt(Math.random());
            const lz = -0.5 + (Math.random() - 0.5) * 0.2;
            const lx = r * Math.cos(angle);
            const ly = r * Math.sin(angle);

            const rot = rotate(lx, ly, lz);
            points[index++] = rot[0];
            points[index++] = rot[1];
            points[index++] = rot[2];
        }

        return points;
    }

    function generateLocation(count, size) {
        const points = new Float32Array(count * 3);
        let index = 0;
        const scale = size / 12;

        const outerCount = Math.floor(count * 0.40);
        const innerCount = Math.floor(count * 0.20);
        const fillCount = Math.floor(count * 0.30);
        const shadowCount = count - outerCount - innerCount - fillCount;

        const cy = 2.5 * scale;
        const rOuter = 3.5 * scale;
        const rInner = 1.2 * scale;
        const tipY = -4.5 * scale;

        const pitch = 0.25;
        const yaw = 0.45;
        const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
        const cosY = Math.cos(yaw), sinY = Math.sin(yaw);

        function rotate(lx, ly, lz) {
            let y1 = ly * cosP - lz * sinP;
            let z1 = ly * sinP + lz * cosP;
            let rx = lx * cosY + z1 * sinY;
            let ry = y1;
            let rz = -lx * sinY + z1 * cosY;
            return [rx, ry, rz];
        }

        // 1. Outer boundary
        for (let i = 0; i < outerCount; i++) {
            let lx, ly;
            const t = Math.random();
            if (t < 0.5) {
                const startAngle = -Math.PI / 6;
                const endAngle = 7 * Math.PI / 6;
                const angle = startAngle + Math.random() * (endAngle - startAngle);
                lx = rOuter * Math.cos(angle);
                ly = cy + rOuter * Math.sin(angle);
            } else {
                const side = Math.random() < 0.5 ? -1 : 1;
                const lineT = Math.random();
                const tangentAngle = side > 0 ? -Math.PI / 6 : 7 * Math.PI / 6;
                const tx = rOuter * Math.cos(tangentAngle);
                const ty = cy + rOuter * Math.sin(tangentAngle);
                
                lx = THREE.MathUtils.lerp(tx, 0, lineT);
                ly = THREE.MathUtils.lerp(ty, tipY, lineT);
            }
            const lz = (Math.random() - 0.5) * 1.2 * scale;
            const rot = rotate(lx, ly, lz);
            points[index++] = rot[0];
            points[index++] = rot[1];
            points[index++] = rot[2];
        }

        // 2. Inner circular boundary
        for (let i = 0; i < innerCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const lx = rInner * Math.cos(angle);
            const ly = cy + rInner * Math.sin(angle);
            const lz = (Math.random() - 0.5) * 1.4 * scale;

            const rot = rotate(lx, ly, lz);
            points[index++] = rot[0];
            points[index++] = rot[1];
            points[index++] = rot[2];
        }

        // 3. Fill faces
        for (let i = 0; i < fillCount; i++) {
            let lx, ly;
            let attempts = 0;
            while (attempts < 100) {
                attempts++;
                const px = (Math.random() - 0.5) * 2 * rOuter;
                const py = tipY + Math.random() * (cy + rOuter - tipY);
                const dy = py - cy;
                const distToCircleCenter = Math.sqrt(px * px + dy * dy);
                
                if (distToCircleCenter < rInner) continue;
                
                if (distToCircleCenter <= rOuter && py >= cy) {
                    lx = px;
                    ly = py;
                    break;
                }
                
                if (py < cy) {
                    const tangentAngle = -Math.PI / 6;
                    const tx = rOuter * Math.cos(tangentAngle);
                    const ty = cy + rOuter * Math.sin(tangentAngle);
                    const slope = (ty - tipY) / tx;
                    const limitX = (py - tipY) / slope;
                    if (Math.abs(px) <= limitX) {
                        lx = px;
                        ly = py;
                        break;
                    }
                }
            }
            if (lx === undefined) {
                lx = 0;
                ly = cy;
            }
            const lz = (Math.random() - 0.5) * 1.0 * scale;
            const rot = rotate(lx, ly, lz);
            points[index++] = rot[0];
            points[index++] = rot[1];
            points[index++] = rot[2];
        }

        // 4. Base shadow loop
        for (let i = 0; i < shadowCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = scale * 1.8 * Math.sqrt(Math.random());
            const lx = r * Math.cos(angle);
            const ly = tipY - 0.2 * scale;
            const lz = r * Math.sin(angle) * 0.4;

            const rot = rotate(lx, ly, lz);
            points[index++] = rot[0];
            points[index++] = rot[1];
            points[index++] = rot[2];
        }

        return points;
    }

    function init() {
        clock = new THREE.Clock();
        
        // SimplexNoise v2 instantiation:
        const simplex = new SimplexNoise();
        noise3D = (x, y, z) => simplex.noise3D(x, y, z);
        noise4D = (x, y, z, w) => simplex.noise4D(x, y, z, w);

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x02050f, 0.025);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 6, 25);
        updateViewOffset();

        renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webglCanvas'), antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.minDistance = 4;
        controls.maxDistance = 70;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2.4;

        scene.add(new THREE.AmbientLight(0x505070));
        const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.7);
        dirLight1.position.set(10, 15, 10);
        scene.add(dirLight1);
        const dirLight2 = new THREE.DirectionalLight(0x99bbff, 1.0);
        dirLight2.position.set(-10, -8, -10);
        scene.add(dirLight2);

        setupPostProcessing();
        createStarfield();
        setupParticleSystem();

        window.addEventListener('resize', onWindowResize);
        window.addEventListener('click', onCanvasClick);





        // Scroll fade-out handler
        const canvasContainer = document.getElementById('canvas-container');
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const vh = window.innerHeight;
            if (canvasContainer) {
                if (scrollY > vh * 0.5) {
                    canvasContainer.style.opacity = Math.max(0, 1 - (scrollY - vh * 0.5) / (vh * 0.5));
                } else {
                    canvasContainer.style.opacity = 1;
                }
            }
        });

        resetAutoMorphTimer();

        isInitialized = true;
        animate();
    }

    function updateViewOffset() {
        if (window.innerWidth < 900) {
            camera.clearViewOffset();
        } else {
            const horizontalOffset = -window.innerWidth * 0.22;
            camera.setViewOffset(window.innerWidth, window.innerHeight, horizontalOffset, 0, window.innerWidth, window.innerHeight);
        }
    }

    function resetAutoMorphTimer() {
        if (autoMorphInterval) clearInterval(autoMorphInterval);
        autoMorphInterval = setInterval(() => {
            if (!isMorphing) {
                triggerMorph();
            }
        }, 12000);
    }

    function setupPostProcessing() {
        composer = new THREE.EffectComposer(renderer);
        composer.addPass(new THREE.RenderPass(scene, camera));
        bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), CONFIG.bloomStrength, CONFIG.bloomRadius, CONFIG.bloomThreshold);
        composer.addPass(bloomPass);
    }

    function createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = new Float32Array(CONFIG.starCount * 3);
        const starSizes = new Float32Array(CONFIG.starCount);
        const starColors = new Float32Array(CONFIG.starCount * 3);
        for (let i = 0; i < CONFIG.starCount; i++) {
            tempVec.set(
                THREE.MathUtils.randFloatSpread(500),
                THREE.MathUtils.randFloatSpread(500),
                THREE.MathUtils.randFloatSpread(500)
            );
            if (tempVec.length() < 120) tempVec.setLength(120 + Math.random() * 250);
            starVertices[i * 3] = tempVec.x;
            starVertices[i * 3 + 1] = tempVec.y;
            starVertices[i * 3 + 2] = tempVec.z;
            starSizes[i] = Math.random() * 0.12 + 0.04;
            const color = new THREE.Color();
            color.setHSL(Math.random() < 0.15 ? Math.random() : 0.65, 0.6, 0.75 + Math.random() * 0.25);
            starColors[i * 3] = color.r;
            starColors[i * 3 + 1] = color.g;
            starColors[i * 3 + 2] = color.b;
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
        starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
        const starMaterial = new THREE.ShaderMaterial({
            uniforms: { pointTexture: { value: createStarTexture() } },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                void main() {
                    vColor = color;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (450.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }`,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                void main() {
                    float alpha = texture2D(pointTexture, gl_PointCoord).a;
                    if (alpha < 0.1) discard;
                    gl_FragColor = vec4(vColor, alpha * 0.85);
                }`,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });
        scene.add(new THREE.Points(starGeometry, starMaterial));
    }

    function createStarTexture() {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.25, 'rgba(255,255,255,0.7)');
        gradient.addColorStop(0.6, 'rgba(255,255,255,0.2)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
        return new THREE.CanvasTexture(canvas);
    }

    function setupParticleSystem() {
        targetPositions = SHAPES.map(shape => shape.generator(CONFIG.particleCount, CONFIG.shapeSize));
        particlesGeometry = new THREE.BufferGeometry();
        currentPositions = new Float32Array(targetPositions[0]);
        sourcePositions = new Float32Array(targetPositions[0]);
        swarmPositions = new Float32Array(CONFIG.particleCount * 3);
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

        particleSizes = new Float32Array(CONFIG.particleCount);
        particleOpacities = new Float32Array(CONFIG.particleCount);
        particleEffectStrengths = new Float32Array(CONFIG.particleCount);
        for (let i = 0; i < CONFIG.particleCount; i++) {
            particleSizes[i] = THREE.MathUtils.randFloat(CONFIG.particleSizeRange[0], CONFIG.particleSizeRange[1]);
            particleOpacities[i] = 0.9;
            particleEffectStrengths[i] = 0.0;
        }
        particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
        particlesGeometry.setAttribute('opacity', new THREE.BufferAttribute(particleOpacities, 1));
        particlesGeometry.setAttribute('aEffectStrength', new THREE.BufferAttribute(particleEffectStrengths, 1));

        const colors = new Float32Array(CONFIG.particleCount * 3);
        updateColorArray(colors, currentPositions);
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        particlesMaterial = new THREE.ShaderMaterial({
            uniforms: { pointTexture: { value: createStarTexture() } },
            vertexShader: `
                attribute float size;
                attribute float opacity;
                attribute float aEffectStrength;
                varying vec3 vColor;
                varying float vOpacity;
                varying float vEffectStrength;
                void main() {
                    vColor = color;
                    vOpacity = opacity;
                    vEffectStrength = aEffectStrength;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 2.5;
                    gl_Position = projectionMatrix * mvPosition;
                }`,
            fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                varying float vOpacity;
                varying float vEffectStrength;
                void main() {
                    float alpha = texture2D(pointTexture, gl_PointCoord).a;
                    if (alpha < 0.05) discard;
                    vec3 finalColor = vColor * (1.0 + vEffectStrength * ${CONFIG.morphBrightnessFactor.toFixed(2)});
                    gl_FragColor = vec4(finalColor, alpha * vOpacity);
                }`,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });

        particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particleSystem);
    }

    function updateColorArray(colors, positionsArray) {
        const colorScheme = COLOR_SCHEMES[CONFIG.colorScheme];
        const center = new THREE.Vector3(0, 0, 0);
        const maxRadius = CONFIG.shapeSize * 1.2;
        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;
            tempVec.fromArray(positionsArray, i3);
            const dist = tempVec.distanceTo(center);
            let hue = CONFIG.colorScheme === 'rainbow'
                ? ((tempVec.x / maxRadius + 1) / 2 * 120 + (tempVec.y / maxRadius + 1) / 2 * 120 + (tempVec.z / maxRadius + 1) / 2 * 120) % 360
                : THREE.MathUtils.mapLinear(dist, 0, maxRadius, colorScheme.startHue, colorScheme.endHue);
            const noiseValue = (noise3D(tempVec.x * 0.15, tempVec.y * 0.15, tempVec.z * 0.15) + 1) * 0.5;
            const saturation = THREE.MathUtils.clamp(colorScheme.saturation * (0.85 + noiseValue * 0.25), 0, 1);
            const lightness = THREE.MathUtils.clamp(colorScheme.lightness * (0.9 + noiseValue * 0.2), 0.1, 0.9);
            new THREE.Color().setHSL(hue / 360, saturation, lightness).toArray(colors, i3);
        }
    }

    function updateColors() {
        const colors = particlesGeometry.attributes.color.array;
        updateColorArray(colors, particlesGeometry.attributes.position.array);
        particlesGeometry.attributes.color.needsUpdate = true;
    }

    function triggerMorph() {
        if (isMorphing) return;
        isMorphing = true;
        controls.autoRotate = false;
        
        const nextShapeIndex = (currentShapeIndex + 1) % SHAPES.length;
        const infoEl = document.getElementById('info');
        if (infoEl) {
            infoEl.innerText = `Shape: ${SHAPES[nextShapeIndex].name} (Click to morph)`;
            infoEl.style.textShadow = '0 0 6px rgba(0, 128, 255, 0.9)';
        }

        sourcePositions.set(currentPositions);
        const nextTargetPositions = targetPositions[nextShapeIndex];
        const centerOffsetAmount = CONFIG.shapeSize * CONFIG.swarmDistanceFactor;
        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;
            sourceVec.fromArray(sourcePositions, i3);
            targetVec.fromArray(nextTargetPositions, i3);
            swarmVec.lerpVectors(sourceVec, targetVec, 0.5);
            const offsetDir = tempVec.set(
                noise3D(i * 0.04, 10, 10),
                noise3D(20, i * 0.04, 20),
                noise3D(30, 30, i * 0.04)
            ).normalize();
            const distFactor = sourceVec.distanceTo(targetVec) * 0.08 + centerOffsetAmount;
            swarmVec.addScaledVector(offsetDir, distFactor * (0.6 + Math.random() * 0.7));
            swarmPositions[i3] = swarmVec.x;
            swarmPositions[i3 + 1] = swarmVec.y;
            swarmPositions[i3 + 2] = swarmVec.z;
        }
        currentShapeIndex = nextShapeIndex;
        morphState.progress = 0;
        if (morphTimeline) morphTimeline.pause();
        morphTimeline = anime({
            targets: morphState,
            progress: 1,
            duration: CONFIG.morphDuration,
            easing: 'cubicBezier(0.33, 0, 0.66, 1)',
            complete: () => {
                currentPositions.set(targetPositions[currentShapeIndex]);
                particlesGeometry.attributes.position.needsUpdate = true;
                particleEffectStrengths.fill(0.0);
                particlesGeometry.attributes.aEffectStrength.needsUpdate = true;
                sourcePositions.set(targetPositions[currentShapeIndex]);
                updateColors();
                isMorphing = false;
                controls.autoRotate = true;
            }
        });

        resetAutoMorphTimer();
    }

    function animate() {
        requestAnimationFrame(animate);
        if (!isInitialized) return;
        const elapsedTime = clock.getElapsedTime();
        const deltaTime = clock.getDelta();
        controls.update();
        const positions = particlesGeometry.attributes.position.array;
        const effectStrengths = particlesGeometry.attributes.aEffectStrength.array;

        if (isMorphing) {
            updateMorphAnimation(positions, effectStrengths, elapsedTime, deltaTime);
        } else {
            updateIdleAnimation(positions, effectStrengths, elapsedTime, deltaTime);
        }
        particlesGeometry.attributes.position.needsUpdate = true;
        if (isMorphing || particlesGeometry.attributes.aEffectStrength.needsUpdate) {
            particlesGeometry.attributes.aEffectStrength.needsUpdate = true;
        }
        composer.render(deltaTime);
    }

    function updateMorphAnimation(positions, effectStrengths, elapsedTime, deltaTime) {
        const t = morphState.progress;
        const targets = targetPositions[currentShapeIndex];
        const MathPi = Math.PI;
        const effectStrength = Math.sin(t * MathPi);
        const currentSwirl = effectStrength * CONFIG.swirlFactor * deltaTime * 40;
        const currentNoise = effectStrength * CONFIG.noiseMaxStrength;

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;
            sourceVec.fromArray(sourcePositions, i3);
            swarmVec.fromArray(swarmPositions, i3);
            targetVec.fromArray(targets, i3);

            const t_inv = 1.0 - t;
            const t_inv_sq = t_inv * t_inv;
            const t_sq = t * t;
            bezPos.copy(sourceVec).multiplyScalar(t_inv_sq);
            bezPos.addScaledVector(swarmVec, 2.0 * t_inv * t);
            bezPos.addScaledVector(targetVec, t_sq);

            if (currentSwirl > 0.01) {
                tempVec.subVectors(bezPos, sourceVec);
                swirlAxis.set(
                    noise3D(i * 0.015, elapsedTime * 0.08, 0),
                    noise3D(0, i * 0.015, elapsedTime * 0.08 + 4),
                    noise3D(elapsedTime * 0.08 + 8, 0, i * 0.015)
                ).normalize();
                tempVec.applyAxisAngle(swirlAxis, currentSwirl * (0.6 + Math.random() * 0.4));
                bezPos.copy(sourceVec).add(tempVec);
            }

            if (currentNoise > 0.01) {
                const noiseTime = elapsedTime * CONFIG.noiseTimeScale;
                noiseOffset.set(
                    noise4D(bezPos.x * CONFIG.noiseFrequency, bezPos.y * CONFIG.noiseFrequency, bezPos.z * CONFIG.noiseFrequency, noiseTime),
                    noise4D(bezPos.x * CONFIG.noiseFrequency + 100, bezPos.y * CONFIG.noiseFrequency + 100, bezPos.z * CONFIG.noiseFrequency + 100, noiseTime),
                    noise4D(bezPos.x * CONFIG.noiseFrequency + 200, bezPos.y * CONFIG.noiseFrequency + 200, bezPos.z * CONFIG.noiseFrequency + 200, noiseTime)
                );
                bezPos.addScaledVector(noiseOffset, currentNoise);
            }

            positions[i3] = bezPos.x;
            positions[i3 + 1] = bezPos.y;
            positions[i3 + 2] = bezPos.z;
            effectStrengths[i] = effectStrength;
        }
        particlesGeometry.attributes.aEffectStrength.needsUpdate = true;
    }

    function updateIdleAnimation(positions, effectStrengths, elapsedTime, deltaTime) {
        const breathScale = 1.0 + Math.sin(elapsedTime * 0.4) * 0.01;
        const timeScaled = elapsedTime * CONFIG.idleFlowSpeed;
        const freq = 0.08;
        let needsEffectStrengthReset = false;

        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;
            sourceVec.fromArray(sourcePositions, i3);
            tempVec.copy(sourceVec).multiplyScalar(breathScale);
            flowVec.set(
                noise4D(tempVec.x * freq, tempVec.y * freq, tempVec.z * freq, timeScaled),
                noise4D(tempVec.x * freq + 10, tempVec.y * freq + 10, tempVec.z * freq + 10, timeScaled),
                noise4D(tempVec.x * freq + 20, tempVec.y * freq + 20, tempVec.z * freq + 20, timeScaled)
            );
            tempVec.addScaledVector(flowVec, CONFIG.idleFlowStrength);
            currentVec.fromArray(positions, i3);
            currentVec.lerp(tempVec, 0.06);
            positions[i3] = currentVec.x;
            positions[i3 + 1] = currentVec.y;
            positions[i3 + 2] = currentVec.z;

            if (effectStrengths[i] !== 0.0) {
                effectStrengths[i] = 0.0;
                needsEffectStrengthReset = true;
            }
        }
        if (needsEffectStrengthReset) {
            particlesGeometry.attributes.aEffectStrength.needsUpdate = true;
        }
    }

    function onCanvasClick(event) {
        if (event.target.closest('#controls') || event.target.closest('#info') || event.target.closest('.main-header')) return;
        triggerMorph();
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        updateViewOffset();
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// Generate background paths for Services section
document.addEventListener('DOMContentLoaded', () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
        const bgContainer = document.createElement('div');
        bgContainer.className = 'services-bg-paths';
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 1440 800');
        svg.setAttribute('preserveAspectRatio', 'none');
        
        const pathCount = 35;
        for (let i = 0; i < pathCount; i++) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            // Generate parallel wavy paths sweeping from bottom-left to top-right
            const startY = 650 + i * 8;
            const cp1x = 220 + i * 8;
            const cp1y = 460 - i * 12;
            const cp2x = 880 - i * 4;
            const cp2y = 280 - i * 10;
            const endX = 1550;
            const endY = -120 + i * 14;
            
            const d = `M -100 ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
            
            path.setAttribute('d', d);
            // Alternate subtle navy blue (#1d438a) and semi-transparent white lines
            const opacity = 0.015 + (i / pathCount) * 0.085;
            const color = i % 2 === 0 ? `rgba(29, 67, 138, ${opacity})` : `rgba(255, 255, 255, ${opacity * 0.65})`;
            
            path.setAttribute('stroke', color);
            path.setAttribute('stroke-width', '1.5');
            path.setAttribute('fill', 'none');
            svg.appendChild(path);
        }
        bgContainer.appendChild(svg);
        servicesSection.insertBefore(bgContainer, servicesSection.firstChild);
    }
});

// Hamburger Menu Logic
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navCapsule = document.querySelector('.nav-capsule');

    if (hamburgerMenu && navCapsule) {
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburgerMenu.classList.toggle('active');
            navCapsule.classList.toggle('active');
        });
        
        // Close menu on link click
        navCapsule.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerMenu.classList.remove('active');
                navCapsule.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navCapsule.contains(e.target) && !hamburgerMenu.contains(e.target)) {
                hamburgerMenu.classList.remove('active');
                navCapsule.classList.remove('active');
            }
        });
    }
});
