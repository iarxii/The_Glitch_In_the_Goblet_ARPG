import { createNoise3D } from 'simplex-noise';
import { RNG } from './rng';

export class Noise3DGenerator {
    private noise3D: (x: number, y: number, z: number) => number;

    constructor(seed: number | string) {
        const rng = new RNG(seed);
        this.noise3D = createNoise3D(() => rng.next());
    }

    /**
     * Returns noise value roughly between -1 and 1.
     * @param scale Frequency scale (smaller number = larger features)
     */
    get(x: number, y: number, z: number, scale: number = 0.05): number {
        return this.noise3D(x * scale, y * scale, z * scale);
    }

    /**
     * Returns fractal noise (multiple octaves).
     */
    fbm(x: number, y: number, z: number, octaves: number = 4, persistence: number = 0.5, lacunarity: number = 2, scale: number = 0.05): number {
        let total = 0;
        let frequency = scale;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue;
    }
}
