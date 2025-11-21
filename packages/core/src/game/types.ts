import type { World } from "bitecs";
import type { GameplayScene } from "./scenes/gameplay-scene";

export type System = ( _world : World<{}>, _scene : GameplayScene ) => {}

export enum Spritesheet {
	DUNGEON,
	SHIP
}