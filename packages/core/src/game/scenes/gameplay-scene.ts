import { Spritesheet } from "#game/types.js";
import { SystemPipeline } from "#game/utilities.js";
import { GameObjects, Scene } from "phaser";
import { RenderSystem } from "../ecs/systems";
import { useInputBindingsState } from "#store/input-bindings-state.js";
import { useNetworkedGameState } from "#store/networked-game-state.js";
import { useNetworkState } from "store";
import { ShipControlSystem } from "#game/ecs/systems/ship-control-system.js";
import { RotationSystem } from "#game/ecs/systems/rotation-system.js";
import { VelocitySystem } from "#game/ecs/systems/velocity-system.js";
import { addComponent, addEntity, getAllEntities } from "bitecs";
import { Networked, PlayerInput, Position, Renderable, Rotation, ShipControls, Velocity } from "../ecs/components";


export class GameplayScene extends Scene
{
	private gameState = useNetworkedGameState();
	private networkState = useNetworkState();

	private inputState = useInputBindingsState();
	get InputState(){ return this.inputState; }

	get World(){ return this.gameState.world; }

	protected systems : SystemPipeline;

	protected blitters : Map<Spritesheet, GameObjects.Blitter> = new Map();
	get Blitters() :  Map<Spritesheet, GameObjects.Blitter> { return this.blitters; }

	protected displayObjectMap : Map<number, GameObjects.Bob | GameObjects.Sprite> = new Map();
	get DisplayObjectMap(){ return this.displayObjectMap; }

	protected deltaTime : number = 0;
	get DeltaTime() : number { return this.deltaTime; }

	constructor( key : string = 'gameplay' ) {
		super( key );
		
		this.gameState.setup( this );

		this.networkState.addDataChannel( 'gamedata', this.gameState.setupDataChannel );

		this.systems = new SystemPipeline();
	}

	init() {
		console.log( `...${ this.scene.key } scene init...` );

		this.input.keyboard?.on( "keydown", this.handleKeyDown );
		this.input.keyboard?.on( "keyup", this.handleKeyUp );

		this.blitters.set( Spritesheet.DUNGEON, this.add.blitter( 0, 0, 'dungeon' ) );
		this.blitters.set( Spritesheet.SHIP, this.add.blitter( 0, 0, 'ship' ) );
		this.systems.add( [
			{ name : 'render', func : RenderSystem( this.World ) },
			{ name : "shipControlSystem", func : ShipControlSystem( this.World ) },
			{ name : "rotationSystem", func : RotationSystem( this.World ) },
			{ name : "velocitySystem", func : VelocitySystem( this.World ) },
		] );

		const playerEntity = addEntity( this.World );
		addComponent( this.World, playerEntity, Networked )
		addComponent( this.World, playerEntity, Position )
		addComponent( this.World, playerEntity, Rotation )
		addComponent( this.World, playerEntity, Renderable )
		addComponent( this.World, playerEntity, Velocity )
		addComponent( this.World, playerEntity, PlayerInput )
		addComponent( this.World, playerEntity, ShipControls )

		Position.x[playerEntity] = Math.random() * 200;
		Position.y[playerEntity] = Math.random() * 200;

		Rotation.value[playerEntity] = Math.random() * Math.PI * 2;
		
		Renderable.texture[playerEntity] = Spritesheet.SHIP;
		Renderable.frame[playerEntity] = 3;

		Velocity.value.x[playerEntity] = 0;
		Velocity.value.y[playerEntity] = 0;
		Velocity.acceleration.x[playerEntity] = 0;
		Velocity.acceleration.y[playerEntity] = 0;
		Velocity.friction[playerEntity] = 0;
	}

	update( time : number, delta : number ) : void {
		this.deltaTime = delta / 100;
		this.systems.run( this );

		if( this.networkState.isHost )
			this.gameState.update();
		else
			this.gameState.test();
	}

	handleKeyDown = ( _event : KeyboardEvent ) : void => {
		this.inputState.addActiveAction( _event.code );
	}

	handleKeyUp = ( _event : KeyboardEvent ) : void => {
		this.inputState.removeActiveAction( _event.code );
	}
}	