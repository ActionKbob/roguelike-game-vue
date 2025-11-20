import type { World } from "bitecs";

export class SystemPipeline
{
	
	systemMap : Map<string, ( _world : World ) => {}> = new Map();
	systems: Array<( world: World ) => World> = [];

	add( _name : string, _system : ( _world : World ) => {} ) : void
	{
		if( !this.systemMap.has( _name ) )
			this.systemMap.set( _name, _system );

		this.systems = Array.from( this.systemMap.values() );
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