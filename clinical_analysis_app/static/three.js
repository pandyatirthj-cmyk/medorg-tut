
import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

const canvas = document.createElement("canvas");    
canvas.id = "three-background-canvas";
document.body.prepend(canvas);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.z = 12;

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);

const group = new THREE.Group();
scene.add(group);

// Floating purple and violet particles
const particleCount = 100;
const positions = [];
const particles = [];

for (let i = 0; i < particleCount; i++) {
    const point = new THREE.Vector3(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 8
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
    color: 0x9b7aff,
    size: 0.07,
    transparent: true,
    opacity: 0.8
});

const particleCloud = new THREE.Points(
    particleGeometry,
    particleMaterial
);
group.add(particleCloud);

// Connect nearby particles
const linePositions = [];

for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
        if (particles[i].distanceTo(particles[j]) < 2.2) {
            linePositions.push(
                particles[i].x, particles[i].y, particles[i].z,
                particles[j].x, particles[j].y, particles[j].z
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
    color: 0x9b7aff,
    transparent: true,
    opacity: 0.17
});

group.add(new THREE.LineSegments(lineGeometry, lineMaterial));

// Mouse movement interaction
let targetX = 0;
let targetY = 0;

window.addEventListener("pointermove", event => {
    targetX = (event.clientX / window.innerWidth - 0.5) * 0.35;
    targetY = (event.clientY / window.innerHeight - 0.5) * 0.25;
});

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

function animate() {
    requestAnimationFrame(animate);

    if (!reduceMotion) {
        group.rotation.y += 0.0008;
        group.rotation.x += 0.0003;
        group.rotation.y += targetX * 0.002;
        group.rotation.x += targetY * 0.002;
    }

    renderer.render(scene, camera);
}

animate();