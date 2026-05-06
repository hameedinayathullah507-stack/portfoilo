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
scene.fog = new THREE.FogExp2(0x05050a, 0.02);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// 1. Grid Helper Floor
const gridHelper = new THREE.GridHelper(100, 50, 0x06b6d4, 0x8b5cf6);
gridHelper.position.y = -5;
gridHelper.material.opacity = 0.2;
gridHelper.material.transparent = true;
scene.add(gridHelper);

// 2. Floating Particles Field
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
  // Spread particles in a wide area
  posArray[i] = (Math.random() - 0.5) * 100;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.05,
  color: 0x06b6d4,
  transparent: true,
  opacity: 0.6,
  blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Mouse interaction for camera parallax
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

window.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Scroll interaction for camera
let scrollY = window.scrollY;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const elapsedTime = clock.getElapsedTime();

  // Rotate particles slowly
  particlesMesh.rotation.y = elapsedTime * 0.05;
  particlesMesh.rotation.x = elapsedTime * 0.02;

  // Move grid backwards to simulate moving forward
  gridHelper.position.z = (elapsedTime * 2) % 2;

  // Smooth camera parallax based on mouse
  targetX = mouseX * 2;
  targetY = mouseY * 2 + 5; // Base height of 5
  
  camera.position.x += (targetX - camera.position.x) * 0.05;
  camera.position.y += (targetY - camera.position.y) * 0.05;

  // Camera scroll effect (move camera down/forward slightly on scroll)
  const scrollProgress = scrollY / (document.body.scrollHeight - window.innerHeight);
  camera.position.z = 20 - (scrollProgress * 10);
  
  camera.lookAt(0, 0, 0);

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
