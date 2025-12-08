import { v4 as uuid, } from 'uuid';
import { Lobby } from "shared";

const LOBBY_KEY_CHAR_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export class LobbyManager
{

	private lobbies : Map<string, Lobby>;

	constructor()
	{
		this.lobbies = new Map();
	}

	createLobby( _clientId : string ) : Lobby
	{
		const id = this.generateLobbyId();

		const newLobby : Lobby = {
			id,
			peers : new Map()
		}

		this.lobbies.set( id, newLobby );

		this.addPeerToLobby( id, _clientId, true );

		return newLobby;
	}

	joinLobby( _key : string ) : Lobby | undefined
	{
		this.getLobbyByKey

		this.addPeerToLobby( id, _clientId, true );

		return undefined;
	}

	addPeerToLobby( _lobbyId : string, _peerId : string, _isHost : boolean = false )
	{

	}

	private generateLobbyId( _length : number = 4 ) : string
	{
    let result = '';

    for( let i = 0; i < _length; i++ )
    {
        result += LOBBY_KEY_CHAR_POOL.charAt( Math.floor( Math.random() * LOBBY_KEY_CHAR_POOL.length ) );
    }

    return result;
	}
}