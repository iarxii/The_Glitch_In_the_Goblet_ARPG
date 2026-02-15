import { Canvas } from '@react-three/fiber';
import { Stats, OrbitControls } from '@react-three/drei';
import { Suspense, type ReactNode } from 'react';
import { GameLoop } from './GameLoop';
import { SceneLighting } from './SceneLighting';

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
    return (
        <Canvas
            camera={{ position: [0, 5, 10], fov: 60 }}
            style={{ width: '100vw', height: '100vh' }}
        >
            <Suspense fallback={null}>
                <SceneLighting />
                <GameLoop />
                <OrbitControls />
                {children}
                {import.meta.env.DEV && <Stats />}
            </Suspense>
        </Canvas>
    );
}
