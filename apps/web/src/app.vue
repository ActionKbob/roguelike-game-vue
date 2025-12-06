<script setup lang="ts">
	import { GameWindow } from 'core';	
	import NetworkDebugWindow from './components/network-debug-window.vue';
</script>

<template>
  <div>
		<NetworkDebugWindow />
		<GameWindow />
	</div>
</template>
