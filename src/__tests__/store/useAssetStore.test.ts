import { describe, it, expect, beforeEach } from 'vitest';
import { useAssetStore, LoadStatus } from '../../store/useAssetStore';

describe('useAssetStore', () => {
    beforeEach(() => {
        // Reset the store before each test
        useAssetStore.setState({ assets: {} });
    });

    it('should start with an empty assets map', () => {
        expect(Object.keys(useAssetStore.getState().assets)).toHaveLength(0);
    });

    describe('startLoading()', () => {
        it('should register an asset as loading', () => {
            useAssetStore.getState().startLoading('player_model');
            const asset = useAssetStore.getState().assets['player_model'];
            expect(asset).toBeDefined();
            expect(asset.status).toBe(LoadStatus.Loading);
        });
    });

    describe('markLoaded()', () => {
        it('should mark an asset as loaded with its resource', () => {
            useAssetStore.getState().startLoading('player_model');
            const mockResource = { scene: {} };
            useAssetStore.getState().markLoaded('player_model', mockResource);

            const asset = useAssetStore.getState().assets['player_model'];
            expect(asset.status).toBe(LoadStatus.Loaded);
            expect(asset.resource).toBe(mockResource);
        });
    });

    describe('markError()', () => {
        it('should mark an asset as errored with a message', () => {
            useAssetStore.getState().startLoading('missing_texture');
            useAssetStore.getState().markError('missing_texture', '404 Not Found');

            const asset = useAssetStore.getState().assets['missing_texture'];
            expect(asset.status).toBe(LoadStatus.Error);
            expect(asset.error).toBe('404 Not Found');
        });
    });

    describe('progress()', () => {
        it('should return 1 when no assets are tracked', () => {
            expect(useAssetStore.getState().progress()).toBe(1);
        });

        it('should compute progress correctly', () => {
            const { startLoading, markLoaded } = useAssetStore.getState();
            startLoading('a');
            startLoading('b');
            markLoaded('a', {});
            // One loaded, one still loading → 50%
            expect(useAssetStore.getState().progress()).toBe(0.5);
        });
    });
});
