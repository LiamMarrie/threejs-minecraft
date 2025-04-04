import * as THREE from "three"; // threeJS library

//fps counter
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { World } from "./world";
import { createUI } from "./ui";
import { createLandingScreen } from "./landing";
import audioManager from "./audio";
import { Player } from "./player.js";

let stats, renderer, camera, controls, scene, world, player;

function initGame(worldParams) {
  stats = new Stats();
  document.body.append(stats.dom);

  // render setup
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x80a0e0);

  document.body.appendChild(renderer.domElement);

  // camera setup
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight
  );
  camera.position.set(-32, 16, -32);

  // orbit controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(16, 16, 16);
  controls.update();

  // scene setup
  scene = new THREE.Scene();
  world = new World(worldParams?.size || { width: 64, height: 32 });

  // apply world parameters if provided
  if (worldParams) {
    if (worldParams.name) {
      world.name = worldParams.name;
    }

    if (worldParams.seed) {
      world.params.seed = worldParams.seed;
    }

    if (worldParams.terrain) {
      world.params.terrain = {
        ...world.params.terrain,
        ...worldParams.terrain,
      };
    }
  }

  // create world
  world.generate();
  scene.add(world);

  player = new Player(scene);

  setupLights();
  createUI(world);
  animate();

  // handle window resizing
  window.addEventListener("resize", () => {
    //update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // call func
    renderer.setSize(window.innerWidth, window.innerHeight); // set window new size
  });
}

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

/* to find change in time between frames 
    we get the time of the previous frame and compare to the time of the curr frame 
*/
let previousTime = performance.now();

// render loop
function animate() {
  let currentTime = performance.now();
  let dt = (currentTime - previousTime) / 1000; // dt needs to be in seconds not mil

  requestAnimationFrame(animate);
  player.applyInputs(dt);
  renderer.render(scene, player.camera);
  stats.update(); // display fps counter

  previousTime = currentTime;
}

// route from home
function removeLandingScreen() {
  const landingElement = document.getElementById("landing-screen");
  if (landingElement) {
    landingElement.remove();
  }
}

// init landing screen
createLandingScreen({
  onNewWorld: (worldData) => {
    // init game with world data
    initGame(worldData);
  },

  onLoadWorld: (worldData) => {
    // load game world
    initGame(worldData);
    if (worldData && worldData.params) {
      world.params = worldData.params;
      if (worldData.size) {
        world.size = worldData.size;
      }
      world.generate();
    }
  },
});
