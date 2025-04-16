import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";

import { RNG } from "../utils/rng";

import { blocks, resources } from "./blocks/blocks";

const geometry = new THREE.BoxGeometry();

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
    this.data = [];
  }
  /**
   * generates the world data and meshes
   */
  generate() {
    const rng = new RNG(this.params.seed);
    this.initializeTerrain();
    this.generateResources();
    this.generateUnderground(rng);
    this.generateOverworld(rng);
    this.generateMeshes();
  }

  /**
   * initial world terrain data
   */
  initializeTerrain() {
    this.undergroundDepth = 20;
    this.totalHeight = this.undergroundDepth + this.size.height; // total vertical layers

    this.data = []; // clear the data array
    for (let x = 0; x < this.size.width; x++) {
      const slice = [];
      // allocate totalHeight vertical layers.
      for (let y = 0; y < this.totalHeight; y++) {
        const row = [];
        for (let z = 0; z < this.size.width; z++) {
          row.push({
            id: blocks.empty.id,
            instanceId: null,
          });
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
        for (let y = 1; y < this.undergroundDepth; y++) {
          for (let z = 0; z < this.size.width; z++) {
            // only place resources if the current block is stone ( for now )
            if (this.getBlock(x, y, z)?.id === blocks.stone.id) {
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
      }
    });
  }

  generateUnderground(rng) {
    const caveSimplex = new SimplexNoise(rng);
    const caveScale = 20;
    const caveThreshold = 0.3;

    for (let x = 0; x < this.size.width; x++) {
      for (let z = 0; z < this.size.width; z++) {
        this.setBlockId(
          x,
          0,
          z,
          blocks.bedrock ? blocks.bedrock.id : blocks.stone.id
        );
        for (let y = 1; y < this.undergroundDepth; y++) {
          const caveValue = caveSimplex.noise3d(
            x / caveScale,
            y / caveScale,
            z / caveScale
          );
          if (caveValue > caveThreshold) {
            this.setBlockId(x, y, z, blocks.empty.id);
          } else {
            this.setBlockId(x, y, z, blocks.stone.id);
          }
        }
      }
    }
  }

  /**
   * generates the terrain data for the world
   */
  generateOverworld(rng) {
    const simplex = new SimplexNoise(rng);
    const patchNoise = new SimplexNoise(rng);

    const DIRT_LAYER_DEPTH = 4;

    for (let x = 0; x < this.size.width; x++) {
      for (let z = 0; z < this.size.width; z++) {
        // 2D noise for surface
        const value = simplex.noise(
          x / this.params.terrain.scale,
          z / this.params.terrain.scale
        );

        const scaledNoise =
          this.params.terrain.offset + this.params.terrain.magnitude * value;
        let surfaceHeight = Math.floor(this.size.height * scaledNoise);
        surfaceHeight = Math.max(
          0,
          Math.min(surfaceHeight, this.size.height - 1)
        );

        // actual array index
        const surfaceIndex = this.undergroundDepth + surfaceHeight;

        // place grass
        this.setBlockId(x, surfaceIndex, z, blocks.grass.id);

        // fill down from surfaceIndex-1
        for (let y = surfaceIndex - 1; y >= this.undergroundDepth; y--) {
          if (this.getBlock(x, y, z).id === blocks.empty.id) {
            const depthBelowSurface = surfaceIndex - y;
            if (depthBelowSurface <= DIRT_LAYER_DEPTH) {
              // top few layers are dirt
              this.setBlockId(x, y, z, blocks.dirt.id);
            } else {
              // mostly stone with random dirt patches
              const val = patchNoise.noise3d(x * 0.1, y * 0.1, z * 0.1);
              if (val > 0.7) {
                this.setBlockId(x, y, z, blocks.dirt.id);
              } else {
                this.setBlockId(x, y, z, blocks.stone.id);
              }
            }
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

    const maxCount = this.size.width * this.size.width * this.totalHeight;

    const meshes = {};
    Object.values(blocks)
      .filter((blockType) => blockType.id !== blocks.empty.id)
      .forEach((blockType) => {
        const mesh = new THREE.InstancedMesh(
          geometry,
          blockType.material,
          maxCount
        );
        mesh.name = blockType.name;
        mesh.count = 0;
        meshes[blockType.id] = mesh;
      });

    const matrix = new THREE.Matrix4();
    for (let x = 0; x < this.size.width; x++) {
      for (let y = 0; y < this.totalHeight; y++) {
        for (let z = 0; z < this.size.width; z++) {
          const block = this.getBlock(x, y, z);
          // skip if empty or block entirely hidden
          if (block.id === blocks.empty.id || this.isBlockHidden(x, y, z))
            continue;

          const mesh = meshes[block.id];
          const instanceId = mesh.count;

          matrix.setPosition(x, y - this.undergroundDepth, z);
          mesh.setMatrixAt(instanceId, matrix);
          this.setBlockInstanceId(x, y, z, instanceId);
          mesh.count++;
        }
      }
    }
    this.add(...Object.values(meshes));
  }

  update(delta) {
    // will add sky box and shit in the future
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
    return (
      x >= 0 &&
      x < this.size.width &&
      y >= 0 &&
      y < this.totalHeight && // <-- using totalHeight fixes the bounds checking
      z >= 0 &&
      z < this.size.width
    );
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
      { x: 1, y: 0, z: 0 }, // right
      { x: -1, y: 0, z: 0 }, // left
      { x: 0, y: 0, z: 1 }, // forward
      { x: 0, y: 0, z: -1 }, // back
    ];

    for (let { x: dx, y: dy, z: dz } of neighbors) {
      const neighborBlock =
        this.getBlock(x + dx, y + dy, z + dz)?.id ?? blocks.empty.id;
      if (neighborBlock === blocks.empty.id) {
        return false; // block not obscured if any neighbor is empty
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
