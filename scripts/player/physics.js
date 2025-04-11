import * as THREE from "three";
import { blocks } from "../world/blocks/blocks";

/**
 * Phases:
 *
 * 1. broad phase: filters down the list of blocks we are checking for collisions
 *  - find blocks near player
 *
 * 2. narrow phase: take broad phase blocks and check to see if any of them collide with the player if true
 *  - calc point of collision
 *  - find overlap between block and player
 *  - find collision normal
 *
 * 3. resolve collisions: taking all collisions form the narrow phase and process each of them one by one. for each collision:
 *  - adjust the position of the player
 *  - zero player velocity
 */

const collisionMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  transparent: true,
  opacity: 0.2,
});

const collisionGeometry = new THREE.BoxGeometry(1.001, 1.001, 1.001);

export class Physics {
  constructor(scene) {
    this.helpers = new THREE.Group();
    scene.add(this.helpers);
  }

  /**
   * METHODS
   */

  /**
   * moves the physics forward in time by the change in time
   *
   * @param {number} dt
   * @param {Player} player
   * @param {World} world
   *
   */
  update(dt, player, world) {
    this.detectCollisions(player, world);
  }

  /**
   * main function for collision detection
   * @param {Player} player
   * @param {World} world
   *
   */
  detectCollisions(player, world) {
    const candidates = this.broadPhase(player, world); //
    const collisions = this.narrowPhase(candidates, player);

    if (collisions.length > 0) {
      this.resolveCollisions(collisions);
    }
  }

  /**
   * possible blocks the player may collide with
   * @param {Player} player
   * @param {World} world
   * @returns {[]}
   *
   */
  broadPhase(player, world) {
    const candidates = []; // all possible blocks

    // for each x, y, z coordinate calc the min and max extent
    const extents = {
      x: {
        min: Math.floor(player.position.x - player.radius),
        max: Math.ceil(player.position.x + player.radius),
      },
      y: {
        min: Math.floor(player.position.y - player.height),
        max: Math.ceil(player.position.y),
      },
      z: {
        min: Math.floor(player.position.z - player.radius),
        max: Math.ceil(player.position.z + player.radius),
      },
    };

    // looping through all blocks within the players extents
    // if not empty then they are a possible collision candidate
    for (let x = extents.x.min; x <= extents.x.max; x++) {
      for (let y = extents.y.min; y <= extents.y.max; y++) {
        for (let z = extents.z.min; z <= extents.z.max; z++) {
          const block = world.getBlock(x, y, z); // get block at the x, y, z position

          if (block && block.id !== blocks.empty.id) {
            const blockPosition = { x, y, z };
            candidates.push(blockPosition);
            this.addCollisionHelper(blockPosition);
          }
        }
      }
    }
    console.log(`broad phase candidates: ${candidates.length} `);

    return candidates;
  }

  // Implement narrowPhase for collision detection.
  narrowPhase(candidates, player) {
    // For now, just return an empty array (no collisions)
    // Replace with your collision detection logic.
    return [];
  }

  resolveCollisions(collisions) {
    // Implement collision resolution.
  }

  /**
   * highlights block the player is colliding with
   *
   * @param { THREE.Object3D } block
   */
  addCollisionHelper(block) {
    const blockMesh = new THREE.Mesh(collisionGeometry, collisionMaterial);
    blockMesh.position.copy(block);
    this.helpers.add(blockMesh);
  }
}
