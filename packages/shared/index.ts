export enum NETWORK_MESSAGE_TYPE {
	// REQUEST
	CREATE_LOBBY,
	JOIN_LOBBY,
	LEAVE_LOBBY,

	// RESPONSE
	CONNECTION_SUCCESS,
	LOBBY_JOINED_SUCCESS,
	LOBBY_JOINED_FAILURE,
	CLIENT_JOINED,
	CLIENT_LEFT,

	// SIGNALING
	OFFER,
	ANSWER,
	CANDIDATE
}

export type MessageBody = { 
	data? : any,
	message? : string
}

export type NetworkMessage = {
	type : NETWORK_MESSAGE_TYPE,
	body? : MessageBody
}

export type SignalingMessage = {
	type : NETWORK_MESSAGE_TYPE,
	body : {
		sdp? : RTCSessionDescriptionInit,
		candidate? : RTCIceCandidateInit,
		origin? : string
		target? : string,
		lobby? : string,
	}
}

export interface ServerPeer {
	id : string,
	isHost : boolean,
	lobby : string
}

export type ClientPeer = {
	id : string,
	connection? : RTCPeerConnection,
	dataChanncel? : RTCDataChannel
}

export interface Lobby {
	id : string,
	hostPeer : string,
	peers : Map<string, ServerPeer>
}