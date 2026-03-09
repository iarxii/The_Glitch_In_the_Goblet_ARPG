import { useRef, useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute, Mesh } from 'three';
import { RigidBody, TrimeshCollider } from '@react-three/rapier';
import { GlitchMaterial } from '../shaders/GlitchMaterial';

interface ContinuousChunkProps {
    cx: number;
    cy: number;
    cz: number;
    positions: Float32Array;
    normals: Float32Array;
}

export function ContinuousChunk({ cx, cy, cz, positions, normals }: ContinuousChunkProps) {
    const meshRef = useRef<Mesh>(null);

    const geometry = useMemo(() => {
        const geo = new BufferGeometry();
        // Since positions holds x,y,z in local chunk chunk space we actually just use the raw geometry
        // wait, the worker generated positions are relative to chunk world positions or local?
        // Worker: `const wx = worldOffsetX + x;`
        // `edgeVerts[0] = [x, y, z]`
        // Wait! My worker computed `p0 = [x, y, z]` which means local coordinates!
        geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
        geo.setAttribute('normal', new Float32BufferAttribute(normals, 3));
        return geo;
    }, [positions, normals]);

    if (positions.length === 0) return null;

    // The raw positions are [0..32]. We must offset the mesh visually and physically.
    // wait, my worker defined:
    // const gridResX = chunkSize + 1;
    // const p0 = [x, y, z];
    // Yes, they are in [0, 32] local space.
    // I need to know chunkSize to position it correctly. I can pass world position as props or calculate if chunkSize is exported.
    const CHUNK_SIZE = 32;
    const CHUNK_HEIGHT = 32;
    const worldPosition = [cx * CHUNK_SIZE, cy * CHUNK_HEIGHT, cz * CHUNK_SIZE] as const;

    return (
        <group position={worldPosition}>
            <mesh ref={meshRef} geometry={geometry}>
                <GlitchMaterial vertexColors={false} wobbleAmount={0.01} wobbleSpeed={0.5} />
            </mesh>

            <RigidBody type="fixed" colliders={false} friction={1}>
                {/* TrimeshCollider needs vertices (positions) and indices. Since we generated non-indexed geometry,
                    the vertices array directly maps to triangles.
                    Wait, Rapier Trimesh requires an indices array if unindexed, or we construct it.
                    Actually, if colliders="trimesh" is passed to RigidBody, it auto-generates it from mesh geometry!
                */}
                <TrimeshCollider args={[positions, Array.from({ length: positions.length / 3 }, (_, i) => i)]} />
            </RigidBody>
        </group>
    );
}
