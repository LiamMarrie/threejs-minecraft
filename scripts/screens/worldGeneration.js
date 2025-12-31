/**
 * World Generation Loading Screen
 * Displays a Minecraft-style loading screen while the world generates
 */

/**
 * Creates the World Generation screen UI
 * @param {Object} options
 * @param {Object} options.worldData - World configuration (name, seed, size, etc.)
 * @param {Function} options.onGenerationComplete - Callback when generation is complete
 */
export function createWorldGenerationScreen({
  worldData,
  onGenerationComplete,
}) {
  const worldGenScreen = document.createElement("div");
  worldGenScreen.id = "world-generation-screen";
  worldGenScreen.innerHTML = `
    <div class="generation-container">
      <div class="progress-wrapper">
        <div class="progress-text" id="progress-text">0%</div>
        <div class="progress-container">
          <div class="progress-fill" id="progress-fill"></div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    #world-generation-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url('/images/Overworld_background.png');
      background-size: cover;
      font-family: monocraft, Consolas, 'Courier New', monospace;
      display: flex;
      justify-content: center;
      align-items: center;
      user-select: none;
      z-index: 1000;
    }

    .generation-container {
      width: 100%;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .progress-wrapper {
      width: 100%;
      max-width: 256px;
      height: 318px;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 30px;
    }

    .progress-container {
      width: 100%;
      height: 100%;
      padding: 10px;
      background-color: #000;
      position: relative;
      box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.1);
      margin-bottom: 15px;
    }

    .progress-fill {
      display: grid;
      grid-template-columns: repeat(16, 1fr);
      grid-template-rows: repeat(16, 1fr);
      width: 100%;
      height: 100%;
    }
    
    .chunk {
        background: #000;
        transition: background 0.2s;
    }

    .progress-text {
      color: white;
      font-size: 1.6rem;
      font-weight: bold;
      margin-bottom: 10px;
      text-shadow: 2px 2px #000;
      box-shadow: inset 0 0 0 4px rgba(255, 255, 255, 0.1), 
                  inset 0 0 0 1px rgba(0, 0, 0, 0.2);
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(worldGenScreen);

  const grid = document.getElementById("progress-fill");
  const progressText = document.getElementById("progress-text");
  const TOTAL_CHUNKS = 256; // 16x16 grid
  let loaded = 0;

  // create chunks
  const chunks = [];
  for (let i = 0; i < TOTAL_CHUNKS; i++) {
    const div = document.createElement("div");
    div.className = "chunk";
    grid.appendChild(div);
    chunks.push(div);
  }

  chunks.sort(() => Math.random() - 0.5); // rand order of chunks

  function loadNextChunk() {
    if (loaded >= TOTAL_CHUNKS) return;

    chunks[loaded].style.background =
      Math.random() > 0.2 ? "#3b8526" : "7fb238";

    loaded++;
  }

  let animationInterval = null;
  let currentProgress = 0;

  function updateProgressBar(progress) {
    currentProgress = progress;
    loadNextChunk();
    progressText.textContent = `${Math.floor(progress)}%`;
  }

  // world generation animation attempt
  function startGeneration() {
    let progress = 0;
    animationInterval = setInterval(() => {
      progress += 0.5; // increment by 0.5% each tick
      if (progress >= 100) {
        progress = 100;
        clearInterval(animationInterval);
      }
      updateProgressBar(progress);
    }, 10);

    // world generation is very quick so we simulate a wait time just for effect (for now)
    setTimeout(() => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }

      updateProgressBar(100);

      setTimeout(() => {
        onGenerationComplete();
      }, 500);
    }, 2100);
  }

  // clear
  const removeScreen = () => {
    if (animationInterval) {
      clearInterval(animationInterval);
    }

    if (worldGenScreen && worldGenScreen.parentNode) {
      worldGenScreen.remove();
    }

    if (style && style.parentNode) {
      style.remove();
    }
  };

  return {
    removeScreen,
    startGeneration,
  };
}
