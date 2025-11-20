import { createApp } from "vue";
import App from "./app.vue";

import "./styles.css";
import { createPinia } from "pinia";

const pinia = createPinia(); 

const app = createApp(App);

app.use( pinia ).mount( "#app" );
