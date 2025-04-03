import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";

import { RNG } from "./rng";

import { blocks, resources } from "./blocks";

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshLambertMaterial();

/**
  
 
 Use InstancedMesh if you have to render a large number of objects with the same geometry and material(s) but with different world transformations.  
    - reduces draw calls 

 in simplex noise r = math 


*/

export class World extends THREE.Group {
  /**
   * @type {{
   *  id: number,
   *  instanceId : number,
   * }[][][]}
   */
  data = []; // contains what each 'block' is at each x, y, and z location. id represents the block type ( dirt, wood, grass, ....) and instanceId represents the mesh instance at the specific location

  //terrain generation params
  params = {
    seed: 0,
    terrain: {
      scale: 30,
      magnitude: 0.5,
      offset: 0.2,
    },
  };

  // collection of all the "blocks" in the world
  constructor(size = { width: 64, height: 32 }) {
    // default values
    super();
    this.size = size;
  }
  /**
   * generates the world data and meshes
   */
  generate() {
    const rng = new RNG(this.params.seed);
    this.initializeTerrain();
    this.generateResources(rng);
    //this.generateTerrain(rng);
    this.generateMeshes();
  }

  /**
   * initial world terrain data
   */
  initializeTerrain() {
    this.data = []; // clear data array (resets world)
    for (let x = 0; x < this.size.width; x++) {
      const slice = [];
      for (let y = 0; y < this.size.height; y++) {
        const row = [];
        for (let z = 0; z < this.size.width; z++) {
          row.push({
            id: blocks.empty.id,
            instanceId: null,
          }); // default object for block
        }
        slice.push(row);
      }
      this.data.push(slice);
    }
  }

  /**
   * generates resource blocks
   */

  generateResources(rng) {
    const simplex = new SimplexNoise(rng);
    resources.forEach((resource) => {
      for (let x = 0; x < this.size.width; x++) {
        for (let y = 0; y < this.size.width; y++) {
          for (let z = 0; z < this.size.width; z++) {
            const value = simplex.noise3d(
              x / resource.scale.x,
              y / resource.scale.y,
              z / resource.scale.z
            );
            if (value > resource.scarcity) {
              this.setBlockId(x, y, z, resource.id);
            }
          }
        }
      }
    });
  }

  /**
   * generates the terrain data for the world
   */
  generateTerrain(rng) {
    const simplex = new SimplexNoise(rng);
    // get height at each x and z location. this helps with seed regeneration.
    for (let x = 0; x < this.size.width; x++) {
      for (let z = 0; z < this.size.width; z++) {
        // need to be able to adjust x n z based on terrain params
        const value = simplex.noise(
          // bigger the scale the less the noise will change over a distance
          x / this.params.terrain.scale,
          z / this.params.terrain.scale
        );

        // scale the noise based on the magnitude and offset
        const scaledNoise =
          this.params.terrain.offset + this.params.terrain.magnitude * value;

        let height = Math.floor(this.size.height * scaledNoise); // computes the height of the terrain. want integer

        height = Math.max(0, Math.min(height, this.size.height - 1)); // clamp height between 0 and max height

        //fills all blocks at or below the terrain height
        for (let y = 0; y <= this.size.height; y++) {
          if (y < height && this.getBlock(x, y, z).id === blocks.empty.id) {
            this.setBlockId(x, y, z, blocks.dirt.id);
          } else if (y === height) {
            this.setBlockId(x, y, z, blocks.grass.id);
          } else if (y > height) {
            this.setBlockId(x, y, z, blocks.empty.id);
          }
        }
      }
    }
  }

  /**
   * generates the 3D representation of the world from the world data
   * separates world data from the 3D representation
   */
  generateMeshes() {
    this.clear();

    // need to keep track of max count and current count. cannot go over max count limit
    const maxCount = this.size.width * this.size.width * this.size.height; // width squared x height = total num of "blocks"
    const mesh = new THREE.InstancedMesh(geometry, material, maxCount);
    mesh.count = 0; // curr num of instances. contains total num of instances once for loop is complete

    const matrix = new THREE.Matrix4(); // stores position of each block
    for (let x = 0; x < this.size.width; x++) {
      for (let y = 0; y < this.size.height; y++) {
        for (let z = 0; z < this.size.width; z++) {
          const blockId = this.getBlock(x, y, z).id; // get block id
          const instanceId = mesh.count;
          const blockType = Object.values(blocks).find((x) => x.id === blockId); // gets array of all block object types then finding id of block that matches the blockId at the x, y, z coordinates

          if (blockId !== blocks.empty.id && !this.isBlockHidden(x, y, z)) {
            matrix.setPosition(x + 0.5, y + 0.5, z + 0.5);
            mesh.setMatrixAt(instanceId, matrix); // set transformation matrix for each instance. start at 0 instance. set mesh count at index 0 to the matrix.....
            mesh.setColorAt(instanceId, new THREE.Color(blockType.color)); // sets block color per instance
            this.setBlockInstanceId(x, y, z, instanceId);
            mesh.count++;
          }
        }
      }
    }
    this.add(mesh);
  }

  /**
   * HELPER METHODS
   * 1. get block at (x, y, z)
   *
   * 2. set block id at (x, y, z)
   *
   * 3. set block instance id at (x, y, z)
   *
   * 4. check if (x, y, z) is in bounds
   */

  /**
   * gets the block data at (x, y, z)
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {{id: number, instanceId: number}}
   */
  getBlock(x, y, z) {
    if (this.inBounds(x, y, z)) {
      return this.data[x][y][z]; // if in bounds return block data
    } else {
      return null;
    }
  }

  /**
   * sets the block id for the block at ( x , y, z)
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} id
   */
  setBlockId(x, y, z, id) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].id = id;
    }
  }

  /**
   * sets the block instance id for the block at (x, y, z)
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} instanceId
   *
   */
  setBlockInstanceId(x, y, z, instanceId) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].instanceId = instanceId;
    }
  }

  /**
   * checks if the ( x, y, z) coords are within bounds
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  inBounds(x, y, z) {
    if (
      x >= 0 &&
      x < this.size.width &&
      y >= 0 &&
      y < this.size.height &&
      z >= 0 &&
      z < this.size.width
    ) {
      // checks to ensure the coords are within the bounds
      return true;
    } else {
      return false;
    }
  }

  /**
   * check if the block is completely obscured by other blocks
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  isBlockHidden(x, y, z) {
    const neighbors = [
      { x: 0, y: 1, z: 0 }, // up
      { x: 0, y: -1, z: 0 }, // down
      { x: 1, y: 0, z: 0 }, // left
      { x: -1, y: 0, z: 0 }, // right
      { x: 0, y: 0, z: 1 }, // forward
      { x: 0, y: 0, z: -1 }, // back
    ];

    for (let { x: dx, y: dy, z: dz } of neighbors) {
      const neighborBlock =
        this.getBlock(x + dx, y + dy, z + dz)?.id ?? blocks.empty.id;
      if (neighborBlock === blocks.empty.id) {
        return false; //block not obscured if any neighbor is empty
      }
    }

    return true; // block is fully obscured if all neighbors are non-empty
  }

  /**
   * remove all child objects in the world and clears the group
   */
  removeChildren() {
    this.traverse((child) => {
      if (child.dispose) {
        child.dispose();
      }
    });
    this.clear();
  }
}
