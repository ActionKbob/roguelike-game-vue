import type { World } from "bitecs";

export type System = ( _world : World<{}> ) => {}

export enum Spritesheet {
	DUNGEON,
	SHIP
}