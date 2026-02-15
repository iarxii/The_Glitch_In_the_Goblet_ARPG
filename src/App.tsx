import { GameCanvas } from './components/core';
import { Player, World } from './components/game';
import { Hud } from './components/ui';

/**
 * App – root component
 * ====================
 * Renders the 3D canvas and the HTML HUD overlay.
 * The <GameCanvas> wraps the R3F <Canvas>, so game entities
 * like <Player> and <World> must be placed *inside* it.
 *
 * The <Hud> is a standard React component rendered *outside*
 * the canvas as a fixed HTML overlay.
 */
export default function App() {
  return (
    <>
      <Hud />
      <GameCanvas>
        <World />
        <Player />
      </GameCanvas>
    </>
  );
}
