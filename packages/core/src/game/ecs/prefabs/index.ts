import { addComponent, addComponents, addEntity, addPrefab, IsA, Prefab, type EntityId, type World } from "bitecs";
import { Networked, Position, Rotation } from "../components";

export enum PrefabType {
	NetworkedPlayer = 'NetworkedPlayer'
}

export const PrefabMap : Record<PrefabType, number> = {} as Record<PrefabType, number>



export const InstantiatePrefab = ( _world : World, _type : PrefabType ) : EntityId => {
	if( PrefabMap[ _type ] === undefined )
	{
		PrefabMap[ _type ] = addPrefab( _world );
		addComponents( _world, PrefabMap[ _type ], [ Networked, Position, Rotation ] );
	}

	const prefabInstance = addEntity( _world );
	addComponent( _world, prefabInstance, IsA( PrefabMap[ _type ] ) );

	return prefabInstance;
}