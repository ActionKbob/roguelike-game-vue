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
		open( ws )
		{
			console.log( 'Client CONNECTED' );
		},
		close( ws )
		{
			console.log( 'Client DISCONNECTED' ); 
		},
		message( ws, message )
		{

		}
	}
});

console.log( `WebSocket server running on ${server.hostname}:${server.port}` )