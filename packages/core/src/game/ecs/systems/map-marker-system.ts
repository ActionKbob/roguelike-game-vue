import { query, type World } from "bitecs";
import type { System } from "#game/types";
import { MapMarker, Position } from "../components";
import { useGameState } from "#store/game-state.js";
import type { GameplayScene } from "#game/scenes/gameplay-scene.js";

export function MapMarkerSystem( _world : World ) : System
{
	const gameState = useGameState();
	const gameplayScene = gameState.currentScene as GameplayScene;

	return ( _world : World<{}> ) => {

		const cursorWorldPosition = { x : gameplayScene.input.mousePointer.worldX, y: gameplayScene.input.mousePointer.worldY };

		for( const eid of query( _world, [ MapMarker, Position ] ) )
		{
			const tilePositionX = Math.floor( cursorWorldPosition.x / 16 );
			const tilePositionY = Math.floor( cursorWorldPosition.y / 16 );

			MapMarker.x[ eid ] = tilePositionX;
			MapMarker.y[ eid ] = tilePositionY;

			Position.x[ eid ] = tilePositionX * 16;
			Position.y[ eid ] = tilePositionY * 16;

			// ^ Optimize this by checking current tile position value and setting position via observer when tile x/y changes
		}

		return _world;
	}
}
