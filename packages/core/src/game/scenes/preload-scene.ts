import { Spritesheet } from "#game/types.js";
import { Scene } from "phaser";

type Texure = {
	name : string,
	type : Spritesheet,
	path : string,
	frameSize : {
		width : number;
		height : number;
	}
}

export const TEXTURE_ARRAY : Array< Texure > = [
	{
		name : 'dungeon',
		type : Spritesheet.DUNGEON,
		path :'http://localhost:6969/api/images/tilemap_packed.png',
		frameSize : {
			width : 16,
			height : 16
		}
	},
	{
		name : 'ship',
		type : Spritesheet.SHIP,
		path : 'http://localhost:6969/api/images/ships_packed.png',
		frameSize : {
			width : 32,
			height : 32
		}
	}
];

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
		for( const texture of TEXTURE_ARRAY )
		{
			console.log( `Loading ${ texture.name } texture` )
			this.load.spritesheet(
				texture.name,
				texture.path,
				{
					frameWidth : texture.frameSize.width,
					frameHeight : texture.frameSize.height
				}
			)
		}
	}

	create()
	{
		this.scene.start( 'ship' )
	}
}