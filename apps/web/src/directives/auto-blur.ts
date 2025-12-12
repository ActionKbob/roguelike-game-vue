interface ElementWithBlurHandler extends HTMLElement {
  blurHandler? : ( event: MouseEvent ) => void;
}

export default {
  beforeMount( el : ElementWithBlurHandler )
	{
    el.blurHandler = ( _event: MouseEvent ) => {
      
      if( !el.contains(_event.target as Node) && el !== _event.target )
        el.blur();
      
    };
    
    document.addEventListener( 'click', el.blurHandler );
  },

  unmounted( el : ElementWithBlurHandler )
	{
    if( el.blurHandler )
		{
      document.removeEventListener( 'click', el.blurHandler );
    }
  },
};