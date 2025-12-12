import { defineStore, type Store } from "pinia";
import { createWorld, removeEntity, type World } from "bitecs";
import { createObserverDeserializer, createObserverSerializer, createSnapshotDeserializer, createSnapshotSerializer, createSoADeserializer, createSoASerializer } from "bitecs/serialization";
import { useNetworkState, type NetworkState } from "store";

import { Networked, Position, Renderable, Rotation, Velocity } from "#game/ecs/components";
import type { Scene } from "phaser";

type SerializationObserver  = () => ArrayBuffer;

type NetworkedGameState = {
	playerEntities : Map<string, number>,
	world : World,
	network :  Store<'network-state'> & NetworkState,
	channels : RTCDataChannel[],

	scene? : Scene,

	// Serializers
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

const components = [ Position, Rotation ]

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
			channels : []
		} as NetworkedGameState;
	},
	actions : {
		setup : function( _scene : Scene )
		{
			this.scene = _scene;

			// Setup Serializers
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
					// TODO
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

			console.log( messageView, type )
		}
	}
} )