import { ServerWebSocket } from 'bun';
import { v4 as uuid } from 'uuid';
import { Lobby, NETWORK_MESSAGE_TYPE, NetworkMessage } from 'shared';
import { LobbyManager } from './lobby-manager';
import { ConnectionManager } from './connection-manager';

const PORT = process.env.PORT || 5001;

const creatLobbyKey = ( _length : number ) => {
    const characterPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = '';

    for( let i = 0; i < _length; i++ )
    {
        result += characterPool.charAt( Math.floor( Math.random() * characterPool.length ) );
    }

    return result;
}

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
			console.log( 'Client CONNECTED' );
			const newClientId = uuid();

			const clientId = connectionManager.addConnection( _ws );

			_ws.send( JSON.stringify( {
				type : NETWORK_MESSAGE_TYPE.CONNECTION_SUCCESS,
				body : {
					data : clientId
				}
			} as NetworkMessage ) );
		},
		close( _ws )
		{
			console.log( 'Client DISCONNECTED' );
			connectionManager.removeConnection( _ws );
		},
		message( _ws : ServerWebSocket, _message : string | Buffer<ArrayBuffer> )
		{
			const { type, body } = JSON.parse( _message as string ) as NetworkMessage;

			const client = connectionManager.findConnectionKeyByValue( _ws );

			let lobby : Lobby | undefined;

			switch ( type ) {
				case NETWORK_MESSAGE_TYPE.CREATE_LOBBY :
					
					if( client )
						lobby = lobbyManager.createLobby( client );
						
					handleLobbyJoinResponse( _ws, lobby );

					break;

				case NETWORK_MESSAGE_TYPE.JOIN_LOBBY :

					if( client )
						lobby = lobbyManager.joinLobby( body?.data?.key, client )

					handleLobbyJoinResponse( _ws, lobby );

					break;
			}
		}
	}
});

function handleLobbyJoinResponse( _ws : ServerWebSocket, _lobby : Lobby | undefined  )
{
	if( _lobby )
	{
		_ws.send( JSON.stringify( {
			type : NETWORK_MESSAGE_TYPE.LOBBY_JOINED_SUCCESS,
			body : {
				data : {
					key : _lobby.id
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
const connectionManager : ConnectionManager = new ConnectionManager();

console.log( `WebSocket server running on ${server.hostname}:${server.port}` );