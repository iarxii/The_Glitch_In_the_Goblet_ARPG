import { useRef, useMemo, useEffect } from 'react';
import { InstancedMesh, Matrix4, Object3D, Color, InstancedBufferAttribute } from 'three';
import { type ChunkVoxelData, BlockType, CHUNK_SIZE, CHUNK_HEIGHT } from '../../systems/WorldGen3D';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { GlitchMaterial } from '../shaders/GlitchMaterial';
import { Portal } from './Portal';

interface ChunkProps {
    data: ChunkVoxelData;
}

const colorTmp = new Color();
const dummy = new Object3D();

export function Chunk({ data }: ChunkProps) {
    const meshRef = useRef<InstancedMesh>(null);

    // Compute active blocks and colors for the InstancedMesh
    const { blockCount, matrixArray, colorArray, boundingBoxes } = useMemo(() => {
        const _matrixArray: Matrix4[] = [];
        const _colorArray: number[] = [];
        const _boundingBoxes: { position: [number, number, number]; size: [number, number, number] }[] = [];

        for (let x = 0; x < CHUNK_SIZE; x++) {
            for (let y = 0; y < CHUNK_HEIGHT; y++) {
                for (let z = 0; z < CHUNK_SIZE; z++) {
                    const index = x + CHUNK_SIZE * (y + CHUNK_HEIGHT * z);
                    const type = data.blocks[index];

                    if (type !== BlockType.Empty) {
                        // World position
                        const wx = data.x * CHUNK_SIZE + x;
                        const wy = data.y * CHUNK_HEIGHT + y;
                        const wz = data.z * CHUNK_SIZE + z;

                        // Visual
                        dummy.position.set(wx, wy, wz);
                        dummy.updateMatrix();
                        _matrixArray.push(dummy.matrix.clone());

                        if (type === BlockType.Grass) colorTmp.set('#4ade80');
                        else if (type === BlockType.Dirt) colorTmp.set('#a16207');
                        else if (type === BlockType.Stone) colorTmp.set('#475569');
                        else if (type === BlockType.Crystal) colorTmp.set('#c084fc');
                        else colorTmp.set('#ffffff');

                        _colorArray.push(colorTmp.r, colorTmp.g, colorTmp.b);
                    }
                }
            }
        }

        // 1D Greedy Meshing for Physics (Merging adjacent blocks on X-axis)
        for (let y = 0; y < CHUNK_HEIGHT; y++) {
            for (let z = 0; z < CHUNK_SIZE; z++) {
                let startX = -1;
                for (let x = 0; x < CHUNK_SIZE; x++) {
                    const index = x + CHUNK_SIZE * (y + CHUNK_HEIGHT * z);
                    const isSolid = data.blocks[index] !== BlockType.Empty;

                    if (isSolid && startX === -1) {
                        startX = x; // Start run
                    } else if (!isSolid && startX !== -1) {
                        // End run
                        const length = x - startX;
                        const wx = data.x * CHUNK_SIZE + startX + length / 2 - 0.5;
                        const wy = data.y * CHUNK_HEIGHT + y;
                        const wz = data.z * CHUNK_SIZE + z;

                        _boundingBoxes.push({ position: [wx, wy, wz], size: [length / 2, 0.5, 0.5] });
                        startX = -1;
                    }
                }
                if (startX !== -1) {
                    const length = CHUNK_SIZE - startX;
                    const wx = data.x * CHUNK_SIZE + startX + length / 2 - 0.5;
                    const wy = data.y * CHUNK_HEIGHT + y;
                    const wz = data.z * CHUNK_SIZE + z;

                    _boundingBoxes.push({ position: [wx, wy, wz], size: [length / 2, 0.5, 0.5] });
                }
            }
        }

        return {
            blockCount: _matrixArray.length,
            matrixArray: _matrixArray,
            colorArray: Float32Array.from(_colorArray),
            boundingBoxes: _boundingBoxes,
        };
    }, [data]);

    useEffect(() => {
        if (!meshRef.current || blockCount === 0) return;

        matrixArray.forEach((mat, i) => {
            meshRef.current!.setMatrixAt(i, mat);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;

        if (meshRef.current.geometry) {
            meshRef.current.geometry.setAttribute('color', new InstancedBufferAttribute(colorArray, 3));
        }
    }, [matrixArray, colorArray, blockCount]);

    if (blockCount === 0) return null;

    return (
        <group>
            {/* Visuals */}
            <instancedMesh
                ref={meshRef}
                args={[undefined, undefined, blockCount]}
            >
                <boxGeometry args={[1, 1, 1]} />
                <GlitchMaterial vertexColors={true} wobbleAmount={0.02} wobbleSpeed={0.5} />
            </instancedMesh>

            {/* Optimized Greedy Physics Colliders */}
            <RigidBody type="fixed" colliders={false} friction={1}>
                {boundingBoxes.map((box, i) => (
                    <CuboidCollider key={`col-${i}`} position={box.position} args={box.size} />
                ))}
            </RigidBody>

            {/* Portal if generated in this chunk */}
            {data.hasExit && data.exitPosition && (
                <Portal position={data.exitPosition} />
            )}
        </group>
    );
}
