import { defineStore } from "pinia";
import { NETWORK_MESSAGE_TYPE } from 'shared';

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
		connect : function( _url : string = "ws://localhost:5001", _lobbyKey? : string )
		{
			try
			{
				this.socket = new WebSocket( _url );

				this.status = NETWORK_STATUS.CONNECTING;

				this.socket.addEventListener( "open", () => {
					this.status = NETWORK_STATUS.CONNECTED;
					console.log('Socket connected');

					if( _lobbyKey )
					{
						this.socket?.send( JSON.stringify( {
							type : NETWORK_MESSAGE_TYPE.JOIN_LOBBY,
							data : _lobbyKey
						} ) );
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
			if( this.socket )
				this.socket.close();
		},
		handleMessage : async function( { data } : MessageEvent )
		{
			const { type, body } = JSON.parse( data );

			switch( type )
			{
				case NETWORK_MESSAGE_TYPE.LOBBY_JOINED :

					this.lobbyKey = body.key;
					this.isHost = body.isHost;

					break;
			}
		}
	}
} );