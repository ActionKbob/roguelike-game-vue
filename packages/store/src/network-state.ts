import { defineStore } from "pinia";
import { NETWORK_MESSAGE_TYPE, type ClientPeer, type NetworkMessage, type RTCMessageBody, type ServerPeer, type SignalingMessage } from 'shared';

export enum NETWORK_STATUS {
	DISCONNECTED,
	CONNECTING,
	CONNECTED,
	DISCONNECTING
}

type NetworkState = {
	status : NETWORK_STATUS,
	socket : WebSocket | null,
	peers : Map<string, ClientPeer>,
	clientId? : string,
	lobbyKey? : string,
	isHost? : Boolean
}

const defaultState : NetworkState = {
		status : NETWORK_STATUS.DISCONNECTED,
		socket : null,
		peers : new Map(),
		clientId : undefined,
		lobbyKey : undefined,
		isHost : undefined
	}

export const useNetworkState = defineStore( 'network-state', {
	state : () => ( { ...defaultState} ),
	actions : {
		connect : function( _lobbyKey? : string )
		{
			const url : string = "ws://localhost:5001";

			try
			{
				this.socket = new WebSocket( url );

				this.status = NETWORK_STATUS.CONNECTING;

				this.socket.addEventListener( "open", () => {
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
					this.$reset();
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
				case NETWORK_MESSAGE_TYPE.CONNECTION_SUCCESS :
					this.status = NETWORK_STATUS.CONNECTED;
					this.clientId = body.data?.clientId;
					break;

				case NETWORK_MESSAGE_TYPE.LOBBY_JOINED_SUCCESS :
					const { key, isHost, peers, hostId } = body.data;

					this.lobbyKey = key;
					this.isHost = isHost || false;

					for( const peer of peers )
					{
						this.peers.set( peer.id, { id : peer.id } );
					}

					if( !this.isHost )
						this._setupPeerConnection( hostId );

					break;

				case NETWORK_MESSAGE_TYPE.LOBBY_JOINED_FAILURE :
					this.socket?.close();
					console.error( `Connection failed: ${ body }` );
					break;

				case NETWORK_MESSAGE_TYPE.CLIENT_JOINED :
					const newClientId = body.data.clientId;

					if( newClientId !== this.clientId )
						this.peers.set( newClientId, { id : newClientId } );

					if( this.isHost )
						this._setupPeerConnection( newClientId );

					break;

				case NETWORK_MESSAGE_TYPE.CLIENT_LEFT :
					
					if( this.peers.has( body.data.clientId ) )
					{
						const peer = this.peers.get( body.data.clientId );
						peer?.dataChannel?.close();
						peer?.connection?.close();

						this.peers.delete( peer?.id! );
					}

					break;

				// WEB RTC MESSAGES
				case NETWORK_MESSAGE_TYPE.OFFER : 
				case NETWORK_MESSAGE_TYPE.ANSWER :
				case NETWORK_MESSAGE_TYPE.CANDIDATE : 
					this._handleSignalResponse( type, body );
					break;
			}
		},

		// WebRTC Actions
		_setupPeerConnection : function( _peerId : string )
		{
			const peer = this.peers.get( _peerId );

			if( !peer )
			{
				return;
			}

			const connection = new RTCPeerConnection( {
				iceServers: [
					{
						urls: "stun:stun.l.google.com:19302"
					},
					{
						urls: 'turn:numb.viagenie.ca',
						credential: 'muazkh',
						username: 'webrtc@live.com'
					},
				]
      } )

			peer.connection = connection;

			let dataChannel = undefined;

			if( this.isHost )
			{
				dataChannel = connection.createDataChannel( 'chat' );
				this._setupDataChannel( dataChannel, _peerId );
			}
			else
			{
				connection.ondatachannel = ( event ) => {
					dataChannel = event.channel;
					this._setupDataChannel( dataChannel, _peerId );
				}
			}

			

			// Handle Ice Candidate
			connection.onicecandidate = ( event : RTCPeerConnectionIceEvent ) => {
				if( event.candidate )
				{
					this.socket?.send( JSON.stringify( {
						type : NETWORK_MESSAGE_TYPE.CANDIDATE,
						body : {
							origin : this.clientId,
							target : _peerId,
							candidate : event.candidate
						}
					} as SignalingMessage ) );
				}
			}

			peer.dataChannel = dataChannel;

			// Connections are instantiated by the host
			if( this.isHost )
			{
				connection.createOffer()
				.then( offer => connection.setLocalDescription( offer ) )
				.then( () => {
					this.socket?.send( JSON.stringify( {
						type : NETWORK_MESSAGE_TYPE.OFFER,
						body : {
							origin : this.clientId,
							target : _peerId,
							sdp : connection.localDescription
						}
					} as SignalingMessage ) );
				} )
			}
		},

		_setupDataChannel : function( _dataChannel : RTCDataChannel, _peerId : string )
		{
			_dataChannel.onopen = () => {
				console.log( `Data channel with ${ _peerId } openned` );				
			}

			_dataChannel.onmessage = ( event : MessageEvent ) => {
				console.log( `Message from ${ _peerId }:`, event.data );
			}

			_dataChannel.close = () => {
				console.log( `Data channel with ${ _peerId } closed` );
			}
		},

		_handleSignalResponse : async function( 
			_type : NETWORK_MESSAGE_TYPE.CANDIDATE | NETWORK_MESSAGE_TYPE.OFFER | NETWORK_MESSAGE_TYPE.ANSWER, 
			_body : RTCMessageBody 
		)
		{
			let peer = this.peers.get( _body.origin! );

			if( peer )
			{
				const peerConnection = peer.connection;

				console.log( peerConnection, _type, _body )

				try
				{

					if( _type === NETWORK_MESSAGE_TYPE.OFFER )
					{
						await peerConnection?.setRemoteDescription( new RTCSessionDescription( _body.sdp! ) );
						const answer = await peerConnection?.createAnswer();
						await peerConnection?.setLocalDescription( answer );

						this.socket?.send( JSON.stringify( {
							type : NETWORK_MESSAGE_TYPE.ANSWER,
							body : {
								origin : this.clientId,
								target : peer.id,
								sdp : peerConnection?.localDescription
							}
						} as SignalingMessage ) );
					}
					else if( _type === NETWORK_MESSAGE_TYPE.ANSWER )
					{
						await peerConnection?.setRemoteDescription( new RTCSessionDescription( _body.sdp! ) );
					}
					else if( _type === NETWORK_MESSAGE_TYPE.CANDIDATE )
					{
						await peerConnection?.addIceCandidate( new RTCIceCandidate( _body.candidate! ) );
					}

					
				}
				catch( error )
				{
					console.error( "Error recieving signal:", error );
				}
			}
		}
	}
} );