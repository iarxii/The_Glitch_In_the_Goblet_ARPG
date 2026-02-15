/**
 * Simple Linear Congruential Generator (LCG) for seeded random numbers.
 * Not cryptographically secure, but sufficient for procedural generation.
 * Parameters from numerical recipes or common LCG constants.
 */
export class RNG {
    private seed: number;

    constructor(seed: number | string) {
        if (typeof seed === 'string') {
            this.seed = this.hashString(seed);
        } else {
            this.seed = seed;
        }
    }

    private hashString(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Returns a float between 0 (inclusive) and 1 (exclusive).
     */
    next(): number {
        // LCG constants
        const a = 1664525;
        const c = 1013904223;
        const m = 4294967296; // 2^32

        this.seed = (a * this.seed + c) % m;
        return this.seed / m;
    }

    /**
     * Returns a float between min (inclusive) and max (exclusive).
     */
    range(min: number, max: number): number {
        return min + this.next() * (max - min);
    }

    /**
     * Returns true or false based on probability (0-1).
     */
    chance(probability: number): boolean {
        return this.next() < probability;
    }
}
