import type { World } from "bitecs";
import type { GameplayScene } from "./scenes/gameplay-scene";

export type SystemType = ( _world : World, _scene : GameplayScene ) => {}

export class SystemPipeline
{
	
	systemMap : Map<string, SystemType> = new Map();
	systems: Array<SystemType> = [];

	add( _system : { name : string, func : SystemType } | Array<{ name : string, func : SystemType }> ) : void
	{
		if ( ( _system as { name : string, func : SystemType }[] ).length ) 
		{
			for( const s of ( _system as { name : string, func : SystemType }[] ) )
			{
				this.add( s );
			}
		}
		else
		{
			const s = _system as { name : string, func : SystemType };
			if( !this.systemMap.has( s.name ) )
				this.systemMap.set(  s.name, s.func );
			
			console.log( `Adding ${ s.name } System` );

			this.systems = Array.from( this.systemMap.values() );
		}
	}

	remove( _name : string ) : void
	{
		if( this.systemMap.has( _name ) )
			this.systemMap.delete( _name );

		this.systems = Array.from( this.systemMap.values() );
	}

	run( _scene : GameplayScene ) : World
	{
		return this.systems.reduce(
			( currentWorld, system ) => system( currentWorld, _scene ),
			_scene.World
		);
	}
}

export function degToRad( _angle : number ) : number
{
  return _angle * ( Math.PI / 180 );
}