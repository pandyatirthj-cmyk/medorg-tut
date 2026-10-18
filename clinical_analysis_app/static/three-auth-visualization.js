
import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

const canvas = document.createElement("canvas");
canvas.id = "three-auth-background";
document.body.prepend(canvas);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.z = 12;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);

const group = new THREE.Group();
scene.add(group);

// Purple medical-tech particles
const particleCount = 150;
const positions = [];
const particles = [];

for (let i = 0; i < particleCount; i++) {
    const point = new THREE.Vector3(
        (Math.random() - 0.5) * 24,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10
    );

    particles.push(point);
    positions.push(point.x, point.y, point.z);
}

const particleGeometry = new THREE.BufferGeometry();

particleGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
);

const particleMaterial = new THREE.PointsMaterial({
    color: 0x8b5cf6,
    size: 0.075,
    transparent: true,
    opacity: 0.85,
    depthWrite: false
});

const particleCloud = new THREE.Points(
    particleGeometry,
    particleMaterial
);

group.add(particleCloud);

// Connect nearby particles with violet lines
const linePositions = [];

for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
        if (particles[i].distanceTo(particles[j]) < 2.3) {
            linePositions.push(
                particles[i].x,
                particles[i].y,
                particles[i].z,
                particles[j].x,
                particles[j].y,
                particles[j].z
            );
        }
    }
}

const lineGeometry = new THREE.BufferGeometry();

lineGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3)
);

const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xa78bfa,
    transparent: true,
    opacity: 0.22,
    depthWrite: false
});

const network = new THREE.LineSegments(
    lineGeometry,
    lineMaterial
);

group.add(network);

// Soft purple glow effect using transparent circles
function createGlow(color, opacity, size, x, y, z) {
    const glowGeometry = new THREE.CircleGeometry(size, 48);

    const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        depthWrite: false
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.position.set(x, y, z);
    scene.add(glow);

    return glow;
}

const glowOne = createGlow(0x8b5cf6, 0.055, 3.2, -5, 2, -4);
const glowTwo = createGlow(0x6d28d9, 0.045, 2.5, 5, -2, -3);

// Mouse movement interaction
let targetX = 0;
let targetY = 0;

window.addEventListener("pointermove", (event) => {
    targetX = (event.clientX / window.innerWidth - 0.5) * 0.35;
    targetY = (event.clientY / window.innerHeight - 0.5) * 0.25;
});

// Responsive resizing
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Respect reduced-motion preferences
const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

function animate() {
    requestAnimationFrame(animate);

    if (!reduceMotion) {
        group.rotation.y += 0.0005;
        group.rotation.x += 0.0002;

        group.rotation.y +=
            (targetX - group.rotation.y) * 0.002;

        group.rotation.x +=
            (targetY - group.rotation.x) * 0.002;

        particleCloud.rotation.z += 0.00015;
    }

    renderer.render(scene, camera);
}

animate();