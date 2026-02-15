import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlayerState {
    position: [number, number, number];
    health: number;
    maxHealth: number;
    optimizationOrbs: number;
    dataFragments: number;
    textureShards: number;
}

export interface GameState {
    /** Total elapsed game-time in seconds */
    elapsedTime: number;
    /** Whether the game loop is paused */
    isPaused: boolean;
    /** Player state */
    player: PlayerState;

    // -- Actions --
    tick: (delta: number) => void;
    togglePause: () => void;
    setPlayerPosition: (pos: [number, number, number]) => void;
    damagePlayer: (amount: number) => void;
    healPlayer: (amount: number) => void;
    showAimIndicator: boolean;
    toggleAimIndicator: () => void;
    targetPosition: [number, number, number] | null;
    setTargetPosition: (pos: [number, number, number] | null) => void;
    collectLoot: (type: 'optimizationOrbs' | 'dataFragments' | 'textureShards', amount?: number) => void;
    resetGame: () => void;
}

// ---------------------------------------------------------------------------
// Initial state factory (for easy resets)
// ---------------------------------------------------------------------------

const initialPlayerState: PlayerState = {
    position: [0, 0.5, 0],
    health: 100,
    maxHealth: 100,
    optimizationOrbs: 0,
    dataFragments: 0,
    textureShards: 0,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGameStore = create<GameState>()(
    devtools(
        (set) => ({
            elapsedTime: 0,
            isPaused: false,
            showAimIndicator: true, // Default on
            targetPosition: null, // No target initially
            player: { ...initialPlayerState },

            toggleAimIndicator: () =>
                set((state) => ({ showAimIndicator: !state.showAimIndicator }), false, 'toggleAimIndicator'),

            setTargetPosition: (pos) => set({ targetPosition: pos }, false, 'setTargetPosition'),

            tick: (delta) =>
                set(
                    (state) => ({ elapsedTime: state.elapsedTime + delta }),
                    false,
                    'tick',
                ),

            togglePause: () =>
                set(
                    (state) => ({ isPaused: !state.isPaused }),
                    false,
                    'togglePause',
                ),

            setPlayerPosition: (pos) =>
                set(
                    (state) => ({ player: { ...state.player, position: pos } }),
                    false,
                    'setPlayerPosition',
                ),

            damagePlayer: (amount) =>
                set(
                    (state) => ({
                        player: {
                            ...state.player,
                            health: Math.max(0, state.player.health - amount),
                        },
                    }),
                    false,
                    'damagePlayer',
                ),

            healPlayer: (amount) =>
                set(
                    (state) => ({
                        player: {
                            ...state.player,
                            health: Math.min(state.player.maxHealth, state.player.health + amount),
                        },
                    }),
                    false,
                    'healPlayer',
                ),

            collectLoot: (type, amount = 1) =>
                set(
                    (state) => ({
                        player: {
                            ...state.player,
                            [type]: state.player[type] + amount,
                        },
                    }),
                    false,
                    'collectLoot',
                ),

            resetGame: () =>
                set(
                    { elapsedTime: 0, isPaused: false, player: { ...initialPlayerState } },
                    false,
                    'resetGame',
                ),
        }),
        { name: 'GameStore' },
    ),
);
