import { Scene } from "phaser";

export class PreloadScene extends Scene
{
	constructor()
	{
		super( { key : 'preload' } );
	}

	init()
	{
		console.log( "...Preload..." )
	}

	preload() : void
	{
		this.load.spritesheet(
			'dungeon',
			'http://localhost:6969/api/images/tilemap_packed.png',
			{
				frameWidth : 16,
				frameHeight : 16
			}
		)
	}

	create()
	{
		this.scene.start( 'gameplay' )
	}
}