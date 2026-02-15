import { useGameStore } from '../../store/useGameStore';
import './Hud.css';

/**
 * HUD (Heads-Up Display)
 * ----------------------
 * Displays player vital stats and loot counts as an HTML overlay.
 * This is a *2D* React component rendered outside the Canvas.
 */
export function Hud() {
    const { health, maxHealth, optimizationOrbs, dataFragments, textureShards } =
        useGameStore((s) => s.player);
    const elapsedTime = useGameStore((s) => s.elapsedTime);
    const isPaused = useGameStore((s) => s.isPaused);
    const togglePause = useGameStore((s) => s.togglePause);

    const healthPercent = (health / maxHealth) * 100;

    return (
        <div className="hud">
            {/* Health bar */}
            <div className="hud__health">
                <div className="hud__health-bar" style={{ width: `${healthPercent}%` }} />
                <span className="hud__health-text">
                    {health}/{maxHealth}
                </span>
            </div>

            {/* Loot */}
            <div className="hud__loot">
                <span>⚡ {optimizationOrbs}</span>
                <span>📦 {dataFragments}</span>
                <span>🔷 {textureShards}</span>
            </div>

            {/* Timer & pause */}
            <div className="hud__info">
                <span>{elapsedTime.toFixed(1)}s</span>
                <button className="hud__pause-btn" onClick={togglePause}>
                    {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>
            </div>
        </div>
    );
}
