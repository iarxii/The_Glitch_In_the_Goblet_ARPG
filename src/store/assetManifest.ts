/**
 * Asset Manifest
 * ==============
 * Central registry of every asset used in the game.
 * Each entry declares an id, asset type, and path.
 *
 * Usage:
 *   import { ASSET_MANIFEST, AssetType } from './assetManifest';
 *   const models = ASSET_MANIFEST.filter(a => a.type === AssetType.Model);
 */

export const AssetType = {
    Model: 'model',
    Texture: 'texture',
    Sound: 'sound',
    Font: 'font',
} as const;

export type AssetType = (typeof AssetType)[keyof typeof AssetType];

export interface AssetEntry {
    /** Unique identifier for the asset */
    id: string;
    /** Discriminated type */
    type: AssetType;
    /** Path relative to the /public directory */
    path: string;
    /** Optional human-readable label */
    label?: string;
}

/**
 * Master list – add new assets here.
 * Keep entries sorted by type for readability.
 */
export const ASSET_MANIFEST: AssetEntry[] = [
    // -- Models ---------------------------------------------------------------
    // { id: 'player_model', type: AssetType.Model, path: '/models/player.glb', label: 'Debugger Knight' },

    // -- Textures -------------------------------------------------------------
    // { id: 'ground_tex', type: AssetType.Texture, path: '/textures/ground.png' },

    // -- Sounds ---------------------------------------------------------------
    // { id: 'compile_slash_sfx', type: AssetType.Sound, path: '/sounds/compile_slash.mp3' },
];

// ---------------------------------------------------------------------------
// Helpers – look-up by id or filter by type
// ---------------------------------------------------------------------------

export function getAssetById(id: string): AssetEntry | undefined {
    return ASSET_MANIFEST.find((a) => a.id === id);
}

export function getAssetsByType(type: AssetType): AssetEntry[] {
    return ASSET_MANIFEST.filter((a) => a.type === type);
}
