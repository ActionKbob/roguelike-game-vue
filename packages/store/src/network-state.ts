import { defineStore } from "pinia";
import { NETWORK_REQUEST_TYPE, NETWORK_RESPONSE_TYPE, WEBRTC_MESSAGE_TYPE, type NetworkMessage } from 'shared';

export enum NETWORK_STATUS {
	DISCONNECTED,
	CONNECTING,
	CONNECTED,
	DISCONNECTING
}

type NetworkState = {
	status : NETWORK_STATUS
	socket : WebSocket | null,
	peerConnection : RTCPeerConnection,
	lobbyKey? : string,
	isHost? : Boolean
}

export const useNetworkState = defineStore( 'network-state', {
	state : () => {
		return {
			status : NETWORK_STATUS.DISCONNECTED,
			socket : null,
			peerConnection : new RTCPeerConnection( {
				iceServers : [
					{ urls : 'stun:stun.l.google.com:19302' },
					{ urls : 'stun:global.stun.twilio.com:3478' }
				]
			} )
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
							type : NETWORK_REQUEST_TYPE.JOIN_LOBBY,
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
							type : NETWORK_REQUEST_TYPE.CREATE_LOBBY
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
				case NETWORK_RESPONSE_TYPE.LOBBY_JOINED_SUCCESS :

					const { key, isHost } = body.data;

					this.lobbyKey = key;
					this.isHost = isHost || false;

					if( this.socket )
						setupPeerConnection( this.socket, this.peerConnection );

					if( this.isHost )
						startHostConnection();

					break;

				case NETWORK_RESPONSE_TYPE.LOBBY_JOINED_FAILURE :
					this.socket?.close();
					console.error( `Connection failed: ${ body }` );
					break;

				case NETWORK_RESPONSE_TYPE.HOST_LEFT :
					this.socket?.close();
					console.log( 'Lobby Host left, leaving game' );

				// WEB RTC MESSAGES
				case WEBRTC_MESSAGE_TYPE.OFFER :

					break;
				
				case WEBRTC_MESSAGE_TYPE.ANSWER :
					break;
				
				case WEBRTC_MESSAGE_TYPE.CANDIDATE :
					break;
			}
		},
	}
} );

// WEB RTC HANDLERS
const setupPeerConnection = ( _socket : WebSocket, _peerConnection : RTCPeerConnection ) => {
	_peerConnection.onicecandidate = ( event : RTCPeerConnectionIceEvent ) => {
		if( event.candidate )
		{
			_socket?.send( JSON.stringify( {
				type : WEBRTC_MESSAGE_TYPE.CANDIDATE,
				body : {
					data : {
						candidate : event.candidate.toJSON()
					}
				}
			} as NetworkMessage ) );
		}
	}

	_peerConnection.ondatachannel = ( event : RTCDataChannelEvent ) => {

	}
}

const startHostConnection = () => {
	
}

const handleOffer = async ( _socket : WebSocket, _peerConnection : RTCPeerConnection, _sdp : RTCSessionDescriptionInit ) => {
	
		await _peerConnection.setRemoteDescription( new RTCSessionDescription( _sdp ) );

		const answer = await _peerConnection.createAnswer();
		await _peerConnection.setLocalDescription( answer );

		_socket.send( JSON.stringify( {
			type : WEBRTC_MESSAGE_TYPE.ANSWER,
			body : {
				data : {
					sdp : answer,
					targetPeerId : ''
				}
			}
		} as NetworkMessage ) )
}