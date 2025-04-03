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
  constructor(scene) {
    this.camera = new THREE.PerspectiveCamera(
      75, // Match the main camera's FOV
      window.innerWidth / window.innerHeight, // Correct aspect ratio
      0.1,
      200
    );

    this.controls = new PointerLockControls(this.camera, document.body);
    this.camera.position.set(32, 16, 32);
    scene.add(this.camera);

    // Handle window resizing
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
    });
  }

  /**
   * returns the curr world position of player
   * @type {THREE.Vector3}
   */
  get position() {
    return this.camera.position;
  }
}
