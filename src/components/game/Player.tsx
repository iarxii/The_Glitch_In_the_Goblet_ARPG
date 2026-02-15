import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

/**
 * Player (Placeholder)
 * --------------------
 * Represents the Debugger Knight.
 * Currently renders a simple box mesh.
 * Replace with a GLTF model once art assets are available.
 */
export function Player() {
    const meshRef = useRef<Mesh>(null);

    useFrame((_state, delta) => {
        if (meshRef.current) {
            // Gentle bob animation for now
            meshRef.current.rotation.y += delta * 0.5;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#00d4ff" />
        </mesh>
    );
}
