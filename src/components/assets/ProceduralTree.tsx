import { useMemo } from 'react';
import type { Vector3 } from '@react-three/fiber';

interface ProceduralTreeProps {
    position: [number, number, number];
    scale?: [number, number, number]; // Vector3 tuple
    rotation?: [number, number, number];
}

export function ProceduralTree({ position, scale = [1, 1, 1], rotation = [0, 0, 0] }: ProceduralTreeProps) {
    // Generate random variations based on position/seed later
    // For now simple reliable geometry

    return (
        <group position={position} scale={scale} rotation={rotation}>
            {/* Trunk */}
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.2, 0.4, 2, 8]} />
                <meshStandardMaterial color="#5D4037" />
            </mesh>

            {/* Foliage (Cone style) */}
            <mesh position={[0, 3, 0]} castShadow receiveShadow>
                <coneGeometry args={[1.5, 3, 8]} />
                <meshStandardMaterial color="#2E7D32" />
            </mesh>

            {/* Glitch artifacts (optional wires) */}
            <mesh position={[0, 2, 0]} rotation={[0, 0, 0.5]}>
                <torusGeometry args={[0.8, 0.02, 4, 16]} />
                <meshBasicMaterial color="#00FF00" wireframe />
            </mesh>
        </group>
    );
}
