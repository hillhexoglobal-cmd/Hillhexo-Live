document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('quote-globe-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(560, 560);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    
    // Tilt the globe so northern hemisphere is slightly more visible
    group.rotation.x = 0.4;
    group.rotation.y = -0.5;

    function extractEarthFromImage(imgSrc, count, radius, callback) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxW = 1200; // Higher res = more map detail
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
            
            // Collect ALL valid land pixels first
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
            
            // Sample evenly across all land pixels using a step
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

    let isIntersecting = false;
    let arcDrawProgress = 0;
    const arcs = [];

    if (typeof mapBase64 !== 'undefined') {
        extractEarthFromImage(mapBase64, 200000, 5, (earthPoints) => {
            
            const pointsGeo = new THREE.BufferGeometry();
            const posArray = new Float32Array(earthPoints.length * 3);
            const colArray = new Float32Array(earthPoints.length * 3);

            earthPoints.forEach((p, i) => {
                posArray[i*3] = p.x;
                posArray[i*3+1] = p.y;
                posArray[i*3+2] = p.z;
                
                // Slate gray, light gray, and gold dot mix for light background
                const r = Math.random();
                const color = new THREE.Color(r > 0.85 ? 0x1d438a : (r > 0.4 ? 0x64748b : 0xcbd5e1));
                colArray[i*3] = color.r;
                colArray[i*3+1] = color.g;
                colArray[i*3+2] = color.b;
            });

            pointsGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            pointsGeo.setAttribute('color', new THREE.BufferAttribute(colArray, 3));

            const pointsMat = new THREE.PointsMaterial({
                size: 0.05,
                vertexColors: true,
                transparent: true,
                opacity: 0.85,
                blending: THREE.NormalBlending,
                depthWrite: false
            });

            const pointCloud = new THREE.Points(pointsGeo, pointsMat);
            group.add(pointCloud);

            // Halo (Subtle gold glow on white background)
            const haloGeo = new THREE.SphereGeometry(5.15, 32, 32);
            const haloMat = new THREE.MeshBasicMaterial({
                color: 0x1d438a,
                transparent: true,
                opacity: 0.04,
                blending: THREE.NormalBlending,
                side: THREE.BackSide
            });
            const halo = new THREE.Mesh(haloGeo, haloMat);
            group.add(halo);

            // Cities (removed black/dark dots, using slate-grey instead)
            const cities = [
                { lat: 40.7, lon: -74, color: 0x1d438a }, // NYC (Gold)
                { lat: 51.5, lon: -0.1, color: 0x64748b }, // London (Slate-grey)
                { lat: 35.6, lon: 139.6, color: 0x1d438a }, // Tokyo (Gold)
                { lat: -23.5, lon: -46.6, color: 0x64748b }, // Sao Paulo (Slate-grey)
                { lat: 1.3, lon: 103.8, color: 0x1d438a }  // Singapore (Gold)
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
                const node = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), nodeMat);
                node.position.copy(pos);
                group.add(node);
                nodes.push(pos);
            });

            // Arcs
            const pairs = [[0,1], [1,2], [0,3], [1,4]]; 
            pairs.forEach(pair => {
                const p1 = nodes[pair[0]];
                const p2 = nodes[pair[1]];
                
                const distance = p1.distanceTo(p2);
                const mid = p1.clone().lerp(p2, 0.5).normalize().multiplyScalar(5.0 + distance * 0.4);
                
                const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
                const curvePoints = curve.getPoints(50);
                
                const lineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
                lineGeo.setDrawRange(0, 0); 
                
                const lineMat = new THREE.LineBasicMaterial({ 
                    color: cities[pair[1]].color, 
                    linewidth: 2.5,
                    transparent: true,
                    opacity: 0.6,
                    blending: THREE.NormalBlending
                });
                const line = new THREE.Line(lineGeo, lineMat);
                group.add(line);
                arcs.push(lineGeo);
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        isIntersecting = true;
                    }
                });
            }, { threshold: 0.2 });
            observer.observe(document.querySelector('.request-quote-section'));

            let time = 0;
            const animate = function () {
                requestAnimationFrame(animate);
                time += 0.02;

                group.rotation.y = time * 0.05; // Constant slow rotation

                if (isIntersecting && arcDrawProgress < 50) {
                    arcDrawProgress += 0.3;
                    arcs.forEach(arc => arc.setDrawRange(0, Math.floor(arcDrawProgress)));
                }

                renderer.render(scene, camera);
            };
            animate();
        });
    }
});
