import { defineStore } from "pinia";

type MapState = {
	tileSize : number,
	width : integer,
	height : integer
}

export const useMapState = defineStore( 'map-state', {
	state : () => {
		return {
			tileSize : 16,
			width : 100,
			height : 100
		} as MapState;
	},
	actions : {
		
	}
} )