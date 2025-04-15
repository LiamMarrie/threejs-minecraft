import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";

import { RNG } from "../utils/rng";

import { blocks, resources } from "./blocks/blocks";

import { Sky } from "./environment/sky";

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

    // day and night cycle properties
    this.time = 0;
    this.dayDuration = 240;

    // sky and lighting properties
    this.initSkyAndLights();
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
   * initialize sky data
   */
  initSkyAndLights() {
    this.sky = new Sky();

    this.sky.scale.setScalar(450000);
    this.add(this.sky);

    //sun vector
    this.sun = new THREE.Vector3();

    // ambient light for base illumination
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.add(this.ambientLight);

    // directional light to represent the sun
    this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
    this.sunLight.castShadow = true;
    this.add(this.sunLight);
  }

  /**
   * initial world terrain data
   */
  initializeTerrain() {
    this.undergroundDepth = 20;
    // this.size.height now represents the overworld part only.
    this.totalHeight = this.undergroundDepth + this.size.height; // total vertical layers

    this.data = []; // clear data array (resets world)
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
          // bigger the scale the less the noise will change over a distance
          x / this.params.terrain.scale,
          z / this.params.terrain.scale
        );

        // scale the noise based on the magnitude and offset
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
        mesh.count = 0; // curr num of instances. contains total num of instances once for loop is complete
        meshes[blockType.id] = mesh; // add block id to meshes table
      });

    const matrix = new THREE.Matrix4();
    for (let x = 0; x < this.size.width; x++) {
      for (let y = 0; y < this.totalHeight; y++) {
        for (let z = 0; z < this.size.width; z++) {
          const blockId = this.getBlock(x, y, z).id;
          if (blockId === blocks.empty.id) continue;
          const mesh = meshes[blockId];
          const instanceId = mesh.count;
          // Adjust the y position to convert the array index into the "real" world coordinate.
          matrix.setPosition(x, y - this.undergroundDepth, z);
          mesh.setMatrixAt(instanceId, matrix);
          this.setBlockInstanceId(x, y, z, instanceId);
          mesh.count++;
        }
      }
    }
    this.add(...Object.values(meshes));
  }

  /**
   * update method to be called on every frame
   * delta is the elapsed time in seconds since the last frame
   *
   * * day and night cycle at some point maybe......
   */
  update(delta) {
    // Update the internal time
    this.time += delta;
    // Calculate the time within a full day cycle
    const dayTime = this.time % this.dayDuration;
    // Convert to a full circle (2π for a complete cycle)
    const sunAngle = (dayTime / this.dayDuration) * Math.PI * 2;

    // Update the sun's position: here it moves in a circular path.
    // You can further adjust this for elevation offset
    this.sun.x = Math.sin(sunAngle);
    this.sun.y = Math.cos(sunAngle);
    this.sun.z = 0; // You might add variation here for a more dynamic cycle

    // --- Update sky shader uniforms ---
    // Assumes that your sky.js exposes a material with a sunPosition uniform.
    if (
      this.sky.material &&
      this.sky.material.uniforms &&
      this.sky.material.uniforms["sunPosition"]
    ) {
      this.sky.material.uniforms["sunPosition"].value.copy(this.sun);
    }

    // --- Update the sun light ---
    // Position the directional light with the sun vector so shadows match up.
    this.sunLight.position.copy(this.sun);

    // Adjust the light intensities based on the sun elevation.
    // When the sun is low (or below the horizon), lower the intensities for a night effect.
    if (this.sun.y < 0) {
      this.sunLight.intensity = 0.2;
      this.ambientLight.intensity = 0.1;
    } else {
      this.sunLight.intensity = 1;
      this.ambientLight.intensity = 0.5;
    }
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
