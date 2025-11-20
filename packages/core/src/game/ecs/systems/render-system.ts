import type { GameplayScene } from "#game/scenes/gameplay-scene.js";
import type { System } from "#game/types.js";
import { useGameState } from "#store/game-state.js";
import { observe, onAdd, onRemove, query, type World } from "bitecs";
import type { GameObjects, Scene } from "phaser";
import { Position, Renderable } from "../components";

export function RenderSystem( _world : World ) : System
{

	const displayObjectMap : Map<number, GameObjects.Bob | GameObjects.Sprite> = new Map();

	const gameState = useGameState();
	const gameplayScene = gameState.currentScene as GameplayScene;

	const enterQuery : integer[] = [];
	const exitQuery : integer[] = [];

	observe( _world, onAdd( Renderable, Position ), ( eid : integer ) => enterQuery.push( eid ) );
	observe( _world, onRemove( Renderable ), ( eid : integer ) => exitQuery.push( eid ) );

	return ( _world : World<{}> ) => {

		const entered = enterQuery.splice(0);
		const exited = exitQuery.splice(0);

		for( const eid of entered )
		{
			if( !displayObjectMap.has( eid ) )
			{
				const blitterObject = gameplayScene.Blitters.get( Renderable.texture[ eid ] );
				displayObjectMap.set( eid, blitterObject?.create( 0, 0, Renderable.frame[ eid ]  ) as GameObjects.Bob );
			}
		}

		for( const eid of query( _world, [ Renderable, Position ] ) )
		{
			const displayObject = displayObjectMap.get( eid );
			if( displayObject )
			{
				displayObject.x = Position.x[ eid ];
				displayObject.y = Position.y[ eid ];
			}
		}

		return _world;
	}
}
