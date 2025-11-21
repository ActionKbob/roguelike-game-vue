<script setup lang="ts">
  import { onMounted, ref } from 'vue';
	import Phaser from 'phaser';
	import { PreloadScene, SpaceScene } from '#game/scenes';


	const gameContainer = ref( null as HTMLDivElement | null );

	const gameRef = ref<Phaser.Game | null>( null );

	onMounted( () => {
		gameRef.value = new Phaser.Game( {
			parent : gameContainer.value,
			backgroundColor : "#1a5c85",
			scale : {
				mode : Phaser.Scale.ScaleModes.ENVELOP,
				width  : window.innerWidth / 3,
				height : window.innerHeight / 3
			},
			pixelArt : true,
			antialias : false,
			scene : [
				PreloadScene,
				SpaceScene
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