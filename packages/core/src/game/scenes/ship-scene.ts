import { addComponent, addEntity } from "bitecs";
import { GameplayScene } from "./gameplay-scene";
import { Position, Renderable } from "../ecs/components";
import { Spritesheet } from "#game/types.js";

export class ShipScene extends GameplayScene
{
	constructor()
	{
		super( 'ship' );
	}

	init() : void
	{
		super.init();

		// This is all temporary until I figure out how to structure my prefabs

		const playerShipEntity = addEntity( this.world );

		addComponent( this.world, playerShipEntity, Renderable );
		addComponent( this.world, playerShipEntity, Position );

		Renderable.texture[ playerShipEntity ] = Spritesheet.SHIP;
		Renderable.frame[ playerShipEntity ] = 3;

		Position.x[playerShipEntity] = 50;
		Position.y[playerShipEntity] = 50;
	}
}