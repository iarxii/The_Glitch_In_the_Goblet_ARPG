import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { Vector3 } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { MutableRefObject } from 'react';

/**
 * CameraFollow
 * ------------
 * Updates the camera position and correct OrbitControls target 
 * to follow the player smoothly.
 */
export function CameraFollow({ controlsRef }: { controlsRef: MutableRefObject<OrbitControlsImpl | null> }) {
    const { camera } = useThree();
    const playerPos = useGameStore((state) => state.player.position);

    // Store previous player position to calculate delta
    // Actually simpler: Determine desired target position and existing offset.
    // Ideally OrbitControls.target should match Player Position.
    // If we move OrbitControls.target, and we want to keep the same relative camera offset,
    // we must also move the camera by the same delta.

    // If controls are enabled, they manage camera position based on target + spherical coords.
    // So we just need to update controls.target!
    // OrbitControls will handle moving the camera if it's in 'update' loop.
    // By default OrbitControls updates camera position based on target.

    useFrame(() => {
        if (!controlsRef.current) return;

        const target = controlsRef.current.target;
        const pVector = new Vector3(...playerPos);

        // Smooth follow logic could go here (lerp)
        // For classic ARPG, instant lock is often preferred, or very fast lerp.
        // Let's use direct assignment for "locked" feel first.

        // Calculate constant offset?
        // No, current camera position is derived from target + rotation/zoom.
        // If we change target, we want to shift camera by same amount (pVector - target).

        const delta = pVector.clone().sub(target);

        if (delta.lengthSq() > 0.0001) {
            camera.position.add(delta);
            controlsRef.current.target.copy(pVector);
            controlsRef.current.update();
        }
    });

    return null;
}
