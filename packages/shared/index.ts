export enum NETWORK_MESSAGE_TYPE {
	CONNECTION_SUCCESS,
	CREATE_LOBBY,
	JOIN_LOBBY,
	LEAVE_LOBBY,
	LOBBY_JOINED_SUCCESS,
	LOBBY_JOINED_FAILURE,
	HOST_LEFT
}

export type MessageBody = { 
	data? : any,
	message? : string
}

export type NetworkMessage = {
	type : NETWORK_MESSAGE_TYPE,
	body? : MessageBody
}

export interface Peer {
	id : string,
	isHost : boolean
}

export interface Lobby {
	id : string,
	peers : Map<string, Peer>
}