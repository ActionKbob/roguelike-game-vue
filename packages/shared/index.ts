export enum NETWORK_MESSAGE_TYPE {
	CREATE_LOBBY,
	JOIN_LOBBY,
	LOBBY_JOINED_SUCCESS,
	LOBBY_JOINED_FAILURE
}

export type NetworkMessage = {
	type : NETWORK_MESSAGE_TYPE,
	body? : Object | string | number
}