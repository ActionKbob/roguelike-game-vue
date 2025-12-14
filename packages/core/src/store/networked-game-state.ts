import { defineStore, type Store } from "pinia";
import { addComponent, addEntity, createWorld, removeEntity, type World } from "bitecs";
import { createObserverDeserializer, createObserverSerializer, createSnapshotDeserializer, createSnapshotSerializer, createSoADeserializer, createSoASerializer } from "bitecs/serialization";
import { useNetworkState, type NetworkState } from "store";

import { Networked, Position, Renderable, Rotation, Velocity } from "#game/ecs/components";
import type { Scene } from "phaser";
import type { GameplayScene } from "#game/scenes/gameplay-scene.js";
import { InstantiatePrefab, PrefabType } from "#game/ecs/prefabs/index.js";
import { Spritesheet } from "#game/types.js";

type SerializationObserver  = () => ArrayBuffer;

type NetworkedGameState = {
	playerEntities : Map<string, number>,
	world : World,
	network :  Store<'network-state'> & NetworkState,
	channels : RTCDataChannel[],

	scene? : Scene,

	idMap : Map<number, number>,

	// Serializers
	snapshotSerializer? : SerializationObserver,
	observerSerializers? : Map<string, SerializationObserver>,
	soaSerializer? : any,

	// Deserializers
	snapshotDeserializer? : any
	observerDeserializer? : any
	soaDeserializer? : any
}

enum MessageType {
	SNAPSHOT,
	OBSERVER,
	SOA
}

const components = [ Renderable, Position, Rotation ]

const serializeMessage = ( _type : MessageType, _data : ArrayBuffer ) => {
	const tagged = new Uint8Array( _data.byteLength + 1 );
	tagged[0] = _type;
	tagged.set( new Uint8Array(_data), 1 );
	return tagged.buffer;
}

export const useNetworkedGameState = defineStore( 'networked-game-state', {
	state : () => {
		return {
			playerEntities : new Map(),
			world : createWorld(),
			network : useNetworkState(),
			channels : [],
			idMap : new Map()
		} as NetworkedGameState;
	},
	actions : {
		setup : function( _scene : Scene )
		{
			this.scene = _scene;

			// Setup Serializers
			this.snapshotSerializer = createSnapshotSerializer( this.world, components );
			this.soaSerializer = createSoASerializer( components );

			// Setup Deserializers
			this.snapshotDeserializer = createSnapshotDeserializer( this.world, components );
			this.observerDeserializer = createObserverDeserializer( this.world, Networked, components );
			this.soaDeserializer = createSoADeserializer( components );
		},
		setupDataChannel : function( _dataChannel : RTCDataChannel, _peerId : string )
		{
			this.channels.push( _dataChannel );

			_dataChannel.onopen = () => {
				console.log( `${ _dataChannel.label } channel with ${ _peerId } opened` );

				if( this.network.isHost )
				{

					// Create player entity
					// const playerEntity = InstantiatePrefab( this.world, PrefabType.NetworkedPlayer );
					// addComponent( this.world,playerEntity, [Renderable] );

					// Renderable.texture[ playerEntity ] = Spritesheet.SHIP;
					// Renderable.frame[ playerEntity ] = 3;

					// Position.x[ playerEntity ] = 30;//Math.round( Math.random() * this.scene!.cameras.main.width );
					// Position.y[ playerEntity ] = 30;//Math.round( Math.random() * this.scene!.cameras.main.height );

					// Rotation.value[ playerEntity ] = Math.random() * Math.PI * 2;

					const playerEntity = addEntity( this.world );
					addComponent( this.world, playerEntity, Networked )
					addComponent( this.world, playerEntity, Position )
					addComponent( this.world, playerEntity, Rotation )
					addComponent( this.world, playerEntity, Renderable )

					Position.x[playerEntity] = Math.random() * this.scene!.cameras.main.width;
					Position.y[playerEntity] = Math.random() * this.scene!.cameras.main.height;

					Rotation.value[playerEntity] = Math.random() * Math.PI * 2;
					
					Renderable.texture[playerEntity] = Spritesheet.SHIP;

					this.playerEntities.set( _peerId, playerEntity );

					this.observerSerializers?.set( _peerId, createObserverSerializer( this.world, Networked, components ) );

					const snapshot = this.snapshotSerializer!();
					_dataChannel.send( serializeMessage( MessageType.SNAPSHOT, snapshot ) );
				}
			}

			_dataChannel.onmessage = async ( event : MessageEvent ) => {
				console.log( `${ _dataChannel.label } message from ${ _peerId }:`, event.data );

				if( this.network.isHost )
				{
					// TODO
				}
				else
				{
					this._handleClientMessage( _peerId, event.data );
				}
			}

			_dataChannel.close = () => {
				console.log( `${ _dataChannel.label } channel  with ${ _peerId } closed` );

				if( this.network.isHost )
				{
					// TODO
				}
			}
		},

		// Handlers
		_handleClientMessage : function( _peerId : string, _data : any )
		{
			const messageView = new Uint8Array( _data );
			const type = messageView[0];

			const payload = messageView.slice(1).buffer as ArrayBuffer;

			switch( type )
			{
				case MessageType.SNAPSHOT :
					console.log( 'Recieved snapshot message' );
					this.snapshotDeserializer( payload, this.idMap );
					console.log(this.idMap);
					break;

				case MessageType.OBSERVER :
					break;
				
				case MessageType.SOA :
					break;
			}
		}
	}
} )