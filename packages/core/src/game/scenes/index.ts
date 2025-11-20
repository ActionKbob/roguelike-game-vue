import { GameObjects, Scene } from "phaser";
import { createWorld, type World } from "bitecs";
import { PreloadScene } from "./preload-scene";
import { SystemPipeline } from "#game/utilities.js";
import { useGameState } from "#store/game-state.js";
import { Spritesheet } from "#game/types.js";
import { MapMarkerSystem, RenderSystem } from "../ecs/systems";

export class GameplayScene extends Scene
{
	private gameState = useGameState();	

	private world : World;
	private systems : SystemPipeline;

	private blitters : Map<Spritesheet, GameObjects.Blitter> = new Map();
	get Blitters() {
		return this.blitters;
	}

	constructor( key : string = 'gameplay' ) {
		super( key );

		this.gameState.setScene( this ); 

		this.world = createWorld();
		this.systems = new SystemPipeline();
	}

	init() {
		console.log( `...${ this.scene.key } scene init...` );

		this.blitters.set( Spritesheet.DUNGEON, this.add.blitter( 0, 0, 'dungeon' ) );

		this.systems.add( [
			{ name : 'render', func : RenderSystem( this.world ) },
			{ name : 'map-marker', func : MapMarkerSystem( this.world ) }
		] );
	}

	update( time : number, delta : number ) : void {

		this.systems.run( this.world );
		
	}
}

export { PreloadScene };