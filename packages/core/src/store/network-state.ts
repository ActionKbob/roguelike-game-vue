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

export const useMapState = defineStore( 'network-state', {
	state : () => {
		return {
			status : NetworkStatus.DISCONNECTED,
			socket : null
		} as NetworkState;
	},
	actions : {
		
	}
} );