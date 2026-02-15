import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface AimIndicatorProps {
    start: THREE.Vector3;
    end: THREE.Vector3;
}

export function AimIndicator({ start, end }: AimIndicatorProps) {
    // Lift line slightly above ground to avoid z-fighting
    const points = [
        [start.x, 0.1, start.z] as [number, number, number],
        [end.x, 0.1, end.z] as [number, number, number]
    ];

    return (
        <Line
            points={points}
            color="#ff0055"
            lineWidth={2}
            dashed
            dashScale={5}
            gapSize={2}
            opacity={0.6}
            transparent
        />
    );
}
