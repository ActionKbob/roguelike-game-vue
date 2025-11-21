import { addComponent, addComponents, addEntity, setComponent } from "bitecs";
import { GameplayScene } from "./gameplay-scene";
import { Position, Renderable } from "../ecs/components";
import { Spritesheet } from "#game/types.js";

export class SpaceScene extends GameplayScene
{
	constructor()
	{
		super( 'space' );
	}

	init() : void
	{
		super.init();

		// This is all temporary until I figure out how to structure my prefabs

		const playerShipEntity = addEntity( this.world );

		addComponents( this.world, playerShipEntity, Renderable, Position );

		Renderable.texture[ playerShipEntity ] = Spritesheet.SHIP;
		Renderable.frame[ playerShipEntity ] = 3;

		Position.x[playerShipEntity] = 50;
		Position.y[playerShipEntity] = 50;
	}
}