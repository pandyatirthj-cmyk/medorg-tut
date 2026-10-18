
import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js";

const container = document.getElementById("three-visualization");

if (!container) {
    console.error(
        "Three.js: #three-visualization container was not found."
    );
} else {
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / Math.max(container.clientHeight, 1),
        0.1,
        100
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );

    container.appendChild(renderer.domElement);

    // Purple 3D wireframe object
    const geometry = new THREE.IcosahedronGeometry(1.25, 1);

    const material = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        wireframe: true
    });

    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));

    const light = new THREE.PointLight(0xffffff, 30);
    light.position.set(3, 3, 5);
    scene.add(light);

    // Subtle purple particles
    const particleGeometry = new THREE.BufferGeometry();
    const positions = [];

    for (let i = 0; i < 100; i++) {
        positions.push(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 3
        );
    }

    particleGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
        color: 0xa78bfa,
        size: 0.045,
        transparent: true,
        opacity: 0.8
    });

    const particles = new THREE.Points(
        particleGeometry,
        particleMaterial
    );

    scene.add(particles);

    let animationId;

    function animate() {
        animationId = requestAnimationFrame(animate);

        shape.rotation.x += 0.003;
        shape.rotation.y += 0.006;

        particles.rotation.y += 0.0005;

        renderer.render(scene, camera);
    }

    animate();

    // Resize visualization when its container changes size
    const resizeObserver = new ResizeObserver(() => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        if (width <= 0 || height <= 0) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    });

    resizeObserver.observe(container);

    // Clean up when the page is unloaded
    window.addEventListener("pagehide", () => {
        cancelAnimationFrame(animationId);
        resizeObserver.disconnect();
        geometry.dispose();
        material.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
        renderer.dispose();
    }, { once: true });
}