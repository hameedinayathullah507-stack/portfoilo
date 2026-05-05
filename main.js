import * as THREE from 'three';
import { gsap } from 'gsap';

// --- Scene Setup ---
const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030308, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 10);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// --- Particles (Stars / Dust) ---
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
  // Spread particles in a wide area
  posArray[i] = (Math.random() - 0.5) * 100;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.05,
  color: 0x00f0ff,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// --- Floating 3D Objects ---
const objects = [];
const material = new THREE.MeshPhysicalMaterial({
  color: 0xb000ff,
  metalness: 0.5,
  roughness: 0.1,
  clearcoat: 1.0,
  transparent: true,
  opacity: 0.7,
  wireframe: true
});

// Create abstract geometries representing sections
const geometries = [
  new THREE.IcosahedronGeometry(1.5, 0), // About
  new THREE.TorusGeometry(1.5, 0.4, 16, 100), // Journey
  new THREE.OctahedronGeometry(1.5, 0), // Projects
  new THREE.SphereGeometry(1.5, 32, 32) // Contact
];

geometries.forEach((geom, index) => {
  const mesh = new THREE.Mesh(geom, material);
  
  // Position them down the Y-axis to match scroll sections
  // Section 0 is at Y=0, Section 1 is at Y=-15, etc.
  const yPos = index * -15;
  const xPos = index % 2 === 0 ? 3 : -3; // Alternate sides
  
  mesh.position.set(xPos, yPos, 0);
  
  // Random initial rotation
  mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  
  scene.add(mesh);
  objects.push({
    mesh,
    baseY: yPos,
    randomSpeed: 0.005 + Math.random() * 0.01
  });
});

// Add Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00f0ff, 2, 50);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// --- Scroll & Camera Logic ---
let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  const totalHeight = document.body.scrollHeight - window.innerHeight;
  const scrollProgress = scrollY / totalHeight;
  
  // Update current section index roughly (4 sections)
  currentSection = Math.round(scrollProgress * 3);
  
  // Calculate target camera position
  // 1 section height in HTML corresponds to ~ -15 units in 3D Y-axis
  // The total 3D distance is roughly -45 units
  const targetY = scrollProgress * -45;
  
  // Smoothly move camera using GSAP
  gsap.to(camera.position, {
    y: targetY,
    duration: 1,
    ease: "power2.out"
  });
  
  // Rotate camera slightly based on scroll
  gsap.to(camera.rotation, {
    x: scrollProgress * -0.2,
    y: Math.sin(scrollProgress * Math.PI) * 0.2,
    duration: 1.5,
    ease: "power1.out"
  });

  // --- Hero Section DOM Animation ---
  // Calculates progress for the first 80vh of scrolling
  const heroProgress = Math.min(scrollY / (window.innerHeight * 0.8), 1);
  const heroContent = document.querySelector('.hero-content');
  const heroImage = document.querySelector('.hero-image-container');
  const heroText = document.querySelector('.hero-text');
  
  if (heroContent) {
    gsap.to(heroContent, {
      scale: 1 - (heroProgress * 0.1),
      duration: 0.5,
      overwrite: "auto"
    });
  }
  
  if (heroImage) {
    gsap.to(heroImage, {
      scale: 1 - (heroProgress * 0.2),
      opacity: 1 - (heroProgress * 1.2),
      duration: 0.5,
      overwrite: "auto"
    });
  }

  if (heroText) {
    gsap.to(heroText, {
      y: -50 * heroProgress,
      opacity: 1 - (heroProgress * 1.5),
      duration: 0.5,
      overwrite: "auto"
    });
  }
});

// --- Mouse Interaction ---
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Slowly rotate particle system
  particlesMesh.rotation.y = elapsedTime * 0.05;
  particlesMesh.rotation.x = elapsedTime * 0.02;

  // Parallax effect on camera from mouse
  gsap.to(camera.position, {
    x: mouseX * 0.5,
    z: 10 + mouseY * 0.5,
    duration: 2,
    ease: "power2.out",
    overwrite: "auto"
  });

  // Antigravity floating for objects
  objects.forEach(obj => {
    // Rotation
    obj.mesh.rotation.x += obj.randomSpeed;
    obj.mesh.rotation.y += obj.randomSpeed;
    
    // Floating up and down using Sine wave
    obj.mesh.position.y = obj.baseY + Math.sin(elapsedTime * 2 + obj.baseY) * 0.5;
  });

  renderer.render(scene, camera);
}

// Handle Window Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start loop
animate();

// --- Hero Section Animations ---
// Initial Reveal
gsap.fromTo('.hero-name', 
  { y: 50, opacity: 0 }, 
  { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 }
);

gsap.fromTo(['.hero-tagline', '.skills', '.hero-buttons', '.scroll-indicator'], 
  { y: 20, opacity: 0 }, 
  { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 2 }
);

// Typing Effect
const roleText = "Frontend Developer | Python Full Stack Learner";
const typingEl = document.querySelector('.typing-text');
let typeIndex = 0;

function typeWriter() {
  if (typingEl && typeIndex < roleText.length) {
    typingEl.innerHTML += roleText.charAt(typeIndex);
    typeIndex++;
    setTimeout(typeWriter, 50);
  }
}

setTimeout(typeWriter, 1000); // start after name reveals
