import * as THREE from "three";

/**
 * POINTER LOCK API
 *
 * provides input methods based on the movements of the mouse over time.
 *
 * locks mouse events to a single element
 *
 * THREE.js PointerLockCOntrols
 */
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

export class Player {
  maxSpeed = 10;
  input = new THREE.Vector3(); // store direction player should move based on key input
  velocity = new THREE.Vector3();

  constructor(scene) {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );

    this.controls = new PointerLockControls(this.camera, document.body);
    this.camera.position.set(32, 16, 32);
    scene.add(this.camera);

    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));

    // Handle window resizing
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  applyInputs(dt) {
    if (this.controls.isLocked) {
      this.velocity.x = this.input.x;
      this.velocity.z = this.input.z;
      this.controls.moveRight(this.velocity.x * dt); // change in distance left or right
      this.controls.moveForward(this.velocity.z * dt); // forward or backward

      //player position
      document.getElementById("player-position").innerHTML =
        this.playerPosition();
    }
  }

  /**
   * returns the curr world position of player
   * @type {THREE.Vector3}
   */
  get position() {
    return this.camera.position;
  }

  /**
   * event handler for keydown
   * @param {KeyboardEvent} event
   */
  onKeyDown(event) {
    if (!this.controls.isLocked) {
      this.controls.lock();
      console.log();
    }

    switch (event.code) {
      case "KeyW":
        this.input.z = 0;
        break;
      case "KeyA":
        this.input.x = 0;
        break;
      case "KeyS":
        this.input.z = 0;
        break;
      case "KeyD":
        this.input.x = 0;
        break;
    }
  }

  /**
   * event handler for keyup
   * @param {KeyboardEvent} event
   */
  onKeyUp(event) {
    switch (event.code) {
      case "KeyW":
        this.input.z = this.maxSpeed;
        break;
      case "KeyA":
        this.input.x = -this.maxSpeed;
        break;
      case "KeyS":
        this.input.z = -this.maxSpeed;
        break;
      case "KeyD":
        this.input.x = this.maxSpeed;
        break;
    }
  }

  /**
   * returns player position in a readable string format
   */
  playerPosition() {
    let str = "";
    str += `X:${this.position.x.toFixed(3)} `;
    str += `Y:${this.position.y.toFixed(3)} `;
    str += `Z:${this.position.z.toFixed(3)} `;
    return str;
  }
}
