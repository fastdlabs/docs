import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { edges, flow, groups, nodes } from './data.js';

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

function makeLabel(node) {
    const element = document.createElement('div');
    element.className = 'scene-label';
    element.textContent = node.label;
    element.style.setProperty('--node-color', groups[node.group].color);

    return new CSS2DObject(element);
}

function makeGlowTexture(color) {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');
    const center = size / 2;
    const gradient = context.createRadialGradient(center, center, 0, center, center, center);

    gradient.addColorStop(0, color);
    gradient.addColorStop(0.22, color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

function makeParticleField(count, color, spread, size, opacity) {
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spread.x;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread.y;
        positions[i * 3 + 2] = (Math.random() - 0.5) * spread.z;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    return new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            color,
            size,
            transparent: true,
            opacity,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        }),
    );
}

function curveBetween(start, end) {
    const middle = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5);
    middle.z += 0.8;

    return new THREE.QuadraticBezierCurve3(start, middle, end);
}

export function startScene({ canvas, panel, fallback, onSelect }) {
    if (!canUseWebGL()) {
        fallback.hidden = false;
        canvas.hidden = true;

        return {
            pause() {},
            resume() {},
        };
    }

    const parent = canvas.parentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        42,
        window.innerWidth / window.innerHeight,
        0.1,
        100,
    );
    camera.position.set(0, 2.8, 12.2);

    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.className = 'experience-label-layer';
    parent.appendChild(labelRenderer.domElement);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 6;
    controls.maxDistance = 17;
    controls.autoRotate = !reducedMotion;
    controls.autoRotateSpeed = 0.32;

    const world = new THREE.Group();
    world.position.set(2.0, 0, 0);
    world.scale.setScalar(0.8);
    scene.add(world);

    scene.add(new THREE.AmbientLight(0xffffff, 1.7));

    const keyLight = new THREE.DirectionalLight(0xbae6fd, 2.8);
    keyLight.position.set(5, 8, 7);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x22d3ee, 1.6);
    rimLight.position.set(-6, -4, 3);
    scene.add(rimLight);

    const particleFields = [
        makeParticleField(
            reducedMotion ? 220 : 720,
            0x38bdf8,
            new THREE.Vector3(22, 13, 12),
            0.035,
            0.46,
        ),
        makeParticleField(
            reducedMotion ? 80 : 260,
            0x67e8f9,
            new THREE.Vector3(15, 9, 10),
            0.06,
            0.34,
        ),
    ];

    for (const field of particleFields) {
        scene.add(field);
    }

    const glowTextures = new Map(
        Object.entries(groups).map(([key, group]) => [key, makeGlowTexture(group.color)]),
    );

    const nodeMeshes = [];
    const points = new Map();

    for (const node of nodes) {
        const position = new THREE.Vector3(...node.position);
        points.set(node.id, position);

        const groupColor = groups[node.group].color;
        const geometry = new RoundedBoxGeometry(1.78, 0.74, 0.16, 4, 0.14);
        const material = new THREE.MeshStandardMaterial({
            color: groupColor,
            emissive: groupColor,
            emissiveIntensity: 0.2,
            metalness: 0.45,
            roughness: 0.24,
            transparent: true,
            opacity: 0.95,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.rotation.z = (Math.random() - 0.5) * 0.035;
        mesh.userData.node = node;
        mesh.userData.baseY = position.y;
        mesh.userData.phase = Math.random() * Math.PI * 2;
        mesh.userData.hovered = false;
        mesh.userData.selected = false;

        const border = new THREE.LineSegments(
            new THREE.EdgesGeometry(geometry, 18),
            new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.16,
            }),
        );
        mesh.add(border);

        const glow = new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: glowTextures.get(node.group),
                color: 0xffffff,
                transparent: true,
                opacity: 0.32,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
            }),
        );
        glow.scale.set(2.35, 2.35, 1);
        glow.position.z = -0.12;
        mesh.add(glow);

        mesh.add(makeLabel(node));

        world.add(mesh);
        nodeMeshes.push(mesh);
    }

    for (const [from, to] of edges) {
        const start = points.get(from);
        const end = points.get(to);

        if (!start || !end) {
            continue;
        }

        const curve = curveBetween(start, end);
        const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(curve.getPoints(28)),
            new THREE.LineBasicMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: 0.18,
                blending: THREE.AdditiveBlending,
            }),
        );
        world.add(line);
    }

    const flowPoints = flow
        .map((id) => points.get(id))
        .filter(Boolean);

    const flowCurve = flowPoints.length > 1
        ? new THREE.CatmullRomCurve3(flowPoints)
        : null;

    const flowParticles = [];

    if (flowCurve) {
        for (let i = 0; i < 4; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(i === 0 ? 0.075 : 0.045, 12, 12),
                new THREE.MeshBasicMaterial({
                    color: i === 0 ? 0x67e8f9 : 0x38bdf8,
                    transparent: true,
                    opacity: i === 0 ? 0.95 : 0.55,
                    blending: THREE.AdditiveBlending,
                }),
            );
            particle.userData.offset = i * 0.16 + 0.12;
            particle.userData.progress = 0;
            flowParticles.push(particle);
            world.add(particle);
        }
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = null;
    let hovered = null;
    let selected = null;

    const resize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
    };

    const selectNode = (node) => {
        panel.replaceChildren();

        const close = document.createElement('button');
        close.type = 'button';
        close.className = 'panel-close';
        close.setAttribute('aria-label', '关闭');
        close.textContent = '×';
        close.addEventListener('click', () => {
            panel.hidden = true;

            if (selected) {
                selected.userData.selected = false;
                selected = null;
            }
        });

        const group = document.createElement('span');
        group.className = 'panel-group';
        group.textContent = groups[node.group].label;

        const title = document.createElement('h2');
        title.textContent = node.label;

        const summary = document.createElement('p');
        summary.textContent = node.summary;

        const link = document.createElement('a');
        link.href = node.docs;
        link.textContent = '查看文档 →';

        panel.append(close, group, title, summary, link);
        panel.hidden = false;

        if (onSelect) {
            onSelect(node, panel);
        }
    };

    const raycast = (event) => {
        const bounds = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);

        return raycaster.intersectObjects(nodeMeshes, false)[0]?.object ?? null;
    };

    const handlePointerMove = (event) => {
        const mesh = raycast(event);

        if (hovered === mesh) {
            return;
        }

        if (hovered) {
            hovered.userData.hovered = false;
        }

        hovered = mesh;

        if (hovered) {
            hovered.userData.hovered = true;
        }

        canvas.style.cursor = hovered ? 'pointer' : 'grab';
    };

    const handlePointerDown = (event) => {
        pointerDown = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event) => {
        if (!pointerDown) {
            return;
        }

        const distance = Math.hypot(
            event.clientX - pointerDown.x,
            event.clientY - pointerDown.y,
        );
        pointerDown = null;

        if (distance >= 6) {
            return;
        }

        const mesh = raycast(event);

        if (!mesh) {
            panel.hidden = true;

            if (selected) {
                selected.userData.selected = false;
                selected = null;
            }

            return;
        }

        if (selected) {
            selected.userData.selected = false;
        }

        selected = mesh;
        selected.userData.selected = true;
        selectNode(mesh.userData.node);
    };

    const handlePointerLeave = () => {
        if (hovered) {
            hovered.userData.hovered = false;
            hovered = null;
        }

        canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    let visible = true;
    let frameId = null;
    let elapsed = 0;

    const render = () => {
        if (!visible) {
            return;
        }

        frameId = requestAnimationFrame(render);

        const delta = Math.min(clock.getDelta(), 0.05);
        elapsed += delta;

        for (const particle of particleFields) {
            if (!reducedMotion) {
                particle.rotation.y += delta * 0.012;
                particle.rotation.x += delta * 0.004;
            }
        }

        for (const mesh of nodeMeshes) {
            const targetScale = mesh.userData.selected
                ? 1.12
                : (mesh.userData.hovered ? 1.06 : 1);
            const currentScale = mesh.scale.x;
            const nextScale = currentScale + (targetScale - currentScale) * Math.min(1, delta * 8);
            mesh.scale.setScalar(nextScale);

            const targetIntensity = mesh.userData.selected
                ? 0.55
                : (mesh.userData.hovered ? 0.38 : 0.2);
            const material = mesh.material;
            material.emissiveIntensity += (targetIntensity - material.emissiveIntensity) * Math.min(1, delta * 8);

            if (!reducedMotion) {
                mesh.position.y = mesh.userData.baseY
                    + Math.sin(elapsed * 1.1 + mesh.userData.phase) * 0.035;
                mesh.rotation.y = Math.sin(elapsed * 0.45 + mesh.userData.phase) * 0.035;
            }
        }

        if (flowCurve && !reducedMotion) {
            for (const particle of flowParticles) {
                const progress = (elapsed * 0.13 + particle.userData.offset) % 1;
                particle.position.copy(flowCurve.getPointAt(progress));
            }
        }

        controls.update();
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
    };

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
        destroy() {
            api.pause();
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('pointermove', handlePointerMove);
            canvas.removeEventListener('pointerdown', handlePointerDown);
            canvas.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('pointerleave', handlePointerLeave);
            controls.dispose();
            renderer.dispose();
            labelRenderer.domElement.remove();
        },
    };

    render();

    return api;
}
