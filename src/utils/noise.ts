import { createNoise2D } from 'simplex-noise';
import { RNG } from './rng';

export class NoiseGenerator {
    private noise2D: (x: number, y: number) => number;

    constructor(seed: number | string) {
        const rng = new RNG(seed);
        // simplex-noise 4.x accepts a random function
        this.noise2D = createNoise2D(() => rng.next());
    }

    /**
     * Returns noise value roughly between -1 and 1.
     * @param x X coordinate
     * @param y Y coordinate
     * @param scale Frequency scale (smaller number = larger features)
     */
    get(x: number, y: number, scale: number = 0.01): number {
        return this.noise2D(x * scale, y * scale);
    }

    /**
     * Returns fractal noise (multiple octaves).
     */
    fbm(x: number, y: number, octaves: number = 4, persistence: number = 0.5, lacunarity: number = 2, scale: number = 0.01): number {
        let total = 0;
        let frequency = scale;
        let amplitude = 1;
        let maxValue = 0;  // Used for normalizing result to 0.0 - 1.0

        for (let i = 0; i < octaves; i++) {
            total += this.noise2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue;
    }
}
