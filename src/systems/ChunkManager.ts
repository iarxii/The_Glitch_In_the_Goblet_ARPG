// Singleton worker for generating chunks to avoid worker instantiation overhead
let terrainWorker: Worker | null = null;
let jobIdCounter = 0;
const jobCallbacks = new Map<number, (data: any) => void>();

function getWorker() {
    if (!terrainWorker) {
        terrainWorker = new Worker(new URL('./workers/terrainGenerator.worker.ts', import.meta.url), { type: 'module' });
        terrainWorker.onmessage = (e) => {
            const { jobId, ...data } = e.data;
            if (jobCallbacks.has(jobId)) {
                jobCallbacks.get(jobId)!(data);
                jobCallbacks.delete(jobId);
            }
        };
    }
    return terrainWorker;
}

export interface ChunkInfo {
    cx: number;
    cy: number;
    cz: number;
    positions: Float32Array;
    normals: Float32Array;
}

export async function requestChunk(cx: number, cy: number, cz: number, seed: string | number): Promise<ChunkInfo> {
    return new Promise((resolve) => {
        const worker = getWorker();
        const jobId = jobIdCounter++;

        jobCallbacks.set(jobId, (data) => {
            resolve({
                cx, cy, cz,
                positions: data.positions,
                normals: data.normals
            });
        });

        worker.postMessage({
            jobId,
            cx, cy, cz,
            chunkSize: 32,
            chunkHeight: 32,
            seed,
            isoLevel: 0.0 // Because we output float density centered around 0
        });
    });
}
