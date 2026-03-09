import type { ProfilerOnRenderCallback } from 'react';

// Expose metrics to window for debugging and to a hidden DOM element for the AI Agent
export const TelemetryMetrics = {
    fps: 0,
    renderTimeMs: 0,
    drops: 0,
};

// Simple moving average for smoothing UI updates
const frameTimes: number[] = [];

export function updateTelemetry(delta: number) {
    if (delta > 0) {
        frameTimes.push(1 / delta);
        if (frameTimes.length > 60) {
            frameTimes.shift();
        }
    }

    // Calculate avg FPS
    const sum = frameTimes.reduce((a, b) => a + b, 0);
    TelemetryMetrics.fps = Math.round(sum / (frameTimes.length || 1));

    if (delta > 0.1) {
        TelemetryMetrics.drops++;
    }

    updateDOM();
}

export const onRenderCallback: ProfilerOnRenderCallback = (
    id,
    _phase,
    actualDuration,
) => {
    // Only track the mount/update of the whole GameCanvas for overall cost
    if (id === 'GameRoot') {
        TelemetryMetrics.renderTimeMs = Math.round(actualDuration * 10) / 10;
        updateDOM();
    }
};

let domNode: HTMLDivElement | null = null;

function updateDOM() {
    if (!domNode) {
        domNode = document.createElement('div');
        domNode.id = 'agent-telemetry-data';
        // Hide visually, but keep in DOM for Puppeteer/Playwright to parse
        domNode.style.position = 'absolute';
        domNode.style.opacity = '0';
        domNode.style.pointerEvents = 'none';
        domNode.style.zIndex = '-100';
        document.body.appendChild(domNode);
    }

    // Agent can read this JSON string directly
    domNode.textContent = JSON.stringify(TelemetryMetrics);
}
