import { Grid } from '@react-three/drei';

/**
 * World (Placeholder)
 * -------------------
 * The ground / environment placeholder.
 * Renders a flat plane and a reference grid.
 */
export function World() {
    return (
        <>
            {/* Ground plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
                <planeGeometry args={[50, 50]} />
                <meshStandardMaterial color="#1a1a2e" />
            </mesh>

            {/* Reference grid */}
            <Grid
                position={[0, 0.01, 0]}
                args={[50, 50]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#334155"
                sectionSize={5}
                sectionThickness={1}
                sectionColor="#6366f1"
                fadeDistance={30}
                infiniteGrid
            />
        </>
    );
}
