import { Spritesheet } from "#game/types.js";
import { SystemPipeline } from "#game/utilities.js";
import { useGameState } from "#store/game-state.js";
import { createWorld, type World } from "bitecs";
import { GameObjects, Scene } from "phaser";
import { MapMarkerSystem, RenderSystem } from "../ecs/systems";

export class GameplayScene extends Scene
{
	private gameState = useGameState();	

	protected world : World;
	get World() : World {
		return this.world;
	}

	protected systems : SystemPipeline;

	protected blitters : Map<Spritesheet, GameObjects.Blitter> = new Map();
	get Blitters() :  Map<Spritesheet, GameObjects.Blitter> {
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
		this.blitters.set( Spritesheet.SHIP, this.add.blitter( 0, 0, 'ship' ) );
		this.systems.add( { name : 'render', func : RenderSystem( this.world ) } );
	}

	update( time : number, delta : number ) : void {
		this.systems.run( this );
	}
}