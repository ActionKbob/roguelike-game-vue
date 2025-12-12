<script setup lang="ts">
	import { GameWindow } from 'core';	
	import NetworkDebugWindow from './components/network-debug-window.vue';
	import ChatWindow from './components/chat-window.vue';
</script>

<template>
  <div>
		<NetworkDebugWindow />
		<ChatWindow />
		<GameWindow />
	</div>
</template>
