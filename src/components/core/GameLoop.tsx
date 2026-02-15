import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';

/**
 * GameLoop
 * --------
 * Central game-loop component.  Runs every frame via R3F's `useFrame`.
 * Responsible for advancing global game time and dispatching
 * per-frame updates to game systems.
 *
 * NOTE: Individual entity logic (movement, AI) should live in their
 * own components' `useFrame` hooks to stay modular.  This component
 * handles *global* concerns only (e.g. time tracking, pausing).
 */
export function GameLoop() {
    const isPaused = useGameStore((s) => s.isPaused);
    const tick = useGameStore((s) => s.tick);

    useFrame((_state, delta) => {
        if (isPaused) return;
        tick(delta);
    });

    return null; // This is a logic-only component, no JSX output
}
