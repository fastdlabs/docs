import * as THREE from 'three';

const BASE_SPEED = 3;
const MAX_SPEED = 72;
const ACCELERATION_TIME = 3.2;
const TRAVEL_DISTANCE = 140;

function canUseWebGL() {
    try {
        const canvas = document.createElement('canvas');

        return Boolean(
            window.WebGLRenderingContext
            && (canvas.getContext('webgl2') || canvas.getContext('webgl'))
        );
    } catch {
        return false;
    }
}

function makeGlowTexture() {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');
    const center = size / 2;
    const gradient = context.createRadialGradient(center, center, 0, center, center, center);

    gradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
    gradient.addColorStop(0.18, 'rgba(14, 165, 233, 0.24)');
    gradient.addColorStop(0.55, 'rgba(14, 165, 233, 0.04)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

export function startScene({ canvas, fallback, onProgress, onComplete }) {
    if (!canUseWebGL()) {
        fallback.hidden = false;
        canvas.hidden = true;
        onComplete?.();

        return {
            pause() {},
            resume() {},
            restart() {},
        };
    }

    const parent = canvas.parentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        72,
        window.innerWidth / window.innerHeight,
        0.1,
        220,
    );
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const starCount = reducedMotion ? 280 : 900;
    const positions = new Float32Array(starCount * 6);
    const colors = new Float32Array(starCount * 6);
    const stars = [];

    const palette = [
        new THREE.Color(0x67e8f9),
        new THREE.Color(0x38bdf8),
        new THREE.Color(0xa5b4fc),
        new THREE.Color(0xe0f2fe),
    ];

    const resetStar = (index, randomDepth = false) => {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1.4 + Math.random() * 22;
        const color = palette[index % palette.length];
        const star = stars[index];

        star.x = Math.cos(angle) * radius;
        star.y = Math.sin(angle) * radius;
        star.z = randomDepth
            ? -(1 + Math.random() * TRAVEL_DISTANCE)
            : -TRAVEL_DISTANCE;

    };

    for (let i = 0; i < starCount; i++) {
        stars[i] = {
            x: 0,
            y: 0,
            z: 0,
        };
        resetStar(i, true);

        const color = palette[i % palette.length];
        const head = i * 6;
        const tail = head + 3;

        colors[head] = color.r;
        colors[head + 1] = color.g;
        colors[head + 2] = color.b;
        colors[tail] = color.r * 0.42;
        colors[tail + 1] = color.g * 0.42;
        colors[tail + 2] = color.b * 0.42;
    }

    const geometry = new THREE.BufferGeometry();
    const positionAttribute = new THREE.BufferAttribute(positions, 3);
    positionAttribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', positionAttribute);
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const starLines = new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        }),
    );
    scene.add(starLines);

    const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: makeGlowTexture(),
            color: 0xffffff,
            transparent: true,
            opacity: 0.62,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        }),
    );
    glow.position.set(0, 0, -72);
    glow.scale.set(48, 48, 1);
    scene.add(glow);

    const pointer = new THREE.Vector2();
    const targetPointer = new THREE.Vector2();
    let visible = true;
    let frameId = null;
    let elapsed = 0;
    let speed = BASE_SPEED;
    let completed = false;

    const pointerMove = (event) => {
        targetPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        targetPointer.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    const resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const updateStars = (delta) => {
        const length = 0.18 + speed * 0.075;

        for (let i = 0; i < starCount; i++) {
            const star = stars[i];
            star.z += speed * delta;

            if (star.z > 1.5) {
                resetStar(i);
            }

            const offset = i * 6;

            positions[offset] = star.x;
            positions[offset + 1] = star.y;
            positions[offset + 2] = star.z;

            positions[offset + 3] = star.x;
            positions[offset + 4] = star.y;
            positions[offset + 5] = star.z - length;
        }

        positionAttribute.needsUpdate = true;
    };

    const render = () => {
        if (!visible) {
            return;
        }

        frameId = requestAnimationFrame(render);

        const delta = Math.min(clock.getDelta(), 0.05);

        if (!reducedMotion) {
            elapsed += delta;
            const progress = Math.min(elapsed / ACCELERATION_TIME, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            speed = BASE_SPEED + (MAX_SPEED - BASE_SPEED) * eased;

            pointer.x += (targetPointer.x - pointer.x) * Math.min(1, delta * 3);
            pointer.y += (targetPointer.y - pointer.y) * Math.min(1, delta * 3);

            camera.position.x = pointer.x * 0.7;
            camera.position.y = pointer.y * 0.45;
            camera.lookAt(pointer.x * 0.25, pointer.y * 0.18, -1);

            onProgress?.(progress);

            if (!completed && progress >= 1) {
                completed = true;
                onComplete?.();
            }
        }

        updateStars(delta);
        glow.material.opacity = 0.42 + (speed / MAX_SPEED) * 0.38;
        renderer.render(scene, camera);
    };

    canvas.addEventListener('pointermove', pointerMove);
    window.addEventListener('resize', resize);

    const api = {
        pause() {
            visible = false;

            if (frameId !== null) {
                cancelAnimationFrame(frameId);
                frameId = null;
            }
        },
        resume() {
            if (visible) {
                return;
            }

            visible = true;
            clock.getDelta();
            render();
        },
        restart() {
            elapsed = 0;
            speed = BASE_SPEED;
            completed = false;
            onProgress?.(0);

            for (let i = 0; i < starCount; i++) {
                resetStar(i, true);
            }

            api.resume();
        },
    };

    if (reducedMotion) {
        elapsed = ACCELERATION_TIME;
        speed = 0;
        completed = true;
        onProgress?.(1);
        onComplete?.();
    }

    render();

    return api;
}
