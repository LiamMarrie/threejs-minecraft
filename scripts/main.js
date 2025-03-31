import * as THREE from "three"; // threeJS library

//fps counter
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { World } from "./world";
import { createUI } from "./ui";

const stats = new Stats();
document.body.append(stats.dom);

// render setup
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x80a0e0);

document.body.appendChild(renderer.domElement);

// camera setup
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight
);
camera.position.set(-32, 16, -32);

// orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(16, 16, 16);
controls.update();

// scene setup
const scene = new THREE.Scene();
const world = new World();
world.generate();
scene.add(world);

//lighting
function setupLights() {
  const light1 = new THREE.DirectionalLight(); // functions like sun all objects get light
  light1.position.set(1, 1, 1);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight();
  light2.position.set(-1, 1, -0.5);
  scene.add(light2);

  const ambient = new THREE.AmbientLight(); // gives some light to objects not being hit by the "sun"
  ambient.intensity = 0.1;
  scene.add(ambient);
}

// render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  stats.update(); // display fps counter
}

// handle window resizing
window.addEventListener("resize", () => {
  //update camera aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix(); // call func
  renderer.setSize(window.innerWidth, window.innerHeight); // set window new size
});

setupLights();
createUI(world);
animate();
