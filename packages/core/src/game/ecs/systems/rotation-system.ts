import type { GameplayScene } from "#game/scenes/gameplay-scene.js";
import type { System } from "#game/types.js";
import { useGameState } from "#store/game-state.js";
import { query, type World } from "bitecs";
import { Renderable, Rotation } from "../components";

export function RotationSystem( _world : World ) : System
{
	const gameState = useGameState();
	const gameplayScene = gameState.currentScene as GameplayScene;

	return ( _world : World<{}>, _scene : GameplayScene ) => {

		const { DisplayObjectMap } = _scene;

		for( const eid of query( _world, [ Rotation, Renderable ] ) )
		{
			
		}

		return _world;
	}
}
