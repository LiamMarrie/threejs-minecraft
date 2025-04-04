import audioManager from "../sfx/audio";
import { createNewWorldScreen } from "./new-world";

/**
 * Creates and manages the landing screen UI
 */
export function createLandingScreen({ onNewWorld, onLoadWorld }) {
  // Start background music
  audioManager.startMusic();

  // Create landing screen container
  const landingScreen = document.createElement("div");
  landingScreen.id = "landing-screen";

  // Add content to landing screen
  landingScreen.innerHTML = `
    <div class="minecraft-container">
      <div class="logo-container">
        <img class="minecraft-logo" src="../public/Minecraft-Logo-2011.png" alt="Minecraft">
        <span class="splash-text" id="splash-text">
        </span>
      </div>
      
      <div class="menu-buttons">
        <button class="minecraft-button" id="singleplayer-button">Singleplayer</button>
        <button class="minecraft-button" id="multiplayer-button">Multiplayer</button>
      </div>
      
      <div class="bottom-buttons">
        <button class="minecraft-button bottom-button" id="options-button">Options...</button>
        <button class="minecraft-button bottom-button" id="quit-button">Quit Game</button>
      </div>
      
      <div class="version-info">
        Minecraft Three.js 1.0.0
      </div>
      
      <div class="github">
        <div class="github-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>
        <a href="https://github.com/LiamMarrie" target="_blank" class="github-link">GitHub</a>
      </div>
    </div>
  `;

  // Add styles for landing screen
  const style = document.createElement("style");
  style.textContent = `
    @font-face {
      font-family: 'MinecraftFont';
      src: url('../public/minecraft-font.ttf') format('truetype');
    }
    
    #landing-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url('../public/background-world.jpg');
      background-size: cover;
      font-family: monocraft, Consolas, 'Courier New', monospace;
      display: flex;
      justify-content: center;
      user-select: none;
      overflow: hidden;
    }
    
    .minecraft-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .logo-container {
      position: relative;
      display: inline-block;
    }

    
    .minecraft-logo {
      width: 600px;
      height: auto;
      image-rendering: pixelated;
    }
    
    .splash-text {
      position: absolute;
      top: 50%;
      right: 5px;
      transform: translate(-50%, -50%) rotate(-20deg);
      font-size: 1.8em;
      color: #FFFF00;
      text-shadow: 2px 2px #3F3F00;
      font-weight: bold;
      pointer-events: none;
      animation: wobble 4s ease-in-out infinite;
      z-index: 10;
      white-space: nowrap; /* Prevents text wrapping */
    }

    
    @keyframes wobble {
      0% { transform: rotate(-15deg) scale(1); }
      50% { transform: rotate(-15deg) scale(1.08); }
      100% { transform: rotate(-15deg) scale(1); }
    }
    
    .menu-buttons {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 400px;
    }
    
    .minecraft-button {
      width: 100%;
      padding: 12px 0;
      margin: 8px 0;
      background-color: #727272;
      color: white;
      border: 2px solid #000;
      border-bottom-width: 4px;
      font-family: monocraft, Consolas, 'Courier New', monospace;
      font-size: 16px;
      text-align: center;
      cursor: pointer;
      position: relative;
      outline: none;
      text-shadow: 2px 2px #000;
      box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.1), 
                  inset 0 0 0 1px rgba(0, 0, 0, 0.2);
    }
    
    .minecraft-button:hover {
      background-color: #9c9c9c;
    }
    
    .minecraft-button:active {
      top: 2px;
      border-bottom-width: 2px;
    }
    
    .small-button {
      padding: 8px 0;
      font-size: 14px;
    }
    
    .bottom-buttons {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
      width: 100%;
      max-width: 400px;
    }
    
    .bottom-button {
      width: 180px;
    }
    
    .version-info {
      position: absolute;
      bottom: 10px;
      left: 10px;
      color: white;
      font-size: 14px;
      text-shadow: 1px 1px black;
    }
    
    .github {
      position: absolute;
      bottom: 20px;
      right: 20px;
      display: flex;
      align-items: center;
      color: white;
      font-size: 14px;
      text-shadow: 1px 1px black;
    }
    
    .github-icon {
      margin-right: 8px;
      display: flex;
      align-items: center;
    }
    
    .github-link {
      color: white;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .github-link:hover {
      color: #bbbbbb;
    }
    
    .panel-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
    }
    
    .form-group input {
      width: 100%;
      padding: 8px;
      background-color: #3a3a3a;
      border: 2px solid #727272;
      color: white;
      font-family: 'MinecraftFont', 'Segoe UI', sans-serif;
    }
    
    
  `;

  document.head.appendChild(style);
  document.body.appendChild(landingScreen);

  const removeLandingScreen = () => {
    if (landingScreen && landingScreen.parentNode) {
      landingScreen.remove();
    }
  };

  document
    .getElementById("singleplayer-button")
    .addEventListener("click", () => {
      // route to create ne world
      let newWorldScreen = createNewWorldScreen({
        onCreateWorld: (worldData) => {
          newWorldScreen.removeScreen();
          newWorldScreen = null;

          removeLandingScreen();
          onNewWorld(worldData);
        },
        onCancel: () => {
          // return to home page
          newWorldScreen.removeScreen();
          newWorldScreen = null;
        },
      });
    });

  document
    .getElementById("multiplayer-button")
    .addEventListener("click", () => {
      // Show saved worlds panel for multiplayer
      const savedWorldsList = document.getElementById("saved-worlds-list");
      if (savedWorldsList) {
        // Load saved worlds
        loadSavedWorlds();
      } else {
        alert(
          "Multiplayer is not available in this version. Prob never it seems really hard and scary. "
        );
      }
    });

  document.getElementById("options-button").addEventListener("click", () => {
    alert("Options not implemented in this clone");
  });

  document.getElementById("quit-button").addEventListener("click", () => {
    if (confirm("Are you sure you want to quit?")) {
      window.close();
    }
  });

  // splash text
  const splashTexts = [
    "Built with love <3",
    "Three.js!",
    "pls give me a job!",
    "Can I get sued for this??",
    "#Unemployment",
  ];

  const splashTextElement = document.getElementById("splash-text");
  const randomText =
    splashTexts[Math.floor(Math.random() * splashTexts.length)];
  splashTextElement.textContent = randomText;
}
