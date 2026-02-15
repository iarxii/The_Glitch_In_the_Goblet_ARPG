import { NoiseGenerator, RNG } from '../utils';

export const CHUNK_SIZE = 32; // Units

export interface WorldObject {
    id: string; // Unique ID for keying
    type: 'tree' | 'rock' | 'grass';
    position: [number, number, number];
    scale: [number, number, number];
    rotation: [number, number, number];
}

export interface ChunkData {
    x: number;
    z: number;
    objects: WorldObject[];
}

export class WorldGen {
    private noise: NoiseGenerator;
    private rng: RNG;

    constructor(seed: number | string) {
        this.noise = new NoiseGenerator(seed);
        this.rng = new RNG(seed);
    }

    getChunkKey(x: number, z: number): string {
        return `${x},${z}`;
    }

    generateChunk(cx: number, cz: number): ChunkData {
        const objects: WorldObject[] = [];
        const chunkRng = new RNG(`${this.rng.next()}_${cx}_${cz}`); // Pseudo-random specific to chunk

        // Populate chunk
        const objectCount = Math.floor(chunkRng.range(5, 15));

        for (let i = 0; i < objectCount; i++) {
            // Local coordinates within chunk
            const lx = chunkRng.range(0, CHUNK_SIZE);
            const lz = chunkRng.range(0, CHUNK_SIZE);

            // World coordinates
            const wx = cx * CHUNK_SIZE + lx;
            const wz = cz * CHUNK_SIZE + lz;

            // Use noise for density/biomes (example: forests)
            const density = this.noise.get(wx, wz, 0.05); // Large scale features

            if (density > 0.2) {
                // Determine type based on noise or RNG
                const typeVal = chunkRng.next();
                let type: WorldObject['type'] = 'tree';

                if (typeVal > 0.7) type = 'rock';
                else if (typeVal > 0.9) type = 'grass';

                objects.push({
                    id: `${cx}_${cz}_${i}`,
                    type,
                    position: [wx, 0, wz], // Flat ground for now
                    scale: [
                        chunkRng.range(0.8, 1.5),
                        chunkRng.range(0.8, 1.5),
                        chunkRng.range(0.8, 1.5)
                    ],
                    rotation: [0, chunkRng.range(0, Math.PI * 2), 0]
                });
            }
        }

        return {
            x: cx,
            z: cz,
            objects
        };
    }
}
