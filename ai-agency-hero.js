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
        shapeSize: 16, // Increased shape size (was 12) to make center shapes bigger
        swarmDistanceFactor: 1.4,
        swirlFactor: 3.5,
        noiseFrequency: 0.08,
        noiseTimeScale: 0.03,
        noiseMaxStrength: 2.5,
        colorScheme: 'fire',
        morphDuration: 2000,
        particleSizeRange: [0.08, 0.24],
        starCount: 6000,
        bloomStrength: 1.2,
        bloomRadius: 0.4,
        bloomThreshold: 0.1,
        idleFlowStrength: 0.5,
        idleFlowSpeed: 0.22, // increased speed
        idleRotationSpeed: 0.05, // increased speed
        morphSizeFactor: 0.4,
        morphBrightnessFactor: 0.5
    };

    const SHAPES = [
        { name: 'Blackhole', generator: generateBlackhole },
        { name: 'Torus', generator: generateTorus },
        { name: 'Helix', generator: generateHelix },
        { name: 'Hyperboloid', generator: generateHyperboloid },
        { name: 'Crystal', generator: generateCrystal }
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
    function generateHelix(count, size) {
        const points = new Float32Array(count * 3);
        let index = 0;
        const radius = size * 0.55;
        const height = size * 1.3;

        for (let i = 0; i < count; i++) {
            // Alternate between two strands
            const strand = Math.random() < 0.5 ? 0 : Math.PI;
            const t = Math.random(); // height progress from 0 to 1
            const y = (t - 0.5) * height;

            // Spiral angle spirals up along the y axis
            const spiralTurns = 3.0;
            const angle = t * spiralTurns * Math.PI * 2 + strand;

            // Helix strand line points
            let x = Math.cos(angle) * radius;
            let z = Math.sin(angle) * radius;

            // Add some noise/fuzziness to make it look like a cloud of energy
            const fuzz = 0.15 * radius;
            x += (Math.random() - 0.5) * fuzz;
            z += (Math.random() - 0.5) * fuzz;
            const dy = (Math.random() - 0.5) * fuzz;

            points[index++] = x;
            points[index++] = y + dy;
            points[index++] = z;
        }
        return points;
    }



    function generateHyperboloid(count, size) {
        const points = new Float32Array(count * 3);
        let index = 0;
        const R = size * 0.6; // Waist radius

        for (let i = 0; i < count; i++) {
            const v = (Math.random() - 0.5) * 2.0; // height from -1 to 1
            const theta = Math.random() * Math.PI * 2;
            const y = v * size * 0.7;

            // Hyperboloid equation: r = R * sqrt(1 + v^2)
            const r = R * Math.sqrt(1 + v * v) * (0.9 + Math.random() * 0.2);

            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;

            points[index++] = x;
            points[index++] = y;
            points[index++] = z;
        }
        return points;
    }

    function generateCrystal(count, size) {
        const points = new Float32Array(count * 3);
        let index = 0;
        const radius = size * 0.8;

        for (let i = 0; i < count; i++) {
            // Generate points on the surfaces of an octahedron: |x| + |y| + |z| = radius
            const u = (Math.random() - 0.5) * 2;
            const v = (Math.random() - 0.5) * 2;
            const w = (Math.random() - 0.5) * 2;

            // Normalize to L1 norm
            const sum = Math.abs(u) + Math.abs(v) + Math.abs(w);
            const scale = radius / (sum === 0 ? 1 : sum);

            let x = u * scale;
            let y = v * scale;
            let z = w * scale;

            // Add slight random inside noise to make the crystal look filled/holographic
            const insideFactor = 0.85 + Math.random() * 0.15;
            x *= insideFactor;
            y *= insideFactor;
            z *= insideFactor;

            points[index++] = x;
            points[index++] = y;
            points[index++] = z;
        }
        return points;
    }

    function generateBlackhole(count, size) {
        const points = new Float32Array(count * 3);
        let index = 0;
        const radius = size * 0.65;
        
        // Accretion disk count: 75% of particles
        const diskCount = Math.floor(count * 0.75);
        const lensingCount = count - diskCount;
        
        // 1. Accretion Disk (flat spiraling particles with noise)
        for (let i = 0; i < diskCount; i++) {
            const r = THREE.MathUtils.randFloat(radius * 0.25, radius * 2.0);
            const theta = Math.random() * Math.PI * 2 + (r * 1.5); // Spiral winding
            const x = Math.cos(theta) * r;
            const z = Math.sin(theta) * r;
            const y = (Math.random() - 0.5) * 0.15 * radius * (1.0 / (r * 0.5)); // thinner at edges
            
            points[index++] = x;
            points[index++] = y;
            points[index++] = z;
        }
        
        // 2. Gravitational Lensing (vertical halo/ring around the center)
        for (let i = 0; i < lensingCount; i++) {
            const r = radius * 0.7;
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() - 0.5) * 0.2; // thin band
            // Rotate the ring vertically to represent the lensed light bending over the top/bottom
            const x = r * Math.sin(theta);
            const y = r * Math.cos(theta) * Math.sin(phi);
            const z = r * Math.cos(theta) * Math.cos(phi);
            
            points[index++] = x;
            points[index++] = y;
            points[index++] = z;
        }
        
        return points;
    }

    function generateTorus(count, size) {
        const points = new Float32Array(count * 3);
        let index = 0;
        const R = size * 0.7; // Major radius
        const r = size * 0.25; // Minor radius

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;

            // Torus parametric equations
            const x = (R + r * Math.cos(phi)) * Math.cos(theta);
            const y = r * Math.sin(phi);
            const z = (R + r * Math.cos(phi)) * Math.sin(theta);

            points[index++] = x;
            points[index++] = y;
            points[index++] = z;
        }
        return points;
    }

    function init() {
        if (document.body.classList.contains('contact-page')) {
            return;
        }
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
        controls.autoRotateSpeed = 8.0;
        controls.enableZoom = false;

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
        }, 7000);
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
                    // size attenuation: scale size inversely with distance (Z depth)
                    gl_PointSize = size * 0.8 * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }`,
            fragmentShader: `
                varying vec3 vColor;
                varying float vOpacity;
                varying float vEffectStrength;
                void main() {
                    // Compute circular coordinates from gl_PointCoord (from 0 to 1)
                    vec2 uv = gl_PointCoord - vec2(0.5);
                    float distSq = dot(uv, uv);
                    if (distSq > 0.25) discard; // Crop point into a perfect circle

                    // Compute normal vectors on the sphere surface
                    float z = sqrt(0.25 - distSq);
                    vec3 normal = normalize(vec3(uv, z));

                    // Directional lighting from top-right-front spotlight source
                    vec3 lightDir = normalize(vec3(0.5, 0.7, 0.5));
                    float diff = max(dot(normal, lightDir), 0.0);
                    
                    // Soft ambient lighting
                    vec3 ambient = vec3(0.25);
                    
                    // Combine colors with diffuse + ambient reflection
                    vec3 finalColor = vColor * (diff * 0.8 + ambient);

                    // Add specular highlights for shiny 3D sphere look
                    vec3 viewDir = vec3(0.0, 0.0, 1.0);
                    vec3 reflectDir = reflect(-lightDir, normal);
                    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
                    finalColor += vec3(0.35) * spec;

                    // Boost color slightly during morph transition
                    finalColor *= (1.0 + vEffectStrength * ${CONFIG.morphBrightnessFactor.toFixed(2)});

                    gl_FragColor = vec4(finalColor, vOpacity);
                }`,
            blending: THREE.NormalBlending,
            depthTest: true,
            depthWrite: true,
            transparent: true,
            vertexColors: true
        });

        particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particleSystem);
    }

    function updateColorArray(colors, positionsArray) {
        const c = new THREE.Color();
        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3;
            tempVec.fromArray(positionsArray, i3);
            
            // Generate noise value between 0.0 and 1.0 based on spatial coordinates
            const n = (noise3D(tempVec.x * 0.1, tempVec.y * 0.1, tempVec.z * 0.1) + 1.0) * 0.5;
            
            // Add slight random variation to the noise per particle for organic texture
            const jitter = (Math.random() - 0.5) * 0.08;
            const nJittered = THREE.MathUtils.clamp(n + jitter, 0.0, 1.0);

            if (nJittered < 0.40) {
                // 1. Navy Blue - organic shades of deep blue-indigo
                c.setRGB(
                    0.04 + Math.random() * 0.06,
                    0.12 + Math.random() * 0.10,
                    0.50 + Math.random() * 0.20
                );
            } else if (nJittered < 0.72) {
                // 2. Violet / Purple - shades of medium violet
                c.setRGB(
                    0.32 + Math.random() * 0.12,
                    0.20 + Math.random() * 0.08,
                    0.48 + Math.random() * 0.16
                );
            } else {
                // 3. Cream / Off-white - shades of warm beige
                c.setRGB(
                    0.86 + Math.random() * 0.08,
                    0.83 + Math.random() * 0.06,
                    0.79 + Math.random() * 0.06
                );
            }
            c.toArray(colors, i3);
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
