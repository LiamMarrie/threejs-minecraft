/**
 * create new world screen
 */
import audioManager from "../sfx/musicPlayer";

/**
 * Creates the New World screen UI
 * @param {Object} options
 * @param {Function} options.onCreateWorld - Callback when a world is created
 * @param {Function} options.onCancel - Callback when user wants to return to main menu
 */
export function createNewWorldScreen({ onCreateWorld, onCancel }) {
  // Create screen container
  const newWorldScreen = document.createElement("div");
  newWorldScreen.id = "new-world-screen";

  // Add content
  newWorldScreen.innerHTML = `
    <div class="minecraft-container">
      <h2 class="screen-title">Create New World</h2>
      
      <div class="world-form">
        <div class="form-group">
          <label for="world-name">World Name</label>
          <input type="text" id="world-name" value="New World">
          <p class="save-location">Will be saved in: New World</p>
        </div>
        
        <div class="form-group">
          <label for="world-seed">Seed for the World Generator (1-10000)</label>
          <input type="text" id="world-seed" placeholder="">
          <p class="seed-hint">Leave blank for a random seed</p>
        </div>
      </div>
      
      <div class="button-row">
        <button class="minecraft-button" id="create-world-button">Create New World</button>
        <button class="minecraft-button" id="cancel-button">Cancel</button>
      </div>
    </div>
  `;
  const style = document.createElement("style");
  style.textContent = `
    #new-world-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url('../../public/textures/menu background/Overworld_background.png');
      background-size: cover;
      font-family: monocraft, Consolas, 'Courier New', monospace;
      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;
      overflow: hidden;
      z-index: 1000;
    }
    
    .minecraft-container {
      width: 100%;
      max-width: 800px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    
    .screen-title {
      text-align: center;
      color: white;
      font-size: 2.5rem;
      margin-bottom: 50px;
      text-shadow: 2px 2px #000;
    }
    
    .world-form {
      width: 100%;
      max-width: 500px;
      display: flex;
      flex-direction: column;
      align-items: center;
      color: white;
      margin-bottom: 30px;
    }
    
    .form-group {
      margin-bottom: 40px;
      width: 100%;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 10px;
      color: #EEEEEE;
      font-size: 1.2rem;
    }
    
    .form-group input {
      width: 100%;
      max-width: 500px;
      padding: 16px;
      background-color: #000000;
      border: 2px solid #727272;
      color: white;
      font-family: monocraft, Consolas, 'Courier New', monospace;
      text-align: left;
      font-size: 1.4rem;
    }
    
    .save-location, .seed-hint {
      margin-top: 8px;
      color: #CCCCCC;
      font-size: 1.1rem;
    }
    
    .button-row {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      width: 100%;
      margin-top: 30px;
    }
    
    .minecraft-button {
      width: 100%;
      max-width: 500px;
      padding: 16px;
      background-color: #727272;
      color: white;
      border: 2px solid #000;
      border-bottom-width: 4px;
      font-family: monocraft, Consolas, 'Courier New', monospace;
      font-size: 1.2rem;
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
  `;

  document.head.appendChild(style);
  document.body.appendChild(newWorldScreen);

  const worldNameInput = document.getElementById("world-name");
  const saveLocationText = document.querySelector(".save-location");

  worldNameInput.addEventListener("input", () => {
    const worldName = worldNameInput.value || "New World";
    saveLocationText.textContent = `Will be saved in: ${worldName}`;
  });

  // event listeners
  document
    .getElementById("create-world-button")
    .addEventListener("click", () => {
      const worldName = worldNameInput.value || "New World";
      const seedInput = document.getElementById("world-seed").value;
      const seed = seedInput
        ? parseInt(seedInput) || seedInput
        : Math.floor(Math.random() * 10000);

      onCreateWorld({
        name: worldName,
        seed: seed,
        size: {
          width: 64,
          height: 32,
        },
        gameMode: "creative",
        difficulty: "peaceful",
      });
    });

  document.getElementById("cancel-button").addEventListener("click", () => {
    onCancel();
  });

  const removeScreen = () => {
    if (newWorldScreen && newWorldScreen.parentNode) {
      newWorldScreen.remove();
    }

    if (style && style.parentNode) {
      style.remove();
    }
  };

  return {
    removeScreen,
  };
}
