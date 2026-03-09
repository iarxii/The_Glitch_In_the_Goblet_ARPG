import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { useGameStore } from '../../store/useGameStore';
import { MeshTransmissionMaterial } from '@react-three/drei';

interface PortalProps {
    position: [number, number, number];
}

export function Portal({ position }: PortalProps) {
    const meshRef = useRef<Mesh>(null);
    const playerPosRef = useRef<Vector3>(new Vector3());

    const advanceLevel = useGameStore((s) => s.advanceLevel);

    // Sync player position without triggering re-renders to check distance
    useFrame(() => {
        if (!meshRef.current) return;
        meshRef.current.rotation.y += 0.02;

        const playerPos = useGameStore.getState().player.position;
        playerPosRef.current.set(...playerPos);

        const dist = playerPosRef.current.distanceTo(meshRef.current.position);

        if (dist < 1.5) {
            // Player entered the portal
            advanceLevel();
        }
    });

    return (
        <group position={position}>
            {/* Inner Portal Frame */}
            <mesh ref={meshRef} position={[0, 0.5, 0]}>
                <torusGeometry args={[0.8, 0.2, 16, 32]} />
                <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={2} />
            </mesh>

            {/* Portal Surface (Glass/Transmission) */}
            <mesh position={[0, 0.5, 0]}>
                <circleGeometry args={[0.7, 32]} />
                <MeshTransmissionMaterial
                    backside
                    samples={4}
                    thickness={0.2}
                    chromaticAberration={2}
                    anisotropy={0.5}
                    distortion={0.5}
                    distortionScale={1}
                    temporalDistortion={0.2}
                    color="#ffffff"
                />
            </mesh>

            {/* Point light to glow */}
            <pointLight position={[0, 0.5, 0]} color="#c084fc" intensity={5} distance={5} />
        </group>
    );
}
