import type { GameObjects } from "phaser";
import { hasComponent, observe, onAdd, onRemove, query, type World } from "bitecs";
import type { GameplayScene } from "#game/scenes/gameplay-scene";
import { Position, Renderable, Rotation } from "#game/ecs/components";
import type { SystemType } from "#game/utilities.js";

export function RenderSystem( _world : World ) : SystemType
{	
	const enterQuery : integer[] = [];
	const exitQuery : integer[] = [];
	
	observe( _world, onAdd( Renderable, Position ), ( eid : integer ) => enterQuery.push( eid ) );
	observe( _world, onRemove( Renderable ), ( eid : integer ) => exitQuery.push( eid ) );
	
	return ( _world : World<{}>, _scene : GameplayScene ) => {

		const { DisplayObjectMap } = _scene;

		const entered = enterQuery.splice(0);
		const exited = exitQuery.splice(0);

		for( const eid of entered )
		{
			if( !DisplayObjectMap.has( eid ) )
			{
				if( hasComponent( _world, eid, Rotation ) )
				{
					const spriteObject = _scene.add.sprite( 0, 0, 'ship' );
					spriteObject.setFrame( Renderable.frame[ eid ] );
					_scene.DisplayObjectMap.set( eid, spriteObject );
				}
				else
				{
					const blitterObject = _scene.Blitters.get( Renderable.texture[ eid ] );
					DisplayObjectMap.set( eid, blitterObject?.create( 0, 0, Renderable.frame[ eid ]  ) as GameObjects.Bob );
				}

			}
		}

		for( const eid of query( _world, [ Renderable, Position ] ) )
		{
			const displayObject = DisplayObjectMap.get( eid );
			if( displayObject )
			{
				
				displayObject.x = Position.x[ eid ];
				displayObject.y = Position.y[ eid ];
			}
		}

		return _world;
	}
}
