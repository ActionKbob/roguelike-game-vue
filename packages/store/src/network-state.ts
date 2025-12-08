import { defineStore } from "pinia";
import { NETWORK_MESSAGE_TYPE, type NetworkMessage } from 'shared';

export enum NETWORK_STATUS {
	DISCONNECTED,
	CONNECTING,
	CONNECTED,
	DISCONNECTING
}

type NetworkState = {
	status : NETWORK_STATUS
	socket : WebSocket | null,
	lobbyKey? : string,
	isHost? : Boolean
}

export const useNetworkState = defineStore( 'network-state', {
	state : () => {
		return {
			status : NETWORK_STATUS.DISCONNECTED,
			socket : null
		} as NetworkState;
	},
	actions : {
		connect : function( _lobbyKey? : string )
		{

			const url : string = "ws://localhost:5001";

			try
			{
				this.socket = new WebSocket( url );

				this.status = NETWORK_STATUS.CONNECTING;

				this.socket.addEventListener( "open", () => {
					this.status = NETWORK_STATUS.CONNECTED;
					console.log('Socket connected');

					if( _lobbyKey )
					{
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
						this.socket?.send( JSON.stringify( {
							type : NETWORK_MESSAGE_TYPE.CREATE_LOBBY
						} ) );
					}
				} );

				this.socket.addEventListener( "close", () => {
					this.status = NETWORK_STATUS.DISCONNECTED;
					console.log('Socket disconnected');
					this.socket = null;
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
				case NETWORK_MESSAGE_TYPE.LOBBY_JOINED_SUCCESS :

					const { key, isHost } = body.data;

					this.lobbyKey = key;
					this.isHost = isHost || false;

					break;

				case NETWORK_MESSAGE_TYPE.LOBBY_JOINED_FAILURE :
					this.socket?.close();
					this.socket = null;
					console.error( `Connection failed: ${ body }` )
					break;
			}
		}
	}
} );