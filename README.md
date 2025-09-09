![Logo](/public/images/MineCraft-Logo-ThreeJS.png)

# MINECRAFT THREEJS EDITION

A browser-based Minecraft clone built with Three.js, featuring procedural world generation, block-based terrain, and a classic Minecraft-style user interface.

![Minecraft Clone](https://img.shields.io/badge/Three.js-Minecraft_Clone-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-yellow)

## 🎮 Features

- **Procedural World Generation** - Infinite-style terrain with configurable parameters
- **Resource Distribution** - Coal, iron, and stone ore generation with rarity controls
- **Cave Systems** - Realistic underground cavern networks using Simplex noise
- **Authentic UI** - Pixel-perfect recreation of Minecraft's interface
- **Real-time Editing** - Live world parameter adjustment with instant regeneration
- **Performance Optimized** - Efficient instanced rendering for large worlds

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/minecraft-clone.git
cd minecraft-clone
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎯 Controls

- **Mouse** - Look around and navigate menus
- **WASD** - Movement (when implemented)
- **ESC** - Return to menu
- **GUI Panel** - Adjust world parameters in real-time

## 🏗️ Project Structure

```
minecraft-clone/
├── index.html              # Main HTML entry point
├── main.js                 # Application initialization
├── style.css               # Global styles
├── package.json            # Dependencies and scripts
├── vite.config.js          # Build configuration
├── world/
│   ├── world.js            # World generation and management
│   └── blocks/
│       └── blocks.js       # Block definitions and textures
├── utils/
│   └── rng.js              # Seeded random number generator
├── ui/
│   └── ui.js               # In-game UI controls
├── screens/
│   ├── landing.js          # Main menu
│   ├── new-world.js        # World creation screen
│   ├── pause.js            # Pause menu (placeholder)
│   └── options.js          # Options screen (placeholder)
└── sfx/
    └── musicPlayer.js      # Audio management
```

## 🌍 World Generation

### Terrain System

The world generation uses a sophisticated multi-layer approach:

- **Underground (20 blocks deep)**: Stone foundation with cave systems
- **Surface Layer**: Height-mapped terrain using Simplex noise
- **Resource Distribution**: Procedural ore placement based on depth and rarity
- **Bedrock Foundation**: Indestructible bottom layer

### Block Types

| Block       | Description                              | Properties               |
| ----------- | ---------------------------------------- | ------------------------ |
| 🟩 Grass    | Surface blocks with multi-textured faces | Grass top, dirt sides    |
| 🟫 Dirt     | Standard earth material                  | Underground layers       |
| ⬜ Stone    | Base underground material                | Configurable generation  |
| ⚫ Coal Ore | Common resource                          | Adjustable scarcity      |
| 🔶 Iron Ore | Rare resource                            | Deep generation patterns |
| ⬛ Bedrock  | Indestructible foundation                | Bottom layer only        |

### Customization

World generation parameters are fully customizable:

- **Seed**: Deterministic world generation
- **Scale**: Terrain feature size (10-100)
- **Magnitude**: Height variation intensity (0-1)
- **Offset**: Base terrain height (0-1)
- **Resource Scarcity**: Individual ore rarity settings

## 🔧 Technical Details

### Performance Optimizations

- **Instanced Rendering**: Uses Three.js InstancedMesh for efficient block rendering
- **Occlusion Culling**: Hidden blocks are automatically excluded from rendering
- **Efficient Updates**: Separation of world data from visual representation
- **Memory Management**: Optimized data structures for large worlds

### Rendering Pipeline

- **WebGL Renderer**: Hardware-accelerated 3D graphics
- **Shadow Mapping**: Soft shadows with configurable quality
- **Dual Camera System**: Debug orbit camera + first-person view
- **Texture Filtering**: Nearest-neighbor for authentic pixel art

### Audio System

- **Background Music**: Atmospheric audio with toggle controls
- **Volume Control**: Persistent audio settings
- **State Management**: Smooth transitions between game states

## 🎨 UI/UX Design

### Landing Screen

- Animated Minecraft logo with rotating splash text
- Authentic button styling with hover effects
- Background panorama integration
- GitHub and version information display

### World Creation

- Custom world naming system
- Seed input for reproducible worlds
- Real-time save location preview
- Parameter configuration interface

### Debug Interface

- Real-time parameter adjustment with lil-gui
- Live world regeneration capabilities
- Performance monitoring with Stats.js
- Player and camera control options

## 🛠️ Development

### Technology Stack

- **Three.js** - 3D graphics and rendering
- **Vite** - Build tool and development server
- **lil-gui** - Runtime parameter adjustment
- **Modern ES6+** - Modular JavaScript architecture

### Code Organization

The codebase follows a modular architecture with clear separation of concerns:

- **World Logic**: Isolated in `world/` directory
- **UI Components**: Organized by screen in `screens/`
- **Utilities**: Reusable functions in `utils/`
- **Audio**: Centralized audio management
- **Rendering**: Three.js integration in main application

## 🎯 Roadmap

### Upcoming Features

- [ ] **Player System**: First-person movement and controls
- [ ] **Block Interaction**: Placing and breaking blocks
- [ ] **Inventory System**: Item collection and management
- [ ] **Multiplayer Support**: WebRTC-based multiplayer
- [ ] **Advanced Biomes**: Multiple terrain types
- [ ] **Mob System**: Entity AI and spawning
- [ ] **Day/Night Cycle**: Dynamic lighting and sky
- [ ] **World Persistence**: Save and load functionality

### Technical Improvements

- [ ] **Worker Threads**: Offload world generation to web workers
- [ ] **LOD System**: Level-of-detail for distant chunks
- [ ] **Chunk Loading**: Infinite world streaming
- [ ] **Advanced Physics**: Collision detection and response
- [ ] **Shader Effects**: Custom materials and post-processing

### Development Guidelines

- Follow existing code style and organization
- Add comments for complex algorithms
- Test world generation with various seeds
- Ensure UI responsiveness across devices
- Maintain performance benchmarks

## 📧 Get in Touch

- **GitHub**: [LiamMarrie](https://github.com/LiamMarrie)
- **Project Link**: [MineCraft Clone](https://github.com/LiamMarrie/minecraft-clone)
- **LinkedIn**: [LinkedIn](https://www.linkedin.com/in/liam-marrie/)
