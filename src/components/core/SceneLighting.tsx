/**
 * SceneLighting
 * -------------
 * Default scene lighting preset.
 * Provides a soft ambient fill and a directional key-light
 * that casts shadows (when shadow maps are enabled on the Canvas).
 */
export function SceneLighting() {
    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight
                position={[5, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize={[1024, 1024]}
            />
        </>
    );
}
