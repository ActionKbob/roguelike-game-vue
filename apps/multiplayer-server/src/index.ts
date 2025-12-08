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
		open( ws )
		{
			console.log( 'Client CONNECTED' );
			const newClientId = uuid();

			const clientId = connectionManager.addConnection( ws );

			ws.send( JSON.stringify( {
				type : NETWORK_MESSAGE_TYPE.CONNECTION_SUCCESS,
				body : {
					data : clientId
				}
			} as NetworkMessage ) );
		},
		close( ws )
		{
			console.log( 'Client DISCONNECTED' );
			connections.forEach( ( _socket, _id ) => {
				if( _socket === ws )
				{
					connections.delete( _id );
				}
			} )
		},
		message( ws : ServerWebSocket, message : string | Buffer<ArrayBuffer> )
		{
			const { type, body } = JSON.parse( message as string ) as NetworkMessage;

			const client = connections.forEach( ( _socket, _id ) => (  ) )

			let lobby : Lobby | undefined;
			

			switch ( type ) {
				case NETWORK_MESSAGE_TYPE.CREATE_LOBBY :
					
					lobby = lobbyManager.createLobby(  );
					
					if( lobby )
					{
						ws.send( JSON.stringify( {
							type : NETWORK_MESSAGE_TYPE.LOBBY_JOINED_SUCCESS,
							body : {
								data : {
									key : lobby.key
								}
							}
						} as NetworkMessage ) )
					}
					else
					{
						// Send failure
					}

					break;

				case NETWORK_MESSAGE_TYPE.JOIN_LOBBY :

					lobby = lobbyManager.createLobby();

					if( lobby )
					{
						// Send success
					}
					else
					{
						// Send failure
					}

					break;
			}
		}
	}
});

const lobbyManager : LobbyManager = new LobbyManager();
const connectionManager : ConnectionManager = new ConnectionManager();

console.log( `WebSocket server running on ${server.hostname}:${server.port}` );