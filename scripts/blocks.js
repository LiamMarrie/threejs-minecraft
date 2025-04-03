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
  },
  dirt: {
    id: 2,
    name: "dirt",
    color: "#644117",
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
  },
};

export const resources = [blocks.stone, blocks.coalOre, blocks.ironOre];
