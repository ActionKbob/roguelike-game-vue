import { useNetworkState, type NetworkState } from "#network-state.js";
import { defineStore, type Store } from "pinia";

type ChatMessage = {
	sender : string,
	message : string
}

type ChatState = {
	messages : ChatMessage[],
	network :  Store<'network-state'> & NetworkState
	channels : RTCDataChannel[]
}

export const useChatState = defineStore( 'chat-state', {
	state : () => ( {
		messages : [],
		network : useNetworkState(),
		channels : []
	} as ChatState ),
	actions : {
		setupDataChannel : function( _dataChannel : RTCDataChannel, _peerId : string )
		{
			this.channels.push( _dataChannel );

			_dataChannel.onopen = () => {
				console.log( `${ _dataChannel.label } channel with ${ _peerId } opened` );
			}

			_dataChannel.onmessage = ( event : MessageEvent ) => {
				console.log( `${ _dataChannel.label } message from ${ _peerId }:`, event.data );

				const newMessage : ChatMessage = JSON.parse( event.data );
				
				this.messages.push( newMessage );

				if( this.network.isHost )
				{
					this.channels.forEach( channel => {
						channel.send( JSON.stringify( newMessage ) );
					})	
				}
			}

			_dataChannel.close = () => {
				console.log( `${ _dataChannel.label } channel  with ${ _peerId } closed` );
				this.channels = this.channels.filter( channel => channel !== _dataChannel );
			}
		},
		sendMessage : function( _message : string )
		{

			if( !_message || _message.length === 0 )
				return;

			const newMessage = {
				sender : this.network.clientId,
				message : _message
			} as ChatMessage

			if( this.network.isHost )
				this.messages.push( newMessage );

			this.channels.forEach( channel => {
				channel.send( JSON.stringify( newMessage ) );
			})			
		}
	}
} );