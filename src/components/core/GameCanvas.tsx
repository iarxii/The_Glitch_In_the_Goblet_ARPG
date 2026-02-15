import { Canvas } from '@react-three/fiber';
import { Stats, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useRef, type ReactNode } from 'react';
import { GameLoop } from './GameLoop';
import { World } from '../game/World';
import { Player } from '../game/Player';
import { useGameStore } from '../../store/useGameStore';
import { DestinationMarker } from '../game/DestinationMarker';
import { CameraFollow } from '../game/CameraFollow';

interface GameCanvasProps {
    children?: ReactNode;
}

/**
 * GameCanvas
 * ----------
 * Top-level 3D canvas wrapper. Sets up the R3F <Canvas>,
 * default camera, lighting, and the game loop system.
 * Pass game entities (Player, World, etc.) as children.
 */
export function GameCanvas({ children }: GameCanvasProps) {
    const controlsRef = useRef<any>(null);

    return (
        <Canvas
            shadows
            camera={{
                position: [0, 15, 15],
                fov: 50,
                near: 0.1,
                far: 200
            }}
            style={{ width: '100vw', height: '100vh' }}
        >
            <Suspense fallback={null}>
                {/* SceneLighting is replaced by explicit lights */}
                <GameLoop />
                <CameraFollow controlsRef={controlsRef} />
                <PerspectiveCamera makeDefault position={[0, 15, 15]} />
                <OrbitControls
                    ref={controlsRef}
                    makeDefault
                    enableRotate={false}
                    enableZoom={true}
                    enablePan={false}
                    minZoom={10}
                    maxZoom={50}
                    maxPolarAngle={Math.PI / 2} // Prevent going below ground
                />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <World />
                <Player />
                <DestinationMarkerWrapper />
                {children}
                {import.meta.env.DEV && <Stats />}
            </Suspense>
        </Canvas>
    );
}

function DestinationMarkerWrapper() {
    const targetPosition = useGameStore((s) => s.targetPosition);
    if (!targetPosition) return null;
    return <DestinationMarker position={targetPosition} />;
}
