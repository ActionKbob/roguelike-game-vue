import { defineStore, type Store } from "pinia";
import { createWorld, query, type World } from "bitecs";
import { createObserverDeserializer, createObserverSerializer, createSnapshotDeserializer, createSnapshotSerializer, createSoADeserializer, createSoASerializer } from "bitecs/serialization";
import { useNetworkState, type NetworkState } from "store";

import { Networked, Position, Renderable, Rotation } from "#game/ecs/components";
import type { Scene } from "phaser";

type SerializationObserver  = () => ArrayBuffer;

type NetworkedGameState = {
	playerEntities : Map<string, number>,
	world : World,
	network :  Store<'network-state'> & NetworkState,
	channels : Map<string, RTCDataChannel>,

	scene? : Scene,

	idMap : Map<number, number>,

	// Serializers
	snapshotSerializer? : SerializationObserver,
	observerSerializers : Map<string, SerializationObserver>,
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
			channels : new Map(),
			idMap : new Map(),
			observerSerializers : new Map()
,		} as NetworkedGameState;
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
			this.channels.set( _peerId, _dataChannel );

			_dataChannel.onopen = () => {
				console.log( `${ _dataChannel.label } channel with ${ _peerId } opened` );

				if( this.network.isHost )
				{
					this.observerSerializers?.set( _peerId, createObserverSerializer( this.world, Networked, components ) );
					console.log()
					
				}

				const snapshot = this.snapshotSerializer!();
				_dataChannel.send( serializeMessage( MessageType.SNAPSHOT, snapshot ) );
			}

			_dataChannel.onmessage = async ( event : MessageEvent ) => {
				// console.log( `${ _dataChannel.label } message from ${ _peerId }:`, event.data );

				if( this.network.isHost )
				{
					this._handleHostMessage();
				}
				// else
				// {
				// }
				this._handleClientMessage( _peerId, event.data );
			}

			_dataChannel.close = () => {
				console.log( `${ _dataChannel.label } channel  with ${ _peerId } closed` );

				if( this.network.isHost )
				{
					// TODO
				}
			}
		},

		update : function()
		{
			this._handleHostMessage();
		},

		// Handlers
		_handleHostMessage : function()
		{
			for( const [ peerId, channel ] of this.channels )
			{
				if( channel.readyState === 'open' )
				{					
					const soaUpdates = this.soaSerializer( query( this.world, [ Networked, Position, Rotation ] ) );
					channel.send( serializeMessage( MessageType.SOA, soaUpdates ) );

					const observerSerializer = this.observerSerializers?.get( peerId );
					if( observerSerializer )
					{
						const updates = observerSerializer();
						console.log('host msg', updates.byteLength)
						if( updates.byteLength > 0 )
						{
							channel.send( serializeMessage( MessageType.OBSERVER, updates ) );
						}
					}
				}
			}
		},

		_handleClientMessage : function( _peerId : string, _data : any )
		{
			const messageView = new Uint8Array( _data );
			const type = messageView[0];

			const payload = messageView.slice(1).buffer as ArrayBuffer;

			switch( type )
			{
				case MessageType.SNAPSHOT :
					// console.log( 'Recieved snapshot message' );
					this.snapshotDeserializer( payload, this.idMap );
					console.log(this.idMap);
					break;

				case MessageType.OBSERVER :
					// console.log( 'Recieved observer message' );
					this.observerDeserializer( payload, this.idMap );
					break;
				
				case MessageType.SOA :
					// console.log( 'Recieved soa message' );
					this.soaDeserializer( payload, this.idMap );
					break;
			}
		}
	}
} )