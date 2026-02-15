import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, DoubleSide } from 'three';

interface DestinationMarkerProps {
    position: [number, number, number];
}

export function DestinationMarker({ position }: DestinationMarkerProps) {
    const meshRef = useRef<Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        // Pulse effect
        const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
        meshRef.current.scale.set(scale, scale, 1);
    });

    return (
        <mesh
            ref={meshRef}
            position={[position[0], position[1] + 0.05, position[2]]}
            rotation={[-Math.PI / 2, 0, 0]} // Flat on ground
        >
            <ringGeometry args={[0.3, 0.4, 32]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.6} side={DoubleSide} />
        </mesh>
    );
}
