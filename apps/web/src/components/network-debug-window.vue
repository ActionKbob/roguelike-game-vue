<script lang="ts" setup>

	import { useNetworkState, NetworkStatus } from 'store';
	import { ref } from 'vue';

	const props = defineProps( [ 'lobbyKeyInput' ] );
	const emits = defineEmits( [ 'update:lobbyKeyInput' ] );

	const networkState = useNetworkState();

	const lobbyKey = ref( '' );
	//cat eeeeeeuuuuiiiiiooooooooolllllllllllllrrrrrrrrrrqqqqqqqqqwwwwwwmmmmmmmmm444444455555 - Roland 2025
	const handleKeyInput = ( event : InputEvent ) => {
		const target = event.target as HTMLInputElement;
		lobbyKey.value = target?.value.toUpperCase();
	}

</script>

<template>
	<div class="absolute text-white">
		<input type="text" maxlength=4 class="p-1 rounded border border-white outline-0" :value="lobbyKey" @input="handleKeyInput" v-if="networkState.status == NetworkStatus.DISCONNECTED" />
		<div>
			<button v-if="networkState.status == NetworkStatus.DISCONNECTED" v-on:click="() => { networkState.connect( lobbyKey ) }" >Connect</button>
			<button v-if="networkState.status == NetworkStatus.CONNECTED" v-on:click="() => networkState.disconnect()" >Disconnect</button>
		</div>
		<div v-if="networkState.status == NetworkStatus.CONNECTED && networkState.lobbyKey">
			Lobby Key: {{ networkState.lobbyKey }}
		</div>
		
	</div>
</template>