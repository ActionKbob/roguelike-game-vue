import { defineStore } from "pinia";
import { NETWORK_MESSAGE_TYPE, type ClientPeer, type NetworkMessage, type ServerPeer, type SignalingMessage } from 'shared';
import { NetworkStatus } from "..";

export enum NETWORK_STATUS {
	DISCONNECTED,
	CONNECTING,
	CONNECTED,
	DISCONNECTING
}

type NetworkState = {
	status : NETWORK_STATUS,
	socket : WebSocket | null,
	peers : Map<string, ClientPeer>,
	clientId? : string,
	dataChannel? : RTCDataChannel,
	lobbyKey? : string,
	isHost? : Boolean
}

const defaultState : NetworkState = {
		status : NETWORK_STATUS.DISCONNECTED,
		socket : null,
		peers : new Map(),
		clientId : undefined,
		dataChannel : undefined,
		lobbyKey : undefined,
		isHost : undefined
	}

export const useNetworkState = defineStore( 'network-state', {
	state : () => ( { ...defaultState} ),
	actions : {
		connect : function( _lobbyKey? : string )
		{
			const url : string = "ws://localhost:5001";

			try
			{
				this.socket = new WebSocket( url );

				this.status = NETWORK_STATUS.CONNECTING;

				this.socket.addEventListener( "open", () => {
					if( _lobbyKey )
					{
						console.log( 'Attempting to join lobby ', _lobbyKey );
						this.socket?.send( JSON.stringify( {
							type : NETWORK_MESSAGE_TYPE.JOIN_LOBBY,
							body : {
								data : {
									key : _lobbyKey
								}
							}
						} as NetworkMessage ) );
					}
					else
					{
						console.log( 'Attempting to create lobby' );
						this.socket?.send( JSON.stringify( {
							type : NETWORK_MESSAGE_TYPE.CREATE_LOBBY
						} ) );
					}
				} );

				this.socket.addEventListener( "close", () => {
					this.$reset();
				} );

				this.socket.addEventListener( "message", this.handleMessage );
			}
			catch( error )
			{
				console.error( `Error connecting to server: ${ error }` );
			}
		},
		disconnect : function()
		{
			this.socket?.close();
		},
		handleMessage : async function( { data } : MessageEvent )
		{
			const { type, body } = JSON.parse( data );

			switch( type )
			{
				case NETWORK_MESSAGE_TYPE.CONNECTION_SUCCESS :
					this.status = NETWORK_STATUS.CONNECTED;
					this.clientId = body.data?.clientId;
					break;

				case NETWORK_MESSAGE_TYPE.LOBBY_JOINED_SUCCESS :

					const { key, isHost, peers } = body.data;

					this.lobbyKey = key;
					this.isHost = isHost || false;

					for( const peer of peers )
					{
						this.peers.set( peer.id, { id : peer.id } );
					}

					break;

				case NETWORK_MESSAGE_TYPE.LOBBY_JOINED_FAILURE :
					this.socket?.close();
					console.error( `Connection failed: ${ body }` );
					break;

				case NETWORK_MESSAGE_TYPE.CLIENT_JOINED :
					
					const newClientId = body.data.clientId;

					if( newClientId !== this.clientId )
						this.peers.set( newClientId, { id : newClientId } );

					if( this.isHost )
						this._setupPeerConnection( newClientId );

					break;

				case NETWORK_MESSAGE_TYPE.CLIENT_LEFT :
					console.log( 'Client left' );
					break;
				// WEB RTC MESSAGES
				case NETWORK_MESSAGE_TYPE.OFFER :
					
					break;
				
				case NETWORK_MESSAGE_TYPE.ANSWER :
					break;
				
				case NETWORK_MESSAGE_TYPE.CANDIDATE :
					
					break;
			}
		},

		// WebRTC Actions
		_setupPeerConnection : function( _peerId : string )
		{

		}
	}
} );