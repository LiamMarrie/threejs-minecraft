import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();

function loadTexture(path) {
  const texture = textureLoader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.NearestFilter; // fixes three.js auto burly texture
  texture.magFilter = THREE.NearestFilter; // same here

  return texture;
}

// define texture types
const textures = {
  dirt: loadTexture("textures/blocks/dirt.png"),
  grass: loadTexture("textures/blocks/grass.png"),
  grassSide: loadTexture("textures/blocks/grass_side.png"),
  stone: loadTexture("textures/blocks/stone.png"),
  coalOre: loadTexture("textures/blocks/coal_ore.png"),
  ironOre: loadTexture("textures/blocks/iron_ore.png"),
  sand: loadTexture("textures/blocks/sand.png"),
  water: loadTexture("textures/blocks/water_still.png"),
  bedrock: loadTexture("textures/blocks/bedrock.png"),
};

// block types
export const blocks = {
  empty: {
    id: 0,
    name: "empty",
  },
  grass: {
    id: 1,
    name: "grass",
    color: "#008000",
    material: [
      new THREE.MeshLambertMaterial({ map: textures.grassSide }), //right
      new THREE.MeshLambertMaterial({ map: textures.grassSide }), //left
      new THREE.MeshLambertMaterial({ map: textures.grass }), //top
      new THREE.MeshLambertMaterial({ map: textures.dirt }), //bottom
      new THREE.MeshLambertMaterial({ map: textures.grassSide }), // front
      new THREE.MeshLambertMaterial({ map: textures.grassSide }), //side
    ],
  },
  dirt: {
    id: 2,
    name: "dirt",
    color: "#644117",
    material: new THREE.MeshLambertMaterial({ map: textures.dirt }),
  },
  stone: {
    id: 3,
    name: "stone",
    color: "#808080",
    scale: {
      x: 30,
      y: 30,
      z: 30,
    },
    scarcity: 0.5,
    material: new THREE.MeshLambertMaterial({ map: textures.stone }),
  },
  coalOre: {
    id: 4,
    name: "coal",
    color: "#000",
    scale: {
      x: 20,
      y: 20,
      z: 20,
    },
    scarcity: 0.8,
    material: new THREE.MeshLambertMaterial({ map: textures.coalOre }),
  },
  ironOre: {
    id: 5,
    name: "iron",
    color: "#A59C94",
    scale: {
      x: 60,
      y: 60,
      z: 60,
    },
    scarcity: 0.9,
    material: new THREE.MeshLambertMaterial({ map: textures.ironOre }),
  },
  sand: {
    id: 6,
    name: "sand",
    material: new THREE.MeshLambertMaterial({ map: textures.sand }),
  },

  water: {
    id: 7,
    name: "water",
    material: new THREE.MeshLambertMaterial({
      map: textures.water,
      transparent: true,
      opacity: 0.7,
    }),
  },
  bedrock: {
    id: 8,
    name: "bedrock",
    material: new THREE.MeshLambertMaterial({
      map: textures.bedrock,
    }),
  },
};

export const resources = [blocks.stone, blocks.coalOre, blocks.ironOre];
