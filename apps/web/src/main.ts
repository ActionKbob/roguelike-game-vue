import { createApp } from "vue";
import App from "./app.vue";
import { createPinia } from "pinia";

import autoBlur from "./directives/auto-blur";

import "./styles.css";

const pinia = createPinia(); 

const app = createApp(App);

app
.directive( 'auto-blur', autoBlur )
.use( pinia )
.mount( "#app" );
