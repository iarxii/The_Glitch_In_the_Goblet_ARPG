# The Glitch in the Goblet: Architecture & Systems Overview

This document outlines the architectural patterns, core technologies, and established systems that drive "The Glitch in the Goblet". The project is built not just as a game, but as a modular, scalable, and highly reactive web application utilizing 3D rendering alongside traditional frontend patterns.

## 1. Core Principles & Tech Stack

The architecture favors a functional, reactive approach over traditional Object-Oriented game loops.

*   **Core Framework:** React 18+ (via Vite) & TypeScript for strong typing.
*   **Rendering engine:** Three.js orchestrated declaratively through **React Three Fiber (R3F)** and `@react-three/drei`.
*   **Global State Management:** **Zustand**. Used extensively to decouple game logic from the React render cycle, allowing systems to publish and subscribe to state changes efficiently without causing heavy re-renders.

## 2. Architectural Pattern: React-ECS Hybrid

Rather than using a strict Entity-Component-System (ECS) library, the project leverages React's inherent component model to achieve an ECS-like architecture:

*   **Entities** are represented by React Components (e.g., `<Player />`, `<World />`, `<ProceduralTree />`).
*   **Components (Data/Logic)** are encapsulated as custom React hooks (e.g., `useKeyboard`, `useMousePosition`) or zustand cross-slice selectors (`useGameStore(state => state.player.health)`).
*   **Systems** are functional closures running inside R3F's `useFrame` hook, either globally (like time progression in `<GameLoop />`) or locally attached to specific entities (like movement and collision inside `<Player />`).

This approach provides immense flexibility, utilizing React for scene-graph composition (the DOM-like tree of 3D objects) and raw functional loops for performant physics/gameplay logic.

## 3. Core Systems Breakdown

### 3.1 The Game Loop System (`GameLoop.tsx`)
Unlike pure React where state changes immediately trigger renders, game loops require continuous updates independent of user input.
*   **Central Dispatch:** The discrete `GameLoop.tsx` component exists purely to hook into R3F's `useFrame`. It is a stateless functional component from React's perspective, but it calculates the `delta` time and triggers the Zustand store's `tick()` function once per frame.
*   **Pausable Time:** This system checks the `isPaused` state globally, pausing all delta-time accumulation if the player hits escape or opens a menu.

### 3.2 State Management System (`store/useGameStore.ts`)
Zustand acts as the "Blackboard" or single source of truth for the game world that persists across component mounts/unmounts.
*   **Data Layout:** It stores the `GameState` (elapsed time, pause flags, targeted action points) and `PlayerState` (health, position, collectable resources).
*   **Transient State Updates:** By passing a `false` or transient flag to Zustand set functions, or by accessing the store directly in `useFrame` without triggering a React state update, we mutate data precisely without thrashing the React reconciler.

### 3.3 Procedural World Generation System (`WorldGen.ts` & `World.tsx`)
The world is constructed chunk by chunk around the player.
*   **`WorldGen` Class:** A pure TypeScript class disconnected from React. It uses a consistent pseudo-random number generator (`RNG`) and `NoiseGenerator` seeded by the world string to predictably output structural data (trees, rocks, grass) based on world coordinates `(cx, cz)`.
*   **`World` Component Coordinator:** It reads the camera position, queries `WorldGen` for the necessary chunks within the `RENDER_DISTANCE` radius, caching generated `ChunkData` in a React state Map, and declaratively mapping the results to actual 3D `<group>` and `<mesh>` components in the scene.

### 3.4 Input & Control System
Player actions are captured declaratively and evaluated imperatively frame-by-frame.
*   **Input Hooks (`useKeyboard`, `useMousePosition`):** These hooks set up global `window` event listeners and maintain mutable refs or local state for the current snapshot of keys pressed and the 3D projected mouse position.
*   **Kinematic Character Controller (`Player.tsx`):** Every frame, the Player reads from the input hooks and the Zustand target position.
    *   **Rotation:** It physically updates its `<group>` wrapper's rotation matrix using `lookAt()` toward the mouse cursor.
    *   **Movement & Gravity:** It calculates a velocity vector based on WASD overrides or autonomous pathing toward a mouse-clicked destination, applies custom "fake" physics (gravity and jump force parameters from `Physics.ts`), and resolves basic floor collisions manually before calling `setPlayerPosition` back to the global store.

## 4. Directory Structure Guide

```text
src/
├── assets/          # Raw models, textures, or procedural asset wrappers (ProceduralTree.tsx)
├── components/      # The structural blocks of the scene graph
│   ├── core/        # Infra: GameCanvas (Roots), GameLoop, SceneLighting
│   ├── game/        # Gameplay entities: Player, World, Interactive Markers
│   └── ui/          # 2D DOM Overlays handling non-spatial UI
├── hooks/           # Pure data lifecycles capturing external input (Keyboard, Mouse)
├── store/           # Zustand state defining the current snapshot of reality
├── systems/         # Headless logic classes/constants (Physics parameters, WorldGen noise)
└── utils/           # Math and helpers (RNG, Noise wrappers)
```

## Summary
The combination of React's composition models with R3F's frame loop enables "The Glitch in the Goblet" to run decoupled logical systems side-by-side with declarative UI. Whether adding a new enemy AI behavior or debugging the chunk-spawning mechanism, systems are localized to explicit domains, making the project highly extensible.
