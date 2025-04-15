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
  radius = 0.5;
  height = 1.75;
  maxSpeed = 5;

  jumpSpeed = 10;
  onGround = false;

  input = new THREE.Vector3(); // store direction player should move based on key input
  velocity = new THREE.Vector3();
  #worldVelocity = new THREE.Vector3();

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

    this.cameraHelper = new THREE.CameraHelper(this.camera);
    scene.add(this.cameraHelper);

    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));

    // wireframe mesh visual for player bounding cylinder AKA steve in the future at some point idk???
    this.boundsHelper = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16),
      new THREE.MeshBasicMaterial({ wireframe: true })
    );
    scene.add(this.boundsHelper);

    // Handle window resizing
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  /**
   *
   * returns the velo of the player in the world coordinates
   *
   * @returns {THREE.Vector3}
   *
   */
  get worldVelocity() {
    this.#worldVelocity.copy(this.velocity);
    this.#worldVelocity.applyEuler(
      new THREE.Euler(0, this.camera.rotation.y, 0)
    );
    return this.#worldVelocity;
  }

  /**
   * applies a change in velo 'dv' that is specified in the world frame
   *
   * @param {THREE.Vector3} dv
   */
  applyWorldDeltaVelocity(dv) {
    dv.applyEuler(new THREE.Euler(0, -this.camera.rotation.y, 0));
    this.velocity.add(dv);
  }

  applyInputs(dt) {
    if (this.controls.isLocked) {
      this.velocity.x = this.input.x;
      this.velocity.z = this.input.z;
      this.controls.moveRight(this.velocity.x * dt); // change in distance left or right
      this.controls.moveForward(this.velocity.z * dt); // forward or backward

      this.position.y += this.velocity.y * dt;
      //player position
      document.getElementById("player-position").innerHTML =
        this.playerPosition();
    }
  }

  /**
   * update the position of the players bounding cylinder to move with the game camera
   *
   */
  updateBoundsHelper() {
    this.boundsHelper.position.copy(this.position);
    this.boundsHelper.position.y -= this.height / 2;
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
      case "KeyR":
        if (this.repeat) break;
        this.position.set(32, 10, 32);
        this.velocity.set(0, 0, 0);
        break;
      case "Space":
        if (this.onGround) {
          this.velocity.y += this.jumpSpeed;
        }
        break;
    }
  }

  /**
   * event handler for keyup
   * @param {KeyboardEvent} event
   */
  onKeyUp(event) {
    switch (event.code) {
      case "Escape":
        if (event.repeat) break;
        if (this.controls.isLocked) {
          console.log("unlocking controls");
          this.controls.unlock();
        } else {
          console.log("locking controls");
          this.controls.lock();
        }
        break;
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
