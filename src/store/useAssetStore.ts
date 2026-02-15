import { create } from 'zustand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export const LoadStatus = {
    Idle: 'idle',
    Loading: 'loading',
    Loaded: 'loaded',
    Error: 'error',
} as const;

export type LoadStatus = (typeof LoadStatus)[keyof typeof LoadStatus];

export interface TrackedAsset {
    id: string;
    status: LoadStatus;
    /** The loaded resource (Texture, GLTF, AudioBuffer, etc.) */
    resource?: unknown;
    error?: string;
}

interface AssetStoreState {
    assets: Record<string, TrackedAsset>;

    /** Register an asset as loading */
    startLoading: (id: string) => void;
    /** Mark an asset as loaded and store its resource */
    markLoaded: (id: string, resource: unknown) => void;
    /** Mark an asset as failed */
    markError: (id: string, error: string) => void;
    /** Retrieve a loaded asset resource (type-unsafe – caller casts) */
    getResource: (id: string) => unknown | undefined;
    /** Overall loading progress (0–1) */
    progress: () => number;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAssetStore = create<AssetStoreState>()((set, get) => ({
    assets: {},

    startLoading: (id) =>
        set((state) => ({
            assets: {
                ...state.assets,
                [id]: { id, status: LoadStatus.Loading },
            },
        })),

    markLoaded: (id, resource) =>
        set((state) => ({
            assets: {
                ...state.assets,
                [id]: { id, status: LoadStatus.Loaded, resource },
            },
        })),

    markError: (id, error) =>
        set((state) => ({
            assets: {
                ...state.assets,
                [id]: { id, status: LoadStatus.Error, error },
            },
        })),

    getResource: (id) => get().assets[id]?.resource,

    progress: () => {
        const entries = Object.values(get().assets);
        if (entries.length === 0) return 1;
        const loaded = entries.filter(
            (a) => a.status === LoadStatus.Loaded || a.status === LoadStatus.Error,
        ).length;
        return loaded / entries.length;
    },
}));
