import { ServerWebSocket } from "bun";
import { MessageBody } from "shared";
import { v4 as uuid } from 'uuid';

export class ConnectionManager
{
	connections : Map<string, ServerWebSocket>

	constructor()
	{
		this.connections = new Map();
	}

	addConnection( _ws : ServerWebSocket ) : string
	{
		const clientId = uuid();

		this.connections.set( clientId, _ws );

		return clientId;
	}

	removeConnection( _ws : ServerWebSocket ) : void
	{
		const removeId = this.findConnectionKeyByValue( _ws );

		if( removeId )
			this.connections.delete( removeId );
	}

	findConnectionKeyByValue( _value : ServerWebSocket )
	{
		for( const [ key, value ] of this.connections.entries() )
		{
			if( value === _value )
				return key;
		}
		return undefined;
	}

	sendMessageToClient( _clientId : string, _message : MessageBody )
	{
		const client = this.connections.get( _clientId );

		if( client )
			client.send( JSON.stringify( _message ) );
	}
}