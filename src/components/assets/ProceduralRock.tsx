import type { Vector3 } from '@react-three/fiber';

interface ProceduralRockProps {
    position: [number, number, number];
    scale?: [number, number, number];
    rotation?: [number, number, number];
}

export function ProceduralRock({ position, scale = [1, 1, 1], rotation = [0, 0, 0] }: ProceduralRockProps) {
    return (
        <group position={position} scale={scale} rotation={rotation}>
            <mesh castShadow receiveShadow>
                <dodecahedronGeometry args={[0.8, 0]} />
                <meshStandardMaterial color="#78909C" flatShading />
            </mesh>
            {/* Detail variation */}
            <mesh position={[0.4, -0.2, 0.3]} scale={0.5} castShadow>
                <dodecahedronGeometry args={[0.6, 0]} />
                <meshStandardMaterial color="#546E7A" flatShading />
            </mesh>
        </group>
    );
}
