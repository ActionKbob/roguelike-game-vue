import type { World } from "bitecs";

type System = {
	name : string, 
	func : ( _world : World ) => {}
}
export class SystemPipeline
{
	
	systemMap : Map<string, ( _world : World ) => {}> = new Map();
	systems: Array<( world: World ) => World> = [];

	add( _system : System | Array<System> ) : void
	{
		if ( ( _system as System[] ).length ) 
		{
			for( const s of ( _system as System[] ) )
			{
				this.add( s );
			}
		}
		else
		{
			const s = _system as System;
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

	run( _world : World ) : World
	{
		return this.systems.reduce(
			( currentWorld, system ) => system( currentWorld ),
			_world
		);
	}
}