import { defineStore, type Store } from "pinia";
import { createWorld, type World } from "bitecs";
import { createSnapshotSerializer } from "bitecs/serialization";

import { useNetworkState, type NetworkState } from "store";

type GameState = {
	world : World,
	network :  Store<'network-state'> & NetworkState,
	channels : RTCDataChannel[],
	snapshotSerializer? : () => ArrayBuffer,
	// observerSerializers : Map<string, 
}

export const useGameState = defineStore( 'game-state', {
	state : () => {
		return {
			world : createWorld(),
			network : useNetworkState(),
			channels : []
		} as GameState;
	},
	actions : {
		setupDataChannel : function( _dataChannel : RTCDataChannel, _peerId : string )
		{
			this.snapshotSerializer = createSnapshotSerializer( this.world, [] );

			this.channels.push( _dataChannel );

			_dataChannel.onopen = () => {
				console.log( `${ _dataChannel.label } channel with ${ _peerId } opened` );

			}

			_dataChannel.onmessage = ( event : MessageEvent ) => {
				console.log( `${ _dataChannel.label } message from ${ _peerId }:`, event.data );

			}

			_dataChannel.close = () => {
				console.log( `${ _dataChannel.label } channel  with ${ _peerId } closed` );
			}
		}
	}
} )