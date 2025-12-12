import { query, type World } from "bitecs";
import type { GameplayScene } from "#game/scenes/gameplay-scene.js";
import { InputAction, type System } from "#game/types.js";
import { PlayerInput, Position, Rotation, ShipControls, Velocity } from "#game/ecs/components";
import { degToRad } from "#game/utilities.js";

export function ShipControlSystem( _world : World ) : System
{
	return ( _world : World<{}>, _scene : GameplayScene ) => {

		const { DeltaTime } = _scene;
		const { activeActions } = _scene.InputState;

		for( const eid of query( _world, [ ShipControls, Position, Rotation, Velocity, PlayerInput ] ) )
		{
			const rotationDir = activeActions.has( InputAction.SHIP_ROTATE_RIGHT ) ? 1 : activeActions.has( InputAction.SHIP_ROTATE_LEFT ) ? -1 : 0;
			Rotation.value[ eid ] += ( 0.5 * rotationDir ) * DeltaTime;
			
			if( activeActions.has( InputAction.SHIP_THRUST ) )
			{
				const currentRotation = Rotation.value[ eid ];
				const currentAcceleration =  10; //ShipControls.acceleration[ eid ];

				const v_x = Math.cos( currentRotation + degToRad( 90 ) ) * currentAcceleration * -1 * DeltaTime;
				const v_y = Math.sin( currentRotation + degToRad( 90 ) ) * currentAcceleration * -1 * DeltaTime;				

				Velocity.acceleration.x[ eid ] += v_x;
				Velocity.acceleration.y[ eid ] += v_y;
				
			}
			else
			{
				if( Velocity.value.x[eid] !== 0 || Velocity.value.y[eid] !== 0 )
				{
					Velocity.acceleration.x[ eid ] *= 0.5 * DeltaTime;
					Velocity.acceleration.y[ eid ] *= 0.5 * DeltaTime;
				}
			}
		}

		return _world;
	}
}