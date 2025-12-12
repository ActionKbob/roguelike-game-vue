import { addComponent, addEntity } from "bitecs";
import { GameplayScene } from "./gameplay-scene";
import { Position, Renderable } from "../ecs/components";
import { Spritesheet } from "#game/types.js";

export class MapScene extends GameplayScene
{
	constructor()
	{
		super( 'map' );
	}

	init() : void
	{
		super.init();

		// This is all temporary until I figure out how to structure my prefabs

		const playerShipEntity = addEntity( this.World );

		addComponent( this.World, playerShipEntity, Renderable );
		addComponent( this.World, playerShipEntity, Position );

		Renderable.texture[ playerShipEntity ] = Spritesheet.DUNGEON;
		Renderable.frame[ playerShipEntity ] = ( 12 * 7 ) + 3;

		Position.x[playerShipEntity] = 150;
		Position.y[playerShipEntity] = 50;
	}
}