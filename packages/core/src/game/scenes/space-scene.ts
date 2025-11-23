import { addComponent, addComponents, addEntity, setComponent } from "bitecs";
import { GameplayScene } from "./gameplay-scene";
import { Position, Renderable, Rotation } from "../ecs/components";
import { Spritesheet } from "#game/types.js";
import { RotationSystem } from "#game/ecs/systems/rotation-system.js";

export class SpaceScene extends GameplayScene
{
	constructor()
	{
		super( 'space' );
	}

	init() : void
	{
		super.init();

		this.systems.add( { name : "rotationSystem", func : RotationSystem( this.world ) } );

		// This is all temporary until I figure out how to structure my prefabs

		const playerShipEntity = addEntity( this.world );

		addComponents( this.world, playerShipEntity, Rotation, Renderable, Position );

		Renderable.texture[ playerShipEntity ] = Spritesheet.SHIP;
		Renderable.frame[ playerShipEntity ] = 3;

		Position.x[playerShipEntity] = 50;
		Position.y[playerShipEntity] = 50;

		Rotation.value[ playerShipEntity ] = 0;
	}

	update(time: number, delta: number): void {
		super.update( time, delta );
	}
}