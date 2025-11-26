import { query, type World } from "bitecs";
import { useGameState } from "#store/game-state.js";
import type { GameplayScene } from "#game/scenes/gameplay-scene.js";
import { type System } from "#game/types.js";
import { Position, Velocity } from "#game/ecs/components";

export function VelocitySystem( _world : World ) : System
{
	const gameState = useGameState();
	const gameplayScene = gameState.currentScene as GameplayScene;

	return ( _world : World<{}>, _scene : GameplayScene ) => {

		const { DeltaTime } = _scene;

		for( const eid of query( _world, [ Position, Velocity ] ) )
		{
			if( !Velocity.value.x[ eid ] || ( Math.abs( Velocity.value.x[ eid ] ) > 0 && Math.abs( Velocity.value.x[ eid ] ) < 0.01 ) )
				Velocity.value.x[ eid ] = 0;

			if( !Velocity.value.y[ eid ] || ( Math.abs( Velocity.value.y[ eid ] ) > 0 && Math.abs( Velocity.value.y[ eid ] ) < 0.01 ) )
				Velocity.value.y[ eid ] = 0;

			if( Velocity.acceleration.x[ eid ] !== 0 || Velocity.acceleration.y[ eid ] !== 0 )
			{
				Velocity.value.x[ eid ] += Velocity.acceleration.x[ eid ] * DeltaTime;
				Velocity.value.y[ eid ] += Velocity.acceleration.y[ eid ] * DeltaTime;
			}
			else
			{
				console.log( Velocity.friction[ eid ] , DeltaTime, Velocity.friction[ eid ] * DeltaTime );
				Velocity.value.x[ eid ] *= 1 - ( Velocity.friction[ eid ] * DeltaTime );
				Velocity.value.y[ eid ] *= 1 - ( Velocity.friction[ eid ] * DeltaTime );
			}

			Velocity.acceleration.x[ eid ] = 0;
			Velocity.acceleration.y[ eid ] = 0;

			Position.x[ eid ] += Velocity.value.x[ eid ] * DeltaTime;
			Position.y[ eid ] += Velocity.value.y[ eid ] * DeltaTime;
		}

		return _world;
	}
}