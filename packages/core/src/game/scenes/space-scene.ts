import { addComponents, addEntity } from "bitecs";
import { GameplayScene } from "./gameplay-scene";
import { PlayerInput, Position, Renderable, Rotation, ShipControls, Velocity } from "../ecs/components";
import { Spritesheet } from "#game/types.js";
import { RotationSystem } from "#game/ecs/systems/rotation-system.js";
import { ShipControlSystem } from "#game/ecs/systems/ship-control-system.js";
import { VelocitySystem } from "#game/ecs/systems/velocity-system.js";

export class SpaceScene extends GameplayScene
{
	constructor()
	{
		super( 'space' );
	}

	init() : void
	{
		super.init();

		this.systems.add( [
			{ name : "shipControlSystem", func : ShipControlSystem( this.world ) },
			{ name : "rotationSystem", func : RotationSystem( this.world ) },
			{ name : "velocitySystem", func : VelocitySystem( this.world ) },
		] );

		// This is all temporary until I figure out how to structure my prefabs

		const playerShipEntity = addEntity( this.world );

		addComponents( this.world, playerShipEntity, Rotation, Renderable, Position, Velocity, PlayerInput, ShipControls );

		Renderable.texture[ playerShipEntity ] = Spritesheet.SHIP;
		Renderable.frame[ playerShipEntity ] = 3;

		Position.x[playerShipEntity] = Math.round( Math.random() * this.cameras.main.width );
		Position.y[playerShipEntity] = Math.round( Math.random() * this.cameras.main.height );

		Velocity.value.x[playerShipEntity] = 0;
		Velocity.value.y[playerShipEntity] = 0;
		Velocity.acceleration.x[playerShipEntity] = 0;
		Velocity.acceleration.y[playerShipEntity] = 0;
		Velocity.friction[playerShipEntity] = 0.12;

		Rotation.value[ playerShipEntity ] = 0;
	}

	update(time: number, delta: number): void {
		super.update( time, delta );
	}
}