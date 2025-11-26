import type { World } from "bitecs";
import type { GameplayScene } from "./scenes/gameplay-scene";

export type System = ( _world : World<{}>, _scene : GameplayScene ) => {}

export enum Spritesheet {
	DUNGEON,
	SHIP
}

export enum InputAction {

	NULL,

	// Ship Actions
	SHIP_THRUST,
	SHIP_ROTATE_RIGHT,
	SHIP_ROTATE_LEFT

}

export type KeyBinding = {
	[ action in InputAction ]? : string
}