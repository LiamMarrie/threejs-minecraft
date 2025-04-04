import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import audioManager from "../sfx/audio";
import { resources } from "../block/blocks";

export function createUI(world, player) {
  const gui = new GUI();

  const playerFolder = gui.addFolder("Player");
  playerFolder.add(player, "maxSpeed", 1, 20).name("Max Speed");
  playerFolder
    .add(player.cameraHelper, "visible")
    .name("Camera helper viability ");

  gui.add(world.size, "width", 8, 128, 1).name("Width").listen();
  gui.add(world.size, "height", 8, 64, 1).name("Height").listen();

  // terrain folder
  const terrainFolder = gui.addFolder("Terrain");
  terrainFolder.add(world.params, "seed", 0, 10000).name("Seed").listen();
  terrainFolder
    .add(world.params.terrain, "scale", 10, 100)
    .name("Scale")
    .listen();
  terrainFolder
    .add(world.params.terrain, "magnitude", 0, 1)
    .name("Magnitude")
    .listen();
  terrainFolder
    .add(world.params.terrain, "offset", 0, 1)
    .name("Offset")
    .listen();

  // resources folder
  const resourcesFolder = gui.addFolder("Resources");

  resources.forEach((resource) => {
    const resourceFolder = resourcesFolder.addFolder(resource.name);
    resourceFolder.add(resource, "scarcity", 0, 1).name("Scarcity");

    const scaleFolder = resourceFolder.addFolder("Scale");
    scaleFolder.add(resource.scale, "x", 10, 100).name("X Scale");
    scaleFolder.add(resource.scale, "y", 10, 100).name("Y Scale");
    scaleFolder.add(resource.scale, "z", 10, 100).name("Z Scale");
  });

  const audioFolder = gui.addFolder("Audio");

  const musicControl = {
    musicEnabled: audioManager.isPlaying,
    toggleMusic: () => {
      musicControl.musicEnabled = audioManager.toggleMusic();
    },
  };
  audioFolder
    .add(musicControl, "musicEnabled")
    .name("Music")
    .listen()
    .onChange(() => {
      musicControl.toggleMusic();
    });
  const volumeControl = {
    volume: audioManager.volume,
  };
  audioFolder
    .add(volumeControl, "volume", 0, 1, 0.01)
    .name("Volume")
    .onChange((value) => {
      audioManager.setVolume(value);
    });

  // world reset button
  const optionsFolder = gui.addFolder("Options");
  optionsFolder
    .add(
      {
        returnToMenu: () => {
          if (
            confirm("Return to main menu? Any unsaved progress will be lost.")
          ) {
            // return to the home screen
            window.location.reload();
          }
        },
      },
      "returnToMenu"
    )
    .name("Return to Menu");

  gui.onChange(() => {
    world.generate();
  });
}
