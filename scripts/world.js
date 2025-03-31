import * as THREE from "three";

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshLambertMaterial({ color: 0x00d000 }); // lambert gives shading to material

/**
  
 
 Use InstancedMesh if you have to render a large number of objects with the same geometry and material(s) but with different world transformations.  
    - reduces draw calls 


*/

export class World extends THREE.Group {
  /**
   *
   * @type {{
   *  id: number,
   *  instanceId : number,
   * }[][][]}
   */
  data = []; // contains what each 'block' is at each x, y, and z location. id represents the block type and instanceId represents the mesh instance at the specific location

  // Group is the collection of all the "blocks" in the world
  constructor(size = { width: 64, height: 32 }) {
    // default values
    super();
    this.size = size;
  }
  /**
   * generates the world data and meshes
   */
  generate() {
    this.generateTerrain();
    this.generateMeshes();
  }

  /**
   * generates the world terrain data
   */
  generateTerrain() {
    this.data = [];
    for (let x = 0; x < this.size.width; x++) {
      const slice = [];
      for (let y = 0; y < this.size.height; y++) {
        const row = [];
        for (let z = 0; z < this.size.width; z++) {
          row.push({
            id: 1,
            instanceId: null,
          });
        }
        slice.push(row);
      }
      this.data.push(slice);
    }
  }

  /**
   * generates the 3D representation of the world from the world data
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
          matrix.setPosition(x + 0.5, y + 0.5, z + 0.5);
          mesh.setMatrixAt(mesh.count++, matrix); // set transformation matrix for each instance. start at 0 instance. set mesh count at index 0 to the matrix.....
        }
      }
    }
    this.add(mesh);
  }
}
