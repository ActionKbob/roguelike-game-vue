import { ServerWebSocket } from "bun";
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
}