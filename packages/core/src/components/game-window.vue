<script setup lang="ts">
  import { onMounted, ref } from 'vue';
	import Phaser from 'phaser';
	import { PreloadScene, SpaceScene } from '#game/scenes';
	import { MapScene } from '#game/scenes/map-scene.js';
	import { useInputBindingsState } from '#store/input-bindings-state.js';
import { useNetworkState } from '#store/network-state.js';

	const inputBindingsState = useInputBindingsState();

	const gameContainer = ref( null as HTMLDivElement | null );

	const gameRef = ref<Phaser.Game | null>( null );

	onMounted( () => {

		inputBindingsState.initializeInputMap();

		gameRef.value = new Phaser.Game( {
			parent : gameContainer.value,
			backgroundColor : "#1A5C85",
			scale : {
				mode : Phaser.Scale.ScaleModes.ENVELOP,
				width  : window.innerWidth / 3,
				height : window.innerHeight / 3
			},
			pixelArt : true,
			antialias : false,
			scene : [
				PreloadScene,
				SpaceScene,
				MapScene
			],
			fps : {
				limit : 144
			}
		} );
	} );

</script>

<template>
	<div id="phaser-container" ref="gameContainer"></div>
</template>