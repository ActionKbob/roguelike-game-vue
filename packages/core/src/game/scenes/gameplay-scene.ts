import { Spritesheet } from "#game/types.js";
import { SystemPipeline } from "#game/utilities.js";
import { GameObjects, Scene } from "phaser";
import { RenderSystem } from "../ecs/systems";
import { useInputBindingsState } from "#store/input-bindings-state.js";
import { useGameState } from "#store/game-state.js";


export class GameplayScene extends Scene
{
	private gameState = useGameState();

	get World()
	{
		return this.gameState.world;
	}

	private inputState = useInputBindingsState();
	get InputState()
	{
		return this.inputState;
	}


	protected systems : SystemPipeline;

	protected blitters : Map<Spritesheet, GameObjects.Blitter> = new Map();
	get Blitters() :  Map<Spritesheet, GameObjects.Blitter> {
		return this.blitters;
	}

	protected displayObjectMap : Map<number, GameObjects.Bob | GameObjects.Sprite> = new Map();
	get DisplayObjectMap()
	{
		return this.displayObjectMap;
	}

	protected deltaTime : number = 0;
	get DeltaTime() : number
	{
		return this.deltaTime;
	}

	constructor( key : string = 'gameplay' ) {
		super( key );
		
		this.systems = new SystemPipeline();
	}

	init() {
		console.log( `...${ this.scene.key } scene init...` );

		this.input.keyboard?.on( "keydown", this.handleKeyDown );
		this.input.keyboard?.on( "keyup", this.handleKeyUp );

		this.blitters.set( Spritesheet.DUNGEON, this.add.blitter( 0, 0, 'dungeon' ) );
		this.blitters.set( Spritesheet.SHIP, this.add.blitter( 0, 0, 'ship' ) );
		this.systems.add( { name : 'render', func : RenderSystem( this.World ) } );
	}

	update( time : number, delta : number ) : void {
		this.deltaTime = delta / 100;
		this.systems.run( this );

	}

	handleKeyDown = ( _event : KeyboardEvent ) : void => {
		this.inputState.addActiveAction( _event.code );
	}

	handleKeyUp = ( _event : KeyboardEvent ) : void => {
		this.inputState.removeActiveAction( _event.code );
	}
}	