import { describe, it, expect } from 'vitest';
import { clamp, lerp, degToRad, randomRange } from '../../utils/math';

describe('math utilities', () => {
    describe('clamp()', () => {
        it('should return the value when within range', () => {
            expect(clamp(5, 0, 10)).toBe(5);
        });

        it('should clamp to min', () => {
            expect(clamp(-5, 0, 10)).toBe(0);
        });

        it('should clamp to max', () => {
            expect(clamp(15, 0, 10)).toBe(10);
        });
    });

    describe('lerp()', () => {
        it('should return a when t = 0', () => {
            expect(lerp(0, 10, 0)).toBe(0);
        });

        it('should return b when t = 1', () => {
            expect(lerp(0, 10, 1)).toBe(10);
        });

        it('should return midpoint when t = 0.5', () => {
            expect(lerp(0, 10, 0.5)).toBe(5);
        });

        it('should clamp t so it does not exceed the range', () => {
            expect(lerp(0, 10, 2)).toBe(10);
            expect(lerp(0, 10, -1)).toBe(0);
        });
    });

    describe('degToRad()', () => {
        it('should convert 180° to π', () => {
            expect(degToRad(180)).toBeCloseTo(Math.PI);
        });

        it('should convert 0° to 0', () => {
            expect(degToRad(0)).toBe(0);
        });
    });

    describe('randomRange()', () => {
        it('should return a value within [min, max)', () => {
            for (let i = 0; i < 50; i++) {
                const val = randomRange(5, 10);
                expect(val).toBeGreaterThanOrEqual(5);
                expect(val).toBeLessThan(10);
            }
        });
    });
});
