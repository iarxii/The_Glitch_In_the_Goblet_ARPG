import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import { requestChunk, type ChunkInfo } from '../../systems/ChunkManager';
import { ContinuousChunk } from '../world/ContinuousChunk';
import { useGameStore } from '../../store/useGameStore';

const CHUNK_SIZE = 32;
const RENDER_DISTANCE = 1;

export function World() {
    const levelSeed = useGameStore((s) => s.levelSeed);
    const [chunks, setChunks] = useState<Map<string, ChunkInfo>>(new Map());
    const { camera } = useThree();

    useEffect(() => {
        let isCancelled = false;
        const newChunks = new Map<string, ChunkInfo>();
        const requests: Promise<void>[] = [];

        // Generate a 3x3x3 grid of chunks around origin for starters
        // Actually, let's keep it mostly around y=0
        const camX = Math.floor(camera.position.x / CHUNK_SIZE);
        const camZ = Math.floor(camera.position.z / CHUNK_SIZE);
        const camY = 0; // simplified for now

        for (let x = camX - RENDER_DISTANCE; x <= camX + RENDER_DISTANCE; x++) {
            for (let z = camZ - RENDER_DISTANCE; z <= camZ + RENDER_DISTANCE; z++) {
                // Generate chunk slightly below ground up to player level
                for (let y = camY - 1; y <= camY; y++) {
                    const key = `${x},${y},${z}`;
                    if (!chunks.has(key)) {
                        requests.push(
                            requestChunk(x, y, z, levelSeed).then(data => {
                                if (!isCancelled) {
                                    setChunks(prev => new Map(prev).set(key, data));
                                }
                            })
                        );
                    } else {
                        newChunks.set(key, chunks.get(key)!);
                    }
                }
            }
        }

        if (requests.length > 0) {
            Promise.all(requests).then(() => {
                if (!isCancelled) {
                    useGameStore.getState().setTerrainLoaded(true);
                }
            });
        }

        if (requests.length === 0 && Array.from(chunks.keys()).join(',') !== Array.from(newChunks.keys()).join(',')) {
            setChunks(newChunks);
            useGameStore.getState().setTerrainLoaded(true);
        }

        return () => {
            isCancelled = true;
        };
    }, [levelSeed]); // Regenerate when levelSeed changes

    return (
        <>
            {/* Ground Plane (Infinite illusion) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
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
                <ContinuousChunk
                    key={`chunk-${chunk.cx}-${chunk.cy}-${chunk.cz}`}
                    cx={chunk.cx} cy={chunk.cy} cz={chunk.cz}
                    positions={chunk.positions} normals={chunk.normals}
                />
            ))}
        </>
    );
}
