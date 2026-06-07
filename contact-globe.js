document.addEventListener('DOMContentLoaded', () => {
    // Only run this script on the contact page
    if (!document.body.classList.contains('contact-page')) return;

    const canvas = document.getElementById('webglCanvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    
    // Perspective Camera setup
    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const group = new THREE.Group();
    scene.add(group);
    
    // Tilt the globe so northern hemisphere is slightly more visible
    group.rotation.x = 0.4;
    group.rotation.y = -0.5;

    // Shift the globe to the right on desktop to frame the left-aligned content nicely
    function updateGlobePosition() {
        if (window.innerWidth > 900) {
            group.position.x = 2.2;
        } else {
            group.position.x = 0;
        }
    }
    updateGlobePosition();

    function extractEarthFromImage(imgSrc, count, radius, callback) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxW = 1200; // Map resolution
            const ratio = img.height / img.width;
            canvas.width = maxW;
            canvas.height = maxW * ratio;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            
            let darkCount = 0; let brightCount = 0;
            for (let i = 0; i < imgData.length; i+=4) {
                const b = (imgData[i] + imgData[i+1] + imgData[i+2])/3;
                if(b > 128) brightCount++; else darkCount++;
            }
            const landIsBright = brightCount < darkCount;
            
            const validPixels = [];
            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    const idx = (y * canvas.width + x) * 4;
                    const brightness = (imgData[idx] + imgData[idx + 1] + imgData[idx + 2]) / 3;
                    const isLand = landIsBright ? (brightness > 128) : (brightness < 128);
                    
                    if (isLand) { 
                        const lon = (x / canvas.width) * 360 - 180;
                        const lat = 90 - (y / canvas.height) * 180;
                        
                        const phi = (90 - lat) * (Math.PI / 180);
                        const theta = (lon + 180) * (Math.PI / 180);
                        
                        const px = -(radius * Math.sin(phi) * Math.cos(theta));
                        const py = radius * Math.cos(phi);
                        const pz = radius * Math.sin(phi) * Math.sin(theta);
                        
                        validPixels.push(new THREE.Vector3(px, py, pz));
                    }
                }
            }
            
            const finalPts = [];
            const step = Math.max(1, Math.floor(validPixels.length / count));
            for (let i = 0; i < validPixels.length; i += step) {
                const p = validPixels[i].clone();
                p.x += (Math.random() - 0.5) * 0.04;
                p.y += (Math.random() - 0.5) * 0.04;
                p.z += (Math.random() - 0.5) * 0.04;
                finalPts.push(p);
            }
            callback(finalPts);
        };
        img.src = imgSrc;
    }

    const arcs = [];
    let arcDrawProgress = 0;

    if (typeof mapBase64 !== 'undefined') {
        extractEarthFromImage(mapBase64, 200000, 5, (earthPoints) => {
            
            const pointsGeo = new THREE.BufferGeometry();
            const posArray = new Float32Array(earthPoints.length * 3);
            const colArray = new Float32Array(earthPoints.length * 3);

            earthPoints.forEach((p, i) => {
                posArray[i*3] = p.x;
                posArray[i*3+1] = p.y;
                posArray[i*3+2] = p.z;
                
                // Mix of slate-blue, dark blue, and light gray dots matching reference colors
                const r = Math.random();
                const color = new THREE.Color(r > 0.85 ? 0x1d438a : (r > 0.45 ? 0x64748b : 0x94a3b8));
                colArray[i*3] = color.r;
                colArray[i*3+1] = color.g;
                colArray[i*3+2] = color.b;
            });

            pointsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            pointsGeo.setAttribute('color', new THREE.BufferAttribute(colArray, 3));

            const pointsMat = new THREE.PointsMaterial({
                size: 0.045,
                vertexColors: true,
                transparent: true,
                opacity: 0.75,
                blending: THREE.NormalBlending,
                depthWrite: false
            });

            const pointCloud = new THREE.Points(pointsGeo, pointsMat);
            group.add(pointCloud);

            // Halo glow effect
            const haloGeo = new THREE.SphereGeometry(5.12, 32, 32);
            const haloMat = new THREE.MeshBasicMaterial({
                color: 0x1d438a,
                transparent: true,
                opacity: 0.035,
                blending: THREE.NormalBlending,
                side: THREE.BackSide
            });
            const halo = new THREE.Mesh(haloGeo, haloMat);
            group.add(halo);

            // Cities
            const cities = [
                { lat: 40.7, lon: -74, color: 0x1d438a }, // NYC
                { lat: 51.5, lon: -0.1, color: 0x64748b }, // London
                { lat: 35.6, lon: 139.6, color: 0x1d438a }, // Tokyo
                { lat: -23.5, lon: -46.6, color: 0x64748b }, // Sao Paulo
                { lat: 1.3, lon: 103.8, color: 0x1d438a }  // Singapore
            ];

            function getCartesian(lat, lon, radius) {
                const phi = (90 - lat) * (Math.PI / 180);
                const theta = (lon + 180) * (Math.PI / 180);
                return new THREE.Vector3(
                    -(radius * Math.sin(phi) * Math.cos(theta)),
                    radius * Math.cos(phi),
                    radius * Math.sin(phi) * Math.sin(theta)
                );
            }

            const nodes = [];
            cities.forEach(city => {
                const pos = getCartesian(city.lat, city.lon, 5.0);
                const nodeMat = new THREE.MeshBasicMaterial({ color: city.color });
                const node = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), nodeMat);
                node.position.copy(pos);
                group.add(node);
                nodes.push(pos);
            });

            // Connection Arcs
            const pairs = [[0,1], [1,2], [0,3], [1,4]]; 
            pairs.forEach(pair => {
                const p1 = nodes[pair[0]];
                const p2 = nodes[pair[1]];
                
                const distance = p1.distanceTo(p2);
                const mid = p1.clone().lerp(p2, 0.5).normalize().multiplyScalar(5.0 + distance * 0.35);
                
                const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
                const curvePoints = curve.getPoints(50);
                
                const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
                lineGeo.setDrawRange(0, 0); 
                
                const lineMat = new THREE.LineBasicMaterial({ 
                    color: cities[pair[1]].color, 
                    linewidth: 2,
                    transparent: true,
                    opacity: 0.45,
                    blending: THREE.NormalBlending
                });
                const line = new THREE.Line(lineGeo, lineMat);
                group.add(line);
                arcs.push(lineGeo);
            });

            let time = 0;
            const animate = function () {
                requestAnimationFrame(animate);
                time += 0.012; // Slow elegant rotation

                group.rotation.y = time * 0.05;

                // Gradually reveal the arcs
                if (arcDrawProgress < 50) {
                    arcDrawProgress += 0.25;
                    arcs.forEach(arc => arc.setDrawRange(0, Math.floor(arcDrawProgress)));
                }

                renderer.render(scene, camera);
            };
            animate();
        });
    }

    // Window resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        updateGlobePosition();
    });
});
