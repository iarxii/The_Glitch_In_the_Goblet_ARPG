import { useEffect, useMemo, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import { WorldGen, CHUNK_SIZE, type ChunkData } from '../../systems/WorldGen';
import { ProceduralTree } from '../assets/ProceduralTree';
import { ProceduralRock } from '../assets/ProceduralRock';

// Render distance in chunks (radius)
const RENDER_DISTANCE = 1;

export function World() {
    // Persistent WorldGen instance
    // TODO: Get seed from game store or config
    const worldGen = useMemo(() => new WorldGen('glitch-goblet-seed'), []);

    const [chunks, setChunks] = useState<Map<string, ChunkData>>(new Map());
    const { camera } = useThree();

    // Check for new chunks periodically or on move
    // For now, simpler: just load initial area
    useEffect(() => {
        const newChunks = new Map<string, ChunkData>();

        // Simple grid around origin (0,0) for now until player moves
        // Logic can be expanded to track camera position
        const camX = Math.floor(camera.position.x / CHUNK_SIZE);
        const camZ = Math.floor(camera.position.z / CHUNK_SIZE);

        for (let x = camX - RENDER_DISTANCE; x <= camX + RENDER_DISTANCE; x++) {
            for (let z = camZ - RENDER_DISTANCE; z <= camZ + RENDER_DISTANCE; z++) {
                const key = worldGen.getChunkKey(x, z);
                if (!chunks.has(key)) {
                    newChunks.set(key, worldGen.generateChunk(x, z));
                } else {
                    newChunks.set(key, chunks.get(key)!);
                }
            }
        }

        setChunks(newChunks);
    }, []); // Run once on mount for now

    return (
        <>
            {/* Ground Plane (Infinite illusion) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial color="#1a1a2e" />
            </mesh>

            <Grid
                position={[0, 0.01, 0]}
                args={[100, 100]}
                cellSize={1}
                cellThickness={0.5}
                cellColor="#334155"
                sectionSize={CHUNK_SIZE}
                sectionThickness={1}
                sectionColor="#6366f1"
                fadeDistance={50}
                infiniteGrid
            />

            {/* Render Chunks */}
            {[...chunks.values()].map((chunk) => (
                <group key={`chunk-${chunk.x}-${chunk.z}`}>
                    {chunk.objects.map((obj) => {
                        switch (obj.type) {
                            case 'tree':
                                return (
                                    <ProceduralTree
                                        key={obj.id}
                                        position={obj.position}
                                        scale={obj.scale}
                                        rotation={obj.rotation}
                                    />
                                );
                            case 'rock':
                                return (
                                    <ProceduralRock
                                        key={obj.id}
                                        position={obj.position}
                                        scale={obj.scale}
                                        rotation={obj.rotation}
                                    />
                                );
                            default:
                                return null;
                        }
                    })}
                </group>
            ))}
        </>
    );
}
