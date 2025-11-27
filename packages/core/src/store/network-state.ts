import { defineStore } from "pinia";

enum NetworkStatus {
	DISCONNECTED,
	CONNECTING,
	CONNECTED,
	DISCONNECTING
}

type NetworkState = {
	status : NetworkStatus
	socket : WebSocket | null
}

export const useNetworkState = defineStore( 'network-state', {
	state : () => {
		return {
			status : NetworkStatus.DISCONNECTED,
			socket : null
		} as NetworkState;
	},
	actions : {
		connect : function( _url : string = "ws://localhost:5001" )
		{
			try
			{
				this.socket = new WebSocket( _url );

				this.status = NetworkStatus.CONNECTING;

				this.socket.addEventListener( "open", () => {
					this.status = NetworkStatus.CONNECTED;
					console.log('Socket connected')
				} );
			}
			catch( error )
			{

			}
		},
		handleMessage : async function( { data } : MessageEvent )
		{
			console.log(data);
		}
	}
} );