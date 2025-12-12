import type { GameObjects } from "phaser";
import { query, type World } from "bitecs";
import type { GameplayScene } from "#game/scenes/gameplay-scene.js";
import { Renderable, Rotation } from "#game/ecs/components";
import type { System } from "#game/types.js";

export function RotationSystem( _world : World ) : System
{
		return ( _world : World<{}>, _scene : GameplayScene ) => {

		const { DisplayObjectMap } = _scene;

		for( const eid of query( _world, [ Rotation, Renderable ] ) )
		{
			const displayObject = DisplayObjectMap.get( eid );
			if( displayObject )
			{
				( displayObject as GameObjects.Sprite).rotation = Rotation.value[ eid ];
			}
		}

		return _world;
	}
}
