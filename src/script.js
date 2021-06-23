import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Vector3 } from 'three';

const gameData = {
  ArrowUp: false,
  ArrowLeft: false,
  ArrowRight: false,
  ArrowDown: false,
  MouseXRel: Math.PI,
  CurrentDir: Math.PI,
};

const cameraOrbit = 8;

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fa0ff);

// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);

camera.position.set(0, 2, cameraOrbit);
scene.add(camera);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshBasicMaterial({ color: 0x4057c2 })
);
ground.rotation.x = -Math.PI * 0.5;
ground.position.y = 0.25;
scene.add(ground);

const gltfLoader = new GLTFLoader();
let boatModel;
gltfLoader.load('/models/Sailboat.glb', (gltf) => {
  // scene.add(gltf.scene.children[0])
  console.log(gltf);
  boatModel = gltf.scene;
  boatModel.rotation.y = Math.PI;
  // boatModel.position.x = 0;
  // boatModel.position.y = 0;
  // boatModel.position.z = 0;
  scene.add(boatModel);
  camera.lookAt(boatModel.position);
});

const keyLight = new THREE.DirectionalLight(0xffffff, 2);
keyLight.position.set(-0.5, 1, -0.5);
scene.add(keyLight);

const ambientLight = new THREE.AmbientLight(0x404040, 4); // soft white light
scene.add(ambientLight);

// const fillLight = new THREE.DirectionalLight(0xffffff, 1);
// fillLight.position.set(-0.5, -1, -0.5);
// scene.add(fillLight);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
const tick = () => {
  gameData.CurrentDir = (gameData.CurrentDir + gameData.MouseXRel) / 2;
  camera.position.x = Math.sin(gameData.CurrentDir) * cameraOrbit;
  camera.position.z = Math.cos(gameData.CurrentDir) * cameraOrbit;
  if (boatModel) {
    camera.lookAt(boatModel.position);
  }
  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

window.addEventListener('resize', () => {
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

window.addEventListener('mousemove', (e) => {
  const halfWidth = window.innerWidth / 2;
  const distToMid = (e.clientX - halfWidth) / halfWidth;
  gameData.MouseXRel = distToMid * (Math.PI / 2) + Math.PI;
});

window.addEventListener('keydown', (e) => {
  gameData[e.key] = true;
});

window.addEventListener('keyup', (e) => {
  gameData[e.key] = false;
});
