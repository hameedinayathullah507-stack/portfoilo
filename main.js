import * as THREE from 'three';

// --- Global Mouse Tracking for CSS Variables ---
const updateMousePosition = (e) => {
  const { clientX, clientY } = e;
  
  // Update mouse glow
  document.documentElement.style.setProperty('--mouse-x', `${clientX}px`);
  document.documentElement.style.setProperty('--mouse-y', `${clientY}px`);
  
  // Update individual glass cards for their local hover effect
  document.querySelectorAll('.glass-card').forEach(card => {
    const rect = card.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
};

window.addEventListener('mousemove', updateMousePosition);

// --- Magnetic Buttons ---
const magneticBtns = document.querySelectorAll('.magnetic-btn');
magneticBtns.forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Move the button slightly towards the cursor
    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0px, 0px)';
  });
});

// --- Tilt Effect for Cards ---
const tiltCards = document.querySelectorAll('.tilt-card');
tiltCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -5; // Max 5 deg
    const rotateY = ((x - centerX) / centerX) * 5;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  });
});

// --- Scroll Reveal ---
const revealElements = document.querySelectorAll('.reveal');

const revealCallback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      // Optional: stop observing once revealed
      // observer.unobserve(entry.target);
    }
  });
};

const revealObserver = new IntersectionObserver(revealCallback, {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// Make hero active immediately
setTimeout(() => {
  document.querySelector('.hero-section').classList.add('active');
}, 100);

// --- Navbar Scroll Effect ---
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// --- Typing Effect ---
const roleText = "Frontend Developer";
const typingEl = document.querySelector('.typing-text');
let typeIndex = 0;

function typeWriter() {
  if (typingEl && typeIndex < roleText.length) {
    typingEl.innerHTML += roleText.charAt(typeIndex);
    typeIndex++;
    setTimeout(typeWriter, 50);
  }
}
setTimeout(typeWriter, 1000);


// --- Three.js Futuristic Background ---
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
  opacity: 0.5,
  wireframe: true
});

// Create abstract geometries representing sections
const geometries = [
  new THREE.IcosahedronGeometry(1.5, 0),       // Hero
  new THREE.TorusGeometry(1.5, 0.4, 16, 100),   // About
  new THREE.OctahedronGeometry(1.5, 0),        // Skills
  new THREE.SphereGeometry(1.5, 32, 32),       // Projects
  new THREE.TorusKnotGeometry(1.2, 0.4, 100, 16), // AI Projects
  new THREE.DodecahedronGeometry(1.5, 0),      // Experience
  new THREE.RingGeometry(1, 1.5, 32)            // Contact
];

geometries.forEach((geom, index) => {
  const mesh = new THREE.Mesh(geom, material);
  
  // Spread objects vertically down the scene
  const yPos = index * -15;
  const xPos = index % 2 === 0 ? 4 : -4; // Alternate sides
  
  mesh.position.set(xPos, yPos, 0);
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

window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  const totalHeight = document.body.scrollHeight - window.innerHeight;
  const scrollProgress = scrollY / totalHeight;
  
  // Calculate target camera position (moving down the Y axis)
  // 7 sections * -15 units each = ~ -90 units total travel
  const targetY = scrollProgress * -90;
  
  // Smoothly move camera
  camera.position.y = targetY;
  
  // Add subtle tilt to camera based on scroll
  camera.rotation.x = scrollProgress * -0.2;
});

// Mouse interaction for camera parallax
let mouseX = 0;
let mouseY = 0;

window.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Rotate particles
  particlesMesh.rotation.y = elapsedTime * 0.05;
  particlesMesh.rotation.x = elapsedTime * 0.02;

  // Smooth camera parallax based on mouse
  const targetCamX = mouseX * 2;
  const targetCamZ = 10 + mouseY * 2;
  
  camera.position.x += (targetCamX - camera.position.x) * 0.05;
  camera.position.z += (targetCamZ - camera.position.z) * 0.05;

  // Antigravity floating for objects
  objects.forEach(obj => {
    obj.mesh.rotation.x += obj.randomSpeed;
    obj.mesh.rotation.y += obj.randomSpeed;
    
    // Sine wave float
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

