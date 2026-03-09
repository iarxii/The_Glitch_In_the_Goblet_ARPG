# Implementation Plan: The Glitch In the Goblet ARPG

## Goal Description
Initialize the project with a modular, scalable architecture suitable for a web-based ARPG. The system will favor React Three Fiber for rendering and Zustand for state management, ensuring separation of concerns and testability.

## Proposed Architecture

### 1. Technology Stack
- **Core**: React 18+ (Vite)
- **Language**: TypeScript
- **Rendering**: Three.js + React Three Fiber (R3F)
- **State Management**: Zustand (for game state: player stats, inventory, world state)
- **Physics**: Rapier (via `@react-three/rapier`) - *Optional for now, but good to plan for*
- **Testing**: Vitest + React Testing Library

### 2. Folder Structure
```
src/
├── assets/          # Raw assets (models, textures, sounds)
├── components/      # React components
│   ├── core/        # Core game systems (GameLoop, Scene, Camera)
│   ├── game/        # Game entities (Player, Enemy, World)
│   ├── ui/          # HUD, Menus
│   └── debug/       # Debug tools
├── hooks/           # Custom hooks (game logic, input handling)
├── store/           # Zustand stores (useGameStore, useAssetStore)
├── systems/         # Logic systems (AiSystem, PhysicsSystem - if needed outside components)
├── utils/           # Helper functions
└── __tests__/       # Global tests
```

### 3. Modular Systems

#### Game Loop
The R3F `useFrame` hook will drive the game loop. We will create a `GameLoop` component to manage global updates (time, physics stepping).

#### Entity-Component System (ECS) Hybrid
We will use a "React-idiomatic" approach where:
- **Entities** are React Components (`<Player />`, `<Enemy />`).
- **Components** (in ECS terms) are props or hooks (`useHealth`, `useMovement`).
- **Systems** are `useFrame` callbacks within these components or global managers.

#### Asset Management
A dedicated `AssetManager` will pre-load critical assets using `useGLTF` and `useTexture` from `@react-three/drei`. We will maintain a manifest of assets to ensure type safety.

#### Unit Testing
Vitest will be configured to test:
- **Game Logic**: Pure functions in `utils/` and `store/` actions.
- **Components**: Rendering tests (basic) and hook behavior.

## Implementation Steps

1.  **Initialize Vite Project**: `npm create vite@latest . -- --template react-ts`
2.  **Install Dependencies**: `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`, `zustand`, `vitest`.
3.  **Setup Directory Structure**: Create folders defined above.
4.  **Create Core Components**: `CanvasWrapper`, `GameLoop`.
5.  **Create Basic Game State**: `useGameStore` with player position/stats.
6.  **Setup Test Environment**: Config `vitest` and run a sample test.

## Verification Plan

### Automated Tests
- Run `npm test` to verify Vitest is working.
- Verify that the game loop runs without errors.

### Manual Verification
- Start the dev server (`npm run dev`).
- Verify a 3D scene renders with a basic object (e.g., a cube representing the player).
- specific check for fast-refresh and module replacement.
