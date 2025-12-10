import { ServerWebSocket } from 'bun';
import { Lobby, MessageBody, NETWORK_MESSAGE_TYPE, NetworkMessage, SignalingMessage } from 'shared';
import { LobbyManager } from './lobby-manager';
import { ConnectionManager } from './connection-manager';

const PORT = process.env.PORT || 5001;

const server = Bun.serve({
	port : PORT,
	fetch( req, res )
	{
		if( server.upgrade( req ) )
			return;

		return new Response( "Upgrade failed", { status : 500 } )
	},
	websocket : {
		open( _ws )
		{			
			const clientId = connectionManager.addConnection( _ws );

			console.log( `Client ${ clientId } CONNECTED` );
			
			_ws.send( JSON.stringify( {
				type : NETWORK_MESSAGE_TYPE.CONNECTION_SUCCESS,
				body : {
					data : {
						clientId
					}
				}
			} as NetworkMessage ) );
		},
		close( _ws )
		{
			console.log( 'Client DISCONNECTED' );

			const client = connectionManager.findConnectionKeyByValue( _ws );

			if( client )
				lobbyManager.removePeerFromLobby( client );

			connectionManager.removeConnection( _ws );
		},
		message( _ws : ServerWebSocket, _message : string | Buffer<ArrayBuffer> )
		{
			const { type, body } = JSON.parse( _message as string ) as NetworkMessage | SignalingMessage;

			const client = connectionManager.findConnectionKeyByValue( _ws );
			
			let lobby : Lobby | undefined;
			
			console.log( type )

			switch ( type ) {
				case NETWORK_MESSAGE_TYPE.CREATE_LOBBY :
					
					console.log('CREATING LOBBY');

					if( client )
						lobby = lobbyManager.createLobby( client );
						
					handleLobbyJoinResponse( _ws, lobby, true );

					break;

				case NETWORK_MESSAGE_TYPE.JOIN_LOBBY :

					console.log('JOINING LOBBY');

					if( client )
						lobby = lobbyManager.joinLobby( ( body as MessageBody )?.data?.key, client );

					handleLobbyJoinResponse( _ws, lobby );

					break;

				// FORWARD SIGNALING MESSAGES
				case NETWORK_MESSAGE_TYPE.CANDIDATE || NETWORK_MESSAGE_TYPE.OFFER || NETWORK_MESSAGE_TYPE.ANSWER :
					console.log( `Forwarding message of ${ type }` )
					if( client )
					{
						lobby = lobbyManager.getLobbyByPeer( client );
						if( lobby )
						{
							connectionManager.sendMessageToClient( lobby.hostPeer, {
								type,
								body
							} as SignalingMessage );
						}
					}

					break;
			}
		}
	}
});

function handleLobbyJoinResponse( _ws : ServerWebSocket, _lobby : Lobby | undefined, _isHost : boolean = false  )
{
	if( _lobby )
	{
		_ws.send( JSON.stringify( {
			type : NETWORK_MESSAGE_TYPE.LOBBY_JOINED_SUCCESS,
			body : {
				data : {
					key : _lobby.id,
					peers : [ ..._lobby.peers.values() ],
					isHost : _isHost
				}
			}
		} as NetworkMessage ) );
	}
	else
	{
		_ws.send( JSON.stringify( {
			type : NETWORK_MESSAGE_TYPE.LOBBY_JOINED_FAILURE,
			body : {
				message : "Failed to join lobby"
			}
		} as NetworkMessage ) );
	}
}

const lobbyManager : LobbyManager = new LobbyManager();
export const connectionManager : ConnectionManager = new ConnectionManager();

console.log( `WebSocket server running on ${server.hostname}:${server.port}` );