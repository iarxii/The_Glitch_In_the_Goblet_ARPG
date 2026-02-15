import { useFrame, useThree } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import * as THREE from 'three';
import { useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export function CameraFollow() {
    const playerPos = useGameStore((s) => s.player.position);
    const { camera, controls } = useThree();

    // Store previous player position to calculate delta
    const prevPlayerPos = useRef(new THREE.Vector3(...playerPos));

    useFrame((_state, _delta) => {
        if (!controls) return;

        const orbit = controls as unknown as OrbitControlsImpl;
        const target = new THREE.Vector3(...playerPos);

        // Calculate how much player moved
        const displacement = target.clone().sub(prevPlayerPos.current);

        // Move camera by same amount to maintain relative offset
        camera.position.add(displacement);

        // Update control target to look at player
        orbit.target.copy(target);

        // Update controls
        orbit.update();

        // Sync ref
        prevPlayerPos.current.copy(target);
    });

    return null;
}
