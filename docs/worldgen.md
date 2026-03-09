# World Generation (3D Voxel Dungeons)

The world generation system has been refactored in Phase 2 from a flat 2D plane to a fully volumetric, 3D Voxel Chunk system.

## 1. The Core Algorithm (`WorldGen3D.ts`)

Instead of just checking $x$ and $z$ coordinates, the generator now checks $x$, $y$, and $z$ against a 3D Noise density function (`Noise3DGenerator` wrapping `simplex-noise`).

*   **Chunks:** The world is divided into chunks. A chunk is defined by `CHUNK_SIZE` (x, z) and `CHUNK_HEIGHT` (y). Currently, we run a single vertical chunk, but the system is designed to allow stacking chunks vertically if deep underground descents are added.
*   **Surface:** A 2D Fractional Brownian Motion (FBM) noise map calculates the `surfaceHeight`.
*   **Volumetrics:** For every block below the surface, we calculate a 3D density using 3D FBM. If the density > 0.1, the block solidifies into stone, dirt, or crystal veins. If it is less, it hollows out, naturally carving complex cave systems and underhangs.

## 2. Block Types & The Data Array

To keep memory low, chunk voxel data is stored as a 1D `Uint8Array`.

*   0: Empty (Air)
*   1: Stone (Base cave wall)
*   2: Dirt (Sub-surface layer)
*   3: Grass (Top layer at `surfaceHeight`)
*   4: Crystal (Rare pockets determined by high-frequency 3D noise)

## 3. High-Performance Rendering (`Chunk.tsx`)

Rendering thousands of `<mesh>` components in React Three Fiber crushes performance. Instead, we use a single `THREE.InstancedMesh` per chunk.

1.  We iterate over the chunk's 1D array.
2.  For every solid block, we calculate its world transform (`Matrix4`) and corresponding color.
3.  We pass all matrices into `InstancedMesh.setMatrixAt()` and set all colors into an `InstancedBufferAttribute`.
4.  This reduces draw calls per chunk from potentially 4,096 down to **1**.

## 4. Physics & Rapier

Physics are handled via `@react-three/rapier`. Currently, the `Chunk.tsx` generates an array of standard `CuboidCollider` args mapping exactly to the solid blocks. For extreme optimization in the future, a greedy meshing algorithm can combine adjacent colliders into larger, single bounding boxes.

## 5. Portals (Level Transitions)

During chunk generation, there is a very small probability (`> 0.9995`) to spawn an Exit Portal in empty space. The portal syncs with the Zustand store (`useGameStore`). Walking into it calls `advanceLevel()`, which increments the state's `levelSeed` string, wiping the current chunks in `World.tsx` and generating an entirely fresh dungeon layout while preserving player stats.
