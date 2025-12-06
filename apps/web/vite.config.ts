import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from '@tailwindcss/vite';

export default defineConfig( {
  plugins : [ 
		vue(),
		tailwindcss()
	] as Plugin[],
  resolve : {
    alias : {
      "@": fileURLToPath( new URL( "./src", import.meta.url ) ),
    },
  },
} );
