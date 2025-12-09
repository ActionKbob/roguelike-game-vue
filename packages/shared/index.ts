export enum NETWORK_REQUEST_TYPE {
	CREATE_LOBBY,
	JOIN_LOBBY,
	LEAVE_LOBBY,
}

export enum NETWORK_RESPONSE_TYPE {
	CONNECTION_SUCCESS,
	LOBBY_JOINED_SUCCESS,
	LOBBY_JOINED_FAILURE,
	HOST_LEFT
}

export enum WEBRTC_MESSAGE_TYPE {
	OFFER,
	ANSWER,
	CANDIDATE
}

export type MessageBody = { 
	data? : any,
	message? : string
}

export type NetworkMessage = {
	type : NETWORK_REQUEST_TYPE | NETWORK_RESPONSE_TYPE | WEBRTC_MESSAGE_TYPE,
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