import * as THREE from "three";
import { Camera } from "../../player/camera.js";
import { Player } from "../player.js";
import { OnKeyDown, OnKeyUp } from "../player.js";

// setup listener
const listener = new THREE.AudioListener();
Camera.add(listener);

// load a sound and set it as the Audio object's buffer
const walking = new THREE.AudioLoader();
walking.load("../public/sfx/grass1.fsb", function (buffer) {
  listener.setBuffer(buffer);
  listener.setLoop(true);
  listener.setVolume(0.5);
  listener.play();
  listener.onKeyDown(onKeyDown);
});
