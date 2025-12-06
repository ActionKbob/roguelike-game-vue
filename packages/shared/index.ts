export enum NETWORK_MESSAGE_TYPE {
	CREATE_LOBBY,
	JOIN_LOBBY,
	LOBBY_JOINED
}

export interface IMessage {
	type : NETWORK_MESSAGE_TYPE,
	body? : Object | string | number
}