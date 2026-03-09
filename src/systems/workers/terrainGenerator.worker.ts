import { Noise3DGenerator } from '../../utils/noise3d';
import { NoiseGenerator } from '../../utils';
import { edgeTable, triTable } from 'three/examples/jsm/objects/MarchingCubes.js';

const _edgeTable = edgeTable as unknown as Int32Array;
const _triTable = triTable as unknown as Int32Array;

// Precomputed offsets for the 8 corners of a cube
const corners = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
    [0, 1, 1]
];

self.onmessage = function (e) {
    const { cx, cy, cz, chunkSize, chunkHeight, seed, isoLevel } = e.data;

    const noise3D = new Noise3DGenerator(seed);
    const surfaceNoise = new NoiseGenerator(seed);

    // We sample grid of size chunkSize + 1
    const gridResX = chunkSize + 1;
    const gridResY = chunkHeight + 1;
    const gridResZ = chunkSize + 1;

    const values = new Float32Array(gridResX * gridResY * gridResZ);

    const worldOffsetX = cx * chunkSize;
    const worldOffsetY = cy * chunkHeight;
    const worldOffsetZ = cz * chunkSize;

    // 1. Evaluate Density Field
    for (let z = 0; z < gridResZ; z++) {
        for (let y = 0; y < gridResY; y++) {
            for (let x = 0; x < gridResX; x++) {
                const wx = worldOffsetX + x;
                const wy = worldOffsetY + y;
                const wz = worldOffsetZ + z;

                const surfaceHeight = surfaceNoise.fbm(wx, wz, 4, 0.5, 2, 0.02) * 10 + 5;

                let density = 0;

                // Below surface is solid
                if (wy <= surfaceHeight) {
                    density = 1.0; // Solid

                    // Carve tunnels
                    const tunnelNoise = noise3D.fbm(wx, wy, wz, 3, 0.5, 2, 0.05);
                    if (Math.abs(tunnelNoise) < 0.08) {
                        density = -1.0; // Empty
                    }

                    // Carve arenas
                    const arenaNoise = noise3D.get(wx, wy, wz, 0.02);
                    if (arenaNoise > 0.55) {
                        density = -1.0; // Empty
                    }

                    if (wy < -20) {
                        density = 1.0; // bedrock
                    }
                } else {
                    density = -1.0; // Empty
                }

                values[x + gridResX * (y + gridResY * z)] = density;
            }
        }
    }

    const positions: number[] = [];
    const normals: number[] = [];

    // Helper functions
    function getVal(x: number, y: number, z: number) {
        return values[x + gridResX * (y + gridResY * z)];
    }

    function interpolate(val1: number, val2: number, p1: number[], p2: number[]) {
        if (Math.abs(isoLevel - val1) < 0.00001) return [...p1];
        if (Math.abs(isoLevel - val2) < 0.00001) return [...p2];
        if (Math.abs(val1 - val2) < 0.00001) return [...p1];

        const mu = (isoLevel - val1) / (val2 - val1);
        return [
            p1[0] + mu * (p2[0] - p1[0]),
            p1[1] + mu * (p2[1] - p1[1]),
            p1[2] + mu * (p2[2] - p1[2])
        ];
    }

    // Prepare arrays for polygonize
    const cubeVals = new Float32Array(8);
    const edgeVerts = Array(12).fill([0, 0, 0]);

    // 2. Marching Cubes
    for (let z = 0; z < gridResZ - 1; z++) {
        for (let y = 0; y < gridResY - 1; y++) {
            for (let x = 0; x < gridResX - 1; x++) {

                // Get 8 corners
                let cubeIndex = 0;
                for (let i = 0; i < 8; i++) {
                    const cx_local = x + corners[i][0];
                    const cy_local = y + corners[i][1];
                    const cz_local = z + corners[i][2];
                    cubeVals[i] = getVal(cx_local, cy_local, cz_local);
                    if (cubeVals[i] < isoLevel) {
                        cubeIndex |= (1 << i);
                    }
                }

                const edges = _edgeTable[cubeIndex];
                if (edges === 0) continue; // Completely inside or outside

                // Find intersecting vertices on edges
                const p0 = [x, y, z];
                const p1 = [x + 1, y, z];
                const p2 = [x + 1, y + 1, z];
                const p3 = [x, y + 1, z];
                const p4 = [x, y, z + 1];
                const p5 = [x + 1, y, z + 1];
                const p6 = [x + 1, y + 1, z + 1];
                const p7 = [x, y + 1, z + 1];

                if (edges & 1) edgeVerts[0] = interpolate(cubeVals[0], cubeVals[1], p0, p1);
                if (edges & 2) edgeVerts[1] = interpolate(cubeVals[1], cubeVals[2], p1, p2);
                if (edges & 4) edgeVerts[2] = interpolate(cubeVals[2], cubeVals[3], p2, p3);
                if (edges & 8) edgeVerts[3] = interpolate(cubeVals[3], cubeVals[0], p3, p0);
                if (edges & 16) edgeVerts[4] = interpolate(cubeVals[4], cubeVals[5], p4, p5);
                if (edges & 32) edgeVerts[5] = interpolate(cubeVals[5], cubeVals[6], p5, p6);
                if (edges & 64) edgeVerts[6] = interpolate(cubeVals[6], cubeVals[7], p6, p7);
                if (edges & 128) edgeVerts[7] = interpolate(cubeVals[7], cubeVals[4], p7, p4);
                if (edges & 256) edgeVerts[8] = interpolate(cubeVals[0], cubeVals[4], p0, p4);
                if (edges & 512) edgeVerts[9] = interpolate(cubeVals[1], cubeVals[5], p1, p5);
                if (edges & 1024) edgeVerts[10] = interpolate(cubeVals[2], cubeVals[6], p2, p6);
                if (edges & 2048) edgeVerts[11] = interpolate(cubeVals[3], cubeVals[7], p3, p7);

                // Build triangles
                cubeIndex <<= 4;
                let i = 0;
                while (_triTable[cubeIndex + i] !== -1) {
                    const e1 = _triTable[cubeIndex + i];
                    const e2 = _triTable[cubeIndex + i + 1];
                    const e3 = _triTable[cubeIndex + i + 2];

                    const v1 = edgeVerts[e1];
                    const v2 = edgeVerts[e2];
                    const v3 = edgeVerts[e3];

                    // Positions
                    positions.push(v1[0], v1[1], v1[2]);
                    positions.push(v2[0], v2[1], v2[2]);
                    positions.push(v3[0], v3[1], v3[2]);

                    // Compute flat normal
                    const ax = v2[0] - v1[0];
                    const ay = v2[1] - v1[1];
                    const az = v2[2] - v1[2];

                    const bx = v3[0] - v1[0];
                    const by = v3[1] - v1[1];
                    const bz = v3[2] - v1[2];

                    let nx = ay * bz - az * by;
                    let ny = az * bx - ax * bz;
                    let nz = ax * by - ay * bx;

                    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
                    if (len > 0) {
                        nx /= len; ny /= len; nz /= len;
                    }

                    normals.push(nx, ny, nz);
                    normals.push(nx, ny, nz);
                    normals.push(nx, ny, nz);

                    i += 3;
                }
            }
        }
    }

    const posArray = new Float32Array(positions);
    const normArray = new Float32Array(normals);

    self.postMessage({
        jobId: e.data.jobId,
        cx, cy, cz,
        positions: posArray,
        normals: normArray,
    } as any, [posArray.buffer, normArray.buffer]);
};
