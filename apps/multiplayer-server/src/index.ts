import { ServerWebSocket } from 'bun';
import { NETWORK_MESSAGE_TYPE, NetworkMessage } from 'shared';

const PORT = process.env.PORT || 5001;

const Lobbies : Map<string, ServerWebSocket> = new Map();

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
		},
		close( ws )
		{
			console.log( 'Client DISCONNECTED' );
		},
		message( ws : ServerWebSocket, message : string | Buffer<ArrayBuffer> )
		{
			const { type, body } = JSON.parse( message as string ) as NetworkMessage;

			switch ( type ) {
				case NETWORK_MESSAGE_TYPE.CREATE_LOBBY :
					
					let key = creatLobbyKey( 4 );

					do
					{
						Lobbies.set( key, ws );
					}
					while( !Lobbies.has( key ) );

					if( Lobbies.has( key ) )
					{
						console.log( `Lobby ${ key } created...` );
						ws.send( JSON.stringify( {
							type : NETWORK_MESSAGE_TYPE.LOBBY_JOINED_SUCCESS,
							body : {
								key,
								isHost : true
							}
						} ) );
					}

					break;

				case NETWORK_MESSAGE_TYPE.JOIN_LOBBY :

					const lobbyKey : string = body as string;

					if( Lobbies.has( lobbyKey ) )
					{
						Lobbies.set( body as string, ws );
						ws.send( JSON.stringify( {
							type : NETWORK_MESSAGE_TYPE.LOBBY_JOINED_SUCCESS,
							body : {
								key : lobbyKey
							}
						} as NetworkMessage ) )
					}
					else
					{
						ws.send( JSON.stringify( {
							type : NETWORK_MESSAGE_TYPE.LOBBY_JOINED_FAILURE,
							body : "Lobby does not exist"
						} as NetworkMessage ) )
					}

					break;
			}
		}
	}
});

console.log( `WebSocket server running on ${server.hostname}:${server.port}` );