import { useCallback, useEffect, useRef } from 'react';

/**
 * useKeyboard
 * -----------
 * Tracks which keys are currently pressed.
 * Returns a stable `isKeyDown(key)` function.
 *
 * @example
 *   const isKeyDown = useKeyboard();
 *   useFrame(() => {
 *     if (isKeyDown('KeyW')) moveForward();
 *   });
 */
export function useKeyboard() {
    const keys = useRef<Set<string>>(new Set());

    useEffect(() => {
        const onDown = (e: KeyboardEvent) => keys.current.add(e.code);
        const onUp = (e: KeyboardEvent) => keys.current.delete(e.code);

        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup', onUp);
        return () => {
            window.removeEventListener('keydown', onDown);
            window.removeEventListener('keyup', onUp);
        };
    }, []);

    const isKeyDown = useCallback((code: string) => keys.current.has(code), []);
    return isKeyDown;
}
