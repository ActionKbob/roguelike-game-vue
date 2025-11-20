import { Scene, GameObjects } from "phaser";
import { addComponents, addEntity, createWorld, type World } from "bitecs";
import { Spritesheet } from "#game/types";
import { SystemPipeline } from "#game/utilities";
import { useGameState } from "#store/game-state";
import { RenderSystem, MapMarkerSystem } from "#game/ecs/systems";
import { MapMarker, Position, Renderable } from "#game/ecs/components";
import { useMapState } from "#store/map-state.js";

export class GameplayScene extends Scene
{
	private gameState = useGameState();

	private mapState = useMapState();

	private world : World;
	private systems : SystemPipeline;

	private blitters : Map<Spritesheet, GameObjects.Blitter> = new Map();
	get Blitters() {
		return this.blitters;
	}

	private graphics! : GameObjects.Graphics;

	constructor() {
		super( { key : 'gameplay' } );

		this.gameState.setScene( this ); 

		this.world = createWorld();
		this.systems = new SystemPipeline();
	}

	init() {
		console.log( "...Gameplay..." );

		this.graphics = this.make.graphics();

		this.blitters.set( Spritesheet.DUNGEON, this.add.blitter( 0, 0, 'dungeon' ) );

		this.systems.add( 'render', RenderSystem( this.world ) );
		this.systems.add( 'map-marker', MapMarkerSystem( this.world ) );

		//Test Entity
		const mapMarkerEntity = addEntity( this.world );
		addComponents( this.world, mapMarkerEntity, Renderable, Position, MapMarker );

		Renderable.texture[ mapMarkerEntity ] = Spritesheet.DUNGEON;
		Renderable.frame[ mapMarkerEntity ] = ( 12 * 5 );
		Position.x[ mapMarkerEntity ] = 50;
		Position.y[ mapMarkerEntity ] = 50;

		this.graphics.lineStyle(1, 0xFF00FF);
		this.graphics.strokeRect(16, 16, 16, 16);
	}

	update( time : number, delta : number ) : void {

		this.systems.run( this.world );
		
	}
}