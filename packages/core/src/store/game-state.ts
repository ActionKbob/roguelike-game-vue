import type { Scene } from "phaser";
import { defineStore } from "pinia";

type GameState = {
	
	currentScene : Scene | null
}

export const useGameState = defineStore( 'game-state', {
	state : () => {
		return {

		} as GameState;
	},
	actions : {
		setScene( _scene : Scene ) {
			this.currentScene = _scene;
		}
	}
} )