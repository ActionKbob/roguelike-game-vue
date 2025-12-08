import { v4 as uuid, } from 'uuid';
import { Lobby, Peer } from "shared";

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

		this.addPeerToLobby( newLobby, _clientId, true );

		return newLobby;
	}

	joinLobby( _id : string, _clientId : string ) : Lobby | undefined
	{
		const lobby = this.lobbies.get( _id );

		if( lobby )
		{
			this.addPeerToLobby( lobby, _clientId, true );
			return lobby;
		}

		return undefined;
	}

	addPeerToLobby( _lobby : Lobby, _peerId : string, _isHost : boolean = false )
	{
		_lobby.peers.set( _peerId, { id : _peerId, isHost : _isHost } as Peer )
	}

	removePeerFromLobby( _peerId : string )
	{
		const lobby = this.getLobbyByPeer( _peerId );

		lobby?.peers.delete( _peerId );

		if( lobby?.peers.size === 0 )
		{
			this.lobbies.delete( lobby.id );
			console.warn( `Lobby ${ lobby.id } is empty, deleting lobby` );
		}
	}

	getLobbyByPeer( _peerId : string )
	{
		for( const [ key, value ] of this.lobbies.entries() )
		{
			if( value.peers.has( _peerId ) )
				return value;
		}

		return undefined;
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