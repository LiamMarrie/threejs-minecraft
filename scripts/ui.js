import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import audioManager from "./audio";

export function createUI(world) {
  const gui = new GUI();

  gui.add(world.size, "width", 8, 128, 1).name("Width").listen();
  gui.add(world.size, "height", 8, 64, 1).name("Height").listen();

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
