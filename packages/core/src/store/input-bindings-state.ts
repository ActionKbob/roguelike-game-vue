import { InputAction, type KeyBinding } from "#game/types.js";
import { defineStore } from "pinia";

type InputBindingsState = {
	bindings : KeyBinding,
	map : Map<string, InputAction>,
	activeActions : Set<InputAction>
}

const defaultBindings : KeyBinding = {
	[ InputAction.SHIP_THRUST ] : 'KeyW',
	[ InputAction.SHIP_ROTATE_RIGHT ] : 'KeyD',
	[ InputAction.SHIP_ROTATE_LEFT ] : 'KeyA'
}

export const useInputBindingsState = defineStore( 'input-bindings-state', {
	state : () : InputBindingsState => ( {
		bindings : defaultBindings,
		map : new Map<string, InputAction>(),
		activeActions : new Set()
	} ),
	actions : {
		initializeInputMap : function()
		{
			console.log('Input Bindings Init')
			this.map.clear();

			Object.entries( this.bindings ).forEach( ( [ action, key ] ) => {
				this.map.set( key, parseInt( action ) as InputAction );
			} );
		},
		getActionFromKey : function( _key : string ) : InputAction | null
		{
			return this.map.get( _key ) || null;
		},
		addActiveAction : function( _key : string )
		{
			const action = this.getActionFromKey( _key );
			
			if( action )
				this.activeActions.add( action );
		},
		removeActiveAction : function( _key : string )
		{
			const action = this.getActionFromKey( _key );
			if( action && this.activeActions.has( action ) )
				this.activeActions.delete( action );
		}
	}
} );