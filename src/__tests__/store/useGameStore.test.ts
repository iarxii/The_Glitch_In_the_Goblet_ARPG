import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../../store/useGameStore';

describe('useGameStore', () => {
    beforeEach(() => {
        // Reset to initial state before each test
        useGameStore.getState().resetGame();
    });

    it('should initialise with default values', () => {
        const state = useGameStore.getState();
        expect(state.elapsedTime).toBe(0);
        expect(state.isPaused).toBe(false);
        expect(state.player.health).toBe(100);
        expect(state.player.maxHealth).toBe(100);
        expect(state.player.optimizationOrbs).toBe(0);
    });

    describe('tick()', () => {
        it('should advance elapsed time by delta', () => {
            useGameStore.getState().tick(0.016);
            expect(useGameStore.getState().elapsedTime).toBeCloseTo(0.016);
        });
    });

    describe('togglePause()', () => {
        it('should toggle the paused state', () => {
            useGameStore.getState().togglePause();
            expect(useGameStore.getState().isPaused).toBe(true);

            useGameStore.getState().togglePause();
            expect(useGameStore.getState().isPaused).toBe(false);
        });
    });

    describe('damagePlayer()', () => {
        it('should reduce player health by the given amount', () => {
            useGameStore.getState().damagePlayer(30);
            expect(useGameStore.getState().player.health).toBe(70);
        });

        it('should clamp health to 0', () => {
            useGameStore.getState().damagePlayer(999);
            expect(useGameStore.getState().player.health).toBe(0);
        });
    });

    describe('healPlayer()', () => {
        it('should increase player health', () => {
            useGameStore.getState().damagePlayer(50);
            useGameStore.getState().healPlayer(20);
            expect(useGameStore.getState().player.health).toBe(70);
        });

        it('should not exceed maxHealth', () => {
            useGameStore.getState().healPlayer(999);
            expect(useGameStore.getState().player.health).toBe(100);
        });
    });

    describe('collectLoot()', () => {
        it('should increment optimizationOrbs by 1 by default', () => {
            useGameStore.getState().collectLoot('optimizationOrbs');
            expect(useGameStore.getState().player.optimizationOrbs).toBe(1);
        });

        it('should increment by a custom amount', () => {
            useGameStore.getState().collectLoot('dataFragments', 5);
            expect(useGameStore.getState().player.dataFragments).toBe(5);
        });
    });

    describe('resetGame()', () => {
        it('should reset everything to initial values', () => {
            useGameStore.getState().tick(10);
            useGameStore.getState().damagePlayer(50);
            useGameStore.getState().collectLoot('textureShards', 3);
            useGameStore.getState().togglePause();

            useGameStore.getState().resetGame();

            const state = useGameStore.getState();
            expect(state.elapsedTime).toBe(0);
            expect(state.isPaused).toBe(false);
            expect(state.player.health).toBe(100);
            expect(state.player.textureShards).toBe(0);
        });
    });
});
