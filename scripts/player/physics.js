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

const contactMaterial = new THREE.MeshBasicMaterial({
  wireframe: true,
  color: 0x00ff00,
});

const contactGeometry = new THREE.SphereGeometry(0.05, 6, 6);

export class Physics {
  gravity = 32;

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
    this.helpers.clear();
    player.velocity.y -= this.gravity * dt;
    player.applyInputs(dt);
    player.updateBoundsHelper();
    this.detectCollisions(player, world);
  }

  /**
   * main function for collision detection
   * @param {Player} player
   * @param {World} world
   *
   */
  detectCollisions(player, world) {
    player.onGround = false;
    const candidates = this.broadPhase(player, world); //
    const collisions = this.narrowPhase(candidates, player);

    if (collisions.length > 0) {
      this.resolveCollisions(collisions, player);
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
    return candidates;
  }

  /**
   * 1. get point on block closest to player
   *
   * 2. determine if point is insides player bounding cylinder
   *
   * 3. if true compute:
   *  - contact point
   *  - overlap ( amount to move player back from block )
   *  - collision normal ( angle of collision )
   */
  narrowPhase(candidates, player) {
    const collisions = [];

    for (const block of candidates) {
      // get point on the block that is closest to the center of the players bounding cylinder
      const p = player.position;
      const closestPoint = {
        x: Math.max(block.x - 0.5, Math.min(p.x, block.x + 0.5)),
        y: Math.max(
          block.y - 0.5,
          Math.min(p.y - player.height / 2, block.y + 0.5)
        ),
        z: Math.max(block.z - 0.5, Math.min(p.z, block.z + 0.5)),
      };

      // calc distance along each axis between closest point to the center of the player bounding cylinder
      const dx = closestPoint.x - player.position.x;
      const dy = closestPoint.y - (player.position.y - player.height / 2);
      const dz = closestPoint.z - player.position.z;

      if (this.pointInPlayerBoundingCylinder(closestPoint, player)) {
        //compute the overlap between the point and the players bounding cylinder along the y axis and in the xz plane
        const overlapY = player.height / 2 - Math.abs(dy);
        const overlapXZ = player.radius - Math.sqrt(dx * dx + dz * dz);

        // compute the normal of the collision ( point away from the contact point )
        let normal, overlap;
        if (overlapY < overlapXZ) {
          normal = new THREE.Vector3(0, -Math.sign(dy), 0);
          overlap = overlapY;
          player.onGround = true;
        } else {
          normal = new THREE.Vector3(-dx, 0, -dz).normalize();
          overlap = overlapXZ;
        }

        collisions.push({
          block,
          contactPoint: closestPoint,
          normal,
          overlap,
        });

        this.addContactPointHelper(closestPoint);
      }
    }

    return collisions;
  }

  /**
   * resolves each of the collisions found in the narrow phase
   * @param {object} collisions
   *
   * @param {Player} player
   *
   */
  resolveCollisions(collisions, player) {
    // find collisions in order of the smallest to biggest overlap

    collisions.sort((a, b) => {
      return a.overlap < b.overlap;
    });

    for (const collision of collisions) {
      // adjust player position so its no longer overlapping
      let deltaPosition = collision.normal.clone();
      deltaPosition.multiplyScalar(collision.overlap);
      player.position.add(deltaPosition);

      // negate player velo along collision normal
      let magnitude = player.worldVelocity.dot(collision.normal); // get the magnitude of the player velo along the collision normal

      let velocityAdjustment = collision.normal
        .clone()
        .multiplyScalar(magnitude); // remove that part of the velo from the players velo

      // apply
      player.applyWorldDeltaVelocity(velocityAdjustment.negate());
    }
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

  /**
   *
   * visualizes the contact at the point 'p'
   *
   * @param {{ x, y, z }} p
   *
   *
   */
  addContactPointHelper(p) {
    const contactMesh = new THREE.Mesh(contactGeometry, contactMaterial);
    contactMesh.position.copy(p);
    this.helpers.add(contactMesh);
  }

  /**
   *
   * returns true if the point 'p' is inside the players bounding cylinder
   *
   * @param {{ x: number, y: number, z: number }} p
   *
   * @param { Player } player
   *
   * @returns { boolean }
   *
   */
  pointInPlayerBoundingCylinder(p, player) {
    const dx = p.x - player.position.x;
    const dy = p.y - (player.position.y - player.height / 2);
    const dz = p.z - player.position.z;
    const r_sq = dx * dx + dz * dz;

    // check the contact point
    return (
      Math.abs(dy) < player.height / 2 && r_sq < player.radius * player.radius
    );
  }
}
