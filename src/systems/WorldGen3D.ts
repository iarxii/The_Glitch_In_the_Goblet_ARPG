import { Noise3DGenerator } from '../utils/noise3d';
import { NoiseGenerator } from '../utils'; // 2D noise for surface
import { RNG } from '../utils';

export const CHUNK_SIZE = 16;
export const CHUNK_HEIGHT = 16; // Number of vertical blocks in a chunk

export const BlockType = {
    Empty: 0,
    Stone: 1,
    Dirt: 2,
    Grass: 3,
    Crystal: 4,
} as const;

export type BlockType = typeof BlockType[keyof typeof BlockType];

export interface ChunkVoxelData {
    x: number;
    y: number;
    z: number;
    blocks: Uint8Array; // 1D array representing 3D grid
    // For portals
    hasExit?: boolean;
    exitPosition?: [number, number, number];
}

export class WorldGen3D {
    private noise3D: Noise3DGenerator;
    private surfaceNoise: NoiseGenerator;
    private rng: RNG;

    constructor(seed: number | string) {
        this.noise3D = new Noise3DGenerator(seed);
        this.surfaceNoise = new NoiseGenerator(seed);
        this.rng = new RNG(seed);
    }

    getChunkKey(cx: number, cy: number, cz: number): string {
        return `${cx},${cy},${cz}`;
    }

    private getIndex(x: number, y: number, z: number): number {
        return x + CHUNK_SIZE * (y + CHUNK_HEIGHT * z);
    }

    generateChunk(cx: number, cy: number, cz: number): ChunkVoxelData {
        const blocks = new Uint8Array(CHUNK_SIZE * CHUNK_HEIGHT * CHUNK_SIZE);

        const worldOffsetX = cx * CHUNK_SIZE;
        const worldOffsetY = cy * CHUNK_HEIGHT;
        const worldOffsetZ = cz * CHUNK_SIZE;

        let hasExit = false;
        let exitPosition: [number, number, number] | undefined = undefined;

        // Randomly place an exit portal rarely logic
        const chunkRng = new RNG(`${this.rng.next()}_${cx}_${cy}_${cz}`);

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                const wx = worldOffsetX + x;
                const wz = worldOffsetZ + z;

                // Base terrain height map
                const surfaceHeight = Math.floor(this.surfaceNoise.fbm(wx, wz, 4, 0.5, 2, 0.02) * 10 + 5);

                for (let y = 0; y < CHUNK_HEIGHT; y++) {
                    const wy = worldOffsetY + y;
                    const index = this.getIndex(x, y, z);

                    // Default to empty above surface
                    let isSolid = false;
                    let isArena = false;

                    if (wy <= surfaceHeight) {
                        isSolid = true; // default underground is solid

                        // 1. Carve Tunnels (Worm-like structures using abs of FBM)
                        const tunnelNoise = this.noise3D.fbm(wx, wy, wz, 3, 0.5, 2, 0.05);
                        if (Math.abs(tunnelNoise) < 0.08) {
                            isSolid = false;
                        }

                        // 2. Carve Arenas (Large sparse rooms using low frequency noise)
                        const arenaNoise = this.noise3D.get(wx, wy, wz, 0.02);
                        if (arenaNoise > 0.55) {
                            isSolid = false;
                            isArena = true;
                        }

                        // Hard bedrock boundary
                        if (wy < -20) {
                            isSolid = true;
                            isArena = false;
                        }
                    }

                    if (isSolid) {
                        if (wy === surfaceHeight) {
                            blocks[index] = BlockType.Grass;
                        } else if (wy > surfaceHeight - 3) {
                            blocks[index] = BlockType.Dirt;
                        } else {
                            // Rare crystal veins in walls
                            const crystalDensity = this.noise3D.get(wx, wy, wz, 0.2);
                            if (crystalDensity > 0.8) {
                                blocks[index] = BlockType.Crystal;
                            } else {
                                blocks[index] = BlockType.Stone;
                            }
                        }
                    } else {
                        // Empty space
                        blocks[index] = BlockType.Empty;

                        // Place portals only in Arenas
                        if (!hasExit && isArena && wy > 0) {
                            // Very low probability per empty block, but since arenas are huge, this hits often enough
                            // Max 1 per chunk
                            if (chunkRng.next() > 0.999) {
                                hasExit = true;
                                exitPosition = [wx, wy + 0.5, wz];
                            }
                        }
                    }
                }
            }
        }

        return { x: cx, y: cy, z: cz, blocks, hasExit, exitPosition };
    }
}
