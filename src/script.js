import * as THREE from "three";
import GUI from "lil-gui";
import gsap from "gsap";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Debug
 */
const gui = new GUI();

const parameters = {
  materialColor: "#ffeded",
};

gui.addColor(parameters, "materialColor").onChange(() => {
  material.color.set(parameters.materialColor);
  particlesMaterial.color.set(parameters.materialColor);
});

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
// Texture
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

// Material
const material1 = new THREE.MeshToonMaterial({
  color: "#E4572E",
  gradientMap: gradientTexture,
});
const material2 = new THREE.MeshToonMaterial({
  color: "#17BEBB",
  gradientMap: gradientTexture,
});
const material3 = new THREE.MeshToonMaterial({
  color: "#FFC914",
  gradientMap: gradientTexture,
});
const material4 = new THREE.MeshToonMaterial({
  color: "#76B041",
  gradientMap: gradientTexture,
});

// Models
let bally;
const gltfloader = new GLTFLoader();
gltfloader.load("models/bally/Bally_Male.glb", (gltf) => {
  bally = gltf.scene;
  bally.position.x = 1;
  bally.scale.set(0.1, 0.1, 0.1);
  scene.add(bally);
});

let planet;
gltfloader.load("models/planet/planet.glb", (gltf) => {
  planet = gltf.scene;
  planet.position.set(0, 1, -3);
  planet.scale.set(0.03, 0.03, 0.03);
  console.log(planet);
  scene.add(planet);
});

// Objects
const objectsDistance = 4;
const mesh1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 36, 50, 60),

  material1
);
const mesh2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.3, 36, 50, 60),
  material2
);
const mesh3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.2, 36, 50, 60),
  material3
);
const mesh4 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 36, 50, 60),
  material4
);

mesh1.position.x = 2;
mesh2.position.x = 0;
mesh3.position.x = -2;
mesh4.position.x = -2.5;

mesh1.position.y = -objectsDistance * 0;
mesh2.position.y = 1;
mesh3.position.y = 0.5;
mesh4.position.y = -0.5;

/* scene.add(mesh1, mesh2, mesh3, mesh4); */

const sectionMeshes = [mesh1, mesh2, mesh3, mesh4];

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
directionalLight.position.set(0.5, 1, 1);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(directionalLight, ambientLight);

/**
 * Particles
 */
// Geometry
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 10);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectsDistance * 0.5 -
    Math.random() * objectsDistance * sectionMeshes.length;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

// Material
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Scroll
 */
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);

  if (newSection != currentSection) {
    currentSection = newSection;

    gsap.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: "power2.inOut",
      x: "+=6",
      y: "+=3",
      z: "+=1.5",
    });
  }
});

/**
 * Cursor
 */
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  //Planet
  if (planet) {
    planet.rotation.y += 0.001;
    planet.rotation.x += 0.002;
  }
  //Animate Bally
  if (bally) {
    // Adjust rotation more gradually
    if (bally) {
      // Adjust rotation
      bally.rotation.y += 0.005 * Math.random();
      bally.rotation.x += 0.005 * Math.random();

      bally.position.set(
        Math.sin(elapsedTime * 0.1) * 2,
        Math.cos(elapsedTime * 0.1) * 1.5,
        Math.tan(elapsedTime * 0.1) * 1.5
      );
    }
  }

  // Animate camera
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = -cursor.y * 0.5;
  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Animate meshes
  mesh1.rotation.x += 0.005 * Math.random();
  mesh1.rotation.y += 0.005 * Math.random();
  mesh1.rotation.z += 0.005 * Math.random();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
