import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Water } from 'three/examples/jsm/objects/Water.js';

const gameData = {
  ArrowUp: false,
  ArrowLeft: false,
  ArrowRight: false,
  ArrowDown: false,
  MouseXRel: Math.PI,
  CurrentDir: Math.PI,
  BoatDir: Math.PI,
  BoatVelocity: 0,
  MaxVelocity: 0.5,
  TurnVelocity: 0,
  MaxTurnVelocity: 0.05,
  TurnAcceleration: 0.001,
  TurnDecceleration: 0.05,
  Acceleration: 0.001,
  Decceleration: 0.01,
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

const gltfLoader = new GLTFLoader();
let boatModel;
let islandModel;
gltfLoader.load('/models/Sailboat.glb', (gltf) => {
  boatModel = gltf.scene;
  boatModel.rotation.y = gameData.BoatDir;
  scene.add(boatModel);
  camera.lookAt(boatModel.position);
});

gltfLoader.load('/models/Island.glb', (gltf) => {
  islandModel = gltf.scene;
  islandModel.position.z = 5;
  islandModel.position.x = 10;
  islandModel.scale.set(2, 2, 2);
  scene.add(islandModel);
});

const keyLight = new THREE.DirectionalLight(0xfffbd4, 1.5);
keyLight.position.set(-0.5, 1, -0.5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xfffbd4, 1);
fillLight.position.set(1, 1, 0);
scene.add(fillLight);

const ambientLight = new THREE.AmbientLight(0xfffbd4, 1); // soft white light
scene.add(ambientLight);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

const water = new Water(waterGeometry, {
  textureWidth: 512,
  textureHeight: 512,
  waterNormals: new THREE.TextureLoader().load(
    'textures/waternormals.jpg',
    function (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    }
  ),
  sunDirection: new THREE.Vector3(),
  sunColor: 0xffffff,
  waterColor: 0x001e0f,
  distortionScale: 6,
  fog: scene.fog !== undefined,
});

water.rotation.x = -Math.PI * 0.5;
water.position.y = 0.25;

scene.add(water);

/**
 * Animate
 */
const clock = new THREE.Clock();
const tick = () => {
  let delta = clock.getDelta();
  gameData.CurrentDir += (gameData.MouseXRel - gameData.CurrentDir) * delta * 2;
  water.material.uniforms['time'].value += 1.0 / 120.0;

  if (gameData.ArrowLeft && gameData.TurnVelocity < gameData.MaxTurnVelocity) {
    gameData.TurnVelocity += gameData.TurnAcceleration;
  } else if (
    gameData.ArrowRight &&
    gameData.TurnVelocity > -gameData.MaxTurnVelocity
  ) {
    gameData.TurnVelocity -= gameData.TurnAcceleration;
  } else if (gameData.TurnVelocity > 0) {
    gameData.TurnVelocity -= gameData.TurnVelocity * gameData.TurnDecceleration;
  } else if (gameData.TurnVelocity < 0) {
    gameData.TurnVelocity -= gameData.TurnVelocity * gameData.TurnDecceleration;
  }

  if (gameData.ArrowUp && gameData.BoatVelocity < gameData.MaxVelocity) {
    gameData.BoatVelocity += gameData.Acceleration;
  } else if (gameData.BoatVelocity > 0) {
    gameData.BoatVelocity -= gameData.BoatVelocity * gameData.Decceleration;
  }

  if (boatModel) {
    // Move camera to position
    camera.position.x =
      boatModel.position.x + Math.sin(gameData.CurrentDir) * cameraOrbit;
    camera.position.z =
      boatModel.position.z + Math.cos(gameData.CurrentDir) * cameraOrbit;
    // Move boat forward
    boatModel.position.z -= gameData.BoatVelocity * Math.cos(gameData.BoatDir);
    boatModel.position.x -= gameData.BoatVelocity * Math.sin(gameData.BoatDir);

    boatModel.position.y = Math.sin(clock.elapsedTime) * 0.1;
    gameData.BoatDir += gameData.TurnVelocity;
    boatModel.rotation.y = gameData.BoatDir;
    boatModel.rotation.z = Math.cos(clock.elapsedTime) * 0.1;
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
  gameData.MouseXRel = distToMid * (Math.PI / 1) + Math.PI;
});

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'w':
    case 'ArrowUp':
      gameData.ArrowUp = true;
      break;
    case 'a':
    case 'ArrowLeft':
      gameData.ArrowLeft = true;
      break;
    case 'd':
    case 'ArrowRight':
      gameData.ArrowRight = true;
      break;
    case 's':
    case 'ArrowDown':
      gameData.ArrowDown = true;
      break;
    default:
      break;
  }
});

window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
    case 'ArrowUp':
      gameData.ArrowUp = false;
      break;
    case 'a':
    case 'ArrowLeft':
      gameData.ArrowLeft = false;
      break;
    case 'd':
    case 'ArrowRight':
      gameData.ArrowRight = false;
      break;
    case 's':
    case 'ArrowDown':
      gameData.ArrowDown = false;
      break;
    default:
      break;
  }
});
