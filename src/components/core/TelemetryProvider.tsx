import React, { Profiler, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { onRenderCallback, updateTelemetry } from '../../utils/telemetry';

// Used inside the R3F Canvas to grab frame delta
function FrameTracker() {
    useFrame((_, delta) => {
        updateTelemetry(delta);
    });
    return null;
}

// Wrap the main app contents
export function TelemetryProvider({ children }: { children: React.ReactNode }) {

    // Safety check cleanup
    useEffect(() => {
        return () => {
            const node = document.getElementById('agent-telemetry-data');
            if (node) node.remove();
        }
    }, [])

    return (
        <Profiler id="GameRoot" onRender={onRenderCallback}>
            {children}
            {/* The actual R3F Hook tracking needs to be injected into the Canvas below this */}
        </Profiler>
    );
}

// This needs to be exported and injected inside GameCanvas.tsx `<Canvas>`
export { FrameTracker };
