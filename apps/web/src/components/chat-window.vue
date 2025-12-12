<script lang="ts" setup>
import { useNetworkState } from 'store';
import { useChatState } from 'store/src/chat-state';

	const networkState = useNetworkState();
	const chatState = useChatState();

	networkState.addDataChannel( 'chat', chatState.setupDataChannel );

	let inputVal = "";

	const handleChatSubmit = ( event : SubmitEvent ) => {
		event.preventDefault();
		chatState.sendMessage( inputVal );
		inputVal = '';
	}

</script>

<template>
	<div class="absolute bottom-0 m-8 w-[400px]">
		<div class="text-white p-2">
			<p :class="{ 'text-right' :  sender === networkState.clientId }" v-for="{ sender, message } in chatState.messages">Player {{ networkState.getPeerIndex( sender ) + 1 }}: {{ message }}</p>
		</div>
		<form v-on:submit="handleChatSubmit">
			<div class="flex gap-2">
				<input class="grow" v-model="inputVal" v-auto-blur type="text">
				<input class="btn" type="submit" value="Send">
			</div>
		</form>
	</div>
</template>