<script lang="ts" setup>

	import { useNetworkState, NetworkStatus } from 'store';

	const networkState = useNetworkState();

</script>

<template>
	<div class="absolute text-white">
		<div>
			<button v-if="networkState.status == NetworkStatus.DISCONNECTED" v-on:click="() => networkState.connect()" >Connect</button>
			<button v-if="networkState.status == NetworkStatus.CONNECTED" v-on:click="() => networkState.disconnect()" >Disconnect</button>
		</div>
		<div v-if="networkState.status == NetworkStatus.CONNECTED && networkState.lobbyKey">
			Lobby Key: {{ networkState.lobbyKey }}
		</div>
	</div>
</template>