import { useGameStore } from '../../store/useGameStore';
import './Hud.css';

/**
 * HUD (Heads-Up Display)
 * ----------------------
 * Displays player vital stats and loot counts as an HTML overlay.
 * This is a *2D* React component rendered outside the Canvas.
 */
export function Hud() {
    const health = useGameStore((s) => s.player.health);
    const maxHealth = useGameStore((s) => s.player.maxHealth);
    const optimizationOrbs = useGameStore((s) => s.player.optimizationOrbs);
    const dataFragments = useGameStore((s) => s.player.dataFragments);
    const textureShards = useGameStore((s) => s.player.textureShards);

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
                <Timer />
                <button className="hud__pause-btn" onClick={togglePause}>
                    {isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>
            </div>
        </div>
    );
}

function Timer() {
    const elapsedTime = useGameStore((s) => s.elapsedTime);
    return <span>{elapsedTime.toFixed(1)}s</span>;
}
