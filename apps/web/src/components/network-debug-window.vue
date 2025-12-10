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
	<div class="absolute flex flex-col text-white gap-4 p-4">
		<div>
			<p>Client ID &mdash; {{ networkState.clientId }}</p>
		</div>
		<div class="flex gap-6" v-if="networkState.status == NetworkStatus.CONNECTED && networkState.lobbyKey">
			<div>
				<p>Lobby :</p>
				<p class="text-xl font-extrabold" :class="{ 'text-amber-300' : networkState.isHost }">{{ networkState.lobbyKey }}</p>
			</div>
			<div>
				<p>Peers :</p>
				<ul>
					<li v-for="item in networkState.peers.values()">{{ item.id }}</li>
				</ul>
			</div>
		</div>
		<div>
			<div>
				<div class="flex gap-4" v-if="networkState.status == NetworkStatus.DISCONNECTED" >
					<button class="button" v-on:click="() => { networkState.connect( lobbyKey ) }" >Connect</button>
					<input type="text" maxlength=4 class="p-1 rounded border border-white outline-0" :value="lobbyKey" @input="handleKeyInput" v-if="networkState.status == NetworkStatus.DISCONNECTED" />
				</div>
				<button class="button" v-else v-on:click="() => networkState.disconnect()" >Disconnect</button>
			</div>
		</div>
				
	</div>
</template>