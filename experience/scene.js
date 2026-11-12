import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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

function curveBetween(start, end) {
    const middle = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5);
    middle.z += 0.8;

    return new THREE.QuadraticBezierCurve3(start, middle, end);
}

export function startScene({ canvas, panel, fallback }) {
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
    controls.autoRotateSpeed = 0.35;

    const world = new THREE.Group();
    world.position.set(2.0, 0, 0);
    world.scale.setScalar(0.8);
    scene.add(world);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));

    const keyLight = new THREE.DirectionalLight(0xbae6fd, 2.8);
    keyLight.position.set(5, 8, 7);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x22d3ee, 1.4);
    rimLight.position.set(-6, -4, 3);
    scene.add(rimLight);

    const meshes = [];
    const points = new Map();

    for (const node of nodes) {
        const position = new THREE.Vector3(...node.position);
        points.set(node.id, position);

        const geometry = new THREE.BoxGeometry(1.75, 0.72, 0.2);
        const material = new THREE.MeshStandardMaterial({
            color: groups[node.group].color,
            emissive: groups[node.group].color,
            emissiveIntensity: 0.18,
            metalness: 0.35,
            roughness: 0.28,
            transparent: true,
            opacity: 0.94,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.rotation.z = (Math.random() - 0.5) * 0.05;
        mesh.userData.node = node;
        mesh.add(makeLabel(node));

        world.add(mesh);
        meshes.push(mesh);
    }

    for (const [from, to] of edges) {
        const start = points.get(from);
        const end = points.get(to);

        if (!start || !end) {
            continue;
        }

        const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(curveBetween(start, end).getPoints(24)),
            new THREE.LineBasicMaterial({
                color: 0x38bdf8,
                transparent: true,
                opacity: 0.22,
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

    const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 14, 14),
        new THREE.MeshBasicMaterial({ color: 0x67e8f9 }),
    );

    if (flowCurve) {
        world.add(particle);
    }

    let visible = true;
    let frameId = null;
    let flowProgress = 0;
    const clock = new THREE.Clock();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = null;

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
    };

    const pick = (event) => {
        const bounds = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(meshes, false)[0];

        if (!hit) {
            panel.hidden = true;

            return;
        }

        selectNode(hit.object.userData.node);
    };

    canvas.addEventListener('pointerdown', (event) => {
        pointerDown = { x: event.clientX, y: event.clientY };
    });

    canvas.addEventListener('pointerup', (event) => {
        if (!pointerDown) {
            return;
        }

        const distance = Math.hypot(
            event.clientX - pointerDown.x,
            event.clientY - pointerDown.y,
        );
        pointerDown = null;

        if (distance < 6) {
            pick(event);
        }
    });

    const render = () => {
        if (!visible) {
            return;
        }

        frameId = requestAnimationFrame(render);

        const delta = Math.min(clock.getDelta(), 0.05);

        if (!reducedMotion && flowCurve) {
            flowProgress = (flowProgress + delta * 0.16) % 1;
            particle.position.copy(flowCurve.getPointAt(flowProgress));
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
            controls.dispose();
            renderer.dispose();
            labelRenderer.domElement.remove();
        },
    };

    render();

    return api;
}
